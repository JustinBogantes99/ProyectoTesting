const funcionesPaginacion = {};

const daoPersona = require('../../daos/persona.dao');
const daoPeticion = require('../../daos/peticion.dao');
const funcionesFecha = require('./funcionesFecha');
const funcionesHistorial = require('./funcionesHistorial');
const { sortByProperty } = require('../functions');
const daoRespuesta = require('../../daos/respuesta.dao');
let limitePorPagina = 3;    //Cantidad de peticiones o respuestas
let limitePorPantalla = 1;  //Cantidad de indices en la paginacion

function generarPaginacion(totalPaginas, limitePorPantalla, paginaActual) {
    let pagina = {
        paginaActual: paginaActual.toString(),
        primera_pagina: "1",
        ultima_pagina: totalPaginas.toString(),
        paginasIntermedias: [],
    }
    if (paginaActual > totalPaginas || paginaActual < 1) {
        pagina.valida = false;
        pagina.textoRegresar = "Ir a Página 1";
    }
    else {
        pagina.valida = true;

        if (totalPaginas == 1) {
            pagina.unaPagina = true;
            pagina.textoRegresar = "- 1 -";
        }
        else if (paginaActual == 1) {
            pagina.unaPagina = false;
            pagina.anterior = false;
            if (paginaActual + 1 <= totalPaginas) {
                pagina.siguiente = true;
                pagina.valSiguiente = (paginaActual + 1).toString();
            }

            pagina.separacionIzquierda = false;
            pagina.separacionDerecha = true;

            let rango;
            if (paginaActual + limitePorPantalla <= totalPaginas) {
                rango = paginaActual + limitePorPantalla;
            } else {
                rango = totalPaginas;
            }
            let hayIntermedios = false;
            for (let i = paginaActual + 1; i <= rango; i++) {
                if (i != totalPaginas) {
                    if (i > 1 && i < totalPaginas) {
                        hayIntermedios = true;
                        pagina.paginasIntermedias.push(i.toString());
                        if (i + 1 == totalPaginas) {
                            pagina.separacionDerecha = false;
                        }
                    }
                }
            }
            if (!hayIntermedios) {
                pagina.separacionDerecha = false;
            }
        }
        else if (paginaActual == totalPaginas) {
            pagina.anterior = true;
            pagina.siguiente = false;
            pagina.valAnterior = (paginaActual - 1).toString();

            pagina.separacionIzquierda = true;
            pagina.separacionDerecha = false;

            let rango;
            if (totalPaginas - limitePorPantalla > 1) {
                rango = totalPaginas - limitePorPantalla;
            }
            else {
                rango = 2;
            }
            let hayIntermedios = false;
            for (let i = rango; i < totalPaginas; i++) {
                if (i > 1 && i < totalPaginas) {
                    hayIntermedios = true;
                    pagina.paginasIntermedias.push(i.toString());
                    if (i - 1 == 1) {
                        pagina.separacionIzquierda = false;
                    }
                }
            }
            if (!hayIntermedios) {
                pagina.separacionIzquierda = false;
            }
        }
        else {
            pagina.anterior = true;
            pagina.siguiente = true;
            pagina.valAnterior = (paginaActual - 1).toString();
            pagina.valSiguiente = (paginaActual + 1).toString();

            pagina.separacionIzquierda = true;
            pagina.separacionDerecha = true;

            let rangoAnterior;
            let rangoSiguiente;
            if (paginaActual - limitePorPantalla >= 1) {
                rangoAnterior = paginaActual - limitePorPantalla;
            }
            else {
                rangoAnterior = paginaActual - 1;
            }
            if (paginaActual + limitePorPantalla <= totalPaginas) {
                rangoSiguiente = paginaActual + limitePorPantalla;
            }
            else {
                rangoSiguiente = paginaActual + (totalPaginas - paginaActual);
            }
            for (let i = rangoAnterior; i <= rangoSiguiente; i++) {
                if (i > 1 && i < totalPaginas) {
                    pagina.paginasIntermedias.push(i.toString());
                    if (i + 1 == totalPaginas) {
                        pagina.separacionDerecha = false;
                    }
                    if (i - 1 == 1) {
                        pagina.separacionIzquierda = false;
                    }
                }
            }
        }
    }
    return pagina;
}

