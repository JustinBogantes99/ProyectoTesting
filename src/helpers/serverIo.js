const { Memo } = require('../models/req_models');

exports.receivers = (io) => {
    io.on('connection', async function (socket) {
        socket.on('subscribe', function (room) {
            socket.join(room);
        });

        socket.on('send message', async function (data) {
            let newMemo = new Memo({ peticionOrigen: data.room, mensaje: data.text, remitente: data.author });
            await newMemo.save();
            io.sockets.in(data.room).emit('conversacion privada', [data]);
        });
    });
}

//Prueba de como actualizar el campo de notificaciones 
/*router.get('/pruebaNotificaciones', async (req, res) => {
    const usuarioNotificar = "5ed927fa09a7384cd0d4750a";
    data = {
        asunto: "Prueba de agregar notificaciones Cambiele el titulo",
        enlace: "algo",
        categoria: "peticion"
    }
    let usuario = await Persona.findByIdAndUpdate(usuarioNotificar, {$push: {notificacion: data}});
    req.flash('success_msg', usuario);
    res.redirect('/');
});*/