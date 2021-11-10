const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const estadoSchema = new Schema({
    tipo: { type: String, required: true},
    descripcion: { type: String, required: true}
});

const Estado = mongoose.model('Estado', estadoSchema);

module.exports = Estado;