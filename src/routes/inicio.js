// General del Archivo de Rutas

const { express, mongoose } = require('../config/dependencies');
const passport = require('passport');
const router = express.Router();

// Funciones / Variables Requeridas por el Archivo de Rutas

const daoPersona = require('../daos/persona.dao');
const { isAuthenticated } = require('../helpers/auth');
const daoAdministracion = require('../daos/administracion.dao');
const { validarRegistro, validarCorreo, validarContrasenna } = require("../models.valid/persona.val");
const { correoContrasenna, correoAgregarDepartamentoEntidad } = require('../helpers/mailService');

// Modelos Requeridos

const { Persona, Entidad, AgregarDepartamento } = require('../models/req_models');
const Departamento = require('../models/departamento');



// ---------------------------------------------------------------------- Rutas del Archivo

async function generarToken() {
    let token;
    let persona;
    while (true) {
        token = mongoose.Types.ObjectId();
        persona = await daoPersona.obtenerPersona_porToken(token.toString());
        if (persona === null) {
            return token.toString()
        }
    }
}

router.get('/', (req, res) => {
    if (req.user) {
        res.redirect('/inicio');
    }
    else {
        res.render('./inicio/inicioUsuarioNoAutorizado');
    }
});

//Inicio de usuario autorizado
router.get('/inicio', isAuthenticated, async (req, res) => {
    res.redirect('/inicio/bandeja_inicio');
});

//Inicio de sesión
router.get('/inicio_sesion', (req, res) => {
    res.render('./inicio/inicioSesion');
});

router.post('/inicio_sesion', passport.authenticate('local',
    { failureRedirect: '/inicio_sesion', failureFlash: true }), (req, res) => {
        let returnTo = req.session.returnTo;
        delete req.session.returnTo;
        res.redirect(returnTo || '/inicio');
    }
);

router.get('/obtener_correo', (req, res) => {
    res.render('./inicio/solicitarDatosRecuperacion');
});

router.get('/cambiar_contrasenna', (req, res) => {
    res.redirect('/');
});

router.get('/cambiar_contrasenna/:token', async (req, res) => {
    let token = req.params.token;
    if (token.match(/^[0-9a-fA-F]{24}$/)) {
        let persona = await daoPersona.obtenerPersona_porToken(token.toString());
        if (persona === null) {
            req.flash('error_msg', "El token para cambio de contraseña no pertenece a ningun usuario del sistema.");
            res.redirect('/');
        } else {
            let fechaLimiteCambioContrasenna = persona.fechaFinToken;
            let fechaActual = new Date();
            if (fechaLimiteCambioContrasenna >= fechaActual) {
                res.render('./inicio/cambiarContrasenna', { token: token.toString() });
            } else {
                req.flash('error_msg', "El token para cambio de contraseña a caducado.");
                res.redirect('/');
            }
        }
    } else {
        req.flash('error_msg', "El token para cambio de contraseña no es valido.");
        res.redirect('/');
    }
});
//desde el inicio de usuario no autorizado
router.post('/cambiar_contrasenna/:token', async (req, res) => {
    let token = req.params.token;
    let persona = await daoPersona.obtenerPersona_porToken(token);
    let data = req.body;
    let errors = validarContrasenna(data);
    if (errors.length > 0) {
        let error = "";
        for (i in errors) {
            error = error + "<p class='mb-0'>" + errors[i].text + '</p>';
        }
        req.flash('error_msg', error);
        res.redirect('/cambiar_contrasenna/' + token);
    } else {
        const nuevaPersona = new Persona({});
        const password = await nuevaPersona.encryptPassword(data.contrasena);
        await daoPersona.modificarContrasenna(persona._id, password);
        await daoPersona.eliminarToken(persona._id, data.token, data.fechaFinToken);
        req.flash('success_msg', "Contraseña cambiada exitosamente.");
        res.redirect('/inicio_sesion');
    }
})

