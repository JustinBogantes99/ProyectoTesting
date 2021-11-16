import { Persona } from './fake-persona.spect'

export class passport {
    // lista de personas
    personas:Array<Persona>
    
    constructor(){
        this.personas = new Array<Persona>();
        var persona = new Persona('Alfredo', 'Gonzáles', 'Flores', '88888888', 'alfredo@gmail.com',
        '12345', "No Definido", null, null ,null,null,null,null,)
        this.personas.push(persona)
        
    }
    
    // Simula passport.use para autenticar usuario
    use(usernameField:String, passwordField:String){
        var encontrado = 0;
        var autenticado = 0;
        this.personas.forEach(persona => {
            if (persona.correo == usernameField){
                encontrado = 1;
                if (persona.contrasena == passwordField) autenticado = 1;
            }
        })
        return encontrado + autenticado;
    }


}