window.myRole = null; // Assigned by network.js ('X' for Host, 'O' for Guest)

let gridSize = 3;
let lastChanceActive = false;
let pendingWinner = null;
let winCondition = 3; 
let isMiseryMode = false; 
let silencedPlayer = null; 
let reflectActive = null;  
let board = [];

let players = ['X', 'O'];
let startingPlayer = 'X'; 
let currentPlayer = 'X';
let scores = { 'X': 0, 'O': 0 };

let hasUsedLastChance = { 'X': false, 'O': false }; 
let lastChanceEndTime = 0; 
let labyrinthActive = false;
let labyrinthTurnCount = 0;
let isGravityWellActive = false;
let gravityWellTurnsLeft = 0;
let shortcutActive = false;
let blackoutPlayer = null;
let blackoutTurnsLeft = 0; 
let eclipseTurnsLeft = 0; 

let playerPowers = { 'X': [], 'O': [] }; 
let activePower = null; 
const MAX_POWER_SLOTS = 6; 

// ---> NEW SWAP SYSTEM VARIABLES <---
let isTrashMode = false;
let pendingNewPower = null;
let swappingPlayer = null; // Fixes the tie-game merging bug!

let isTransitioning = false;   
let powerSource = null;        

let instantPowers = ['NUKE', 'MINDBEND', 'MIRAGE', 'QUAKE', 'GRAVITY', 'GUILLOTINE', 'EXPAND', 'ROTATE', 'MISERY', 'COPYCAT', 'SILENCE', 'SABOTAGE', 'REFRESH', 'STEAL', 'QUANTUM', 'REWIND', 'LABYRINTH', 'GRAVITY_WELL', 'SINKHOLE', 'BLACKOUT', 'SHORTCUT', 'MAGNET', 'ECLIPSE'];
let twoStepPowers = ['SWAP']; 

let gameState = "PLAYING"; 
let roundWinner = null;
let draftQueue = []; 

const C_GRID = [100, 110, 120, 100]; 
const C_X = [220, 40, 40];      
const C_O = [60, 100, 255];     
const C_DUST_LIGHT = [180, 170, 160, 80]; 
const C_DUST_DARK = [100, 90, 80, 50];   
const C_GLOW = [255, 255, 100, 180]; 
const C_BG = [20, 25, 30]; 
window.isGameReady = false; 
function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('game-screen'); // Locks the canvas inside the hidden HTML div
  
  initBoard();
  currentPlayer = startingPlayer;
  textAlign(CENTER, CENTER);
  
  noLoop(); // FREEZES the game engine entirely until PeerJS connects
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
}

function initBoard() {
  board = [];
  for (let i = 0; i < gridSize; i++) {
    board[i] = new Array(gridSize).fill('');
  }
}

window.getBoardBounds = function() {
  let boardW = min(width * 0.5, height * 0.6); 
  let boardX = width / 2 - boardW / 2;
  let boardTop = height / 2 - boardW / 2 + 20; 
  let boardBottom = boardTop + boardW;
  return { w: boardW, h: boardW, x: boardX, top: boardTop, bottom: boardBottom };
}

function draw() {
  if (gameState === "GAMEOVER") gameState = "GAME_OVER";
  
  if (typeof drawDynamicBackground === "function") {
      drawDynamicBackground();
  } else {
      background(C_BG[0], C_BG[1], C_BG[2]); 
  }
  
  push(); 
  if (typeof runAnimations === "function") runAnimations(); 

  if (gameState === "GAME_OVER") {
    drawGameOver();
  } 
  else if (gameState === "DRAFTING") {
    if (typeof drawDraftScreen === "function") drawDraftScreen(); 
  } 
  else if (gameState === "PLAYING" || gameState === "POWER_SWAP") {
    if (lastChanceActive && millis() > lastChanceEndTime && !isTransitioning) finalizeRound(pendingWinner);

    drawTurnBox(); 
    drawBoard();
    drawPowerInventory(); 
    drawScores();
    if (isMiseryMode) drawMiseryOverlay();
    if (lastChanceActive) drawLastChanceOverlay();
    drawTooltips(); 
    
    if (gameState === "POWER_SWAP" && typeof drawSwapUI === "function") {
        drawSwapUI();
    }
  }
  pop(); 

  if (typeof drawDevConsole === "function") drawDevConsole();
}

