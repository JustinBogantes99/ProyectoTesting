const { Persona } = require('../models/req_models');
const daoPersona = {};

const notselected = {
    token: 0, contrasena: 0,
    notificacionModificacion: 0,
    notificacionRespuesta: 0,
    notificacionPeticion: 0,
    notificacionFecha: 0
};

daoPersona.obtenerPersona_porId = async idPersona => {
    let persona = await Persona.findById(idPersona).select(notselected);
    return persona;
}

daoPersona.obtenerPersonas_porIds = async idsPersonas => {
    let personas = [];
    for await (id of idsPersonas) {
        let persona = await daoPersona.obtenerPersona_porId(id);
        personas.push(persona);
    }
    return personas;
}

daoPersona.obtenerPersona_porMultiples = async condiciones => {
    let persona = await Persona.find(condiciones).select(notselected);
    return persona;
}

daoPersona.obtenerPersona_porMultiples_ag = condiciones => {
    let personas = Persona.aggregate().project({
        nombreCompleto: { $concat: ['$nombre', ' ', '$apellido1', ' ', '$apellido2'] },
        nombre: 1,
        apellido1: 1,
        apellido2: 1,
        telefono: 1,
        correo: 1,
        departamento: 1
    }).match(condiciones);
    return personas;
}

daoPersona.nombreCompleto = persona => {
    let nombre = persona.nombre + " " + persona.apellido1 + " " + persona.apellido2;
    return nombre;
}

daoPersona.obtenerUnaPersonaPorMultiples = async condiciones => {
    let persona = await Persona.findOne(condiciones);
    return persona;
}

daoPersona.obtenerPersona_porToken = async token => {
    let persona = await Persona.findOne({ token: token });
    return persona;
}

daoPersona.actualizarToken = async persona => {
    await Persona.findByIdAndUpdate(persona._id, { token: persona.token, fechaFinToken: persona.fechaFinToken });
}

daoPersona.eliminarToken = async (idPersona) => {
    await Persona.findByIdAndUpdate(idPersona, { $unset: { token: 1, fechaFinToken: 1 } });
}

daoPersona.modificarNombre = async (idPersona, nombreN) => {
    await Persona.findByIdAndUpdate(idPersona, { nombre: nombreN });
}

daoPersona.modificarApellido1 = async (idPersona, apellido1N) => {
    await Persona.findByIdAndUpdate(idPersona, { apellido1: apellido1N });
}

daoPersona.modificarApellido2 = async (idPersona, apellido2N) => {
    await Persona.findByIdAndUpdate(idPersona, { apellido2: apellido2N });
}

daoPersona.modificarContrasenna = async (idPersona, contrasennaN) => {
    await Persona.findByIdAndUpdate(idPersona, { contrasena: contrasennaN });
}

daoPersona.modificarTelefono = async (idPersona, telefonoN) => {
    await Persona.findByIdAndUpdate(idPersona, { telefono: telefonoN });
}

daoPersona.asignarDepartamento = async (idPersona, idDepartamento) => {
    await Persona.findByIdAndUpdate(idPersona, { departamento: idDepartamento });
}

module.exports = daoPersona;