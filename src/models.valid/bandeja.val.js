const daoPersona = require("../daos/persona.dao");
const funcionesFecha = require("../helpers/functions/funcionesFecha");

const validaciones = {}

let filtrosPeticion  = ['buscar_NombrePersona0',
                        'buscar_CorreoPersona0',
                        'buscar_Asunto0',
                        'buscar_Codigo0',
                        'radiosTipo0',
                        'radiosActividad0',
                        'radiosPrioridad0',
                        'buscar_FechaInicio0',
                        'buscar_FechaFin0'];

let filtrosRespuesta = ['buscar_NombrePersona1',
                        'buscar_CorreoPersona1',
                        'buscar_Asunto1',
                        'radiosTipo1',
                        'radiosEstado1'];

// Validacion de los campos

function validar(data, filtro) {
    let salida = { ... data };
    for (let i = 0; i < filtro.length; i++) {
        let prop = filtro[i];
        if (typeof salida[prop] === 'undefined') {
            salida[prop] = "";
        }
    }
    return salida;
}

validaciones.validarQuery = data => {
    let salida;
    try {
        if (typeof data === 'undefined') {
            salida = validar({
                buscar_porTipo: '0'
            }, filtrosPeticion);
        }
        else if (data.buscar_porTipo === '1') {
            salida = validar(data, filtrosRespuesta);
        }
        else {
            data.buscar_porTipo = '0';
            salida = validar(data, filtrosPeticion);
        }
    } catch (error) {
        salida = validar({
            buscar_porTipo: '0'
        }, filtrosPeticion);
    }
    return salida;
}

async function obtenerInvolucrados(data, porTipo) {
    let idsPersonas = [];
    let condiciones = {
        $and: [
            { nombreCompleto: new RegExp(data['buscar_NombrePersona' + porTipo], 'i')},
            { correo: new RegExp(data['buscar_CorreoPersona' + porTipo], 'i')}
        ]
    };
    let personas = daoPersona.obtenerPersona_porMultiples_ag(condiciones);

    for await (const persona of personas) {
        idsPersonas.push(persona._id);
    }
    return idsPersonas;
}

function filtrosFecha (limitante, fecha) {
    let filtro;
    let validar = funcionesFecha.formatoValido(fecha);
    let nuevaFecha = funcionesFecha.crearFecha(fecha);

    if (limitante === '$gte') {
        filtro = (validar) ? { fechaLimite: { $gte: nuevaFecha } } : {};
    }
    else {
        filtro = (validar) ? { fechaLimite: { $lte: nuevaFecha } } : {};
    }

    return filtro;
}

validaciones.generarCondiciones = async (data, idUsuario) => {
    let condiciones1, condiciones2, porTipo = data.buscar_porTipo;
    let idsPersonas = await obtenerInvolucrados(data, porTipo);
    let condiciones, extras;

    condiciones1 = {$and: [
        { asunto: new RegExp(data['buscar_Asunto' + porTipo], 'i')},
        { remitente: { $in: idsPersonas }},
        { destinatario: idUsuario }]};
    condiciones2 = {$and: [
        { asunto: new RegExp(data['buscar_Asunto' + porTipo], 'i')},
        { destinatario: { $in: idsPersonas }},
        { remitente: idUsuario }]};
    
    if (porTipo === '0') {
        let filtroGT = filtrosFecha('$gte', data['buscar_FechaInicio' + porTipo]);
        let filtroLT = filtrosFecha('$lte', data['buscar_FechaFin' + porTipo]);
        extras = [{ codigo: new RegExp(data['buscar_Codigo' + porTipo], 'i') },
            { prioridad: new RegExp(data['radiosPrioridad' + porTipo], 'i') },
            { estado: new RegExp(data['radiosActividad' + porTipo]) },
            filtroGT, filtroLT];
    }
    else {
        let radiosEstado = data["radiosEstado" + porTipo];
        if (radiosEstado === 'Todas' || radiosEstado === '') {
            extras = [{}];
        }
        else if (radiosEstado === 'Aceptadas') {
            extras = [{ aceptado: { tipo: true }}];
        }
        else if (radiosEstado === 'Rechazadas') {
            extras = [{ 'aceptado.tipo': false }];
        }
        else if (radiosEstado === 'Sin Revisar') {
            extras = [{ $or: [
                { $and: [
                    {'aceptado.revisado': { $eq: null }},
                    {'aceptado.tipo': { $eq: null }}
                ] },
                { $and: [
                    { 'aceptado.revisado': false },
                    { 'aceptado.tipo': false }
                ] }
            ]}];
        }
    }

    condiciones1['$and'].push( ... extras);
    condiciones2['$and'].push( ... extras);

    let radiosTipo = data['radiosTipo' + porTipo];
    if (radiosTipo == "Ambos") {
        condiciones = { $or: [condiciones1, condiciones2] };
    }
    else if (radiosTipo == "Recibidos") {
        condiciones = condiciones1;
    }
    else {
        condiciones = condiciones2;
    }

    /*console.log(condiciones1);
    console.log(condiciones2);*/

    return condiciones;

}

module.exports = validaciones;