function mousePressed() {
  // STRICT NETWORK GATE: Block clicks entirely until the safety delay finishes
  if (!window.isGameReady || window.myRole === null) return; 

  if (gameState === "GAMEOVER") gameState = "GAME_OVER";
  if (isTransitioning) return;
  
  if (gameState === "GAME_OVER") {
      location.reload(); 
      return; 
  } 
 else if (gameState === "DRAFTING") {
      // ADD THIS LINE: Only the player whose turn it is to draft can click
      if (draftQueue.length > 0 && window.myRole !== draftQueue[0]) return;
      
      if (typeof handleDraftClick === "function") handleDraftClick();
      return;
  } 
  else if (gameState === "POWER_SWAP") {
      // ADD THIS LINE: Only the player swapping can click
      if (swappingPlayer && window.myRole !== swappingPlayer) return;

      if (typeof handleSwapClick === "function") handleSwapClick();
      return; 
  }
  else if (gameState === "PLAYING") {
      // STRICT NETWORK GATE: Drop clicks if it's not this computer's turn
      if (currentPlayer !== window.myRole && window.myRole !== null) return;

      if (lastChanceActive && mouseY < 80) { finalizeRound(pendingWinner); return; }
      
      if (lastChanceActive) {
          let btnX = width/2; let btnY = height - 30; let btnW = 220; let btnH = 36;
          if (mouseX > btnX - btnW/2 && mouseX < btnX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
              finalizeRound(pendingWinner); return;
          }
      }

      let clickedPower = checkPowerClick();
      if (clickedPower) {
        if (currentPlayer === silencedPlayer) return; 
        
        if (instantPowers.includes(clickedPower.id)) {
          window.applyMove(0, 0, clickedPower.id, currentPlayer);
          if (typeof sendNetworkMove === "function") sendNetworkMove(0, 0, clickedPower.id);
          
          clickedPower.cd = clickedPower.maxCd; activePower = null; powerSource = null;
          return;
        }

        if (activePower === clickedPower) { activePower = null; powerSource = null; } 
        else { activePower = clickedPower; powerSource = null; }
        return; 
      }

      let bnd = getBoardBounds();
      
      if (mouseX > bnd.x && mouseX < bnd.x + bnd.w && mouseY > bnd.top && mouseY < bnd.bottom) {
        let w = bnd.w / gridSize; let h = bnd.h / gridSize;
        let i = floor((mouseX - bnd.x) / w); let j = floor((mouseY - bnd.top) / h);
        
        if (activePower) {
          if (twoStepPowers.includes(activePower.id)) {
            let piece = board[i][j];
            let opp = currentPlayer === 'X' ? 'O' : 'X';

            if (!powerSource) {
              let valid = false;
              if (activePower.id === 'SWAP' && piece === currentPlayer) valid = true;
              if (valid) powerSource = { i: i, j: j }; 
              return; 
            } else {
              let validTarget = false;
              if (activePower.id === 'SWAP' && (piece === opp || piece === opp + '_S') && !piece.endsWith('_A')) validTarget = true;

              if (validTarget) {
                window.applyMove(i, j, activePower.id, currentPlayer);
                if (typeof sendNetworkMove === "function") sendNetworkMove(i, j, activePower.id);
                
                activePower.cd = activePower.maxCd; activePower = null; powerSource = null;
              } else { powerSource = null; } 
            }
          } else {
            window.applyMove(i, j, activePower.id, currentPlayer);
            if (typeof sendNetworkMove === "function") sendNetworkMove(i, j, activePower.id);
            
            activePower.cd = activePower.maxCd; activePower = null; powerSource = null;
          }
        } else if (board[i][j] === '' || board[i][j].startsWith('MINE_') || board[i][j] === 'P_WALL') {
          let piece = board[i][j];
          if (piece.startsWith('MINE_') && piece.endsWith(currentPlayer)) return; // Prevent clicking own mine
          
          window.applyMove(i, j, null, currentPlayer);
          if (typeof sendNetworkMove === "function") sendNetworkMove(i, j, null);
        }
      }
  }
}

