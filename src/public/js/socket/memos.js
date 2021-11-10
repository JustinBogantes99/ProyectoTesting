let idPeticion = document.getElementById("idPeticion").value
let idRemitente = document.getElementById('idRemitente').value
let nombreRemitente = document.getElementById('nombreRemitente').value
let socket = io({ 'forceNew': true });

socket.emit('subscribe', idPeticion);
/*socketNotificacionRecibido.emit('subscribe', idPersona);*/
function render(data) {
    let html = data.map(function (elem, index) {
        let tipoChat;
        let alineacion;
        let clase;
        let espacioIzq;
        let espacioDer;
        if (elem.author == idRemitente) {
            tipoChat = "chatA";
            alineacion = "right"
            clase = "text-right misMensajes";
            espacioIzq = "";
            espacioDer = "&nbsp;";
        } else {
            tipoChat = "chatB";
            alineacion = "left"
            clase = "";
            espacioIzq = "&nbsp;";
            espacioDer = "";
        }
        return (`<small class="text-muted ${tipoChat} text-${alineacion}"> justo ahora</small>
        <div class="toast bg-light border border-success my-1 ${tipoChat}" role="alert" aria-live="assertive"
            aria-atomic="true">
            <div class="toast-body ${clase}">
                ${espacioIzq} ${elem.text} ${espacioDer}
            </div>
        </div>`)
    }).join(" ");

    document.getElementById('messages').innerHTML += html;
}

socket.on('conversacion privada', function (data) {
    render(data);
    let objDiv = document.getElementById("messages");
    objDiv.scrollTop = objDiv.scrollHeight;
});

function addMessage(e) {
    var mensaje = {
        author: idRemitente,
        nombre: nombreRemitente,
        text: document.getElementById('idMensaje').value,
        room: idPeticion
    };
    document.getElementById('idMensaje').value = "";
    socket.emit('send message', mensaje);
    return false;
}