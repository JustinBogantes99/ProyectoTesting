$(function () {
    $('#btn_consultarPeticion').on('click', _ => {
        $('#idAsunto').val("");
        $('#idDestinatarios').val("");
        $('#asuntoPreliminar').val("");
        $('#usuarioDestino').val("");
        let idUsuario = $('#idUsuario').val();
        let codigo = $('#idCodigoPeticion').val();
        let asunto = $('#idNombrePeticion').val();
        let selectUsuarios = $('#idUsuarios');
        selectUsuarios.html('');
        selectUsuarios.append(`<option value="-1">No se han encontrado Usuarios</option>`);
        $('#destinatario').val("");
        $.ajax({
            url: '/obtener_peticiones',
            method: 'POST',
            data: {
                idUsuario,
                codigo,
                asunto
            },
            success: peticiones => {
                let selectPeticiones = $('#idPeticiones');
                selectPeticiones.html('');
                if (Object.keys(peticiones).length > 0) {
                    consultarRespuesta(peticiones);
                } else {
                    selectPeticiones.append(`<option value="-1">No se han encontrado Peticiones</option>`);
                }
            }
        })
    });

    $('#idPeticiones').on('click', _ => {
        let peticionElegida = $('#idPeticiones option:selected');
        let selectUsuarios = $('#idUsuarios');
        selectUsuarios.html('');
        selectUsuarios.append(`<option value="-1">No se han encontrado Usuarios</option>`);
        $('#destinatario').val("");
        if (peticionElegida.val() === "-1") {
            $('#idAsunto').val("");
            $('#idDestinatarios').val("");
            $('#asuntoPreliminar').val("");
            $('#usuarioDestino').val("");
            $('#idDestinatarios').val("");
        } else {
            $('#idAsunto').val(peticionElegida.html());
            $('#asuntoPreliminar').val(peticionElegida.val());
            obtenerDestinario();
            obtenerFechaLimite();
        }
    });

    function obtenerDestinario() {
        let idPeticion = $('#asuntoPreliminar').val();
        $.ajax({
            url: '/obtener_remitente_de_peticion',
            method: 'POST',
            data: {
                idPeticion
            },
            success: persona => {
                let idPersona = persona._id;
                let correoPersona = persona.correo;
                $('#usuarioDestino').val(idPersona);
                $('#idDestinatarios').val(correoPersona);
            }
        });
    }

    function consultarRespuesta(peticiones) {
        let selectPeticiones = $('#idPeticiones');
        selectPeticiones.html('');
        var bandera = 1;
        peticiones.forEach(peticion => {
            let idPeticion = peticion._id;
            $.ajax({
                url: '/obtener_respuesta_peticion',
                method: 'POST',
                data: {
                    idPeticion
                },
                success: respuesta => {
                    if (respuesta == null) {
                        if (bandera == 1) {
                            selectPeticiones.html('');
                            selectPeticiones.append('<option value="-1">Seleccione una petición</option>');
                            bandera = 0;
                        }
                        selectPeticiones.append(`<option value="${peticion._id}">${peticion.codigo} - ${peticion.asunto}</option>`);
                    }
                    else {
                        if (bandera == 1) {
                            selectPeticiones.html('');
                            selectPeticiones.append(`<option value="-1">No se han encontrado Peticiones</option>`);
                        }
                    }
                }
            });
        });
    }

    function obtenerFechaLimite() {
        let idPeticion = $('#asuntoPreliminar').val();
        $.ajax({
            url: '/obtener_fecha_limite',
            method: 'POST',
            data: {
                idPeticion
            },
            success: peticion => {
                let MaxDate = peticion.fechaLimite;
                var tomorrow = new Date(MaxDate);
                tomorrow.setDate(tomorrow.getDate() + 1);
                jQuery(document).ready(function ($) {
                    $('#date').datepicker({
                        maxDate: tomorrow
                    });
                });
            }
        });
    }

    $('#btn_detallePeticion').on('click', _ => {
        let peticionSeleccionada = $('#idPeticiones').val();
        if (peticionSeleccionada === "-1" || peticionSeleccionada === "") {
            $('#modal_errorPeticion').modal('show');
        }
        else {
            $.ajax({
                url: '/obtener_una_peticion',
                method: 'POST',
                data: {
                    peticionSeleccionada
                },
                success: peticion => {
                    let asunto = peticion.asunto;
                    let codigo = peticion.codigo;
                    let descripcion = peticion.descripcion;
                    let remitente = "Recibido de parte de: " + $('#idDestinatarios').val();
                    let link = "/inicio/mostrar_peticion/" + peticion._id;
                    $("#modal_linkPeticion").attr("href", link);
                    $('#modal_asuntoPeticion').html(asunto);
                    $('#modal_codigo').html(codigo);
                    $(tinymce.get('modal_descripcionPeticion').getBody()).html(descripcion);
                    $('#modal_remitentePeticion').html(remitente);
                    $('#modal_detallesPeticion').modal('show');
                }
            });
        }
    });
});