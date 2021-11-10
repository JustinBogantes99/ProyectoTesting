// General del Archivo de Rutas

const { express } = require('../config/dependencies');
const router = express.Router();

// Funciones / Variables Requeridas por el Archivo de Rutas

const { isAuthenticated } = require('../helpers/auth');
const funcionesPaginacion = require('../helpers/functions/funcionesPaginacion');
const consultasVal = require('../models.valid/bandeja.val');



// ---------------------------------------------------------------------- Rutas del Archivo

router.get('/inicio/bandeja', isAuthenticated, (req, res) => {
    res.redirect('/inicio/bandeja/bandeja_peticiones_recibidas/1')
});

router.get('/inicio/bandeja/bandeja_peticiones_recibidas', isAuthenticated, (req, res) => {
    res.redirect('/inicio/bandeja/bandeja_peticiones_recibidas/1');
});

router.get('/inicio/bandeja/bandeja_respuestas_recibidas', isAuthenticated, (req, res) => {
    res.redirect('/inicio/bandeja/bandeja_respuestas_recibidas/1');
});

router.get('/inicio/bandeja/bandeja_peticiones_enviadas', isAuthenticated, (req, res) => {
    res.redirect('/inicio/bandeja/bandeja_peticiones_enviadas/1');
});

router.get('/inicio/bandeja/bandeja_respuestas_enviadas', isAuthenticated, (req, res) => {
    res.redirect('/inicio/bandeja/bandeja_respuestas_enviadas/1');
});

router.get('/inicio/bandeja/bandeja_peticiones_recibidas/:pagina', isAuthenticated, async (req, res) => {
    let bandeja = "Entrada Peticion";
    let condiciones = { destinatario: req.user._id };
    let paginaActual = parseInt(req.params.pagina, 10) || 1;
    let enlace = "/inicio/bandeja/bandeja_peticiones_recibidas/";

    let resultados = await funcionesPaginacion.generarBandeja(paginaActual, condiciones, req.user.id, bandeja, enlace);
    res.render('./bandeja/bandejaUsuario', resultados);
});

router.get('/inicio/bandeja/bandeja_respuestas_recibidas/:pagina', isAuthenticated, async (req, res) => {
    let bandeja = "Entrada Respuesta";
    let condiciones = { destinatario: req.user._id };
    let paginaActual = parseInt(req.params.pagina, 10) || 1;
    let enlace = "/inicio/bandeja/bandeja_respuestas_recibidas/";

    let resultados = await funcionesPaginacion.generarBandeja(paginaActual, condiciones, req.user.id, bandeja, enlace);
    res.render('./bandeja/bandejaUsuario', resultados);
});

router.get('/inicio/bandeja/bandeja_peticiones_enviadas/:pagina', isAuthenticated, async (req, res) => {
    let bandeja = "Salida Peticion";
    let condiciones = { remitente: req.user._id };
    let paginaActual = parseInt(req.params.pagina, 10) || 1;
    let enlace = "/inicio/bandeja/bandeja_peticiones_enviadas/";

    let resultados = await funcionesPaginacion.generarBandeja(paginaActual, condiciones, req.user.id, bandeja, enlace);
    res.render('./bandeja/bandejaUsuario', resultados);
});

router.get('/inicio/bandeja/bandeja_respuestas_enviadas/:pagina', isAuthenticated, async (req, res) => {
    let bandeja = "Salida Respuesta";
    let condiciones = { remitente: req.user._id };
    let paginaActual = parseInt(req.params.pagina, 10) || 1;
    let enlace = "/inicio/bandeja/bandeja_respuestas_enviadas/";

    let resultados = await funcionesPaginacion.generarBandeja(paginaActual, condiciones, req.user.id, bandeja, enlace);
    res.render('./bandeja/bandejaUsuario', resultados);
});

//Bandeja del inicio de sesión de usuario
router.get('/inicio/bandeja_inicio', isAuthenticated, async (req, res) => {
    let bandeja = "Inicio";
    let comunicacion = await funcionesPaginacion.obtenerUltimasOcurrencias(bandeja, req.user._id);
    res.render('./home/inicioUsuarioRegistrado', { comunicacion, bandeja });
});

router.get('/inicio/bandeja/bandeja_consulta', isAuthenticated, async (req, res) => {
    res.redirect('/inicio/bandeja/bandeja_consulta/1');
});

router.get('/inicio/bandeja/bandeja_consulta/:pagina', isAuthenticated, async (req, res) => {
    let paginaActual = parseInt(req.params.pagina, 10) || 1;
    let filtros = consultasVal.validarQuery(req.query);
    let enlace = "/inicio/bandeja/bandeja_consulta/";
    let bEnlace = req._parsedOriginalUrl.search;
    let condiciones, bandeja, resultados;

    if (filtros.buscar_porTipo === '0') {
        bandeja = "Consulta Peticion";
    }
    else {
        bandeja = "Consulta Respuesta";
    }

    condiciones = await consultasVal.generarCondiciones(filtros, req.user._id);

    resultados = await funcionesPaginacion.generarBandeja(paginaActual, condiciones, req.user.id, bandeja, enlace, bEnlace);
    resultados.filtros = filtros;
    res.render('./bandeja/consulta', resultados);
});

module.exports = router;