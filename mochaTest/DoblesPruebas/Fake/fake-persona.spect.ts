//Clase Fake-Persona

export class notificacionSchema {
    asunto:String
    enlace:String
    leido:Boolean
    constructor(asunto:String, enlace:String, leido:Boolean){
        this.asunto = asunto;
        this.enlace = enlace;
        this.leido = leido;
    }
}

export class Persona{
    //Atributos de Persona
    nombre:String
    apellido1:String
    apellido2:String
    telefono:String
    correo:String
    contrasena:String
    departamento:String
    token:String | null
    fechaFinToken:Date | null
    notificacionPeticion:notificacionSchema | null
    notificacionRespuesta:notificacionSchema | null
    notificacionModificacion:notificacionSchema | null
    notificacionFecha:notificacionSchema | null

    //Contructor recibe una serie de parámetros y los coloca en atributos. No se sabe qué es "senas"
    constructor(nombre: String, apellido1:String, apellido2:String, telefono:String, correo:String, contrasena:String, departamento:String, token:String | null, fechaFinToken:Date | null, notificacionPeticion:notificacionSchema | null, notificacionRespuesta:notificacionSchema | null, notificacionModificacion:notificacionSchema | null, notificacionFecha:notificacionSchema | null){
        this.nombre = nombre;
        this.apellido1 = apellido1;
        this.apellido2 = apellido2;
        this.telefono = telefono;
        this.correo = correo;
        this.contrasena = contrasena;
        this.departamento = departamento;
        this.token = token;
        this.fechaFinToken = fechaFinToken;
        this.notificacionPeticion = notificacionPeticion;
        this.notificacionRespuesta = notificacionRespuesta;
        this.notificacionModificacion = notificacionModificacion;
        this.notificacionFecha = notificacionFecha;
    }
    obtenerPersona_porId(id:String){
        const persona= {nombre:this.nombre,apellido1:this.apellido1,apellido2:this.apellido2}
        return persona
    }

} 