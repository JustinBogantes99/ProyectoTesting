const socketHelper = require('./socketHelper');
const { EMAIL_CRED } = require('../config/properties');

const { Persona } = require('../models/req_models');
const { nodeoutlook } = require('../config/dependencies');
const funcionesFecha = require('./functions/funcionesFecha');

const emailFunctions = {};

async function enviarNotificacion (data) {
    let io = socketHelper.get();
    const usuarioNotificar = data.idUsuarioNotificar;
    let actualizacion; 
    let tipoNotificacion;
    nuevaNotificacion = {
        asunto: data.asunto,
        enlace: data.enlace,
        leido: 0
    }
     
    if(data.categoria == "peticion"){
        actualizacion = { notificacionPeticion: {$each: [nuevaNotificacion], $position: 0}};
        tipoNotificacion = "notificacionPeticion";
    }else if(data.categoria == "respuesta"){
        actualizacion = { notificacionRespuesta: {$each: [nuevaNotificacion], $position: 0}};
        tipoNotificacion = "notificacionRespuesta";
    }else if(data.categoria == "modificacion"){
        actualizacion = { notificacionModificacion: {$each: [nuevaNotificacion], $position: 0}};
        tipoNotificacion = "notificacionModificacion";
    }else if(data.categoria == "fecha"){
        actualizacion = { notificacionFecha: {$each: [nuevaNotificacion], $position: 0}};
        tipoNotificacion = "notificacionFecha";
    }
    await Persona.findByIdAndUpdate(usuarioNotificar, { $push: actualizacion }).then(async _ => {
        let persona = await Persona.findById(usuarioNotificar);
        nuevaNotificacion.id = persona[tipoNotificacion][0]._id;
    });
    nuevaNotificacion.categoria = data.categoria;
    io.sockets.in(usuarioNotificar).emit('mostrar notificacion', [nuevaNotificacion]);
}

