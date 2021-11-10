const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const memoSchema = new Schema({
    peticionOrigen: {type: String, required: true},
    mensaje: { type: String, required: true },
    remitente: { type: String, required: true }
}, {
    timestamps: true,
});

const Memo = mongoose.model('Memo', memoSchema);

module.exports = Memo;