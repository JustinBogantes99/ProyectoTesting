// General del Archivo de Rutas

const { express } = require('../config/dependencies');
const router = express.Router();

// Funciones / Variables Requeridas por el Archivo de Rutas

const daoPersona = require('../daos/persona.dao');
const daoAdministracion = require('../daos/administracion.dao');
const { isAuthenticated } = require('../helpers/auth');
const { validarLlenadoYContrasena } = require("../models.valid/persona.val");

router.get('/inicio/perfil', isAuthenticated, async (req, res) => {
    let departamento = await daoAdministracion.obtenerNombreDepartamento(req.user.departamento);
    res.render('./usuario/perfil', { departamento });
});

router.put('/inicio/perfil/modificarNombre', isAuthenticated, async (req, res) => {
    const { nombre } = req.body;

    if (nombre.length <= 0) {
        req.flash('error_msg', 'El nombre no puede estar vacío.');
    }
    else {
        await daoPersona.modificarNombre(req.user.id, nombre);
        req.flash('success_msg', 'Nombre actualizado exitosamente.');
    }
    res.redirect('/inicio/perfil');
});

router.put('/inicio/perfil/modificarApellido1', isAuthenticated, async (req, res) => {
    const { apellido1 } = req.body;

    if (apellido1.length <= 0) {
        req.flash('error_msg', 'El apellido no puede estar vacío.');
    }
    else {
        await daoPersona.modificarApellido1(req.user.id, apellido1);
        req.flash('success_msg', 'Primer apellido actualizado exitosamente.');
    }
    res.redirect('/inicio/perfil');
});

router.put('/inicio/perfil/modificarApellido2', isAuthenticated, async (req, res) => {
    const { apellido2 } = req.body;

    if (apellido2.length <= 0) {
        req.flash('error_msg', 'El apellido no puede estar vacío.');
    }
    else {
        await daoPersona.modificarApellido2(req.user.id, apellido2);
        req.flash('success_msg', 'Segundo apellido actualizado exitosamente.');
    }
    res.redirect('/inicio/perfil');
});

router.put('/inicio/perfil/modificarTelefono', isAuthenticated, async (req, res) => {
    const { telefono } = req.body;

    if (telefono.length <= 0) {
        req.flash('error_msg', 'El telefono no puede estar vacío.');
    }
    else {
        await daoPersona.modificarTelefono(req.user.id, telefono);
        req.flash('success_msg', 'Usuario actualizado exitosamente.');
    }
    res.redirect('/inicio/perfil');
});

router.put('/inicio/perfil/modificarContrasenna', isAuthenticated, async (req, res) => {
    const { contrasennaAnterior, nuevaContrasenna } = req.body;
    const data = req.body;
    let errors = validarLlenadoYContrasena(data); //validacion del llenado de campos
    if (errors.length > 0) {
        let error = "";
        for(i in errors){
            error = error + "<p class='mb-0'>" + errors[i].text + '</p>';
        }
        req.flash('error_msg', error);
        res.redirect('/inicio/perfil');
    } else {
        const match = await req.user.matchPassword(contrasennaAnterior);
        if (match) {
            const password = await req.user.encryptPassword(nuevaContrasenna);
            await daoPersona.modificarContrasenna(req.user.id, password);
            req.flash('success_msg', 'Contraseña actualizada exitosamente.');
        }
        else {
            req.flash('error_msg', 'Contraseña anterior incorrecta.');
        }
        res.redirect('/inicio/perfil');
    }
});

router.put('/inicio/perfil/modificarDepartamento', isAuthenticated, async (req, res) => {
    let { idDepartamento } = req.body;
    let tipo, mensaje;
    if (!(idDepartamento == "" || typeof idDepartamento === "undefined")) {
        await daoPersona.asignarDepartamento(req.user._id, idDepartamento);
        tipo = 'success_msg';
        mensaje = 'Departamento actualizado exitosamente.';
    }
    else {
        tipo = 'error_msg';
        mensaje = 'Error al actualizar el departamento.';
    }
    req.flash(tipo, mensaje);
    res.redirect('/inicio/perfil');
});

module.exports = router;