emailFunctions.construirCorreo = async (data) => {
    // Datos recibidos
    let personaOrigen = data.persona[0];
    let personaDestino = data.persona[1];
    let mensaje = data.mensaje;
    let tipo = data.tipo;
    let idPeticion = data.idPeticion;
    let asuntoPrimario = data.asuntoPrimario;
    let req = data.req;
    // Datos ingresados extra
    let asunto;
    let descripcion;        //descripcion dirigida al receptor
    let descripcionInversa; //descripcion dirigida al enviador
    let urlDestino;
    let nombreOrigenCompleto = personaOrigen.nombre + ' ' 
        + personaOrigen.apellido1 + ' ' + personaOrigen.apellido2;
    let nombreDestinoCompleto = personaDestino.nombre + ' ' 
        + personaDestino.apellido1 + ' ' + personaDestino.apellido2;
    let categoria;
    let asuntoNotificacion;
    // Formalizacion del correo
    if (tipo == 'Peticion') {
        urlDestino = req.protocol + '://' + req.get('host') + '/inicio/mostrar_peticion/' + idPeticion;
    }
    else if (tipo == 'Respuesta') {
        urlDestino = req.protocol + '://' + req.get('host') + '/inicio/mostrar_respuesta/' + idPeticion;
    }
    if (mensaje == 'Nueva_Peticion') {
        asunto = "RequesTec | Nueva Petición";
        descripcion = 'Usted ha recibido una petición del usuario ' + nombreOrigenCompleto + '.\n\n'
            + 'Asunto de la Petición: ' + asuntoPrimario + '\n'
            + 'Enlace de la Petición: ' + urlDestino;
        descripcionInversa = 'Usted ha enviado una petición al usuario ' + nombreDestinoCompleto + '.\n\n'
            + 'Asunto de la Petición: ' + asuntoPrimario + '\n'
            + 'Enlace de la Petición: ' + urlDestino;
        categoria = "peticion";
        asuntoNotificacion = "Tienes una nueva petición de " + nombreOrigenCompleto;
        
    }
    else if (mensaje == 'Nueva_Delegacion') {
        asunto = "RequesTec | Nueva Delegación";
        descripcion = 'Usted ha recibido una delegación del usuario ' + nombreOrigenCompleto + '.\n\n'
            + 'Asunto de la Delegación: ' + asuntoPrimario + '\n'
            + 'Enlace de la Delegación: ' + urlDestino;
        descripcionInversa = 'Usted ha realizado una delegación al usuario ' + nombreDestinoCompleto + '.\n\n'
            + 'Asunto de la Delegación: ' + asuntoPrimario + '\n'
            + 'Enlace de la Delegación: ' + urlDestino;
        categoria = "peticion";
        asuntoNotificacion = "Tienes una nueva delegación de " + nombreOrigenCompleto;
    }
    else if (mensaje == 'Nueva_Respuesta') {
        asunto = "RequesTec | Nueva Respuesta";
        descripcion = 'Usted ha recibido una respuesta del usuario ' + nombreOrigenCompleto + '.\n\n'
            + 'Asunto de la Respuesta: ' + asuntoPrimario + '\n'
            + 'Enlace de la Respuesta: ' + urlDestino;
        descripcionInversa = 'Usted ha enviado una respuesta al usuario ' + nombreDestinoCompleto + '.\n\n'
            + 'Asunto de la Respuesta: ' + asuntoPrimario + '\n'
            + 'Enlace de la Respuesta: ' + urlDestino;
        categoria = "respuesta";
        asuntoNotificacion = "Tienes una nueva respuesta de " + nombreOrigenCompleto;
    }
    else if (mensaje == 'Peticion_Modificada') {
        asunto = "RequesTec | Petición Modificada";
        descripcion = 'El usuario ' + nombreOrigenCompleto + ' ha modificado una petición.\n\n'
            + 'Nuevo asunto de la Petición: ' + asuntoPrimario[0] + '\n'
            + 'Anterior asunto de la Petición: ' + asuntoPrimario[1] + '\n'
            + 'Enlace de la Petición: ' + urlDestino;
        descripcionInversa = 'Usted ha modificado una petición dirigida al usuario ' + nombreDestinoCompleto + '.\n\n'
            + 'Nuevo asunto de la Petición: ' + asuntoPrimario[0] + '\n'
            + 'Anterior asunto de la Petición: ' + asuntoPrimario[1] + '\n'
            + 'Enlace de la Petición: ' + urlDestino;
        categoria = "modificacion";
        asuntoNotificacion = nombreOrigenCompleto + " ha modificado una petición" ;
    }
    else if (mensaje == 'Respuesta_Modificada') {
        asunto = "RequesTec | Respuesta Modificada";
        descripcion = 'El usuario ' + nombreOrigenCompleto + ' ha modificado una respuesta.\n\n'
            + 'Asunto de la Respuesta: ' + asuntoPrimario + '\n'
            + 'Enlace de la Respuesta: ' + urlDestino;
        descripcionInversa = 'Usted ha modificado una respuesta dirigida al usuario ' + nombreDestinoCompleto + '.\n\n'
            + 'Asunto de la Respuesta: ' + asuntoPrimario + '\n'
            + 'Enlace de la Respuesta: ' + urlDestino;
        categoria = "modificacion";
        asuntoNotificacion = nombreOrigenCompleto + " ha modificado una respuesta" ;
    }
    else if (mensaje == 'Respuesta_Aceptada') {
        asunto = "RequesTec | Respuesta Aceptada";
        descripcion = 'El usuario ' + nombreOrigenCompleto + ' ha aceptado su respuesta.\n\n'
            + 'Asunto de la Respuesta: ' + asuntoPrimario + '\n'
            + 'Enlace de la Respuesta: ' + urlDestino;
        descripcionInversa = 'Usted ha aceptado una respuesta del usuario ' + nombreDestinoCompleto + '.\n\n'
            + 'Asunto de la Respuesta: ' + asuntoPrimario + '\n'
            + 'Enlace de la Respuesta: ' + urlDestino;
        categoria = "respuesta";
        asuntoNotificacion = nombreOrigenCompleto + " ha aceptado una respuesta" ;
    }
    else if (mensaje == 'Respuesta_Rechazada') {
        asunto = "RequesTec | Respuesta Rechazada";
        descripcion = 'El usuario ' + nombreOrigenCompleto + ' ha rechazado su respuesta.\n\n'
            + 'Asunto de la Respuesta: ' + asuntoPrimario[0] + '\n'
            + 'Razón: ' + asuntoPrimario[1] + '\n'
            + 'Enlace de la Respuesta: ' + urlDestino;
        descripcionInversa = 'Usted ha rechazado una respuesta al usuario ' + nombreDestinoCompleto + '.\n\n'
            + 'Asunto de la Respuesta: ' + asuntoPrimario[0] + '\n'
            + 'Razón: ' + asuntoPrimario[1] + '\n'
            + 'Enlace de la Respuesta: ' + urlDestino;
        categoria = "respuesta";
        asuntoNotificacion = nombreOrigenCompleto + " ha rechazado una respuesta" ;
    }

    descripcion += '\n\n- Equipo de RequesTec';
    descripcionInversa += '\n\n- Equipo de RequesTec';

    await enviarNotificacion({asunto: asuntoNotificacion, enlace: urlDestino, categoria, idUsuarioNotificar: personaDestino._id});

    crearEmailyEnviar({     //Correo al receptor
        personaObjetivo: personaDestino.correo, 
        asunto, 
        descripcion
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    crearEmailyEnviar({     //Correo al emisor
        personaObjetivo: personaOrigen.correo, 
        asunto, 
        descripcion:descripcionInversa
    });

}

emailFunctions.construirCorreoPorTiempo = async (data) => {
    let asuntoNotificacion;
    let categoria = "fecha";
    let persona = data.persona;
    let peticiones = data.peticiones;
    let dir = data.dir;
    let dias = data.dias;
    let nombreCompleto = persona.nombre + ' ' 
        + persona.apellido1 + ' ' + persona.apellido2;
    // Partes del correo
    let asunto = 'RequesTec | Peticiones Pendientes';
    let descripcion = 'Hola, ' + nombreCompleto + '.\n\n'
        + 'A continuación se le presentan las peticiones que acaban dentro de los próximos '
        + dias + ' días:\n';
    for await (const peticion of peticiones) {
        let urlDestino = dir + '/inicio/mostrar_peticion/' + peticion._id;
        let limite = funcionesFecha.formatDate(peticion.fechaLimite);
        descripcion += '\t-' + peticion.asunto + '\n\t\t*Fecha Límite de la tarea: ' + limite
            + '\n\t\t*Acceda a esta tarea: ' + urlDestino + '\n\n';
        asuntoNotificacion = "Una peticion esta apunto de vencer";
        enviarNotificacion({asunto: asuntoNotificacion, enlace: urlDestino, categoria, idUsuarioNotificar: persona._id});
    }
    descripcion +='\n- Equipo de RequesTec';
    
    crearEmailyEnviar({
        personaObjetivo: persona.correo, 
        asunto, 
        descripcion
    });
}

function crearEmailyEnviar(data) {
    let mailOptions = {
        auth: EMAIL_CRED,
        from: EMAIL_CRED.user,
        to: data.personaObjetivo,
        subject: data.asunto,
        text: data.descripcion,
        onError: (e) => console.log(e),
        onSuccess: (i) => console.log(i)
    }
    nodeoutlook.sendEmail(mailOptions);
}

emailFunctions.correoContrasenna= (data) => {
    let req = data.req;
    let asunto = 'Cambio de contraseña RequesTec.';
    let descripcion = 'Este es un correo solicitado para el cambio de contraseña de su cuenta en RequesTec, el siguiente link no debe de ser compartido con nadie:' + '\n';
    let urlDestino = req.protocol + '://' + req.get('host') + '/cambiar_contrasenna/' + data.token;
    descripcion += urlDestino + '\n';
    descripcion += 'En caso de no haber solicitado el cambio de contraseña, ignore este correo.' + '\n';
    descripcion += 'Equipo RequesTec.';
    contenidoCorreo = {
        personaObjetivo: data.correo, 
        asunto, 
        descripcion
    }
    crearEmailyEnviar(contenidoCorreo)
}

emailFunctions.correoAgregarDepartamentoEntidad= (data) => {
    let req = data.req;
    let asunto = 'Agregar Entidades o Departamentos.';
    let descripcion = 'Este es un correo solicitado para agregar entidades o departamentos al sistema de RequesTec, el siguiente link no debe de ser compartido con nadie:' + '\n';
    let urlDestino = req.protocol + '://' + req.get('host') + '/registro_entidad_departamento/' + data.token;
    descripcion += urlDestino + '\n';
    descripcion += 'Cuenta con un tiempo máximo de 3 horas para acceder a este link.' + '\n';
    descripcion += 'En caso de no haber solicitado agregar entidades o departamentos al sistema de RequesTec, ignore este correo.' + '\n';
    descripcion += 'Equipo RequesTec.';
    contenidoCorreo = {
        personaObjetivo: EMAIL_CRED.user, 
        asunto, 
        descripcion
    }
    crearEmailyEnviar(contenidoCorreo)
}

module.exports = emailFunctions;