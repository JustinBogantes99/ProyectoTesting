// General del Archivo de Rutas

const { express, mongoose, Grid } = require('../config/dependencies');
const router = express.Router();

// Funciones / Variables Requeridas por el Archivo de Rutas
const daoArchivo = require('../daos/archivo.dao');
const daoPeticion = require('../daos/peticion.dao');
const funcionesFecha = require('../helpers/functions/funcionesFecha');

const { upload } = require('../config/database');
const { getFileName } = require('../helpers/functions');
const { construirCorreo } = require('../helpers/mailService');
const { isAuthenticated, isAllowed } = require('../helpers/auth');
const { validarYSubirArchivos } = require('../models.valid/peticion.val');

const funcionesHistorial = require('../helpers/functions/funcionesHistorial');

let gfs;
let conn = mongoose.connection;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Modelos Requeridos

const { Persona, Peticion, Adjunto } = require('../models/req_models');
const funciones = require('../daos/archivo.dao');



// ---------------------------------------------------------------------- Rutas del Archivo

router.get('/inicio/formular_peticion', isAuthenticated, (req, res) => {
    res.render('./envioRespuesta/formularPeticion', { fechaActual: (new Date()) });
});

//Envío de la petición
router.post('/inicio/agregar_peticion', validarYSubirArchivos, isAuthenticated, async (req, res) => {
    let data = req.body;
    data.fechaLimite = funcionesFecha.finalDelDia(data.fechaLimite);
    if (typeof data.errors !== 'undefined') {
        res.render('./envioRespuesta/formularPeticion', data);
    }
    else {
        data.remitente = req.user.id;
        await daoPeticion.registrarPeticion(data, req);

        req.flash('success_msg', 'Se ha enviado la petición correctamente.');
        res.redirect('/inicio/formular_peticion');
    }
});

//Visualización de la petición
router.get('/inicio/mostrar_peticion/:id', isAuthenticated, isAllowed, async (req, res) => {
    let idPeticion = req.params.id;
    let data = await daoPeticion.obtenerPeticion(idPeticion, req.user._id);

    if (typeof data.error !== 'undefined') {
        res.redirect('/inicio/mostrar_peticion');
    }
    else {
        res.render('./envioRespuesta/mostrarPeticion', data);
    }
});

router.get('/inicio/mostrar_peticion', isAuthenticated, (req, res) => {
    res.render('./envioRespuesta/mostrarPeticion');
});

router.get('/inicio/delegar_peticion/:id', isAuthenticated, isAllowed, async (req, res) => {  //Refactorizar
    let idPeticion = req.params.id;
    let peticion = await Peticion.findById(idPeticion);
    let nombrePeticion = peticion.asunto;
    let codigo = peticion.codigo;
    let nivel = peticion.nivel;
    let fechaLimite = peticion.fechaLimite;
    let descripcion = peticion.descripcion;
    let usuario = await Persona.findById(peticion.remitente);
    let remitente = usuario.correo;

    let archivos = await daoArchivo.obtenerArchivos_porIdPeticion(idPeticion);

    res.render('./envioRespuesta/delegarPeticionEspecifica', { idPeticion, nombrePeticion, codigo, fechaLimite: funcionesFecha.formatDate(fechaLimite), descripcion, remitente, archivos, nivel });
});

router.post('/inicio/agregar_delegacion', isAuthenticated, upload.array('file'), async (req, res) => { //Refactorizar
    const { asunto, descripcion, fechaLimite, prioridad, destinatarioCorreo, idPeticion, ventana, archivos, nivel } = req.body;
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
    if (errors.length > 0) {
        let arrepentimiento = req.files;
        arrepentimiento.forEach(archivo => {
            gfs.remove({ _id: archivo.id, root: 'uploads' });
        });
        if (ventana == 1) {
            req.flash('error_msg', "Los campos no pueden estar vacíos");
            res.redirect('/inicio/delegar_peticion/'+idPeticion);
        }
    }
    else {
        let peticion = await Peticion.findById(idPeticion);
        let nuevoNivel = parseInt(nivel, 10) + 1;
        const destinatarioCompleto = await Persona.findOne({ correo: destinatarioCorreo });
        let fechaLimiteFinaldelDia = funcionesFecha.finalDelDia(fechaLimite);
        const nuevaPeticion = new Peticion({
            codigo: peticion.codigo,
            nivel: nuevoNivel,
            asunto,
            descripcion,
            fechaLimite:fechaLimiteFinaldelDia,
            estado: "Activo",
            prioridad,
            remitente: req.user.id,
            destinatario: destinatarioCompleto._id,
            peticionOrigen: idPeticion
        });

        await nuevaPeticion.save(function (err, peticion) {

            for (const archivo of req.files) {
                let idArchivo = archivo.id;
                let nombreArchivo = archivo.originalname;
                let idMedio = peticion._id;
                let tipoMedio = "Peticion";
                let registroAdjunto = new Adjunto({ idArchivo, nombreArchivo, idMedio, tipoMedio });
                registroAdjunto.save();
            }

            if (typeof archivos === "string") {
                let idNombreArchivo = archivos.split("|");
                let registroAdjunto = new Adjunto({
                    idArchivo: idNombreArchivo[0],
                    nombreArchivo: idNombreArchivo[1],
                    idMedio: peticion._id,
                    tipoMedio: "Peticion"
                });
                registroAdjunto.save();
            }
            else if (typeof archivos !== "undefined") {
                for (const archivo of archivos) {
                    let idNombreArchivo = archivo.split("|");
                    let registroAdjunto = new Adjunto({
                        idArchivo: idNombreArchivo[0],
                        nombreArchivo: idNombreArchivo[1],
                        idMedio: peticion._id,
                        tipoMedio: "Peticion"
                    });
                    registroAdjunto.save();
                }
            }
            construirCorreo({ persona: [req.user, destinatarioCompleto], mensaje: 'Nueva_Delegacion', tipo: 'Peticion', idPeticion: peticion._id, asuntoPrimario: asunto, req });
        });

        req.flash('success_msg', 'Se ha delegado la petición correctamente.');
        if (ventana == 1) {
            res.redirect('/inicio/delegar_peticion/' + idPeticion);
        }
    }
});

