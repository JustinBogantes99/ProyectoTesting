let idPersona = document.getElementById("idPersonaNotificacion").value
let socketNotificacionRecibido = io({ 'forceNew': true });

socketNotificacionRecibido.emit('subscribe', idPersona);

function render2(data) {
    let tipoNotificacion
    if(data[0].categoria == "peticion"){
        tipoNotificacion = "notificacionPeticion";
    }else if(data[0].categoria == "respuesta"){
        tipoNotificacion = "notificacionRespuesta";
    }else if(data[0].categoria == "modificacion"){
        tipoNotificacion = "notificacionModificacion";
    }else if(data[0].categoria == "fecha"){
        tipoNotificacion = "notificacionFecha";
    }

    let html = data.map(function (elem, index) {
        return (`<a href="${elem.enlace}" class="greenStatement btn btn-block multiline text-left  greenLi pt-2 ${tipoNotificacion} noLeido" id="${elem.id}"> ${elem.asunto} - <i>justo ahora</i></a><br>`)}).join(" ");
    document.getElementById(tipoNotificacion+'Id').innerHTML = html + document.getElementById(tipoNotificacion+'Id').innerHTML;
    document.getElementById("activarNotificacion").innerHTML = "<span class=\"badge\">nuevo</span>";
}

socketNotificacionRecibido.on('mostrar notificacion', data => {
    render2(data);
});