router.post('/inicio_sesion', passport.authenticate('local',
    { failureRedirect: '/inicio_sesion', failureFlash: true }), (req, res) => {
        let returnTo = req.session.returnTo;
        delete req.session.returnTo;
        res.redirect(returnTo || '/inicio');
    }
);

router.post('/crear_token', async (req, res) => {
    let data = await validarCorreo(req.body);
    if (data.errors.length > 0) {
        req.flash('error_msg', data.errors[0].text);
        res.redirect('/obtener_correo');
    } else {
        let fecha = new Date();
        let token = await generarToken();
        data.persona.token = token;
        horaFin = fecha.getHours() + 3
        fecha.setHours(horaFin);
        data.persona.fechaFinToken = fecha;
        daoPersona.actualizarToken(data.persona);
        correoContrasenna({ token: data.persona.token, correo: data.persona.correo, req })
        req.flash('success_msg', "Se ha enviado un correo para el cambio de contraseña");
        res.redirect('/obtener_correo');
    }
});

router.get('/crear_token', isAuthenticated, async (req, res) => {
    registros = await daoAdministracion.obtenerTodosRegistros();
    let fecha = new Date();
    if (registros.length == 0) {
        let token = await generarToken();
        horaFin = fecha.getHours() + 3
        fecha.setHours(horaFin);
        const nuevoRegistroToken = new AgregarDepartamento({ token: token, fechaFinToken: fecha });
        await nuevoRegistroToken.save();
        correoAgregarDepartamentoEntidad({ token, req });
        req.flash('success_msg', 'Se ha enviado un correo al correo del sistema.');
    } else {
        if (registros[0].fechaFinToken >= fecha) {
            req.flash('error_msg', 'Ya existe una solicitud, para el registro de entidades y departamentos, revise la bandeja del correo del sistema.');
        } else {
            horaFin = fecha.getHours() + 3
            fecha.setHours(horaFin);
            await daoAdministracion.actualizarToken({ _id: registros[0]._id, token: registros[0].token, fechaFinToken: fecha });
            correoAgregarDepartamentoEntidad({ token: registros[0].token, req });
            req.flash('success_msg', 'Se ha enviado un correo al correo del sistema.');
        }
    }
    res.redirect('/inicio/bandeja_inicio');
});

router.get('/registro_entidad_departamento', (req, res) => {
    res.redirect('/');
});

router.get('/registro_entidad_departamento/:token', async (req, res) => {
    let token = req.params.token;
    if (token.match(/^[0-9a-fA-F]{24}$/)) {
        let agregarDepartamento = await daoAdministracion.obtenerAgregarDepartamento_porToken(token.toString());
        if (agregarDepartamento === null) {
            req.flash('error_msg', "El token para agregar entidades y departamento no pertenece al sistema.");
            res.redirect('/');
        } else {
            let fechaLimiteAgregarDepartamento = agregarDepartamento.fechaFinToken;
            let fechaActual = new Date();
            if (fechaLimiteAgregarDepartamento >= fechaActual) {
                res.render('./inicio/registroEntidadDepartamento', { token: token.toString() });
            } else {
                req.flash('error_msg', "El token para agregar entidades y departamento a caducado.");
                res.redirect('/');
            }
        }
    } else {
        req.flash('error_msg', "El token para agregar entidades y departamento no es valido.");
        res.redirect('/');
    }
});

//Finalización de la sesión
router.get('/cerrar_sesion', isAuthenticated, (req, res) => {
    req.logOut();
    res.redirect('/');
});

//Registro de usuario
router.get('/registro_usuario', (req, res) => {
    res.render('./inicio/registroUsuario');
});

