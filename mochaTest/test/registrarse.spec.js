let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);
const url= 'http://localhost:3000';

describe('Iniciar sesion: ', ()=>{
    it('correo y contraseña correctos', (done) => {
        chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .end( function(err,res){
            expect(res).to.redirectTo('http://localhost:3000/inicio');
            done();
        });
    });
    it('contraseña incorrecta', (done) => {
        chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: '123456'})
        .end( function(err,res){
            expect(res).to.redirectTo('http://localhost:3000/inicio_sesion');
            done();
        });
    });
    it('correo incorrecto', (done) => {
        chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'aaaa@gmail.com',contrasenaInicio: '123456'})
        .end( function(err,res){
            expect(res).to.redirectTo('http://localhost:3000/inicio_sesion');
            done();
        });
    });
});

describe('Registrarse: ', ()=>{
    
    it('información correcta', (done) => {
        let r = (Math.random() + 1).toString(36).substring(7);
        let correo = r + '@gmail.com';
        chai.request(url)
        .post('/registro_usuario')
        .type('form')
        .send({nombre:'prueba', apellido1: 'prueba', apellido2: 'prueba', telefono: '1234-1234', correo: correo, contrasena: 'aA1234', confirma_contrasena: 'aA1234'})
        .end( function(err,res){
            expect(res).to.redirectTo('http://localhost:3000/inicio_sesion');
            done();
        });
    });
    
    it('correo en uso', (done) => {
        chai.request(url)
        .post('/registro_usuario')
        .type('form')
        .send({nombre:'prueba', apellido1: 'prueba', apellido2: 'prueba', telefono: '1234-1234', correo: 'eduardj.com@gmail.com', contrasena: 'aA1234', confirma_contrasena: 'aA1234'})
        .end( function(err,res){
            expect(res).to.not.redirect;
            done();
        });
    });
    it('contraseñas diferentes', (done) => {
        chai.request(url)
        .post('/registro_usuario')
        .type('form')
        .send({nombre:'prueba', apellido1: 'prueba', apellido2: 'prueba', telefono: '1234-1234', correo: 'eduardj.com@gmail.com', contrasena: 'aaA12345', confirma_contrasena: 'aA1234'})
        .end( function(err,res){
            expect(res).to.not.redirect;
            done();
        });
    });
    it('contraseña no cumple requisitos', (done) => {
        chai.request(url)
        .post('/registro_usuario')
        .type('form')
        .send({nombre:'prueba', apellido1: 'prueba', apellido2: 'prueba', telefono: '1234-1234', correo: 'eduardj.com@gmail.com', contrasena: 'aaaa', confirma_contrasena: 'aaaa'})
        .end( function(err,res){
            expect(res).to.not.redirect;
            done();
        });
    });

});