// ---> DECOUPLED NETWORK ACTION LOGIC <---
window.applyMove = function(i, j, powerId = null, sourcePlayer = null) {
  let playerToUse = sourcePlayer || currentPlayer;
  
  if (powerId) {
    let success = typeof executePower === "function" ? executePower(powerId, i, j) : false;
    if (success === "FREE_ACTION") return;
    if (success) {
      let chanceTriggered = checkRoundOver(false);
      if (!chanceTriggered && gameState === "PLAYING" && !isTransitioning) changeTurn();
    }
    return;
  }

  // Normal Placement Logic
  let piece = board[i][j];
  if (piece === '' || piece.startsWith('MINE_')) {
    if (piece.startsWith('MINE_')) {
      if (piece.endsWith(playerToUse)) return; 
      board[i][j] = piece.split('_')[1]; 
      if (typeof triggerScreenShake === "function") triggerScreenShake(20);
      if (typeof triggerPowerAnimation === "function") triggerPowerAnimation('MINE_TRIGGER', i, j);
    } else {
      if (lastChanceActive) { if (typeof triggerScreenShake === "function") triggerScreenShake(1); return; }
      board[i][j] = playerToUse;
      if (typeof triggerPieceSlam === "function") triggerPieceSlam(i, j);
    }
    
    let chanceTriggered = checkRoundOver(false); 
    if (!chanceTriggered && gameState === "PLAYING" && !isTransitioning) changeTurn();
  } else if (piece === 'P_WALL') {
    board[i][j] = ''; 
    if (typeof triggerScreenShake === "function") triggerScreenShake(5);
    let chanceTriggered = checkRoundOver(false); 
    if (!chanceTriggered && gameState === "PLAYING" && !isTransitioning) changeTurn();
  }
};

window.startDeletionProcess = function(chosenPowerDef, pTracker) {
    pendingNewPower = chosenPowerDef;
    swappingPlayer = pTracker; 
    isTrashMode = true;
    gameState = "POWER_SWAP";
};

window.executeSwap = function(index) {
    if (!isTrashMode || index < 0 || index >= playerPowers[swappingPlayer].length) return;

    let oldPower = playerPowers[swappingPlayer][index];
    let currentCD = oldPower.cd; 

    pendingNewPower.cd = currentCD; 
    playerPowers[swappingPlayer][index] = pendingNewPower;

    if (typeof triggerScreenShake === "function") triggerScreenShake(15);
    if (typeof triggerFlash === "function") triggerFlash(255, 50, 50, 150); 
    
    closeSwapUI();
};

window.closeSwapUI = function() {
    pendingNewPower = null;
    isTrashMode = false;
    swappingPlayer = null;
    gameState = "PLAYING";
    
    if (typeof isDraftingSetup !== "undefined") isDraftingSetup = false;
    changeTurn(); 
};

window.getClickedPowerIndex = function() {
  let activeP = (gameState === "POWER_SWAP" && swappingPlayer) ? swappingPlayer : currentPlayer;
  let startX = (activeP === 'X') ? 20 : width - 200; 
  let powers = playerPowers[activeP];
  for (let i = 0; i < powers.length; i++) {
     let boxY = 100 + (i * 70) + 15;
     if (mouseX > startX && mouseX < startX + 180 && mouseY > boxY && mouseY < boxY + 50) { 
         return i; 
     }
  }
  return -1;
};

