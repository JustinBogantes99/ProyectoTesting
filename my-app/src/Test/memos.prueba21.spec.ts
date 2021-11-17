import { daoPeticion } from './DoblesPruebas/Spy/spy-peticion.dao';
describe('Implementación de los Memos - obtenerPeticion en peticion.dao.js', () => {


    it(`Proceso de obtenerPeticion con los datos correctos`, () => {
                
        //Simulando variables que vienen por parametros
        var id = '123412341234123412341234';

        const dao = new daoPeticion();

        //Procesos de obtenerPeticion
        expect(dao.obtenerPeticion(id)).toEqual(1);
    });


    it(`Proceso de obtenerPeticion con id inexistente`, () => {
                
        //Simulando variables que vienen por parametros
        var id = '123422344284122412341233';

        const dao = new daoPeticion();

        //Procesos de deserializeUser
        expect(dao.obtenerPeticion(id)).toEqual(0);
    });

    it(`Proceso de obtenerPeticion con id inválido`, () => {
                
        //Simulando variables que vienen por parametros
        var id = 'hola';

        const dao = new daoPeticion();

        //Procesos de deserializeUser
        expect(dao.obtenerPeticion(id)).toEqual(-1);
    });

});