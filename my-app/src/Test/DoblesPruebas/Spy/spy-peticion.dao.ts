// CLASE peticion.dao.js

export class daoPeticion{
    // simula la id de la peticion
    idPeticion: String

    constructor(){
        this.idPeticion = '123412341234123412341234';
    }

    obtenerPeticion(peticion:String){
        if (!peticion.match(/^[0-9a-fA-F]{24}$/)) {
            return -1;
        }
        if (peticion === this.idPeticion) return 1;
        else return 0;
    }

}