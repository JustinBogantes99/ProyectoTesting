$(function () {
    $('#btn_consultarUsuario').on('click', _ => {
        $('#destinatario').val("");
        let correo = $('#idCorreoUsuario').val();
        let entidad = $("#idEntidadUsuario").val();
        let nombreUsuario = $('#idNombreUsuario').val();
        let correoRemitente = $('#idDestinatarios').val();
        let departamento = $('#idDepartamentoUsuario').val();
        $.ajax({
            url: '/obtener_usuarios',
            method: 'POST',
            data: {
                correo,
                entidad,
                departamento,
                nombreUsuario,
                correoRemitente
            },
            success: usuarios => {
                let selectUsuarios = $('#idUsuarios');
                selectUsuarios.html('');
                if (Object.keys(usuarios).length > 0) {
                    selectUsuarios.append(`<option value="-1">Seleccione un Usuario</option>`);
                    usuarios.forEach(usuario => {
                        selectUsuarios.append(`<option value="${usuario.correo}">${usuario.nombre} ${usuario.apellido1} ${usuario.apellido2} / ${usuario.correo} / ${usuario.nombreDepartamento}</option>`);
                    });
                }
                else {
                    selectUsuarios.append(`<option value="-1">No se han encontrado Usuarios</option>`);
                }
            }
        });
    });

    $('#idUsuarios').on('click', _ => {
        let usuarioElegido = $('#idUsuarios').val();
        if (usuarioElegido === "-1") {
            $('#destinatario').val("");
        }
        else {
            $('#destinatario').val(usuarioElegido);
        }
    });
});

function actualizarSelector(final){
    $('#seleccionar_Persona'+final).val("");
    let nombreUsuario = $('#buscar_NombrePersona'+final).val();
    let correo = $('#buscar_CorreoPersona'+final).val();
    let departamento = "";
    let correoRemitente = "";
    $.ajax({
        url: '/obtener_usuarios',
        method: 'POST',
        data: {
            correo,
            departamento,
            correoRemitente,
            nombreUsuario
        },
        success: usuarios => {
            let selectUsuarios = $('#seleccionar_Persona'+final);
            selectUsuarios.html('');
            if (Object.keys(usuarios).length > 0) {
                usuarios.forEach(usuario => {
                    let mensaje = `${usuario.nombre} ${usuario.apellido1} ${usuario.apellido2} - ${usuario.correo}`;
                    selectUsuarios.append(`<option title="${mensaje}" value="${mensaje}">${mensaje}</option>`);
                });
            }
            else {
                let mensaje = 'No se han encontrado Usuarios';
                selectUsuarios.append(`<option value="" title="${mensaje}">${mensaje}</option>`);
            }
        }
    });
}

function actualizarInput(final){
    let usuarioElegido = $('#seleccionar_Persona'+final).val()[0];
    let resultado = usuarioElegido.split(" - ")
    $('#buscar_NombrePersona'+final).val(resultado[0]);
    $('#buscar_CorreoPersona'+final).val(resultado[1]);
}

$(function () {
    $('#buscar_NombrePersona0, #buscar_CorreoPersona0').on('keyup', _ => {
        console.log("Hola");
        actualizarSelector(0);
    });
    $('#seleccionar_Persona0').on('click', _ => {
        actualizarInput(0);
    });
});

$(function () {
    $('#buscar_NombrePersona1, #buscar_CorreoPersona1').on('keyup', _ => {
        actualizarSelector(1);
    });
    $('#seleccionar_Persona1').on('click', _ => {
        actualizarInput(1);
    });
});