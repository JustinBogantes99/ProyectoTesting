function formatDate(id, fecha) {
    let nFecha = new Date(fecha);
    
    let dia = nFecha.getUTCDate();
    let mes = nFecha.getUTCMonth() + 1;

    let diaFormateado = (dia >= 10) ? dia : `0${dia}`;
    let mesFormateado = (mes >= 10) ? mes : `0${mes}`;
    let fechaFormateada = `${nFecha.getFullYear()}-${mesFormateado}-${diaFormateado}`;

    document.getElementById(id).innerHTML += " <i>" + fechaFormateada + "</i>";
}