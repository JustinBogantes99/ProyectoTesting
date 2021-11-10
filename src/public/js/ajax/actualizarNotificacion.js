$(function () {
    
    $('div#notificacionPadre').on('click', "a.notificacionPeticion", _ => {
        let notificacion = $(document.activeElement);
        let idNotificacion = notificacion.attr('id');
        let idUsuario = $('#idUsuarioNotificacion').val();
        let tipoNotificacion = "peticion";
        actualizacion(idNotificacion, idUsuario, tipoNotificacion, notificacion.attr('href'));
    });

    $('div#notificacionPadre').on('click', 'a.notificacionRespuesta', _ => {
        let notificacion = $(document.activeElement);
        let idNotificacion = notificacion.attr('id');
        let idUsuario = $('#idUsuarioNotificacion').val();
        let tipoNotificacion = "respuesta";
        actualizacion(idNotificacion, idUsuario, tipoNotificacion, notificacion.attr('href'));
    });

    $('div#notificacionPadre').on('click', 'a.notificacionModificacion', _ => {
        let notificacion = $(document.activeElement);
        let idNotificacion = notificacion.attr('id');
        let idUsuario = $('#idUsuarioNotificacion').val();
        let tipoNotificacion = "modificacion";
        actualizacion(idNotificacion, idUsuario, tipoNotificacion, notificacion.attr('href'));
    });

    $('div#notificacionPadre').on('click', 'a.notificacionFecha', _ => {
        let notificacion = $(document.activeElement);
        let idNotificacion = notificacion.attr('id');
        let idUsuario = $('#idUsuarioNotificacion').val();
        let tipoNotificacion = "fecha";
        actualizacion(idNotificacion, idUsuario, tipoNotificacion, notificacion.attr('href'));
    });

    function actualizacion(idNotificacion, idUsuario, tipoNotificacion, enlace){
        $.ajax({
            url: '/actualizar_notificacion',
            method: 'POST',
            data: {
                idNotificacion,
                idUsuario,
                tipoNotificacion
            },
            success: res => {
                window.location = enlace;
            }
        });
    }   
});

