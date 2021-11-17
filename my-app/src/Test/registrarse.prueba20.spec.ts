import { passport } from './DoblesPruebas/Fake/fake-passport.spect';
describe('Permitir a los usuarios regsitrarse en la aplicación - passport.deserializeUser en passport.js', () => {


    it(`Proceso de passport.deserializeUser con los datos correctos`, () => {
                
        //Simulando variables que vienen por parametros
        var id = 'alfredo@gmail.com';

        const pass = new passport();

        //Procesos de deserializeUser
        expect(pass.deserializeUser(id)).toEqual(1);
    });


    it(`Proceso de passport.deserializeUser con los datos incorrectos`, () => {
                
        //Simulando variables que vienen por parametros
        var id = 'prueba@gmail.com';

        const pass = new passport();

        //Procesos de deserializeUser
        expect(pass.deserializeUser(id)).toEqual(0);
    });

});