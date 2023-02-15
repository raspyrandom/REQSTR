const socket = new WebSocket('https://REQSTR-server.alexkomissarch1.repl.co/socket');

socket.addEventListener('message', (event) => {
    console.log('Message from server ', event.data);
});