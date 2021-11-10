$(function () {
    $('button.btn_eliminarArchivo').on('click', _ => {
        let idArchivo = $(document.activeElement).attr('id');
        $.ajax({
            url: '/eliminar_archivo',
            method: 'DELETE',
            data: {
                idArchivo
            },
            success: _ => {
                let registro = $('div#' + idArchivo);
                registro.remove();
            }
        });
    });
});