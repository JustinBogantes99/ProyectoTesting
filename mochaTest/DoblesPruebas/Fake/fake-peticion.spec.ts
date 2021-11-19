
export class Peticion {
    codigo:String
    nivel: Number
    asunto: String
    descripcion:String
    fechaLimite: String
    estado: String
    prioridad: String
    remitente: String
    destinatario: String
    peticionOrigen:String

    constructor(codigo:String,nivel:Number,asunto:String,descripcion:String,fechaLimite:String,estado:String,prioridad:String,remitente:String,destinatario: String
        ,peticionOrigen:String){
        this.codigo = codigo
        this.nivel = nivel
        this.asunto= asunto
        this.descripcion = descripcion
        this.fechaLimite = fechaLimite
        this.estado = estado
        this.prioridad = prioridad
        this.remitente = remitente
        this.destinatario= destinatario
        this.peticionOrigen=peticionOrigen
    }
}