router.get('/inicio/modificar_peticion/:id', isAuthenticated, isAllowed, async (req, res) => { // Refactorizar
    const idPeticion = req.params.id;
    let peticion = await Peticion.findById(idPeticion);
    if (peticion) {
        let remitente = await Persona.findById(peticion.remitente);
        let fechaLimite = funcionesFecha.formatDate(peticion.fechaLimite);
        let archivos = await Adjunto.find({ idMedio: peticion._id });
        if (archivos) {
            let ids = []
            for (const adjunto of archivos) {
                ids.push(mongoose.Types.ObjectId(adjunto.idArchivo));
            }
            await gfs.files.find({ _id: { $in: ids } }).toArray((err, files) => {
                files.map(file => {
                    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                        file.esImagen = true;
                    }
                    file.originalname = getFileName(archivos, file._id)[0].nombreArchivo;
                });
                res.render('./envioRespuesta/modificarPeticion', { peticion, remitente, fechaLimite, files: files });
            });
        }
    }
});

router.post('/inicio/modificar_peticion', isAuthenticated, upload.array('file'), async (req, res) => { // Refactorizar
    let data_Anterior = req.body;
    for (propiedad in data_Anterior) {
        data_Anterior[propiedad] = data_Anterior[propiedad].trim();
    }
    const { idPeticion, asunto, descripcion, fechaLimite, prioridad, destinatario } = data_Anterior;
    const errors = [];
    if (asunto.length <= 0) {
        errors.push({ text: 'La asunto no puede estar vacío.' });
    }
    if (descripcion.length <= 0) {
        errors.push({ text: 'La descripción no puede estar vacía.' });
    }
    if (fechaLimite.length <= 0) {
        errors.push({ text: 'La fecha límite no puede estar vacía.' });
    }
    if (prioridad.length <= 0) {
        errors.push({ text: 'La prioridad no puede estar vacía.' });
    }
    if (destinatario.length <= 0) {
        errors.push({ text: 'El destinatario no puede estar vacío.' });
    }
    if (errors.length > 0) {
        let arrepentimiento = req.files;
        arrepentimiento.forEach(archivo => {
            gfs.remove({ _id: archivo.id, root: 'uploads' });
        });
        req.flash('error_msg', "Los campos no pueden estar vacíos");
        res.redirect('/inicio/modificar_peticion/'+idPeticion);
    }
    else {
        let peticion = await Peticion.findById(idPeticion);
        let antiguoAsunto = peticion.asunto;
        let fechaLimiteFinaldelDia = funcionesFecha.finalDelDia(fechaLimite);
        await Peticion.findByIdAndUpdate(idPeticion, { asunto, descripcion, fechaLimite:fechaLimiteFinaldelDia, estado: peticion.estado, prioridad, destinatario });

        const destinatarioCompleto = await Persona.findById(destinatario);
        for (const archivo of req.files) {
            let idArchivo = archivo.id;
            let nombreArchivo = archivo.originalname;
            let idMedio = idPeticion;
            let tipoMedio = "Peticion";
            let registroAdjunto = new Adjunto({ idArchivo, nombreArchivo, idMedio, tipoMedio });
            registroAdjunto.save();
        }
        await construirCorreo({ persona: [req.user, destinatarioCompleto], mensaje: 'Peticion_Modificada', tipo: 'Peticion', idPeticion, asuntoPrimario: [asunto, antiguoAsunto], req });
        req.flash('success_msg', 'Se ha modificado la petición correctamente.');
        res.redirect('/inicio/mostrar_peticion/' + idPeticion);
    }
});

router.get('/inicio/historial/:codigo', isAuthenticated, isAllowed, async (req, res) => {
    let codigoPeticion = req.params.codigo;
    let idPersona = req.user._id;
    let espectadores = await daoPeticion.obtenerEspectadores({ codigoPeticion, titulo: "Espectador" });
    let peticionesOrden = await funcionesHistorial.crearHistorial(codigoPeticion);
    let esAdministrador = await daoPeticion.esAdministrador({ idPersona, codigoPeticion });
    
    res.render('./historial/historial', { codigoPeticion, peticionesOrden, esAdministrador, espectadores });
});

module.exports = router;
