import { passport } from './DoblesPruebas/Fake/fake-passport.spect';
describe('Permitir a los usuarios regsitrarse en la aplicación - passport.use en passport.js', () => {


    it(`Proceso de passport.use con los datos correctos`, () => {
                
        //Simulando variables que vienen por parametros
        var usernameField = 'alfredo@gmail.com';
        var passwordField = '12345';

        const pass = new passport();

        //Procesos de use
        expect(pass.use(usernameField, passwordField)).toEqual(2);
    });


    it(`Proceso de passport.use con contraseña incorrecta`, () => {
                
        //Simulando variables que vienen por parametros
        var usernameField = 'alfredo@gmail.com';
        var passwordField = '123';

        const pass = new passport();

        //Procesos de use
        expect(pass.use(usernameField, passwordField)).toEqual(1);
    });


    it(`Proceso de passport.use con usuario incorrecto`, () => {
                
        //Simulando variables que vienen por parametros
        var usernameField = 'prueba@gmail.com';
        var passwordField = '12345678';

        const pass = new passport();

        //Procesos de use
        expect(pass.use(usernameField, passwordField)).toEqual(0);
    });


});