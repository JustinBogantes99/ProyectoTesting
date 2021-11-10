const { DB } = require('../config/properties');
const { path, crypto, multer, GridFsStorage } = require('../config/dependencies');

const validaciones = {}

// Validacion de los campos

function validarCampos(data) {
    const { asunto, descripcion, fechaLimite, prioridad, destinatarioCorreo } = data;
    const errors = [];

    if (asunto.length <= 0) {
        errors.push({ text: 'El asunto no puede estar vacío.' });
    }
    if (descripcion.length <= 0) {
        errors.push({ text: 'La descripción no puede estar vacía.' });
    }
    if (fechaLimite.length <= 0) {
        errors.push({ text: 'La fecha no puede estar vacía.' });
    }
    if (prioridad.length <= 0) {
        errors.push({ text: 'La prioridad no puede estar vacía.' });
    }
    if (destinatarioCorreo.length <= 0) {
        errors.push({ text: 'Debe agregar un destinatario.' });
    }
    return errors;
}

// Almacenamiento de archivos

const storage = new GridFsStorage({
    url: DB,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        req.body.val = 1;
        errors = validarCampos(req.body);
        if (errors.length == 0) {
            return new Promise((resolve, reject) => {
                crypto.randomBytes(16, (err, buf) => {
                    if (err) {
                        return reject(err);
                    }
                    const filename = buf.toString('hex') + path.extname(file.originalname);
                    const fileInfo = {
                        filename: filename,
                        bucketName: 'uploads'
                    };
                    resolve(fileInfo);
                });
            });
        }
        else {
            req.body.errors = errors;
        }
    }
});

let upload = multer({ storage }).array('file');

// Funcion Publica

validaciones.validarYSubirArchivos = async (req, res, next) => {
    upload(req, res, _ => {
        if (typeof req.body.val === 'undefined') {
            errors = validarCampos(req.body);
            if (errors.length != 0) {
                req.body.errors = errors;
            }
        }
        else {
            delete req.body.val;
        }
        return next();
    });
}

module.exports = validaciones 
