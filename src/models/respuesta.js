const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const respuestaSchema = new Schema({
    asunto: { type: String, required: true },
    descripcion: { type: String, required: true },
    remitente: { type: String, required: true },
    destinatario: { type: String, required: true },
    peticionOrigen: { type: String, required: true},
    aceptado: {
        tipo: { type: Boolean, required: false },
        revisado: {type: Boolean, required: false},
        razon: { type: Array, required: false }
    }
}, {
    timestamps: true,
});

const Respuesta = mongoose.model('Respuesta', respuestaSchema);

module.exports = Respuesta;