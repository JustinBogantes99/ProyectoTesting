//const { EMAIL_CRED } = require('../mochaTest/config/properties');
//const { Persona } = require('../models/req_models');
module.exports = {

    enviarNotificacion: function (data) {
    const usuarioNotificar = data.idUsuarioNotificar;
    let actualizacion; 
    let tipoNotificacion;
    nuevaNotificacion = {
        asunto: data.asunto,
        enlace: data.enlace,
        leido: 0
    }
    data['resultado']=0
    if(data.categoria == "peticion"){
        actualizacion = { notificacionPeticion: {$each: [nuevaNotificacion], $position: 0}};
        tipoNotificacion = "notificacionPeticion";
        data.resultado=1
    }else if(data.categoria == "respuesta"){
        actualizacion = { notificacionRespuesta: {$each: [nuevaNotificacion], $position: 0}};
        tipoNotificacion = "notificacionRespuesta";
        data.resultado=1
    }else if(data.categoria == "modificacion"){
        actualizacion = { notificacionModificacion: {$each: [nuevaNotificacion], $position: 0}};
        tipoNotificacion = "notificacionModificacion";
        data.resultado=1
    }else if(data.categoria == "fecha"){
        actualizacion = { notificacionFecha: {$each: [nuevaNotificacion], $position: 0}};
        tipoNotificacion = "notificacionFecha";
        data.resultado=1
    }
    return data
    }
}