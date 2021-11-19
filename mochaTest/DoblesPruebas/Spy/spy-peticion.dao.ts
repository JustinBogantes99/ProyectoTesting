// CLASE peticion.dao.js

export class daoPeticion{
    // simula la id de la peticion
    idPeticion: String
    correo:String

    constructor(){
        this.idPeticion = '123412341234123412341234';
        this.correo = 'alfredo@gmail.com';
    }

    obtenerPeticion(peticion:String){
        if (!peticion.match(/^[0-9a-fA-F]{24}$/)) {
            return -1;
        }
        if (peticion === this.idPeticion) return 1;
        else return 0;
    }

    registrarPeticion(data: any){
        // no tiene mensaje de error
        if (data.destinatarioCorreo === this.correo) return 1;
        else return 1;
    }

}