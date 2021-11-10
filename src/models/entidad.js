const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const entidadSchema = new Schema({
    nombre: { type: String, required: true }
});

const Entidad = mongoose.model('entidad', entidadSchema);

module.exports = Entidad;