async function obtenerSujeto(mensaje, bandeja, idUsuario) {
    let dePara, busqueda, personaObjetivo, privilegios;

    if (bandeja.includes("Consulta")) {
        if (mensaje.destinatario == idUsuario) {
            busqueda = mensaje.remitente;
            dePara = "De:";
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
        }
        else {
            busqueda = mensaje.destinatario;
            dePara = "Para:";
        }
    }
    personaObjetivo = await daoPersona.obtenerPersona_porId(busqueda);
    
    if(mensaje.destinatario != idUsuario && mensaje.remitente != idUsuario){
        privilegios = false;
    }
    else{
        privilegios = true;
    }

    return { personaObjetivo, dePara, privilegios};
}

async function verificarRespuesta(idPeticion, idUsuario) {
    let condiciones = { peticionOrigen: idPeticion, remitente: idUsuario };
    let respuesta = await daoRespuesta.totalDocumentos(condiciones);
    let resultado = (respuesta > 0) ? false : true;
    return resultado;
}

async function generarTarjeta(mensaje, bandeja, tipoMensajes, idUsuario) {
    let nuevoMensaje = {};
    let sujeto = await obtenerSujeto(mensaje, bandeja, idUsuario);

    for (propiedad in mensaje) {
        nuevoMensaje[propiedad] = mensaje[propiedad];
    }
    nuevoMensaje.tipo = tipoMensajes;
    nuevoMensaje.responder = (bandeja === "Entrada Peticion" || bandeja === "Inicio") ?
        await verificarRespuesta(mensaje._id, idUsuario) : false;

    nuevoMensaje.nombrePersona = daoPersona.nombreCompleto(sujeto.personaObjetivo);
    nuevoMensaje.fechaInicio = funcionesFecha.formatDate(mensaje.createdAt);

    if (tipoMensajes == "Peticion") nuevoMensaje.Limite = funcionesFecha.formatDate(mensaje.fechaLimite);
    nuevoMensaje.dePara = sujeto.dePara;
    nuevoMensaje.privilegios = sujeto.privilegios;

    return nuevoMensaje;
}

async function generarLimitePaginacion(dao, condiciones, paginaActual) {
    let limites = {};
    limites.totalRegistros = await dao.totalDocumentos(condiciones);
    limites.totalPaginas = Math.ceil(limites.totalRegistros / limitePorPagina);
    limites.saltar = limitePorPagina * paginaActual - limitePorPagina;
    return limites;
}

funcionesPaginacion.generarBandeja = async (paginaActual, condiciones, idUsuario, bandeja, enlace, bEnlace = "") => {
    let tipoMensajes = (bandeja.includes("Peticion")) ? "Peticion" : "Respuesta";
    let dao = (tipoMensajes === "Peticion") ? daoPeticion : daoRespuesta;
    let lim = await generarLimitePaginacion(dao, condiciones, paginaActual);

    let pagina = generarPaginacion(lim.totalPaginas, limitePorPantalla, paginaActual);
    pagina.href = enlace;
    pagina.bhref = bEnlace;

    let resultado;
    let comunicacion = [];

    if (pagina.valida) {
        resultado = await dao.obtenerMensajes_porMultiples_skip(lim.saltar, limitePorPagina, condiciones);
        for await (const mensaje of resultado) {
            let nuevoMensaje = await generarTarjeta(mensaje, bandeja, tipoMensajes, idUsuario);
            if (tipoMensajes === "Respuesta"){
                nuevoMensaje.tipoRespuesta = funcionesHistorial.obtenerTipoRespuesta([mensaje]);
                if(nuevoMensaje.tipoRespuesta == '<strong><span style="color:red;">Re: Rechazada</span></strong>'){
                    if(mensaje.remitente == idUsuario){
                        nuevoMensaje.remitenteRechazo = true;
                    }
                }
            }
            comunicacion.push(nuevoMensaje);
        }
    }
    return { comunicacion, pagina, bandeja };
}

funcionesPaginacion.obtenerUltimasOcurrencias = async (bandeja, idUsuario) => {
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

module.exports = funcionesPaginacion;