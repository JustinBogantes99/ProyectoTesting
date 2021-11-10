$(function () {
    function actualizarSelect() {
        let selectUsuarios = $('#seleccionar_Persona');
        selectUsuarios.val("");
        let nombreUsuario = $('#buscar_NombrePersona').val();
        let codigoPeticion = $('#codigoPeticion').val();
        let correo = $('#buscar_CorreoPersona').val();
        let departamento = "";

        $.ajax({
            url: '/obtener_noEspectadores',
            method: 'POST',
            data: {
                correo,
                departamento,
                nombreUsuario,
                codigoPeticion
            },
            success: usuarios => {
                selectUsuarios.html('');
                if (Object.keys(usuarios).length > 0) {
                    usuarios.forEach(usuario => {
                        let title = `${usuario.nombre} ${usuario.apellido1} ${usuario.apellido2} - ${usuario.correo}`;
                        selectUsuarios.append(`<option value="${usuario._id}-${usuario.nombre} ${usuario.apellido1} ${usuario.apellido2}-${usuario.correo}" title="${title}">${title}</option>`);
                    });
                }
                else {
                    let mensaje = 'No se han encontrado Usuarios';
                    selectUsuarios.append(`<option value="-1" title="${mensaje}">${mensaje}</option>`);
                }
            }
        });
    }
    $('#buscar_NombrePersona, #buscar_CorreoPersona').on('keyup', _ => {
        actualizarSelect();
    });

    $('#seleccionar_Persona').on('click', _ => {
        let seleccion = $('#seleccionar_Persona').val()[0];
        if (seleccion != "-1") {
            let datosPersona = seleccion.split('-'); //id-nombre-correo
            $('#li_usuarioSeleccionado').text(`${datosPersona[1]} - ${datosPersona[2]}`);
            $('#idPersona').val(datosPersona[0]);
            $('#modalAgregar').modal('show');
        }
    });

    $('#btn_agregarAlHistorial').on('click', _ => {
        console.log("Hola1");
        let codigoPeticion = $('#codigoPeticion').val();
        let idPersona = $('#idPersona').val();

        $.ajax({
            url: '/dar_permisos',
            method: 'POST',
            data: {
                idPersona,
                codigoPeticion,
                titulo: "Espectador"
            },
            success: data => {
                actualizarSelect();
                $('#modalAgregar').modal('hide');
                let listaEspectadores = $('#espectadoresActuales');
                
                if (data.totalEspectadores == 1) {
                    listaEspectadores.html('');
                }
                listaEspectadores.append(
                    `<tr class="d-flex" id="tr-${idPersona}&${codigoPeticion}">
                        <td class="col-10 text-center">${data.persona.nombre} ${data.persona.apellido1} ${data.persona.apellido2} - ${data.persona.correo}</td>
                        <td class="col-2 text-center my-auto bg-light">
                            <a href="" class="eliminarEspectador" id="${idPersona}&${codigoPeticion}">
                                <i class="fa fa-minus-circle" aria-hidden="true"></i>
                            </a>
                        </td>
                    </tr>`
                );
            }
        });
    });

    $(document).on('click', 'a.eliminarEspectador', e => {
        e.preventDefault();
        let activo = $(document.activeElement);
        let entrada = activo.attr('id');
        let condiciones = entrada.split("&");
        let padre = activo.parent().parent()[0];

        $.ajax({
            url: '/quitar_permisos',
            method: 'DELETE',
            data: {
                idPersona: condiciones[0],
                codigoPeticion: condiciones[1]
            },
            success: data => {
                padre.remove();
                if (data.totalEspectadores == 0) {
                    let listaEspectadores = $('#espectadoresActuales');
                    listaEspectadores.html('');
                    listaEspectadores.append(
                        `<tr class="d-flex" id="noespectadores">
                            <td class="col-10">No se encontraron espectadores</td>
                            <td class="col-2">
                                <a href="#" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                    <i class="fa fa-plus-circle" aria-hidden="true"></i>
                                </a>
                            </td>
                        </tr>`
                    );
                }
            }
        });
    });
});