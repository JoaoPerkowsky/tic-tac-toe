const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Guarda a quantidade de jogadores conectados
let players = 0;

// Valida as conexões de cada usuario
io.on('connection', (socket) => {
  console.log('A user connected');

    // Limita a quantidade de jogadores presentes
  if (players >= 2) {
    socket.emit('full', 'A sala esta cheia.');
    socket.disconnect();
    return;
  }

//   Delimita a ordem dos jogadores
  const playerSymbol = players === 0 ? 'x' : 'o';
  socket.emit('player', playerSymbol);
  players++;

//   Faz o broadcast necessario para o outro jogador
  socket.on('move', (data) => {
    socket.broadcast.emit('move', data);
  });

//   Emite o restarte para ambos os jogadores
  socket.on('restart', () => {
    io.emit('restart');
  });

//   Guarda no log caso um dos usuários deslogue
  socket.on('disconnect', () => {
    players--;
    console.log('Um usuário desconectou.');
  });
});

// Inicia a sala e escuta a porta 3000
server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});
