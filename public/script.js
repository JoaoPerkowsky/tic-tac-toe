// Inicia o socket
const socket = io();

const cells = document.querySelectorAll('[data-cell]');
const mensagem = document.getElementById('mensagem');
const btnRestart = document.getElementById('restartBtn');
const divPlacarX = document.getElementById('divPlacar-x');
const divPlacarO = document.getElementById('divPlacar-o');
const xPlacar = document.getElementById('x-placar');
const oPlacar = document.getElementById('o-placar');

let simboloJogador = null;
let turnoAtual = 'x';
let xWins = 0;
let oWins = 0;

const COMBOS_VITORIA = [
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 4, 8], [2, 4, 6]
];

function comecaJogo() {
  cells.forEach(cell => {
    cell.classList.remove('x', 'o');
    cell.textContent = '';
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick, { once: true });
  });
  document.getElementById('mensagem').hidden = true;
  turnoAtual = 'x';
  indicadorTurno();
}

// Lida com os clicks na tela, trocando o turno, alterando o front
// e verifica se ouve um empate ou vitória
function handleClick(e) {
  if (simboloJogador !== turnoAtual) return;

  const cell = e.target;
  const index = [...cells].indexOf(cell);

  if (cell.classList.contains('x') || cell.classList.contains('o')) return;

  fazerJogada(index, simboloJogador);
  socket.emit('move', { index, symbol: simboloJogador });
}

function fazerJogada(index, symbol) {
  const cell = cells[index];
  cell.classList.add(symbol);
  cell.textContent = symbol.toUpperCase();

  if (verificaVitoria(symbol)) {
    mostrarMensagem(symbol.toUpperCase(), false);
    atualizaPlacar(symbol);
    encerraJogo();
  } else if (empate()) {
    mostrarMensagem('', true);
    encerraJogo();
  } else {
    turnoAtual = turnoAtual === 'x' ? 'o' : 'x';
    indicadorTurno();
  }
}

// Lógica do estado de jogo
function indicadorTurno() {
  if (turnoAtual === 'x') {
    divPlacarX.classList.add('ativo');
    divPlacarO.classList.remove('ativo');
  } else {
    divPlacarO.classList.add('ativo');
    divPlacarX.classList.remove('ativo');
  }
}

function verificaVitoria(currentClass) {
  return COMBOS_VITORIA.some(combo =>
    combo.every(index => cells[index].classList.contains(currentClass))
  );
}

function empate() {
  return [...cells].every(cell =>
    cell.classList.contains('x') || cell.classList.contains('o')
  );
}

function encerraJogo() {
  // Reinicia o turno no placar e quadrados marcados.
  cells.forEach(cell => cell.removeEventListener('click', handleClick));
  divPlacarX.classList.remove('ativo');
  divPlacarO.classList.remove('ativo');
}

function atualizaPlacar(vencedor) {
  if (vencedor === 'x') {
    xWins++;
    xPlacar.textContent = `${xWins}`;
  } else {
    oWins++;
    oPlacar.textContent = `${oWins}`;
  }
}

function mostrarMensagem(vencedor, empate) {
  const mensagemBox = document.getElementById('mensagem');
  const vencedorTexto = document.getElementById('mensagem-vencedor');
  const resultadoTexto = document.getElementById('mensagem-resultado');

  mensagemBox.hidden = false;

  if (empate) {
    vencedorTexto.textContent = '';
    resultadoTexto.textContent = 'Empate!';
  } else {
    vencedorTexto.textContent = vencedor;
    resultadoTexto.textContent = 'Venceu!';
  }
}

// Sockets utilizado para o multiplayer que são emitidos para o server.js
socket.on('player', symbol => {
  simboloJogador = symbol;
  comecaJogo();
});

// Manda a mensagem de alerta no caso a sala esteja cheio
socket.on('full', message => {
  alert(message);
});

// Envia a jogada feita pelo jogador
socket.on('move', ({ index, symbol }) => {
  fazerJogada(index, symbol);
});

btnRestart.addEventListener('click', () => {
  if (simboloJogador) socket.emit('restart');
});

socket.on('restart', () => {
  comecaJogo();
});

// Começa o jogo
btnRestart.addEventListener('click', comecaJogo);
comecaJogo();