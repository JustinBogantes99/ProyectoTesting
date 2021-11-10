const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const notificacionSchema = new Schema({
    asunto: { type: String, required: true },
    enlace: { type: String, required: true },
    leido: { type: Boolean, required: true }
}, {
    timestamps: true,
});

const personaSchema = new Schema({
    nombre: { type: String, required: true },
    apellido1: { type: String, required: true },
    apellido2: { type: String, required: true },
    telefono: { type: String, required: true },
    correo: { type: String, required: true },
    contrasena:{ type: String, required: true },
    departamento: { type: String, required: false},
    token: { type: String, required: false},
    fechaFinToken: { type: Date, required: false},
    notificacionPeticion: { type: [notificacionSchema], required: false},
    notificacionRespuesta: { type: [notificacionSchema], required: false},
    notificacionModificacion: { type: [notificacionSchema], required: false},
    notificacionFecha: { type: [notificacionSchema], required: false}
}, {
    timestamps: true,
});

personaSchema.methods.encryptPassword = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(contrasena, salt);
    return hash;
};

personaSchema.methods.matchPassword = async function (contrasena) {
    return await bcrypt.compare(contrasena, this.contrasena);
};

const Persona = mongoose.model('Persona', personaSchema);

module.exports = Persona;
