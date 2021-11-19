let chai = require('chai');
let chaiHttp = require('chai-http');
let chaiDom = require('chai-dom');
const expect = chai.expect;

chai.use(chaiHttp);
chai.use(chaiDom);
const url= 'http://localhost:3000';

describe('Presentar peticiones: ', ()=>{
    it('mostrar peticiones en bandeja de entrada', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.get('/inicio/bandeja_inicio')
            .end(function(err, res) {
                expect(document).querySelector('call-to-action').to.have.length(2);
            });
        });
        done();
    });

    it('mostrar peticiones en bandeja de peticiones', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.get('/inicio/bandeja_inicio')
            .end(function(err, res) {
                expect(document).querySelector('app-page-1').to.have.length(2);
            });
        });
        done();
    });

});


describe('Presentar respuestas: ', ()=>{
    it('mostrar respuestas en petición', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.get('http://localhost:3000/inicio/mostrar_respuesta/6196842e5e7e6f194c2b332d')
            .end(function(err, res) {
                expect(document).querySelector('container mb-4').to.have.descendant('card');
            });
        });
        done();
    });

    it('enviar respuestas', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.post('http://localhost:3000/inicio/responder_peticion/6196b36513ac451a50812c81')
            .send({remitente: '61959a26f8b823522805c5e6',
                peticionOrigen: '6196b36513ac451a50812c81',
                destinatario: '619683815e7e6f194c2b3329',
                asuntoOriginal: 'a',
                destinatarios: 'prueba2@gmail.com',
                descripcion: '<p>a</p>',
                file: '(binary)'})
            .end(function(err, res) {
                expect(document).querySelector('modal-body text-center').to.have.text('Se ha enviado la respuesta correctamente');
            });
        });
        done();
    });

    it('aceptar respuesta', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba2@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.post('http://localhost:3000/inicio/aceptar_respuesta')
            .send({idRespuesta: '6196b3d413ac451a50812c84'})
            .end(function(err, res) {
                expect(document).querySelector('modal-body text-center').to.have.text('Se ha aceptado la respuesta correctamente');
            });
        });
        done();
    });
    it('rechazar respuesta', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba2@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.post('http://localhost:3000/inicio/rechazar_respuesta')
            .send({idRespuesta: '6196b3d413ac451a50812c84'})
            .end(function(err, res) {
                expect(document).querySelector('modal-body text-center').to.have.text('Se ha aceptado la respuesta correctamente');
            });
        });
        done();
    });

});

