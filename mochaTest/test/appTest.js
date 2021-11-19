const assert = require('chai').assert;
const app= require('../app');
const SayHello = require("../app").SayHello;
const email = require("../mailService");
const funciones = require("../funcionesPaginacion")


//const daoPersona = require('../mochaTest/DoblesPruebas/Fake/fake-persona.spect');
//const Persona = require('../mochaTest/DoblesPruebas/Fake/fake-persona.spect')
//import Persona from './file2';
let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const url= 'http://localhost:3000';

describe('App',function(){
    describe('mostrar_peticion',function(){
        it('Datos correctos', (done) => {
            chai.request(url)
            .get('/inicio/mostrar_peticion/'+'5f32d9e9859c9b00178fa85c')
            .type('form')
            .end( function(err,res){
                expect(res).to.redirect;
                done();
            });
        });

        it('ID incorrecto', (done) => {
            chai.request(url)
            .post('/inicio/mostrar_peticion/'+'')
            .type('form')
            .end( function(err,res){
                expect(res).to.redirect;
                done();
            });
        });
    })
    describe('obtenerSujeto',function(){
        it('Todos los datos correctos', function(){
            var mensaje = {destinatario:'1',remitente:''}
            var result = funciones.obtenerSujeto(mensaje,"Consulta","1");
            assert.equal(result,1);

            
        })
        it('Datos incorrectos', function(){
            var  mensaje = {destinatario:'1',remitente:''}
            var result = funciones.obtenerSujeto(mensaje,"","1");
            assert.equal(result,0);

        })
        it('Usuario incorrecto', function(){
            var mensaje = {destinatario:'1',remitente:''}
            var result = funciones.obtenerSujeto(mensaje,"","0");
            assert.equal(result,0);

        })
    })
    describe('verificarRespuesta',function(){
        it('Todos los datos correctos', function(){
            var result = funciones.verificarRespuesta('5f32c7c131aed1001711b579','1')
            assert.equal(result,true);
        })
        it('Datos incorrectos', function(){
            var result = funciones.verificarRespuesta("","")
            assert.equal(result,true);
        })
        it('Usuario incorrecto', function(){
            var result = funciones.verificarRespuesta("","")
            assert.equal(result,true);
        })
        it('Peticion incorrecto', function(){
            var mensaje = {destinatario:'1',remitente:''}
            var result = funciones.verificarRespuesta("","")
            assert.equal(result,true);
        })
    })
    describe('enviarNotificacion',function(){
        it('Todos los datos correctos', function(){
            const data = { 
                idUsuarioNotificar:1,
                categoria:"peticion",
                asunto:'Por favor cambiar sacar la basura',
                enlace:''
            }
            let result = email.enviarNotificacion(data)
            assert.equal(result.resultado,1);
        })
        it('Datos incorrectos', function(){
            const data = { 
                idUsuarioNotificar:0,
                categoria:"",
                asunto:'Por favor cambiar sacar la basura',
                enlace:''
            }
            let result = email.enviarNotificacion(data)
            assert.equal(result.resultado,0);
        })
        it('Usuario incorrecto', function(){
            const data = { 
                idUsuarioNotificar:0,
                categoria:"respuesta",
                asunto:'Por favor cambiar sacar la basura',
                enlace:''
            }
            let result = email.enviarNotificacion(data)
            assert.equal(result.resultado,0);
        })
    })
})

