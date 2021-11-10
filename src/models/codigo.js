const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const codigoSchema = new Schema({
    categoria: { type: String, required: true},
    consecutivo: { type: Number, required: true },
    ndigitos: { type: Number, required: true }
});

const Codigo = mongoose.model('Codigo', codigoSchema);

module.exports = Codigo;