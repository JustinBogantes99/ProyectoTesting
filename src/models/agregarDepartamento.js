const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agregarDepartamentoSchema = new Schema({
    token: { type: String, required: true },
    fechaFinToken: { type: Date, required: true }
});

const AgregarDepartamento = mongoose.model('AgregarDepartamento', agregarDepartamentoSchema);

module.exports = AgregarDepartamento;