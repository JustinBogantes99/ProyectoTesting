const { CPD } = require('../config/properties');

const daoPersona = require('./persona.dao');
const daoArchivo = require('./archivo.dao');
const daoRespuesta = require('./respuesta.dao');
const funcionesFecha = require('../helpers/functions/funcionesFecha');

const { obtenerCodigo } = require('../helpers/functions');
const { construirCorreo } = require('../helpers/mailService');
const { Peticion, PersonaxPeticion, Memo, Adjunto } = require('../models/req_models');

const daoPeticion = {}

daoPeticion.obtenerPeticion_porId = async idPeticion => {
    let peticion = await Peticion.findById(idPeticion);
    return peticion;
}

daoPeticion.obtenerMensajes_porMultiples = async (condiciones, sort={ createdAt: 'desc' }) => {
    let peticiones = await Peticion
        .find(condiciones)
        .sort(sort)
        .lean();
    return peticiones;
}

daoPeticion.obtenerMensajes_porMultiples_skip = async (saltar, limite, condiciones) => {
    let peticiones = await Peticion
        .find(condiciones)
        .skip(saltar)
        .limit(limite)
        .sort({ createdAt: 'desc' })
        .lean();
    return peticiones;
}

daoPeticion.totalDocumentos = async condiciones => {
    let total = await Peticion.countDocuments(condiciones);
    return total;
}

daoPeticion.verificarExistencias = async registro => {
    let existencias = await PersonaxPeticion.findOne(registro);
    return existencias;
}

daoPeticion.darPermisos = async registro => {
    let existencias = await daoPeticion.verificarExistencias(registro);

    if (!existencias) {
        let permiso = new PersonaxPeticion(registro);
        await permiso.save();
    }
    else {
        throw 'No se permiten duplicados de permisos.';
    }
}

daoPeticion.quitarPermisos = async registro => {
    let existencias = await daoPeticion.verificarExistencias(registro);

    if (existencias) {
        await PersonaxPeticion.findOneAndRemove(registro);
    }
    else {
        throw 'No existe registro que eliminar';
    }
}

daoPeticion.tienePermisos = async registro => {
    let permiso = await PersonaxPeticion.countDocuments(registro);
    return permiso;
}

daoPeticion.esAdministrador = async registro => {
    let permiso = await PersonaxPeticion.findOne(registro);
    if (permiso.titulo == "Administrador") {
        return 1;
    }
    return 0;
}

daoPeticion.obtenerEspectadores = async (condiciones={}) => {
    let admitidos = await PersonaxPeticion.find(condiciones);
    let idsPersonas = admitidos.map(admitido => admitido.idPersona);
    let personas = await daoPersona.obtenerPersonas_porIds(idsPersonas);
    return personas;
}

daoPeticion.totalPermitidos = async (condiciones={}) => {
    let total = await PersonaxPeticion.countDocuments(condiciones);
    return total;
}

// ---------------------------------------------------------------- Mover a archivo constructor que use este dao

async function obtenerDatosPeticion(peticion, idUsuario) {
    let remitente, destinatario;
    remitente = await daoPersona.obtenerPersona_porId(peticion.remitente);
    peticion.remitenteNombre = daoPersona.nombreCompleto(remitente);
    peticion.remitenteCorreo = remitente.correo;

    destinatario = await daoPersona.obtenerPersona_porId(peticion.destinatario);
    peticion.destinatarioNombre = daoPersona.nombreCompleto(destinatario);
    peticion.destinatarioCorreo = destinatario.correo;

    
    if (peticion.peticionOrigen) {
        let peticionOrigenCompleta = await daoPeticion.obtenerPeticion_porId(peticion.peticionOrigen);
        peticion.asuntoOrigen = peticionOrigenCompleta.asunto;
    }
    peticion.fechaLimiteFormat = funcionesFecha.formatDateHour(peticion.fechaLimite);
    peticion.fechaInicio = funcionesFecha.formatDateHour(peticion.createdAt);
    peticion.fechaActualizacion = funcionesFecha.formatDateHour(peticion.updatedAt);

    let respuesta = await daoRespuesta.obtenerRespuesta_porMultiples({
        peticionOrigen: peticion._id
    });
    let memos = await Memo.find({ peticionOrigen: peticion._id }).sort('asc');
    memos.map(memo => memo.fecha = funcionesFecha.formatDateHour(memo.createdAt));
    let files = await daoArchivo.obtenerArchivos_porIdPeticion(peticion._id);
    
    let verificarPermisos = { codigoPeticion: peticion.codigo, idPersona: idUsuario};
    let permisos = await daoPeticion.tienePermisos(verificarPermisos);
    if (permisos || peticion.remitente == idUsuario) {
        peticion.permisoVerOrigen = "Si";
    }
    if (permisos) {
        peticion.permisoHistorial = "Si";
    }

    return { peticion, respuesta, files, memos };
}

daoPeticion.obtenerPeticion = async (idPeticion, idUsuario) => {
    let peticion;
    if (!idPeticion.match(/^[0-9a-fA-F]{24}$/)) {
        peticion.error = "Codigo de peticion invalido";
        return peticion;
    }

    let peticionBuscada = await Peticion.findById(idPeticion);
    if (peticionBuscada) {
        return await obtenerDatosPeticion(peticionBuscada,idUsuario);
    }
    else {
        peticion.error = "Peticion no existe";
        return peticion;
    }
}

daoPeticion.registrarPeticion = async (data, req) => {
    let destinatarioCompleto = await daoPersona.obtenerUnaPersonaPorMultiples({
        correo: data.destinatarioCorreo
    });

    data.destinatario = destinatarioCompleto._id;
    delete data.destinatarioCorreo;
    data.codigo = await obtenerCodigo(CPD);
    data.estado = "Activo";
    data.nivel = 0;
    const nuevaPeticion = new Peticion(data);

    await nuevaPeticion.save(function (err, peticion) {
        idPeticion = peticion._id;
        for (const archivo of req.files) {
            let idArchivo = archivo.id;
            let nombreArchivo = archivo.originalname;
            let idMedio = idPeticion;
            let tipoMedio = "Peticion";
            let registroAdjunto = new Adjunto({ idArchivo, nombreArchivo, idMedio, tipoMedio });
            registroAdjunto.save();
        }

        construirCorreo({ persona: [req.user, destinatarioCompleto], mensaje: 'Nueva_Peticion', tipo: 'Peticion', idPeticion, asuntoPrimario: data.asunto, req });

        let registro = { idPersona: data.remitente, codigoPeticion: data.codigo, titulo: "Administrador" };
        daoPeticion.darPermisos(registro);
    });
}

module.exports = daoPeticion; 
