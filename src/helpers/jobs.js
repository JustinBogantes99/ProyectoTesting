const { DN, PORT, USEPORT, PROTOCOL, DIAS } = require('../config/properties');
const { schedule } = require('../config/dependencies');
const { construirCorreoPorTiempo } = require('./mailService');
const { Peticion, Persona } = require('../models/req_models');

function rangoDeDias() {
    let hoy = new Date();
    let limite = new Date();
    limite.setDate(limite.getDate() + DIAS - 1);
    hoy.setHours(00, 00, 00);
    limite.setHours(00, 00, 00);
    return [hoy, limite];
}

async function obtenerPersonaPorCodigo(codigoPorPersona) {
    let personas = [];
    for (const codigo of codigoPorPersona) {
        let persona = await Persona.findById(codigo);
        personas.push(persona);
    }
    return personas;
}

async function iniciarEnvio(personas, peticionPorPersona, tam) {
    let DNE = (USEPORT == 0) ? DN : DN + ':' + PORT; 
    for (i = 0; i < tam; i++) {
        await construirCorreoPorTiempo({
            persona: personas[i],
            peticiones: peticionPorPersona[i],
            dir: PROTOCOL + '://' + DNE,
            dias: DIAS
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

const j = schedule.scheduleJob('0 0 17 * * *', async _ => {
    let personas;
    let codigoPorPersona = [];
    let peticionPorPersona = [];
    let fechas = rangoDeDias();

    peticiones = await Peticion.find({
        estado: "Activo",
        fechaLimite: { $gte: fechas[0], $lt: fechas[1] }
    }).sort('desc');
    
    peticiones.forEach(peticion => {
        if (codigoPorPersona.includes(peticion.destinatario)) {
            let pos = codigoPorPersona.indexOf(peticion.destinatario);
            peticionPorPersona[pos].push(peticion);
        }
        else {
            codigoPorPersona.push(peticion.destinatario);
            peticionPorPersona.push([peticion]);
        }
    });
    
    personas = await obtenerPersonaPorCodigo(codigoPorPersona);
    await iniciarEnvio(personas, peticionPorPersona, codigoPorPersona.length);
    console.log('Anuncio de Pendientes Completado Exitosamente.')
});
