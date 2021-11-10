const { mongoose, Grid } = require('../config/dependencies');
const { Adjunto } = require('../models/req_models');
const { getFileName } = require('../helpers/functions');

let gfs;
let conn = mongoose.connection;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

const funciones = {}

funciones.obtenerAdjunto_porMultiples = async condiciones => {
    let adjunto = await Adjunto.find(condiciones);
    return adjunto;
}

funciones.obtenerArchivos_porIdPeticion = async idPeticion => {
    let archivos = await funciones.obtenerAdjunto_porMultiples({ idMedio: idPeticion });
    let ids = [];
    for (const adjunto of archivos) {
        ids.push(mongoose.Types.ObjectId(adjunto.idArchivo));
    }
    
    let promesa = new Promise(async (resolve, reject) => {
        await gfs.files.find({ _id: { $in: ids } }).toArray((err, files) => {
            files.map(file => {
                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                    file.esImagen = true;
                }
                file.originalname = getFileName(archivos, file._id)[0].nombreArchivo;
            });
            resolve(files);
        });
    });
    return promesa;
}

module.exports = funciones;