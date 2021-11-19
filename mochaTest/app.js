/*module.exports = function(){
    return "Hola"
}*/
module.exports = {
    SayHello:function(){
        return "Hola"
    },
    obtenerMensajes_porMultiples_skip:async (saltar, limite, condiciones) => {
        let respuestas = await Respuesta
            .find(condiciones)
            .skip(saltar)
            .limit(limite)
            .sort({ createdAt: 'desc' })
            .lean();
        return respuestas;
    }
    ,
    obtenerUltimasOcurrencias:async (bandeja, idUsuario) => {
        let comunicacion = []
        let condiciones = { destinatario: idUsuario };
        let peticiones = await daoPeticion.obtenerMensajes_porMultiples_skip(0, 5, condiciones);
        let respuestas = await daoRespuesta.obtenerMensajes_porMultiples_skip(0, 5, condiciones);
    
        for await (const peticion of peticiones) {
            let nuevoMensaje = await generarTarjeta(peticion, bandeja, "Peticion", idUsuario);
            comunicacion.push(nuevoMensaje)
        }
    
        for await (const respuesta of respuestas) {
            let nuevoMensaje = await generarTarjeta(respuesta, bandeja, "Respuesta", idUsuario);
            nuevoMensaje.tipoRespuesta = funcionesHistorial.obtenerTipoRespuesta([respuesta]);
            comunicacion.push(nuevoMensaje)
        }
    
        comunicacion = comunicacion.sort(sortByProperty('createdAt')).slice(0, 6);
        return comunicacion;
    },
    obtenerSujeto: async(mensaje, bandeja, idUsuario) => {
        let dePara, busqueda, personaObjetivo, privilegios;
    
        if (bandeja.includes("Consulta")) {
            if (mensaje.destinatario == idUsuario) {
                busqueda = mensaje.remitente;
                dePara = "De:";
            }
            else {
                busqueda = mensaje.destinatario;
                dePara = "Para:";
            }
        }
        else {
            if (bandeja.includes("Entrada") || bandeja === "Inicio") {
                busqueda = mensaje.remitente;
                dePara = "De:";
            }
            else {
                busqueda = mensaje.destinatario;
                dePara = "Para:";
            }
        }
        personaObjetivo = await daoPersona.obtenerPersona_porId(busqueda);
        
        if(mensaje.destinatario != idUsuario && mensaje.remitente != idUsuario){
            privilegios = false;
        }
        else{
            privilegios = true;
        }
    
        return { personaObjetivo, dePara, privilegios};
    },
    
    registrarPeticion: async (data, req) => {
        let destinatarioCompleto = await daoPersona.obtenerUnaPersonaPorMultiples({
            correo: data.destinatarioCorreo
        });
    
        data.destinatario = destinatarioCompleto._id;
        delete data.destinatarioCorreo;
        data.codigo = await obtenerCodigo(CPD);
        data.estado = "Activo";
        data.nivel = 0;
        const nuevaPeticion = new Peticion(data);
    
        await nuevaPeticion.save(function (err, peticion) {
            idPeticion = peticion._id;
            for (const archivo of req.files) {
                let idArchivo = archivo.id;
                let nombreArchivo = archivo.originalname;
                let idMedio = idPeticion;
                let tipoMedio = "Peticion";
                let registroAdjunto = new Adjunto({ idArchivo, nombreArchivo, idMedio, tipoMedio });
                registroAdjunto.save();
            }
    
            construirCorreo({ persona: [req.user, destinatarioCompleto], mensaje: 'Nueva_Peticion', tipo: 'Peticion', idPeticion, asuntoPrimario: data.asunto, req });
    
            let registro = { idPersona: data.remitente, codigoPeticion: data.codigo, titulo: "Administrador" };
            daoPeticion.darPermisos(registro);
        });
    }
}