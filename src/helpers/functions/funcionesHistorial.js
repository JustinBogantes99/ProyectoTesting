const funcionesHistorial = {};

const daoPeticion = require('../../daos/peticion.dao');
const daoRespuesta = require('../../daos/respuesta.dao');
const daoPersona = require('../../daos/persona.dao');
const funcionesFecha = require('./funcionesFecha');

funcionesHistorial.obtenerTipoRespuesta = respuesta => {
    let tipoRespuesta;
    if(typeof (respuesta[0]) === 'object'){
        if(typeof (respuesta[0].aceptado) !== 'undefined'){
            if(typeof (respuesta[0].aceptado.tipo) !== 'undefined'){
                if(respuesta[0].aceptado.tipo === true){
                    tipoRespuesta = '<strong><span style="color:springgreen;">Re: Aceptada</span></strong>';
                }else if(respuesta[0].aceptado.tipo === false){
                    if(respuesta[0].aceptado.revisado === true){
                        tipoRespuesta = '<strong><span style="color:red;">Re: Rechazada</span></strong>';
                    }else{
                        tipoRespuesta = '<strong><span style="color:blue;">Re: Rechazada y modificada</span></strong>';
                    }
                }
            }else{
                tipoRespuesta = '<strong><span style="color:blue;">Re: En revisión</span></strong>';
            }
        }
    }else{
        tipoRespuesta = '<strong>Re: No hay respuesta</strong>';
    }
    return tipoRespuesta;
}

async function obtenerRespuesta(idPeticionOrigen) {
    let sort = {};
    let condiciones = { peticionOrigen: idPeticionOrigen };
    let respuesta = await daoRespuesta.obtenerMensajes_porMultiples(condiciones, sort);
    return funcionesHistorial.obtenerTipoRespuesta(respuesta);
}

async function armarObjeto(peticion) {
    let registro = {};
    let etiqueta = "&nbsp;";
    registro.id = peticion._id;
    registro.nivel = peticion.nivel;
    registro.tab = etiqueta.repeat(peticion.nivel * 8);
    registro.asunto = peticion.asunto;
    registro.fechaLimite = funcionesFecha.formatDate(peticion.fechaLimite);
    registro.enlace = "/inicio/mostrar_peticion/" + peticion._id;
    let remitente = await daoPersona.obtenerPersona_porId(peticion.remitente);
    registro.remitente = remitente.correo;
    let destinatario = await daoPersona.obtenerPersona_porId(peticion.destinatario);
    registro.destinatario = destinatario.correo;
    registro.respuesta = await obtenerRespuesta(peticion._id);
    return registro;
}

funcionesHistorial.crearHistorial = async codigo => {
    let peticionesOrden = [];
    let sort = { nivel: 1 };
    let condiciones = { codigo: codigo };
    let peticiones = await daoPeticion.obtenerMensajes_porMultiples(condiciones, sort);

    for (let i = 0; i < peticiones.length; i++) {
        let peticionActual = peticiones[i];
        let ubicacionObjetivo = peticionesOrden.findIndex( peticion => peticion.id == peticionActual.peticionOrigen );
        peticionesOrden.splice(ubicacionObjetivo + 1, 0, await armarObjeto(peticionActual));
    }
    return peticionesOrden;
}

module.exports = funcionesHistorial;