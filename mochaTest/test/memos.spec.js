let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);
const url= 'http://localhost:3000';

describe('Enviar memos: ', ()=>{
    it('memo', (done) => {
        let u = chai.request(url)
        .post('/inicio_sesion')
        .send({correoInicio:'prueba@gmail.com',contrasenaInicio: 'aA1234'})
        .then( function(err,res){
            u.put('/inicio/mostrar_peticion/619683af5e7e6f194c2b332a')
            .type('form')
            .send({
                author:'61959a26f8b823522805c5e6', 
                nombre: 'prueba',
                text: 'prueba',
                room: '619683af5e7e6f194c2b332a'
            })
            .end(function(err, res) {
            expect(res).to.not.redirectTo('http://localhost:3000/inicio_sesion');
            });
        });
        done();
    });


});