function changeTurn() {
  if (shortcutActive) { winCondition++; shortcutActive = false; }
  
  if (blackoutPlayer === currentPlayer) { 
    blackoutTurnsLeft--; 
    if (blackoutTurnsLeft <= 0) blackoutPlayer = null; 
  }
  
  if (eclipseTurnsLeft > 0) eclipseTurnsLeft--;

  currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
  if (silencedPlayer === currentPlayer) silencedPlayer = null; 

  if (labyrinthActive) { labyrinthTurnCount++; if (labyrinthTurnCount % 2 === 0) shiftLabyrinth(); }
  if (isGravityWellActive) { applyGravity(); gravityWellTurnsLeft--; if (gravityWellTurnsLeft <= 0) isGravityWellActive = false; }
  
  let bombsToExplode = [];
  let fakesToResolve = []; 

  for (let c = 0; c < gridSize; c++) {
    for (let r = 0; r < gridSize; r++) {
      let cell = board[c][r];
      if (!cell) continue;

      if (cell === 'W_WALL_1_' + currentPlayer) { board[c][r] = 'W'; } 
      else if (cell === 'W_WALL_2_' + currentPlayer) { board[c][r] = 'W_WALL_1_' + currentPlayer; }
      else if (cell.startsWith('CRATER_')) {
        let turns = parseInt(cell.split('_')[1]);
        if (turns === 1) board[c][r] = '';
        else board[c][r] = `CRATER_${turns - 1}`;
      }
      else if (cell.startsWith('ICE_')) {
        let parts = cell.split('_'); let turns = parseInt(parts[1]); let orig = parts.slice(2).join('_');
        if (orig.charAt(0) === currentPlayer) { if (turns === 1) board[c][r] = orig; else board[c][r] = `ICE_${turns - 1}_${orig}`; }
      }
      else if (cell.startsWith('ASSIM_')) {
        let parts = cell.split('_'); let turns = parseInt(parts[1]); let caster = parts[2];
        if (caster === currentPlayer) { if (turns === 1) board[c][r] = caster; else board[c][r] = `ASSIM_${turns - 1}_${caster}`; }
      }
      else if (cell.startsWith('FAKE_')) {
        let parts = cell.split('_'); let turns = parseInt(parts[1]); let caster = parts[2];
        if (caster === currentPlayer) { if (turns === 1) fakesToResolve.push({c, r}); else board[c][r] = `FAKE_${turns - 1}_${caster}`; }
      }
      else if (cell.startsWith('CORRUPT_')) {
        let parts = cell.split('_'); let turns = parseInt(parts[1]); let caster = parts[2];
        if (caster === currentPlayer) {
          if (turns === 1) {
            let neighbors = [{dx: 0, dy: -1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: 1}];
            let enemies = []; let opp = (caster === 'X') ? 'O' : 'X';
            for (let n of neighbors) {
              let nx = c + n.dx, ny = r + n.dy;
              if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                let target = board[nx][ny];
                if ((target === opp || target === opp + '_S' || (target.startsWith('ICE_') && target.endsWith('_' + opp))) && !target.endsWith('_A')) { enemies.push({x: nx, y: ny}); }
              }
            }
            if (enemies.length > 0) { let e = random(enemies); board[e.x][e.y] = caster; if (typeof triggerScreenShake === 'function') triggerScreenShake(4); }
            board[c][r] = `CORRUPT_2_${caster}`; 
          } else { board[c][r] = `CORRUPT_${turns - 1}_${caster}`; }
        }
      }
      else if (cell.startsWith('BOMB_')) {
        let parts = cell.split('_'); let turns = parseInt(parts[1]); let caster = parts[2];
        if (caster === currentPlayer) { if (turns === 1) bombsToExplode.push({c, r}); else board[c][r] = `BOMB_${turns - 1}_${caster}`; }
      }
      else if (cell.startsWith('TROJAN_')) {
        let parts = cell.split('_'); let turns = parseInt(parts[1]); let caster = parts[2];
        if (caster === currentPlayer) {
          if (turns === 1) {
            board[c][r] = caster; 
            let neighbors = [{dx: 0, dy: -1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: 1}];
            for (let n of neighbors) {
              let nx = c + n.dx, ny = r + n.dy;
              if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                if (board[nx][ny] !== '#' && board[nx][ny] !== 'P_WALL' && board[nx][ny] !== 'L_WALL' && !(board[nx][ny] && board[nx][ny].endsWith('_A'))) board[nx][ny] = caster;
              }
            }
            if (typeof triggerScreenShake === 'function') triggerScreenShake(12);
            if (typeof triggerPowerAnimation === 'function') triggerPowerAnimation('TROJAN_POP', c, r);
          } else { board[c][r] = `TROJAN_${turns - 1}_${caster}`; }
        }
      }
    }
  }

  if (fakesToResolve.length > 0) {
    let luckyFake = random(fakesToResolve); 
    for (let f of fakesToResolve) { if (f.c === luckyFake.c && f.r === luckyFake.r) board[f.c][f.r] = currentPlayer; else board[f.c][f.r] = ''; }
  }

  for (let b of bombsToExplode) {
    board[b.c][b.r] = ''; 
    let neighbors = [{dx: -1, dy: -1}, {dx: 0, dy: -1}, {dx: 1, dy: -1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: -1, dy: 1}, {dx: 0, dy: 1}, {dx: 1, dy: 1}];
    for(let n of neighbors) {
        let nx = b.c + n.dx, ny = b.r + n.dy;
        if(nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) { if (!(board[nx][ny] && board[nx][ny].endsWith('_A'))) board[nx][ny] = ''; }
    }
    if (typeof triggerScreenShake === 'function') triggerScreenShake(15);
  }

  let powers = playerPowers[currentPlayer];
  for (let p of powers) if (p.cd > 0) p.cd--; 
  
  if (typeof handleApocalypseTurn === "function" && typeof activeEvent !== 'undefined' && activeEvent) { handleApocalypseTurn(); } 
  else if (typeof triggerApocalypse === "function" && typeof activeEvent !== 'undefined' && !activeEvent) {
      if (gridSize < 6 && random() < 0.005) triggerApocalypse();
  }
  
  checkRoundOver(true);
}

