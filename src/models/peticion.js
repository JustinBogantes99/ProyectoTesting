const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const peticionSchema = new Schema({
    codigo: { type: String, required: true},
    nivel: { type: Number, required: true},
    asunto: { type: String, required: true },
    descripcion: { type: String, required: true },
    fechaLimite: { type: Date, required: true },
    estado: { type: String, required: true },
    prioridad: { type: String, required: true},
    remitente: { type: String, required: true },
    destinatario: { type: String, required: true },
    peticionOrigen: { type: String, required: false}
}, {
    timestamps: true,
});

const Peticion = mongoose.model('Peticion', peticionSchema);

module.exports = Peticion;