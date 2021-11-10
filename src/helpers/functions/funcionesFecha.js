const funcionesFecha = {};

function obtenerFechaBasica (nFecha) {
    let dia = nFecha.getUTCDate();
    let mes = nFecha.getUTCMonth() + 1;

    let diaFormateado = (dia >= 10) ? dia : `0${dia}`;
    let mesFormateado = (mes >= 10) ? mes : `0${mes}`;
    let fechaFormateada = `${nFecha.getFullYear()}-${mesFormateado}-${diaFormateado}`;

    return fechaFormateada;
}

funcionesFecha.crearFecha = (fechaString, diasMas=0) => {
    let fecha;
    if (typeof fechaString === "string" && fechaString.length > 0) {
        fecha = new Date(fechaString);
    }
    else {
        fecha = new Date();
    }
    fecha.setDate(fecha.getDate() + diasMas);
    fecha.setHours(0, 0, 0, 0);

    return fecha;
}

funcionesFecha.formatDate = fecha => {
    let fechaFormateada = obtenerFechaBasica(fecha);
    return fechaFormateada;
}

funcionesFecha.formatDateHour = fecha => {
    let hora = fecha.getHours();
    let minutos = fecha.getMinutes();
    let fechaBasica = obtenerFechaBasica(fecha);

    let ampm = (hora >= 12) ? "pm" : "am";
    let horaFormateada = (hora > 12) ? hora - 12 : hora;
    let minutosFormateados = (minutos >= 10) ? minutos : `0${minutos}`;
    let fechaFormateada = `${fechaBasica} ${horaFormateada}:${minutosFormateados} ${ampm}`;

    return fechaFormateada;
}

funcionesFecha.formatoValido = (fechaString) => {
    return (typeof fechaString === 'string' && fechaString.length > 0);
}

funcionesFecha.finalDelDia = (fechaInput) => {
    let fecha = new Date(fechaInput);
    fecha.setHours(23,59,59,999);
    return fecha;
}

module.exports = funcionesFecha;