function actualizarSelectorEntidad(){
    $('#seleccionar_Entidad').val("");
    let nombreEntidad = $('#buscar_NombreEntidad').val();
    $.ajax({
        url: '/obtener_entidades',
        method: 'POST',
        data: {
            nombreEntidad
        },
        success: entidades => {
            let selectEntidades = $('#seleccionar_Entidad');
            selectEntidades.html('');
            if (Object.keys(entidades).length > 0) {
                entidades.forEach(entidad => {
                    selectEntidades.append(`<option value="${entidad._id}">${entidad.nombre}</option>`);
                });
            }
            else {
                let mensaje = 'No se han encontrado entidades';
                selectEntidades.append(`<option value="" title="${mensaje}">${mensaje}</option>`);
            }
        }
    });
}

function actualizarInputEntidad(){
    let idEntidad = $('#seleccionar_Entidad').val()[0];
    if (idEntidad == "") {
        $('#entidad').val("");
        $('#idEntidad').val("");
    }
    else {
        let entidad = $('#seleccionar_Entidad option:selected').text();
        $('#entidad').val(entidad);
        $('#idEntidad').val(idEntidad);
    }
    $('#departamento').val("");
    $('#idDepartamento').val("");
    let selectDepartamentos = $('#seleccionar_Departamento');
    selectDepartamentos.html('');
    let mensaje = 'No se han encontrado departamentos';
    selectDepartamentos.append(`<option value="" title="${mensaje}">${mensaje}</option>`);
}

function actualizarSelectorDepart(){
    let selectDepartamentos = $('#seleccionar_Departamento');
    selectDepartamentos.val("");
    let nombreDepartamento = $('#buscar_NombreDepartamento').val();
    let idEntidad = $('#idEntidad').val();
    $.ajax({
        url: '/obtener_departamentos',
        method: 'POST',
        data: {
            idEntidad,
            nombreDepartamento
        },
        success: departamentos => {
            selectDepartamentos.html('');
            if (Object.keys(departamentos).length > 0) {
                departamentos.forEach(departamento => {
                    selectDepartamentos.append(`<option value="${departamento._id}">${departamento.nombre}</option>`);
                });
            }
            else {
                let mensaje = 'No se han encontrado departamentos';
                selectDepartamentos.append(`<option value="" title="${mensaje}">${mensaje}</option>`);
            }
        }
    });
}

function actualizarInputDepart(){
    let idDepartamento = $('#seleccionar_Departamento').val()[0];
    if (idDepartamento == "") {
        $('#departamento').val("");
        $('#idDepartamento').val("");
    }
    else {
        let departamento = $('#seleccionar_Departamento option:selected').text();
        $('#departamento').val(departamento);
        $('#idDepartamento').val(idDepartamento);
    }
}

$(function () {
    $('#buscar_NombreDepartamento').on('keyup', _ => {
        actualizarSelectorDepart();
    });
    $('#seleccionar_Departamento').on('click', _ => {
        actualizarInputDepart();
    });
});

$(function () {
    $('#buscar_NombreEntidad').on('keyup', _ => {
        actualizarSelectorEntidad();
    });
    $('#seleccionar_Entidad').on('click', _ => {
        actualizarInputEntidad();
    });
});

$('.greenLi').on('click', function () {
    $('.greenLi').removeClass('seleccionado');
    $(this).addClass('seleccionado');
});