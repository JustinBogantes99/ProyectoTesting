// General del Archivo de Rutas

const { express, mongoose, Grid } = require('../config/dependencies');
const router = express.Router();

// Funciones / Variables Requeridas por el Archivo de Rutas

const { isAuthenticated } = require('../helpers/auth');

let gfs;
let conn = mongoose.connection;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Modelos Requeridos

const { Persona, Peticion, Respuesta, Adjunto } = require('../models/req_models');
const daoPeticion = require('../daos/peticion.dao');
const daoPersona = require('../daos/persona.dao');
const daoAdministracion = require('../daos/administracion.dao');

// ---------------------------------------------------------------------- Rutas del Archivo

router.post('/obtener_usuarios', isAuthenticated, async (req, res) => {
    const { correo, entidad, departamento, correoRemitente, nombreUsuario } = req.body;

    let condiciones;
    if ((typeof entidad === "undefined" || entidad == "") &&
        (typeof departamento === "undefined" || departamento == "")) {
        condiciones = {};
    }
    else {
        let idsEntidades = await daoAdministracion.obtenerIdsEntidad(entidad);
        let idsDepartamentos = await daoAdministracion.obtenerIdsDepartamentos_porNombreXEntidades(idsEntidades, departamento);
        condiciones = { departamento: { $in: idsDepartamentos } };
    }

    Persona.aggregate().project({
        nombreCompleto: { $concat: ['$nombre', ' ', '$apellido1', ' ', '$apellido2'] },
        nombre: 1,
        apellido1: 1,
        apellido2: 1,
        telefono: 1,
        correo: 1,
        departamento: 1
    })
        .match({
            $and: [
                { nombreCompleto: new RegExp(nombreUsuario, 'i') },
                { correo: new RegExp(correo, 'i') },
                { correo: { $ne: req.user.correo } },
                { correo: { $ne: correoRemitente } },
                condiciones]
        })
        .sort({ nombre: 'desc' }).exec(async (err, usuarios) => {
            if (err) throw err;
            for (usuario of usuarios) {
                usuario.nombreDepartamento = await daoAdministracion.obtenerNombreDepartamento(usuario.departamento);
            }
            res.json(usuarios);
        });
});

router.post('/obtener_peticiones', isAuthenticated, async (req, res) => {
    const { idUsuario, codigo, asunto } = req.body;
    let peticiones = await Peticion.find({
        $and: [
            { destinatario: idUsuario },
            { codigo: new RegExp(codigo, 'i') },
            { asunto: new RegExp(asunto, 'i') }]
    }).sort({ fechaLimite: 'desc' });
    res.json(peticiones);
});

router.post('/obtener_remitente_de_peticion', isAuthenticated, async (req, res) => {
    const { idPeticion } = req.body;
    let peticion = await Peticion.findById(idPeticion);
    let persona = await Persona.findById(peticion.remitente);
    res.json(persona);
});

router.get('/imagen/:filename', isAuthenticated, (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'Archivo inaccesible'
            });
        }
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'No se trata de una imagen'
            })
        }
    });
});

router.get('/descargar/:filename', isAuthenticated, (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'Archivo inaccesible'
            });
        }
        // File exists
        res.set('Content-Type', file.contentType);
        res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');
        // streaming from gridfs
        var readstream = gfs.createReadStream({
            filename: req.params.filename
        });
        //error handling, e.g. file does not exist
        readstream.on('error', function (err) {
            throw err;
        });
        readstream.pipe(res);
    });
});

router.post('/obtener_fecha_limite', isAuthenticated, async (req, res) => {
    const { idPeticion } = req.body;
    let peticion = await Peticion.findById(idPeticion)
    res.json(peticion);
});

router.post('/obtener_una_peticion', isAuthenticated, async (req, res) => {
    const { peticionSeleccionada } = req.body;
    let peticion = await Peticion.findById(peticionSeleccionada)
    res.json(peticion);
});

router.post('/obtener_respuesta_peticion', isAuthenticated, async (req, res) => {
    const { idPeticion } = req.body
    let respuesta = await Respuesta.findOne({ peticionOrigen: idPeticion })
    res.json(respuesta);
})

router.delete('/eliminar_archivo', async (req, res) => {
    let { idArchivo } = req.body;
    gfs.remove({ _id: idArchivo, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }
    });
    let adjunto = await Adjunto.deleteMany({ idArchivo: idArchivo })
    //let adjunto = await Adjunto.findOneAndRemove({ idArchivo: idArchivo });
    res.json(adjunto);
});

router.post('/actualizar_notificacion', async (req, res) => {
    const { idNotificacion, idUsuario, tipoNotificacion } = req.body;
    let notificacionActualizada;
    let notificacionUsuario;
    let modificacion;
    if (tipoNotificacion == "peticion") {
        notificacionUsuario = { _id: idUsuario, "notificacionPeticion._id": idNotificacion };
        modificacion = { $set: { "notificacionPeticion.$.leido": 1 } };
    } else if (tipoNotificacion == "respuesta") {
        notificacionUsuario = { _id: idUsuario, "notificacionRespuesta._id": idNotificacion };
        modificacion = { $set: { "notificacionRespuesta.$.leido": 1 } };
    } else if (tipoNotificacion == "modificacion") {
        notificacionUsuario = { _id: idUsuario, "notificacionModificacion._id": idNotificacion };
        modificacion = { $set: { "notificacionModificacion.$.leido": 1 } };
    } else if (tipoNotificacion == "fecha") {
        notificacionUsuario = { _id: idUsuario, "notificacionFecha._id": idNotificacion };
        modificacion = { $set: { "notificacionFecha.$.leido": 1 } };
    }
    notificacionActualizada = await Persona.updateOne(notificacionUsuario, modificacion)
    res.json(notificacionActualizada);
});

router.post('/dar_permisos', isAuthenticated, async (req, res) => {
    try {
        let registro = req.body; // { codigoPeticion, idPersona }
        await daoPeticion.darPermisos(registro);
        let totalEspectadores = await daoPeticion.totalPermitidos({ codigoPeticion: registro.codigoPeticion, titulo: "Espectador" });
        let persona = await daoPersona.obtenerPersona_porId(registro.idPersona);
        
        res.json({ totalEspectadores, persona });
    } catch (error) {
        res.json(error);
    }
});

router.delete('/quitar_permisos', isAuthenticated, async (req, res) => {
    try {
        let registro = req.body; // { codigoPeticion, idPersona }
        await daoPeticion.quitarPermisos(registro);
        let totalEspectadores = await daoPeticion.totalPermitidos({ codigoPeticion: registro.codigoPeticion, titulo: "Espectador" });
        res.json({ totalEspectadores });
    } catch (error) {
        res.json(error);
    }
});

router.post('/obtener_noEspectadores', isAuthenticated, async (req, res) => {
    const { correo, departamento, nombreUsuario, codigoPeticion } = req.body;

    let espectadores = await daoPeticion.obtenerEspectadores({ codigoPeticion });
    let idsPersonas = espectadores.map(espectador => espectador._id);
    let condiciones = { _id: { $nin: idsPersonas },
                        nombreCompleto: new RegExp(nombreUsuario, 'i'),
                        $and: [{correo: new RegExp(correo, 'i')},
                               {correo: { $ne: req.user.correo }}],
                        departamento: new RegExp(departamento, 'i') }

    let usuarios = await daoPersona.obtenerPersona_porMultiples_ag(condiciones);
    res.json(usuarios);
});


module.exports = router;