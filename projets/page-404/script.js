const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const playerImages = document.querySelectorAll(".players-images img");

let currentPlayer = "X";
let grid = Array(9).fill(null);
let humanPlayer = null;
let aiPlayer = null;
let gameStarted = false;

const playerNames = {
  X: "Phant",
  O: "Dino",
};

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner() {
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
      return grid[a];
    }
  }
  if (!grid.includes(null)) return "Egalité";
  return null;
}

function handleClick(e) {
  if (!gameStarted) return;
  const index = e.target.dataset.index;
  if (grid[index] || checkWinner() || currentPlayer !== humanPlayer) return;

  playMove(index, humanPlayer);

  if (!checkWinner()) {
    setTimeout(aiMove, 500);
  }
}

function playMove(index, player) {
  grid[index] = player;
  const cell = board.querySelector(`[data-index="${index}"]`);
  cell.classList.add("taken");
  cell.classList.add("taken-" + player);
  cell.textContent = player === "X" ? "🐘" : "🦖";

  const winner = checkWinner();
  if (winner) {
    statusText.textContent =
      winner === "Egalité" ? "Match nul !" : `${playerNames[winner]} a gagné !`;
    gameStarted = false;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `À ${playerNames[currentPlayer]} de jouer`;
  }
}

function aiMove() {
  if (!gameStarted || checkWinner()) return;
  const emptyIndices = grid
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);
  if (emptyIndices.length === 0) return;
  const index = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  playMove(index, aiPlayer);
}

function resetGame() {
  grid = Array(9).fill(null);
  currentPlayer = humanPlayer || "X";
  gameStarted = !!humanPlayer;
  board.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "taken-X", "taken-O");
  });
  if (gameStarted) {
    statusText.textContent = `Joueur ${playerNames[humanPlayer]} commence`;
    if (currentPlayer === aiPlayer) {
      setTimeout(aiMove, 500);
    }
  } else {
    statusText.textContent = "Choisissez votre personnage pour commencer";
  }
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  }
}

playerImages.forEach((img, idx) => {
  img.addEventListener("click", () => {
    if (gameStarted) return;
    humanPlayer = idx === 0 ? "X" : "O";
    aiPlayer = humanPlayer === "X" ? "O" : "X";
    currentPlayer = humanPlayer;
    gameStarted = true;
    playerImages.forEach((im) => im.classList.remove("selected"));
    img.classList.add("selected");
    resetGame();
  });
});
playerImages.forEach((img, idx) => {
  img.addEventListener("click", () => {
    // SUPPRIMER la condition suivante :
    // if (gameStarted) return;
    humanPlayer = idx === 0 ? "X" : "O";
    aiPlayer = humanPlayer === "X" ? "O" : "X";
    currentPlayer = humanPlayer;
    gameStarted = true;
    playerImages.forEach((im) => im.classList.remove("selected"));
    img.classList.add("selected");
    resetGame();
  });
});
function playMove(index, player) {
  grid[index] = player;
  const cell = board.querySelector(`[data-index="${index}"]`);
  cell.classList.add("taken");
  cell.classList.add("taken-" + player);

  const winner = checkWinner();
  if (winner) {
    statusText.textContent =
      winner === "Egalité" ? "Match nul !" : `${playerNames[winner]} a gagné !`;
    gameStarted = false;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `À ${playerNames[currentPlayer]} de jouer`;
  }
}
function aiMove() {
  if (!gameStarted || checkWinner()) return;

  // IA aléatoire si humain = Dino
  if (humanPlayer === "O") {
    randomAIMove();
    return;
  }

  // IA aléatoire 3 fois sur 5 si humain = Éléphant, sinon joue optimal
  if (humanPlayer === "X" && Math.random() < 0.6) {
    randomAIMove();
    return;
  }

  // IA optimale (minimax)
  const bestMove = getBestMove(aiPlayer);
  if (bestMove !== null) {
    playMove(bestMove, aiPlayer);
  }
}

// IA aléatoire
function randomAIMove() {
  const emptyIndices = grid
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);
  if (emptyIndices.length === 0) return;
  const index = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  playMove(index, aiPlayer);
}

// IA optimale (minimax)
function getBestMove(player) {
  let bestScore = -Infinity;
  let move = null;
  for (let i = 0; i < 9; i++) {
    if (grid[i] === null) {
      grid[i] = player;
      let score = minimax(grid, 0, false, player, humanPlayer);
      grid[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newGrid, depth, isMaximizing, ai, human) {
  const winner = checkWinner();
  if (winner === ai) return 10 - depth;
  if (winner === human) return depth - 10;
  if (winner === "Egalité") return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newGrid[i] === null) {
        newGrid[i] = ai;
        let score = minimax(newGrid, depth + 1, false, ai, human);
        newGrid[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newGrid[i] === null) {
        newGrid[i] = human;
        let score = minimax(newGrid, depth + 1, true, ai, human);
        newGrid[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}
function playMove(index, player) {
  grid[index] = player;
  const cell = board.querySelector(`[data-index="${index}"]`);
  cell.classList.add("taken");
  cell.classList.add("taken-" + player);
  cell.textContent = player === "X" ? "" : "";

  const winner = checkWinner();
  if (winner) {
    statusText.textContent =
      winner === "Egalité" ? "Match nul !" : `${playerNames[winner]} a gagné !`;
    gameStarted = false;
    resetBtn.classList.add("shine"); // Ajoute l'effet de brillance
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `À ${playerNames[currentPlayer]} de jouer`;
  }
}

function resetGame() {
  grid = Array(9).fill(null);
  currentPlayer = humanPlayer || "X";
  gameStarted = !!humanPlayer;
  board.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "taken-X", "taken-O");
  });
  resetBtn.classList.remove("shine"); // Retire l'effet de brillance
  if (gameStarted) {
    statusText.textContent = `Joueur ${playerNames[humanPlayer]} commence`;
    if (currentPlayer === aiPlayer) {
      setTimeout(aiMove, 500);
    }
  } else {
    statusText.textContent = "Choisissez votre personnage pour commencer";
  }
}

resetBtn.addEventListener("click", resetGame);

createBoard();

statusText.textContent = "";
