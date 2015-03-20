var io = require('socket.io')();

io.on('connection', function(socket) {
    // socket.on('photo', function(data) {
    //     console.log('io photo event received');
    //     console.log(data);
    // });
});

module.exports = io;