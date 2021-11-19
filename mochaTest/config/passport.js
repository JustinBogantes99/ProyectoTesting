const passport = require('passport');
const LocalStrategy = require('passport-local');

const Persona = require('../models/persona');

passport.use(new LocalStrategy({ 
     usernameField: 'correoInicio',
     passwordField: 'contrasenaInicio' }, async (correoInicio, contrasenaInicio, done) => {
     const persona = await Persona.findOne({correo: correoInicio});
     if(!persona) {
          return done(null, false, { message: 'Usuario no encontrado.'});
     }
     else {
          const match = await persona.matchPassword(contrasenaInicio);

          if(match) {
               return done(null, persona, {success_msg: 'Usuario autenticado exitosamente.'});
          }
          else {
               return done(null, false, {message: 'Usuario o contraseña incorrecta.'});
          }
     }
}));

passport.serializeUser((persona, done) => {
     done(null, persona.id);
});

passport.deserializeUser((id, done) => {
     Persona.findById(id, (err, persona) => {
          done(err, persona);
     });
});