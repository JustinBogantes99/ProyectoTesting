export class respuestaSchema {
    asunto:String
    descripcion:String
    remitente:String
    destinatario:String
    peticionOrigen:String
    aceptado: {
        tipo: Boolean
        revisado: Boolean
        razon: Array<String>
    }
    constructor(asunto: String, descripcion:String, remitente:String,destinatario:String, peticionOrigen:String){
        this.asunto=asunto
        this.descripcion=descripcion
        this.remitente=remitente
        this.destinatario=destinatario
        this.peticionOrigen=peticionOrigen
        this.aceptado={tipo:true,revisado:true,razon:[]}
    }
}