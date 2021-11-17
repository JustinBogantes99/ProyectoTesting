import { daoPeticion } from './DoblesPruebas/Spy/spy-peticion.dao';
describe('Implementación de los Memos - registrarPeticion en peticion.dao.js', () => {


    it(`Proceso de registrarPeticion con los datos correctos`, () => {
                
        //Simulando variables que vienen por parametros
        let data = {destinatarioCorreo: 'alfredo@gmail.com' };

        const dao = new daoPeticion();

        //Procesos de obtenerPeticion
        expect(dao.registrarPeticion(data)).toEqual(1);
    });

    it(`Proceso de registrarPeticion con los correo incorrecto`, () => {
                
        //Simulando variables que vienen por parametros
        let data = {destinatarioCorreo: 'prueba@gmail.com' };

        const dao = new daoPeticion();

        //Procesos de obtenerPeticion
        expect(dao.registrarPeticion(data)).toEqual(0);
    });


});