function checkPowerClick() {
  let startX = (currentPlayer === 'X') ? 20 : width - 200; 
  let powers = playerPowers[currentPlayer];
  for (let i = 0; i < powers.length; i++) {
     let boxY = 100 + (i * 70) + 15;
     if (mouseX > startX && mouseX < startX + 180 && mouseY > boxY && mouseY < boxY + 50) { if (powers[i].cd === 0) return powers[i]; }
  }
  return null;
}

function checkRoundOver(isEndOfTurn = false) {
  let result = checkWinner();
  if (isMiseryMode && (result === 'X' || result === 'O')) result = (result === 'X') ? 'O' : 'X';

  if (lastChanceActive) {
    if (isEndOfTurn) {
      if (result === pendingWinner) { finalizeRound(result); return false; } 
      else {
        lastChanceActive = false; pendingWinner = null;
        if (typeof triggerScreenShake === 'function') triggerScreenShake(8);
        
        if (result !== null && result !== 'tie' && result !== 'VIRUS') {
           let defender = (result === 'X') ? 'O' : 'X';
           if (!hasUsedLastChance[defender]) {
             lastChanceActive = true; pendingWinner = result;
             hasUsedLastChance[defender] = true; currentPlayer = defender;
             lastChanceEndTime = millis() + 5000; return true; 
           } else { finalizeRound(result); return false; }
        } else if (result === 'VIRUS') { finalizeRound(result); return false; }
        return false;
      }
    } else { return false; }
  }

  if (result !== null && !isTransitioning) {
    if (result === 'tie' || result === 'VIRUS') { finalizeRound(result); return false; }

    let defender = (result === 'X') ? 'O' : 'X'; 
    if (!hasUsedLastChance[defender]) {
      lastChanceActive = true; pendingWinner = result; hasUsedLastChance[defender] = true; 
      currentPlayer = defender; lastChanceEndTime = millis() + 5000; 
      if (typeof triggerScreenShake === "function") triggerScreenShake(5);
      return true; 
    } else { finalizeRound(result); return false; }
  }
  return false;
}

