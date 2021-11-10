const { Codigo } = require('../models/req_models');

async function obtenerCodigo(categoria) {
    let tam;
    let veces;
    let ceros = "0";
    let codigoPeticion;
    let siguienteValor;
    let maximoDigitos = 4
    let anioActual = new Date().getFullYear();
    let codigo = await Codigo.findOne({ categoria: categoria });
    
    if (codigo) {
        veces = maximoDigitos - codigo.ndigitos;
        codigoPeticion = codigo.categoria + ceros.repeat(veces) + codigo.consecutivo;

        siguienteValor = codigo.consecutivo + 1;
        tam = ([10, 100, 1000].includes(siguienteValor)) ? 1 : 0;
        await Codigo.findByIdAndUpdate(codigo._id, { $inc: { consecutivo: 1, ndigitos: tam } });
    }
    else {
        const nuevoCodigo = new Codigo({ categoria: categoria, consecutivo: 2, ndigitos: 1 });
        await nuevoCodigo.save();
        codigoPeticion = categoria + ceros.repeat(3) + 1;
    }
    return codigoPeticion + "-" + anioActual;
}

function formatList(lista) {
    var text = "[";
    lista.forEach(element => {
        text += "'";
        text += element;
        text += "'";
        text += ",";
    });
    return text.replace(/.$/, "]")
}

function getFileName(archivos, idBuscado) {
    return archivos.filter(
        (archivos) => {
            return archivos.idArchivo == idBuscado;
        }
    );
}

var sortByProperty = function (property) {
    return function (x, y) {
        return ((x[property] === y[property]) ? 0 : ((x[property] < y[property]) ? 1 : -1));
    }
}

module.exports = {
    getFileName, formatList,
    obtenerCodigo, sortByProperty
}