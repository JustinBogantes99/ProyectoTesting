let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);
const url= 'http://localhost:3000';

describe('Acceso sin autentificación: ', ()=>{
    it('no permitir acceso a bandeja de entrada', (done) => {
        chai.request(url)
        .get('/inicio/bandeja_inicio')
        .end(function(err, res) {
            expect(res).to.redirectTo('http://localhost:3000/inicio_sesion');
        });
        done();
    });
    it('no permitir acceso a peticion', (done) => {
        chai.request(url)
        .get('/inicio/mostrar_peticion/619683af5e7e6f194c2b332a')
        .end(function(err, res) {
            expect(res).to.redirectTo('http://localhost:3000/inicio_sesion');
        });
        done();
    });
    it('no permitir acceso a bandeja de peticiones', (done) => {
        chai.request(url)
        .get('/inicio/bandeja/bandeja_peticiones_recibidas/1')
        .end(function(err, res) {
            expect(res).to.redirectTo('http://localhost:3000/inicio_sesion');
        });
        done();
    });

});

describe('Acceso con autentificación: ', ()=>{
    it('permitir acceso a bandeja de inicio', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.get('/inicio/bandeja_inicio')
            .end(function(err, res) {
            expect(res).to.not.redirectTo('http://localhost:3000/inicio_sesion');
            });
        });
        done();
    });
    it('permitir acceso a peticion', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.get('/inicio/mostrar_peticion/619683af5e7e6f194c2b332a')
            .end(function(err, res) {
            expect(res).to.not.redirectTo('http://localhost:3000/inicio_sesion');
            });
        });
        done();
    });
    it('permitir acceso a bandeja de peticiones', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.get('/inicio/bandeja/bandeja_peticiones_recibidas/1')
            .end(function(err, res) {
            expect(res).to.not.redirectTo('http://localhost:3000/inicio_sesion');
            });
        });
        done();
    });
    it('prohibir acceso a petición ajena', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.get('/inicio/mostrar_peticion/619683af5e7e6f194c2b332a')
            .end(function(err, res) {
            expect(res).to.redirect;
            });
        });
        done();
    });
});