function finalizeRound(result) {
  isTransitioning = true; roundWinner = result; lastChanceActive = false; pendingWinner = null;

  if (result === 'VIRUS') {
      scores['X'] = 0; scores['O'] = 0; 
      gameState = "GAME_OVER";
      draftQueue = []; 
      if (typeof isDraftingSetup !== "undefined") isDraftingSetup = false;
      if (typeof triggerScreenShake === "function") triggerScreenShake(30);
      isTransitioning = false; return;
  }

  if (result !== 'tie') scores[result]++;
  
  if (typeof triggerScreenShake === "function") triggerScreenShake(8);
  setTimeout(() => {
    if (scores['X'] >= 5 || scores['O'] >= 5) { 
        gameState = "GAME_OVER";
        draftQueue = []; 
        if (typeof isDraftingSetup !== "undefined") isDraftingSetup = false;
    } 
    else {
      gameState = "DRAFTING";
      draftQueue = (result === 'tie') ? ['X', 'O'] : [(result === 'X' ? 'O' : 'X')];
      if (typeof isDraftingSetup !== "undefined") isDraftingSetup = false; 
    }
    isTransitioning = false; 
  }, 1000);
}

function checkWinner() {
  if (eclipseTurnsLeft > 0) return null; 

  const isP = (cell, p) => {
    if (!cell) return false;
    if (cell === p) return true; 
    if (p === 'X' || p === 'O') {
        if (cell === p + '_S' || cell === p + '_A' || cell === 'W') return true;
        if (cell.startsWith('CORRUPT_') && cell.endsWith('_' + p)) return true;
        if (cell.startsWith('TROJAN_') && cell.endsWith('_' + p)) return true;
        if (cell.startsWith('ASSIM_') && !cell.endsWith('_' + p)) return true;
    }
    return false;
  };
  
  for (let j = 0; j < gridSize; j++) {
    let sX = 0, sO = 0, sV = 0;
    for (let i = 0; i < gridSize; i++) {
      if (isP(board[i][j], 'X')) sX++; else sX = 0;
      if (isP(board[i][j], 'O')) sO++; else sO = 0;
      if (isP(board[i][j], 'VIRUS')) sV++; else sV = 0;
      if (sX >= winCondition) return 'X'; if (sO >= winCondition) return 'O'; if (sV >= 4) return 'VIRUS'; 
    }
  }

  for (let i = 0; i < gridSize; i++) {
    let sX = 0, sO = 0, sV = 0;
    for (let j = 0; j < gridSize; j++) {
      if (isP(board[i][j], 'X')) sX++; else sX = 0;
      if (isP(board[i][j], 'O')) sO++; else sO = 0;
      if (isP(board[i][j], 'VIRUS')) sV++; else sV = 0;
      if (sX >= winCondition) return 'X'; if (sO >= winCondition) return 'O'; if (sV >= 4) return 'VIRUS'; 
    }
  }

  for (let d = -(gridSize-1); d < gridSize; d++) {
    let sX = 0, sO = 0, sV = 0;
    for (let i = 0; i < gridSize; i++) {
      let j = i - d;
      if (j >= 0 && j < gridSize) {
        if (isP(board[i][j], 'X')) sX++; else sX = 0;
        if (isP(board[i][j], 'O')) sO++; else sO = 0;
        if (isP(board[i][j], 'VIRUS')) sV++; else sV = 0;
        if (sX >= winCondition) return 'X'; if (sO >= winCondition) return 'O'; if (sV >= 4) return 'VIRUS';
      }
    }
  }

  for (let d = 0; d <= (gridSize-1)*2; d++) {
    let sX = 0, sO = 0, sV = 0;
    for (let i = 0; i < gridSize; i++) {
      let j = d - i;
      if (j >= 0 && j < gridSize) {
        if (isP(board[i][j], 'X')) sX++; else sX = 0;
        if (isP(board[i][j], 'O')) sO++; else sO = 0;
        if (isP(board[i][j], 'VIRUS')) sV++; else sV = 0;
        if (sX >= winCondition) return 'X'; if (sO >= winCondition) return 'O'; if (sV >= 4) return 'VIRUS';
      }
    }
  }
  
  if (board.every(row => row.every(cell => cell !== '' && cell !== 'P_WALL' && cell !== 'L_WALL' && !cell.startsWith('CRATER') && cell !== 'VOID_CENTER' && !cell.startsWith('MINE_')))) return 'tie';
  return null; 
}

