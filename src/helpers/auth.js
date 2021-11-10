const { Peticion, Respuesta } = require('../models/req_models');
const daoPeticion = require('../daos/peticion.dao');

const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect('/inicio_sesion');
}

helpers.isAllowed = async (req, res, next) => {
    let url = req.originalUrl.split("/");
    let id = url.pop();
    let tipo_solicitud = url.pop();

    if (tipo_solicitud == "historial") {
        let registro = {
            codigoPeticion: id,
            idPersona: req.user._id
        };
        if (await daoPeticion.tienePermisos(registro)) {
            return next();
        }
    }
    else {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) { }
        else if (tipo_solicitud == "mostrar_peticion") {
            let current_req = await Peticion.findById(id);
            if (req.user._id == current_req.destinatario || req.user._id == current_req.remitente) {
                return next();
            }
            else {
                let registro = {
                    codigoPeticion: current_req.codigo,
                    idPersona: req.user._id
                };
                if (await daoPeticion.tienePermisos(registro)) {
                    return next();
                }
            }
        }
        else if (tipo_solicitud == "mostrar_respuesta") {
            let current_req = await Respuesta.findById(id);
            let peticion_asociada = await Peticion.findById(current_req.peticionOrigen);
            if (req.user._id == current_req.destinatario || req.user._id == current_req.remitente) {
                return next();
            }
            else {
                let registro = {
                    codigoPeticion: peticion_asociada.codigo,
                    idPersona: req.user._id
                };
                if (await daoPeticion.tienePermisos(registro)) {
                    return next();
                }
            }
        }
        else if (tipo_solicitud == "delegar_peticion") {
            let current_req = await Peticion.findById(id);
            if (req.user._id == current_req.destinatario) {
                return next();
            }
        }
        else if (tipo_solicitud == "modificar_peticion" ||
            tipo_solicitud == "modificar_respuesta") {
            let current_req = (tipo_solicitud == "modificar_peticion") ?
                await Peticion.findById(id) : await Respuesta.findById(id);
            if (req.user._id == current_req.remitente) {
                return next();
            }
        }
        else if (tipo_solicitud == "responder_peticion") {
            let existe_respuesta = await Respuesta.find({ peticionOrigen: id });
            if (existe_respuesta.length == 0) {
                let current_req = await Peticion.findById(id);
                if (req.user._id == current_req.destinatario) {
                    return next();
                }
            }
        }
    }
    req.flash('error_msg', 'Acción no autorizada.');
    res.redirect('/inicio/bandeja_inicio');
}

module.exports = helpers;