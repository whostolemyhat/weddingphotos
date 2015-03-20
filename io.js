var io = require('socket.io')();

io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('photo', function(data) {
        console.log('io photo event received');
        console.log(data);
    });
});

module.exports = io;