const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const personaxpeticionSchema = new Schema({
    codigoPeticion: { type: String, required: true },
    idPersona: { type: String, required: true },
    titulo: { type: String, required: true }
});

const PersonaxPeticion = mongoose.model('personaxpeticion', personaxpeticionSchema);

module.exports = PersonaxPeticion;