const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adjuntoSchema = new Schema({
    idArchivo: { type: String, required: true },
    nombreArchivo: { type: String, required: true },
    idMedio: { type: String, required: true },
    tipoMedio: { type: String, required: true }
});

const Adjunto = mongoose.model('Adjunto', adjuntoSchema);

module.exports = Adjunto;