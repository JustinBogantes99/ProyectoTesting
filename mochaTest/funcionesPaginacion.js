const funcionesPaginacion = {};

//const daoPersona = require('../mochaTest/DoblesPruebas/Fake/fake-persona.spect');
//const daoPeticion = require('../mochaTest/DoblesPruebas/Fake/fake-persona.spect');
//const funcionesFecha = require('./funcionesFecha');
//const funcionesHistorial = require('./funcionesHistorial');
//const { sortByProperty } = require('../functions');
//const daoRespuesta = require('../../daos/respuesta.dao');
let limitePorPagina = 3;    //Cantidad de peticiones o respuestas
let limitePorPantalla = 1;  //Cantidad de indices en la paginacion

module.exports = {
    
    obtenerSujeto:function (mensaje, bandeja, idUsuario) {
    let dePara, busqueda, personaObjetivo, privilegios;
    const valor=0;
    if (bandeja.includes("Consulta")) {
        if (mensaje.destinatario == idUsuario) {
            busqueda = mensaje.remitente;
            dePara = "De:";
            valor=1
            
        }
        else {
            busqueda = mensaje.destinatario;
            dePara = "Para:";
        }
        
    }
    else {
        if (bandeja.includes("Entrada") || bandeja === "Inicio") {
            busqueda = mensaje.remitente;
            dePara = "De:";
            valor=1
            
        }
        else {
            busqueda = mensaje.destinatario;
            dePara = "Para:";
        }
    }

    personaObjetivo = {nombre:'Justin',apellido1:'Bogantes',apellido2:'Rodriguez', telefono:'8888888',correo:'justin@gmail.com',contrasena:'1234',
    departamento:'Computacion', token:'', fechaFinToken:'07/09/2021', notificacionPeticion: '', notificacionRespuesta:'', notificacionModificacion:'',notificacionFecha:''}
    
    if(mensaje.destinatario != idUsuario && mensaje.remitente != idUsuario){
        privilegios = false;
    }
    else{
        privilegios = true;
    }
    return valor;
}
,

verificarRespuesta:function (idPeticion, idUsuario) {
    let condiciones = { peticionOrigen: idPeticion, remitente: idUsuario };
    let respuesta = {asunto:'Llamada de atencion',descripcion:'Venga a mi oficina',remitente:'Boss',destinatario:'Justin Bogantes',peticionOrigen:'5f32c7c131aed1001711b579',aceptado:{tipo:'',revisado:'',razon:''}};
    let resultado = (respuesta > 0) ? false : true;
    return resultado;
}
,
generarTarjeta:async function (mensaje, bandeja, tipoMensajes, idUsuario) {
    let nuevoMensaje = {};
    let sujeto = await obtenerSujeto(mensaje, bandeja, idUsuario);

    for (propiedad in mensaje) {
        nuevoMensaje[propiedad] = mensaje[propiedad];
    }
    nuevoMensaje.tipo = tipoMensajes;
    nuevoMensaje.responder = (bandeja === "Entrada Peticion" || bandeja === "Inicio") ?
        await verificarRespuesta(mensaje._id, idUsuario) : false;

    //nuevoMensaje.nombrePersona = daoPersona.nombreCompleto(sujeto.personaObjetivo);
    //nuevoMensaje.fechaInicio = funcionesFecha.formatDate(mensaje.createdAt);

    if (tipoMensajes == "Peticion") nuevoMensaje.Limite = funcionesFecha.formatDate(mensaje.fechaLimite);
    nuevoMensaje.dePara = sujeto.dePara;
    nuevoMensaje.privilegios = sujeto.privilegios;

    return nuevoMensaje;
}

,

obtenerUltimasOcurrencias : async (bandeja, idUsuario) => {
    let comunicacion = []
    let condiciones = { destinatario: idUsuario };
    let peticiones = await daoPeticion.obtenerMensajes_porMultiples_skip(0, 5, condiciones);
    let respuestas = await daoRespuesta.obtenerMensajes_porMultiples_skip(0, 5, condiciones);

    for await (const peticion of peticiones) {
        let nuevoMensaje = await generarTarjeta(peticion, bandeja, "Peticion", idUsuario);
        comunicacion.push(nuevoMensaje)
    }

    for await (const respuesta of respuestas) {
        let nuevoMensaje = await generarTarjeta(respuesta, bandeja, "Respuesta", idUsuario);
        nuevoMensaje.tipoRespuesta = funcionesHistorial.obtenerTipoRespuesta([respuesta]);
        comunicacion.push(nuevoMensaje)
    }

    comunicacion = comunicacion.sort(sortByProperty('createdAt')).slice(0, 6);
    return comunicacion;
}
}