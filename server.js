const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let users = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    let currentUser = '';

    socket.on('chat message', (data) => {
        if (data.message === 'has connected') {
            currentUser = data.username;
            users[socket.id] = currentUser;
            io.emit('chat message', { username: data.username, message: 'has connected' });
        } else if (data.message === 'has disconnected') {
            io.emit('chat message', { username: data.username, message: 'has disconnected' });
        } else {
            io.emit('chat message', data);
        }
        io.emit('update users', Object.values(users));
    });

    socket.on('disconnect', () => {
        if (currentUser) {
            io.emit('chat message', { username: currentUser, message: 'has disconnected' });
            delete users[socket.id];
        }
        io.emit('update users', Object.values(users));
    });
});

server.listen(3000, () => {
    console.log('Listening on *:3000');
});
