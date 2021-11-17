const assert = require('chai').assert;
const app= require('../app');
const SayHello = require("../app").SayHello;

describe('App',function(){
    describe('Strings',function(){
        it('App shouls return Hola', function(){
            let result = SayHello();
            assert.equal(result,'Hola');
        })
        it('Sayhello should return type string', function(){
            let result = SayHello();
            assert.typeOf(result,'string');
        })
    })
})

