const { Respuesta } = require('../models/req_models');

const daoRespuesta = {};

daoRespuesta.obtenerRespuesta_porMultiples = async condiciones => {
    let respuesta = await Respuesta.find(condiciones);
    return respuesta;
}

daoRespuesta.obtenerMensajes_porMultiples = async (condiciones, sort={ createdAt: 'desc' }) => {
    let respuestas = await Respuesta
        .find(condiciones)
        .sort(sort)
        .lean();
    return respuestas;
}

daoRespuesta.obtenerMensajes_porMultiples_skip = async (saltar, limite, condiciones) => {
    let respuestas = await Respuesta
        .find(condiciones)
        .skip(saltar)
        .limit(limite)
        .sort({ createdAt: 'desc' })
        .lean();
    return respuestas;
}

daoRespuesta.totalDocumentos = async condiciones => {
    let total = await Respuesta.countDocuments(condiciones);
    return total;
}

module.exports = daoRespuesta; 