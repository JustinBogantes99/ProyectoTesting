const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departamentoSchema = new Schema({
    entidad: { type: String, required: true },
    nombre: { type: String, required: true }
});

const Departamento = mongoose.model('departamento', departamentoSchema);

module.exports = Departamento;