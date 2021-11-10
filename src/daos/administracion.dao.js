const { Entidad, Departamento, AgregarDepartamento } = require('../models/req_models');
const daoAdministracion = {};

daoAdministracion.obtenerIdsEntidad = async nombre => {
    let entidades = await Entidad.find({ nombre: new RegExp(nombre, 'i') });
    let idsEntidades = entidades.map(entidad => entidad._id);
    return idsEntidades;
}

daoAdministracion.obtenerIdsDepartamentos_porNombreXEntidades = async (idsEntidades, nombre) => {
    let condiciones = { entidad: { $in: idsEntidades }, nombre: new RegExp(nombre, 'i') };
    let departamentos = await Departamento.find(condiciones);
    let idsDepartamentos = departamentos.map(departamento => departamento._id.toString());
    return idsDepartamentos;
}

daoAdministracion.obtenerAgregarDepartamento_porToken = async token => {
    let agregarDepartamento = await AgregarDepartamento.findOne({ token: token });
    return agregarDepartamento;
}

daoAdministracion.actualizarToken = async agregarDepartamento => {
    await AgregarDepartamento.findByIdAndUpdate(agregarDepartamento._id, { token: agregarDepartamento.token, fechaFinToken: agregarDepartamento.fechaFinToken });
}

daoAdministracion.obtenerTodosRegistros = async _ => {
    let registros = await AgregarDepartamento.find();
    return registros;
}

daoAdministracion.agregarEntidad = async nombreEntidad => {
    let nuevaEntidad = new Entidad({nombre: nombreEntidad});
    await nuevaEntidad.save();
    return true;
}

daoAdministracion.agregarDepartamento = async data => {
    let existencia = await Departamento.findOne(data);
    if(!existencia){
        let nuevaDepartamento = new Departamento(data);
        await nuevaDepartamento.save();
        return true;
    }
    return false;
}

daoAdministracion.obtenerNombreDepartamento = async idDepartamento => {
    let nombreDepartamento;
    try {
        let departamento = await Departamento.findById(idDepartamento);
        let entidad = await Entidad.findById(departamento.entidad);
        nombreDepartamento = `${entidad.nombre} - ${departamento.nombre}`;
    }
    catch (e) {
        nombreDepartamento = "No definido";
    }
    return nombreDepartamento;
}

module.exports = daoAdministracion;