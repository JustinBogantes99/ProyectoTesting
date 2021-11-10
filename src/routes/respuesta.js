// General del Archivo de Rutas

const { express, mongoose, Grid } = require('../config/dependencies');
const router = express.Router();

// Funciones / Variables Requeridas por el Archivo de Rutas
const funcionesFecha = require('../helpers/functions/funcionesFecha');

const { upload } = require('../config/database');
const { getFileName } = require('../helpers/functions');
const { construirCorreo } = require('../helpers/mailService');
const { isAuthenticated, isAllowed } = require('../helpers/auth');

let gfs;
let conn = mongoose.connection;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Modelos Requeridos

const { Persona, Peticion, Respuesta, Adjunto } = require('../models/req_models');

// ---------------------------------------------------------------------- Rutas del Archivo

// Envío de la respuesta
router.post('/inicio/agregar_respuesta', isAuthenticated, upload.array('file'), async (req, res) => {
    const { asuntoOriginal, descripcion, remitente, destinatario, peticionOrigen } = req.body;
    const errors = [];
    if (asuntoOriginal.length <= 0) {
        errors.push({ text: 'El asunto no puede estar vacío.' });
    }
    if (descripcion.length <= 0) {
        errors.push({ text: 'La descripción no puede estar vacía.' });
    }
    if (remitente.length <= 0) {
        errors.push({ text: 'El remitente no puede estar vacío.' });
    }
    if (destinatario.length <= 0) {
        errors.push({ text: 'El destinatario no puede estar vacío.' });
    }
    if (peticionOrigen.length <= 0) {
        errors.push({ text: 'La respuesta de tener una petición origen.' });
    }
    if (errors.length > 0) {
        let arrepentimiento = req.files;
        arrepentimiento.forEach(archivo => {
            gfs.remove({ _id: archivo.id, root: 'uploads' });
        });
        res.render('inicio/responder_peticion', { errors, asunto, descripcion, remitente, destinatario, peticionOrigen });
    }
    else {
        const asunto = "Re: " + asuntoOriginal;
        const nuevaRespuesta = new Respuesta({ asunto, descripcion, remitente, destinatario, peticionOrigen });
        const destinatarioCompleto = await Persona.findById(destinatario);
        await nuevaRespuesta.save(function (err, respuesta) {
            idRespuesta = respuesta._id;
            for (const archivo of req.files) {
                let idArchivo = archivo.id;
                let nombreArchivo = archivo.originalname;
                let idMedio = idRespuesta;
                let tipoMedio = "Respuesta";
                let registroAdjunto = new Adjunto({ idArchivo, nombreArchivo, idMedio, tipoMedio });
                registroAdjunto.save();
            }
            construirCorreo({ persona: [req.user, destinatarioCompleto], mensaje: 'Nueva_Respuesta', tipo: 'Respuesta', idPeticion: idRespuesta, asuntoPrimario: asunto, req });
        });

        req.flash('success_msg', 'Se ha enviado la respuesta correctamente.');
        res.redirect('/inicio/mostrar_respuesta/' + nuevaRespuesta._id);
    }
});

// Visualización de la respuesta
router.get('/inicio/mostrar_respuesta/:id', isAuthenticated, isAllowed, async (req, res) => {
    let idRespuesta = req.params.id;
    if (idRespuesta.match(/^[0-9a-fA-F]{24}$/)) {
        let respuesta = await Respuesta.findById(idRespuesta);
        let longitud = respuesta.aceptado.razon.length;
        let ultimaRazon = respuesta.aceptado.razon[longitud - 1];
        let razon = ultimaRazon ? ultimaRazon : "";
        if (respuesta) {
            let nombrePeticionOrigen = await Peticion.findById(respuesta.peticionOrigen);
            respuesta.asuntoOrigen = nombrePeticionOrigen.asunto;
            let remitente = await Persona.findById(respuesta.remitente);
            respuesta.remitenteNombre = remitente.nombre + " " + remitente.apellido1 + " " + remitente.apellido2;
            respuesta.remitenteCorreo = remitente.correo;
            let destinatario = await Persona.findById(respuesta.destinatario);
            respuesta.destinatarioNombre = destinatario.nombre + " " + destinatario.apellido1 + " " + destinatario.apellido2;
            respuesta.destinatarioCorreo = destinatario.correo;
            respuesta.fechaInicio = funcionesFecha.formatDateHour(respuesta.createdAt);
            respuesta.fechaActualizacion = funcionesFecha.formatDateHour(respuesta.updatedAt);
            let archivos = await Adjunto.find({ idMedio: respuesta._id });
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
                    res.render('./envioRespuesta/mostrarRespuesta', { respuesta, files: files, razon });
                });
            }
        } else {
            res.redirect('/inicio/mostrar_respuesta');
        }
    }
    else {
        res.redirect('/inicio/mostrar_respuesta');
    }
});

router.get('/inicio/mostrar_respuesta', isAuthenticated, (req, res) => {
    res.render('./envioRespuesta/mostrarRespuesta')
});

