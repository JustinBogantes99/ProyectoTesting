let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = chai.expect;
var should = require('chai').should();

chai.use(chaiHttp);
const url= 'http://localhost:3000';

describe('Iniciar sesion: ', ()=>{
    it('correo y contraseña correctos', (done) => {
        chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .end( function(err,res){
            console.log(res.body)
            expect(res).to.redirectTo('http://localhost:3000/inicio');
            done();
        });
    });
    it('contraseña incorrecta', (done) => {
        chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: '123456'})
        .end( function(err,res){
            console.log(res.body)
            expect(res).to.redirectTo('http://localhost:3000/inicio_sesion');
            done();
        });
    });
    it('correo incorrecto', (done) => {
        chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'aaaa@gmail.com',contrasenaInicio: '123456'})
        .end( function(err,res){
            console.log(res.body)
            expect(res).to.redirectTo('http://localhost:3000/inicio_sesion');
            done();
        });
    });
});