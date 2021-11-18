let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);
const url= 'http://localhost:3000';

describe('Formular petición: ', ()=>{
    
    it('datos correctos', (done) => {
        chai.request(url)
        .post('/inicio/agregar_peticion')
        .type('form')
        .send({asunto:'prueba', destinatarioCorreo: 'prueba@prueba', descripcion: '<p>prueba</p>', fechaLimite: '2021-12-12', prioridad: 'Alto', file: '(binary)'})
        .end( function(err,res){
            expect(res).to.redirect;
            done();
        });
    });
     
    it('asunto vacío', (done) => {
        chai.request(url)
        .post('/inicio/agregar_peticion')
        .type('form')
        .send({asunto:'', destinatarioCorreo: 'prueba@prueba', descripcion: '<p>prueba</p>', fechaLimite: '2021-12-12', prioridad: 'Alto', file: '(binary)'})
        .end( function(err,res){
            expect(res).to.have.status(200);
            done();
        });
    });
    it('descripcion vacia', (done) => {
        chai.request(url)
        .post('/inicio/agregar_peticion')
        .type('form')
        .send({asunto:'prueba', destinatarioCorreo: 'prueba@prueba', descripcion: '', fechaLimite: '2021-12-12', prioridad: 'Alto', file: '(binary)'})
        .end( function(err,res){
            expect(res).to.have.status(200);
            done();
        });
    });
});