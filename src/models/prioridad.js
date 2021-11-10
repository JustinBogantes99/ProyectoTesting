const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const prioridadSchema = new Schema({
    tipo: { type: String, required: true },
    descripcion: { type: String, required: true }
});

const Prioridad = mongoose.model('prioridad', prioridadSchema);

module.exports = Prioridad;