router.post('/registro_usuario', async (req, res) => {
    let data_Anterior = req.body;
    for (propiedad in data_Anterior) {
        data_Anterior[propiedad] = data_Anterior[propiedad].trim();
    }
    let data = await validarRegistro(data_Anterior);
    if (data.errors.length > 0) {
        res.render('inicio/registroUsuario', data)
    }
    else {
        delete data.errors;
        data.departamento = "No Definido";
        const nuevaPersona = new Persona(data);
        nuevaPersona.contrasena = await nuevaPersona.encryptPassword(data.contrasena);
        await nuevaPersona.save();
        req.flash('success_msg', 'Se ha registrado al usuario correctamente.');
        res.redirect('/inicio_sesion');
    }
});

//Terminos y condiciones
router.get('/terminos_condiciones', (req, res) => {
    res.render('./inicio/terminosCondiciones');
});

router.get('/registro_entidad_departamento', (req, res) => {
    res.render('./inicio/registroEntidadDepartamento');
});

router.post('/registro_entidad', async (req, res) => {
    let data_Anterior = req.body;
    for (propiedad in data_Anterior) {
        data_Anterior[propiedad] = data_Anterior[propiedad].trim();
    }
    let data = data_Anterior;
    let administracionToken = await daoAdministracion.obtenerTodosRegistros();
    let token = administracionToken[0].token;
    if (data.nombreEntidad == "") {
        req.flash('error_msg', "Se deben llenar los campos");
        res.redirect('/registro_entidad_departamento/' + token);
    } else {
        resultado = await daoAdministracion.agregarEntidad(data.nombreEntidad);
        let mensaje;
        let tipo;
        if (resultado) {
            mensaje = 'Se ha registrado la entidad.';
            tipo = 'success_msg';
        } else {
            mensaje = 'Error al registrar la entidad.';
            tipo = 'error_msg';
        }
        req.flash(tipo, mensaje);
        res.redirect('/registro_entidad_departamento/' + token);
    }
});

router.post('/registro_departamento', async (req, res) => {
    let administracionToken = await daoAdministracion.obtenerTodosRegistros();
    let token = administracionToken[0].token;
    try {
        let data_Anterior = req.body;
        for (propiedad in data_Anterior) {
            data_Anterior[propiedad] = data_Anterior[propiedad].trim();
        }
        let data = data_Anterior;
        if (data.nombreDepartamento == "") {
            throw error;
        }
        resultado = await daoAdministracion.agregarDepartamento({ entidad: data.idEntidad, nombre: data.nombreDepartamento });
        let mensaje;
        let tipo;
        if (resultado) {
            mensaje = 'Se ha registrado el departamento.';
            tipo = 'success_msg';
        } else {
            mensaje = 'Error al registrar el departamento.';
            tipo = 'error_msg';
        }
        req.flash(tipo, mensaje);
        res.redirect('/registro_entidad_departamento/' + token);
    } catch (error) {
        req.flash('error_msg', 'Ingrese un departamento.');
        res.redirect('/registro_entidad_departamento/' + token);
    }

});

router.post('/obtener_entidades', async (req, res) => {//revisar mas tarde
    const { nombreEntidad } = req.body;
    Entidad.aggregate().project({
        nombre: 1,
        _id: 1
    })
        .match({ nombre: new RegExp(nombreEntidad, 'i') })
        .sort({ nombre: 'desc' }).exec((err, entidades) => {
            if (err) throw err;
            res.json(entidades);
        });
});

router.post('/obtener_departamentos', async (req, res) => {//revisar mas tarde
    const { idEntidad, nombreDepartamento } = req.body;
    console.log(idEntidad, " ", nombreDepartamento);
    Departamento.aggregate().project({
        nombre: 1,
        entidad: 1,
        _id: 1
    })
        .match({
            $and: [
                { nombre: new RegExp(nombreDepartamento, 'i') },
                { entidad: idEntidad }]
        })
        .sort({ nombre: 'desc' }).exec((err, departamentos) => {
            if (err) throw err;
            console.log(departamentos);
            res.json(departamentos);
        });
});

module.exports = router;