router.post('/inicio/modificar_respuesta', isAuthenticated, upload.array('file'), async (req, res) => {
    const { idRespuesta, descripcion } = req.body;
    const errors = [];
    if (descripcion.length <= 0) {
        errors.push({ text: 'La descripción no puede estar vacía.' });
    }
    if (idRespuesta.length <= 0) {
        errors.push({ text: 'Ha ocurrido un error al seleccionar una respuesta.' });
    }
    if (errors.length > 0) {
        let arrepentimiento = req.files;
        arrepentimiento.forEach(archivo => {
            gfs.remove({ _id: archivo.id, root: 'uploads' });
        });
        res.render('inicio/mostrar_respuesta', { idRespuesta, descripcion });
    }

    else {
        let respuesta = await Respuesta.findById(idRespuesta);
        await Respuesta.findByIdAndUpdate(idRespuesta, { descripcion, aceptado: { revisado: false, tipo: respuesta.aceptado.tipo, razon: respuesta.aceptado.razon } });

        const asunto = respuesta.asunto;
        const destinatarioCompleto = await Persona.findById(respuesta.destinatario);
        for (const archivo of req.files) {
            let idArchivo = archivo.id;
            let nombreArchivo = archivo.originalname;
            let idMedio = idRespuesta;
            let tipoMedio = "Respuesta";
            let registroAdjunto = new Adjunto({ idArchivo, nombreArchivo, idMedio, tipoMedio });
            registroAdjunto.save();
        }
        await construirCorreo({ persona: [req.user, destinatarioCompleto], mensaje: 'Respuesta_Modificada', tipo: 'Respuesta', idPeticion: idRespuesta, asuntoPrimario: asunto, req });
        req.flash('success_msg', 'Se ha modificado la respuesta correctamente.');
        res.redirect('/inicio/mostrar_respuesta/' + idRespuesta);
    }
});

router.post('/inicio/aceptar_respuesta', isAuthenticated, async (req, res) => {
    const { idRespuesta } = req.body;
    const aceptado = { tipo: true }

    await Respuesta.findByIdAndUpdate(idRespuesta, { aceptado });
    let respuesta = await Respuesta.findById(idRespuesta);
    let destinatarioCompleto = await Persona.findById(respuesta.remitente);

    await construirCorreo({ persona: [req.user, destinatarioCompleto], mensaje: 'Respuesta_Aceptada', tipo: 'Respuesta', idPeticion: idRespuesta, asuntoPrimario: respuesta.asunto, req });

    await Peticion.findByIdAndUpdate(respuesta.peticionOrigen, { estado: "Inactivo" });

    req.flash('success_msg', 'Se ha aceptado la respuesta correctamente.');
    res.redirect('/inicio/mostrar_respuesta/' + idRespuesta);
});

router.post('/inicio/rechazar_respuesta', isAuthenticated, async (req, res) => {
    const { idRespuesta, Razon } = req.body;
    const aceptado = { tipo: false, revisado: true, razon: Razon }

    await Respuesta.findByIdAndUpdate(idRespuesta, { aceptado });
    let respuesta = await Respuesta.findById(idRespuesta);
    let destinatarioCompleto = await Persona.findById(respuesta.remitente);

    await construirCorreo({ persona: [req.user, destinatarioCompleto], mensaje: 'Respuesta_Rechazada', tipo: 'Respuesta', idPeticion: idRespuesta, asuntoPrimario: [respuesta.asunto, Razon], req });

    req.flash('success_msg', 'Se ha rechazado la respuesta correctamente.');
    res.redirect('/inicio/mostrar_respuesta/' + idRespuesta);
});

router.get('/inicio/modificar_respuesta/:id', isAuthenticated, isAllowed, async (req, res) => {
    let idRespuesta = req.params.id;
    if (idRespuesta.match(/^[0-9a-fA-F]{24}$/)) {
        let respuesta = await Respuesta.findById(idRespuesta);
        if (respuesta) {
            let nombrePeticionOrigen = await Peticion.findById(respuesta.peticionOrigen);
            respuesta.asuntoOrigen = nombrePeticionOrigen.asunto;

            let dest = await Persona.findById(respuesta.destinatario);
            respuesta.personaObjetivo = dest.nombre + " " + dest.apellido1 + " " + dest.apellido2;
            respuesta.personaObjetivo = dest.correo;

            let archivos = await Adjunto.find({ idMedio: respuesta._id });
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
                    res.render('./envioRespuesta/modificarRespuesta', { respuesta, files: files });
                });
            }
        } else {
            res.redirect('/inicio/mostrar_respuesta');
        }
    }
    else {
        res.redirect('/inicio/mostrar_respuesta');
    }
});

router.get('/inicio/responder_peticion/:id', isAuthenticated, isAllowed, async (req, res) => {
    const idPeticion = req.params.id;
    let peticion = await Peticion.findById(idPeticion);
    let remitente = await Persona.findById(peticion.remitente);
    res.render('./envioRespuesta/formularRespuestaEspecifica', { peticion, remitente });
});


module.exports = router;