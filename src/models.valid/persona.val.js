const { Persona } = require('../models/req_models');

const validaciones = {}

validaciones.validarRegistro = async (data) => {
    const { nombre, apellido1, apellido2, telefono, correo, contrasena, confirma_contrasena } = data;
    const errors = [];

    if (nombre.length <= 0) {
        errors.push({ text: 'El nombre no puede estar vacío.' });
    }
    if (apellido1.length <= 0) {
        errors.push({ text: 'El primer apellido no puede estar vacío.' });
    }
    if (apellido2.length <= 0) {
        errors.push({ text: 'El segundo apellido no puede estar vacío.' });
    }
    if (telefono.length <= 0) {
        errors.push({ text: 'El teléfono no puede estar vacío.' });
    }
    if (correo.length <= 0) {
        errors.push({ text: 'El correo no puede estar vacío.' });
    }
    let erroresContrasenna = validaciones.validarContrasenna({contrasena, confirma_contrasena});
    errors.push(...erroresContrasenna);

    const correoUsuario = await Persona.findOne({ correo: correo });

    if (correoUsuario) {
        errors.push({ text: 'Este correo ya está en uso.' });
    }
    return { errors, nombre, apellido1, apellido2, telefono, correo, contrasena, confirma_contrasena };
}

validaciones.validarCorreo = async (data) => {
    const { correoRecuperar } = data;
    const errors = [];
    let persona = await Persona.findOne({ correo: correoRecuperar });
    if (persona === null) {
        errors.push({ text: 'El correo no pertenece a ningun usuario registrado en el sistema.' });
    }
    return { errors, persona }
}

validaciones.validarContrasenna = (data) => {
    const { contrasena, confirma_contrasena } = data;
    const errors = [];
    let mayuscula = false;
    let minuscula = false;
    let numero = false;
    let caracter_raro = false;

    for (let i = 0; i < contrasena.length; i++) {
        if (contrasena.charCodeAt(i) >= 65 && contrasena.charCodeAt(i) <= 90) {
            mayuscula = true;
        }
        else if (contrasena.charCodeAt(i) >= 97 && contrasena.charCodeAt(i) <= 122) {
            minuscula = true;
        }
        else if (contrasena.charCodeAt(i) >= 48 && contrasena.charCodeAt(i) <= 57) {
            numero = true;
        }
        else {
            caracter_raro = true;
        }
    }

    if (contrasena.length < 6) {
        errors.push({ text: 'La contraseña debe tener un tamaño mayor a 6 dígitos.' });
    }

    if (contrasena != confirma_contrasena) {
        errors.push({ text: 'Las contraseñas no coinciden.' });
    }

    if (!mayuscula) {
        errors.push({ text: 'La contraseña debe contener al menos una mayuscula.' });
    }

    if (!minuscula) {
        errors.push({ text: 'La contraseña debe contener al menos una minuscula.' });
    }

    if (!numero) {
        errors.push({ text: 'La contraseña debe contener al menos un número' });
    }
    return errors;
}

validaciones.validarLlenadoYContrasena = (data) => {
    const { contrasennaAnterior, nuevaContrasenna, nuevaContrasennaConfirmacion } = data;
    let errors = [];
    if (contrasennaAnterior.length <= 0 || nuevaContrasenna.length <= 0 || nuevaContrasennaConfirmacion <= 0) {
        errors.push({ text: 'Se deben llenar todos los campos de texto.' });
    }
    const dataAux = { contrasena: "", confirma_contrasena: "" };
    dataAux.contrasena = nuevaContrasenna;
    dataAux.confirma_contrasena = nuevaContrasennaConfirmacion;

    errors = errors.concat(validaciones.validarContrasenna(dataAux));
    return errors;
}

module.exports = validaciones 