function resetBoard() {
  startingPlayer = (startingPlayer === 'X') ? 'O' : 'X';
  currentPlayer = startingPlayer;
  
  if (typeof activeEvent !== 'undefined') activeEvent = null;
  if (typeof eventTurnCount !== 'undefined') eventTurnCount = 0;
  
  gridSize = 3; winCondition = 3; initBoard();
  activePower = null; isMiseryMode = false; gameState = "PLAYING";
  
  labyrinthActive = false; labyrinthTurnCount = 0;
  isGravityWellActive = false; gravityWellTurnsLeft = 0;
  shortcutActive = false; blackoutPlayer = null; 
  eclipseTurnsLeft = 0; blackoutTurnsLeft = 0;
  hasUsedLastChance = { 'X': false, 'O': false }; 
}

function shiftLabyrinth() {
  for (let c = 0; c < gridSize; c++) { for (let r = 0; r < gridSize; r++) { if (board[c][r] === 'L_WALL') board[c][r] = ''; } }
  let spots = [];
  for (let c = 0; c < gridSize; c++) {
    for (let r = 0; r < gridSize; r++) { if (board[c][r] !== 'P_WALL' && board[c][r] !== '#' && !(board[c][r] && board[c][r].endsWith('_A'))) spots.push({c, r}); }
  }
  spots.sort(() => random(-1, 1));
  for (let i = 0; i < Math.min(4, spots.length); i++) { board[spots[i].c][spots[i].r] = 'L_WALL'; }
  if (typeof triggerScreenShake === "function") triggerScreenShake(8);
}

function applyGravity() {
  for (let col = 0; col < gridSize; col++) {
    let stack = [];
    for (let row = 0; row < gridSize; row++) {
      let p = board[col][row];
      if (p !== '' && p !== '#' && p !== 'P_WALL' && p !== 'L_WALL' && !(p && p.endsWith('_A'))) { stack.push(p); board[col][row] = ''; }
    }
    let currentRow = gridSize - 1;
    while (stack.length > 0 && currentRow >= 0) {
      if (board[col][currentRow] === '' || board[col][currentRow] === 'P_WALL') { board[col][currentRow] = stack.pop(); }
      currentRow--;
    }
  }
}

function keyPressed() {
  if (key === '`' || key === '~') {
    devConsoleActive = !devConsoleActive;
    if (devConsoleActive) devInputText = ""; 
    return false; 
  }

  if (typeof devConsoleActive !== 'undefined' && devConsoleActive) {
    if (typeof handleDevInput === "function") handleDevInput(key, keyCode);
    return false; 
  }

  if (key === 'a' || key === 'A') {
    if (typeof triggerApocalypse === "function" && !activeEvent) triggerApocalypse();
  }
}
