// --- THE MASTER ABILITY ENGINE ---

function executePower(id, i, j) {
  let opponent = currentPlayer === 'X' ? 'O' : 'X';

  // --- 1. TWO-STEP TARGETING POWERS ---
  if (id === 'SWAP') {
    if (typeof powerSource !== 'undefined' && powerSource !== null) {
      if (board[i][j].endsWith('_A') || board[powerSource.i][powerSource.j].endsWith('_A')) return false; // Aegis blocks
      let temp = board[i][j];
      board[i][j] = board[powerSource.i][powerSource.j];
      board[powerSource.i][powerSource.j] = temp;
      return true;
    }
    return false;
  }

  // --- 2. STANDARD & PHYSICS POWERS (1-Step Targeted) ---
  if (id === 'BULLDOZER') {
    let hasAegis = false;
    for (let c = 0; c < gridSize; c++) if(board[c][j] && board[c][j].endsWith('_A')) hasAegis = true;
    if (hasAegis) return false; // Aegis blocks the bulldozer!

    let newRow = [];
    for (let c = 0; c < gridSize; c++) newRow[c] = board[(c + gridSize - 1) % gridSize][j];
    for (let c = 0; c < gridSize; c++) board[c][j] = newRow[c];
    return true;
  }

  if (id === 'LIGHTNING') {
    if (board[i][j] === opponent || board[i][j] === opponent + '_S' || board[i][j] === opponent + '_A') {
      if (board[i][j].endsWith('_A')) return false; // Aegis deflects
      let toDestroy = [{x: i, y: j}];
      board[i][j] = ''; 
      
      let count = 0; let q = [{x: i, y: j}];
      let visited = new Set(); visited.add(`${i},${j}`);
      
      while(q.length > 0 && count < 2) {
         let curr = q.shift();
         let neighbors = [{dx:-1,dy:0}, {dx:1,dy:0}, {dx:0,dy:-1}, {dx:0,dy:1}, {dx:-1,dy:-1}, {dx:1,dy:1}, {dx:-1,dy:1}, {dx:1,dy:-1}];
         for (let n of neighbors) {
           let nx = curr.x + n.dx; let ny = curr.y + n.dy;
           if (nx>=0 && nx<gridSize && ny>=0 && ny<gridSize) {
              if (!visited.has(`${nx},${ny}`)) {
                 visited.add(`${nx},${ny}`);
                 let p = board[nx][ny];
                 if (p && (p === opponent || p === opponent + '_S' || (p.startsWith('TROJAN_') && p.endsWith(opponent))) && !p.endsWith('_A')) { 
                    toDestroy.push({x: nx, y: ny}); board[nx][ny] = ''; q.push({x: nx, y: ny}); count++;
                    if(count >= 2) break;
                 }
              }
           }
         }
      }
      return true;
    }
    return false;
  }

  if (id === 'MINE') {
    if (board[i][j] === '' || board[i][j] === 'P_WALL') {
      board[i][j] = 'MINE_' + currentPlayer; return true; 
    }
    return false;
  }

  if (id === 'AEGIS') {
    if (board[i][j] === currentPlayer) {
      board[i][j] = currentPlayer + '_A'; return true;
    }
    return false;
  }

  if (id === 'TROJAN') {
    if (board[i][j] === '' || board[i][j] === 'P_WALL') {
      board[i][j] = 'TROJAN_2_' + currentPlayer; return true;
    }
    return false;
  }

  if (id === 'TELEPORT') {
    if ((board[i][j] === opponent || board[i][j] === opponent + '_S') && !board[i][j].endsWith('_A')) {
      let emptySpots = [];
      for(let x=0; x<gridSize; x++) {
        for(let y=0; y<gridSize; y++) { if(board[x][y] === '' || board[x][y] === 'P_WALL') emptySpots.push({x,y}); }
      }
      if(emptySpots.length > 0) {
        let spot = random(emptySpots);
        board[spot.x][spot.y] = board[i][j]; board[i][j] = currentPlayer; return true;
      }
    }
    return false;
  }

  if (id === 'ERASER') {
    if ((board[i][j] === opponent || board[i][j] === opponent + '_S') && !board[i][j].endsWith('_A')) { 
      board[i][j] = currentPlayer; return true; 
    }
    return false;
  }

  if (id === 'WALL') {
    if (board[i][j] === '' || board[i][j] === 'P_WALL') { board[i][j] = '#'; return "FREE_ACTION"; }
    return false;
  }

  if (id === 'BOMB') {
    for (let x = 0; x < gridSize; x++) {
      if (board[i][x] && board[i][x] !== '#' && !board[i][x].endsWith('_A')) board[i][x] = ''; 
      if (board[x][j] && board[x][j] !== '#' && !board[x][j].endsWith('_A')) board[x][j] = ''; 
    }
    return true;
  }

  if (id === 'WILDCARD') {
    if (board[i][j] === '' || board[i][j] === 'P_WALL') { 
      board[i][j] = 'W_WALL_2_' + currentPlayer; 
      let empty = [];
      for(let x = 0; x < gridSize; x++) {
        for(let y = 0; y < gridSize; y++) { if(board[x][y] === '' || board[x][y] === 'P_WALL') empty.push({x, y}); }
      }
      if(empty.length > 0) { let r = random(empty); board[r.x][r.y] = 'W_WALL_2_' + currentPlayer; }
      return true; 
    }
    return false;
  }

  if (id === 'CORRUPT') {
    if (board[i][j] === currentPlayer) { board[i][j] = 'CORRUPT_2_' + currentPlayer; return true; }
    return false;
  }

  if (id === 'CLONE') {
    if (board[i][j] === currentPlayer || (board[i][j].startsWith('CORRUPT_') && board[i][j].endsWith(currentPlayer))) {
      let neighbors = [ {dx: 0, dy: -1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: 1}, {dx: -1, dy: -1}, {dx: 1, dy: -1}, {dx: -1, dy: 1}, {dx: 1, dy: 1} ];
      let cloned = false;
      for (let n of neighbors) {
        let nx = i + n.dx, ny = j + n.dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          if (board[nx][ny] === '' || board[nx][ny] === 'P_WALL') {
            board[nx][ny] = board[i][j]; cloned = true;
          }
        }
      }
      return cloned; 
    }
    return false;
  }

  if (id === 'CHRONO') {
    if ((board[i][j] === opponent || board[i][j] === opponent + '_S') && !board[i][j].endsWith('_A')) {
      board[i][j] = 'ICE_2_' + board[i][j]; return true;
    }
    return false;
  }

  if (id === 'TIMEBOMB') {
    if (board[i][j] === '' || board[i][j] === 'P_WALL') { board[i][j] = 'BOMB_2_' + currentPlayer; return true; }
    return false;
  }

  if (id === 'ASSIMILATE') {
    if ((board[i][j] === opponent || board[i][j] === opponent + '_S') && !board[i][j].endsWith('_A')) {
      board[i][j] = 'ASSIM_2_' + currentPlayer; return true;
    }
    return false;
  }

  if (id === 'LOCKDOWN') {
    if (board[i][j] === '' || board[i][j] === 'P_WALL') { 
      board[i][j] = currentPlayer; 
      let neighbors = [{dx: 0, dy: -1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: 1}];
      for (let n of neighbors) {
        let nx = i + n.dx, ny = j + n.dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          if (board[nx][ny] === '' || board[nx][ny] === 'P_WALL') board[nx][ny] = 'L'; 
        }
      }
      return true; 
    }
    return false;
  }

  if (id === 'SACRIFICE') {
    if (board[i][j] === currentPlayer || (board[i][j].startsWith('CORRUPT_') && board[i][j].endsWith(currentPlayer))) {
      board[i][j] = ''; 
      let oppSpots = [];
      for(let x=0; x<gridSize; x++) {
        for(let y=0; y<gridSize; y++) { if((board[x][y] === opponent || board[x][y] === opponent + '_S') && !board[x][y].endsWith('_A')) oppSpots.push({x,y}); }
      }
      oppSpots.sort(() => random(-1, 1)); 
      let targets = oppSpots.slice(0, 2); 
      for (let t of targets) { board[t.x][t.y] = currentPlayer; } 
      return true;
    }
    return false;
  }

  if (id === 'DOUBLE') {
    if (board[i][j] === '' || board[i][j] === 'P_WALL') {
      board[i][j] = currentPlayer; currentPlayer = opponent; return true;
    }
    return false;
  }

  if (id === 'SHIELD') {
    if (board[i][j] !== '' && board[i][j] !== 'P_WALL') return false; 
    board[i][j] = currentPlayer; 
    let oppPowers = playerPowers[opponent];
    let shuffled = oppPowers.slice().sort(() => 0.5 - Math.random());
    let targets = shuffled.slice(0, 3);
    for (let pwr of targets) { pwr.cd = pwr.maxCd; }
    return true;
  }

  if (id === 'VORTEX') {
    if (board[i][j] === '' || board[i][j] === 'P_WALL') {
      let nextBoard = [];
      for (let x = 0; x < gridSize; x++) nextBoard.push(new Array(gridSize).fill(''));
      
      for (let c = 0; c < gridSize; c++) {
        for (let r = 0; r < gridSize; r++) {
          let p = board[c][r];
          if (p === '#' || p.startsWith('W_WALL') || p === 'P_WALL' || (p && p.endsWith('_A'))) nextBoard[c][r] = p; // Aegis ignores vortex
        }
      }
      
      for (let c = 0; c < gridSize; c++) {
        for (let r = 0; r < gridSize; r++) {
          let p = board[c][r];
          if (p !== '' && p !== '#' && !p.startsWith('W_WALL') && p !== 'P_WALL' && !(p && p.endsWith('_A'))) {
            let nx = c + Math.sign(i - c); let ny = r + Math.sign(j - r);
            if (nx === i && ny === j) { } 
            else if (nextBoard[nx][ny] !== '' && nextBoard[nx][ny] !== 'P_WALL') {
              if (nextBoard[c][r] === '' || nextBoard[c][r] === 'P_WALL') nextBoard[c][r] = p;
            } else { nextBoard[nx][ny] = p; }
          }
        }
      }
      for (let c = 0; c < gridSize; c++) { for (let r = 0; r < gridSize; r++) board[c][r] = nextBoard[c][r]; }
      return true;
    }
    return false;
  }

  // --- 3. INSTANT POWERS (No board click required) ---

  if (id === 'MAGNET') {
    let nextBoard = [];
    for (let x = 0; x < gridSize; x++) nextBoard.push(new Array(gridSize).fill(''));
    let center = Math.floor(gridSize / 2);
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r < gridSize; r++) {
         let p = board[c][r];
         if (p !== '') {
            if (p === '#' || p.endsWith('_A')) { nextBoard[c][r] = p; } 
            else {
                let dx = Math.sign(center - c); let dy = Math.sign(center - r);
                let nx = c + dx; let ny = r + dy;
                if (nextBoard[nx][ny] === '') { nextBoard[nx][ny] = p; } 
                else { if (nextBoard[c][r] === '') nextBoard[c][r] = p; }
            }
         }
      }
    }
    for (let c = 0; c < gridSize; c++) { for (let r = 0; r < gridSize; r++) { board[c][r] = nextBoard[c][r]; } }
    return true;
  }

  // ---> ECLIPSE FIX: Cancels "Last Chance" timer instantly! <---
  if (id === 'ECLIPSE') {
    eclipseTurnsLeft = 2; 
    lastChanceActive = false; 
    pendingWinner = null;
    return "FREE_ACTION";
  }

  if (id === 'GRAVITY_WELL') {
    isGravityWellActive = true; gravityWellTurnsLeft = 2; applyGravity();
    if (typeof triggerScreenShake === "function") triggerScreenShake(15);
    return true;
  }

  if (id === 'LABYRINTH') {
    let oldSize = gridSize;
    gridSize = 5; winCondition = 3; 
    let newBoard = [];
    for (let c = 0; c < gridSize; c++) newBoard[c] = new Array(gridSize).fill('');
    let offset = Math.floor((gridSize - oldSize) / 2);
    for (let c = 0; c < oldSize; c++) { for (let r = 0; r < oldSize; r++) { newBoard[c + offset][r + offset] = board[c][r]; } }
    board.length = 0; 
    for (let c = 0; c < gridSize; c++) board.push(newBoard[c]); 
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r < gridSize; r++) { if (board[c][r] === '' && random() < 0.35) { board[c][r] = 'L_WALL'; } }
    }
    labyrinthActive = true; labyrinthTurnCount = 0;
    return true;
  }

  if (id === 'SINKHOLE') {
    for (let c = 0; c < gridSize; c++) {
      for (let r = gridSize - 1; r > 0; r--) { board[c][r] = board[c][r-1]; }
      board[c][0] = ''; 
    }
    if (typeof triggerScreenShake === "function") triggerScreenShake(12);
    return true;
  }

  if (id === 'SHORTCUT') {
    winCondition--; shortcutActive = true; return "FREE_ACTION"; 
  }

  if (id === 'BLACKOUT') {
    blackoutPlayer = opponent; 
    blackoutTurnsLeft = 2; 
    return "FREE_ACTION"; 
  }

  // ---> QUANTUM SHIFT FIX: Safely swaps ALL variants of a piece! <---
 // ---> QUANTUM SHIFT FIX: Safely swaps ALL variants of a piece and triggers the win! <---
  if (id === 'QUANTUM') {
    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize; row++) {
        let p = board[col][row];
        if (typeof p === 'string' && p !== '') {
          // Standard pieces
          if (p === 'X') board[col][row] = 'O'; 
          else if (p === 'O') board[col][row] = 'X';
          else if (p === 'X_S') board[col][row] = 'O_S'; 
          else if (p === 'O_S') board[col][row] = 'X_S';
          else if (p === 'X_A') board[col][row] = 'O_A'; 
          else if (p === 'O_A') board[col][row] = 'X_A';
          // Captures complex states like Frozen Shields (ICE_2_X_S) or Mines (MINE_X)
          else if (p.includes('_X')) board[col][row] = p.replace('_X', '_O'); 
          else if (p.includes('_O')) board[col][row] = p.replace('_O', '_X');
        }
      }
    }
    if (typeof triggerScreenShake === "function") triggerScreenShake(10);
    return true; // Ends the turn to IMMEDIATELY trigger the game's win-checker!
  }

  if (id === 'REWIND') {
    let oppSpots = [];
    for(let x=0; x<gridSize; x++) {
      for(let y=0; y<gridSize; y++) { if((board[x][y] === opponent || board[x][y] === opponent + '_S') && !board[x][y].endsWith('_A')) oppSpots.push({x,y}); }
    }
    oppSpots.sort(() => random(-1, 1)); let targets = oppSpots.slice(0, 3);
    if (targets.length > 0) {
      for (let t of targets) board[t.x][t.y] = ''; 
      if (typeof triggerScreenShake === "function") triggerScreenShake(5); return true; 
    }
    return false;
  }

  if (id === 'NUKE') {
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r < gridSize; r++) {
        let p = board[c][r];
        if (p !== '#' && p !== '' && !p.startsWith('W_WALL') && !(p && p.endsWith('_A'))) { board[c][r] = ''; }
      }
    }
    currentPlayer = opponent; return true;
  }

  if (id === 'MINDBEND') {
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r < gridSize; r++) {
        let p = board[c][r];
        if (typeof p === 'string' && p !== '' && !(p && p.endsWith('_A'))) {
          if (p === 'X') board[c][r] = 'O'; else if (p === 'O') board[c][r] = 'X';
          else if (p === 'X_S') board[c][r] = 'O_S'; else if (p === 'O_S') board[c][r] = 'X_S';
          else if (p.endsWith('_X')) board[c][r] = p.slice(0, -2) + '_O'; else if (p.endsWith('_O')) board[c][r] = p.slice(0, -2) + '_X';
        }
      }
    }
    return true;
  }

  if (id === 'MIRAGE') {
    let emptySpots = [];
    for (let c = 0; c < gridSize; c++) { for (let r = 0; r < gridSize; r++) { if (board[c][r] === '' || board[c][r] === 'P_WALL') emptySpots.push({c, r}); } }
    let count = Math.min(3, emptySpots.length);
    for (let k = 0; k < count; k++) {
      let idx = floor(random(emptySpots.length)); let spot = emptySpots.splice(idx, 1)[0]; board[spot.c][spot.r] = 'FAKE_2_' + currentPlayer; 
    }
    return true;
  }

  if (id === 'QUAKE') {
    let pieces = []; let emptySpots = [];
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r < gridSize; r++) {
        if (board[c][r] !== '' && !board[c][r].startsWith('W_WALL') && board[c][r] !== '#' && !(board[c][r] && board[c][r].endsWith('_A'))) {
          pieces.push(board[c][r]); board[c][r] = '';
        }
      }
    }
    for (let c = 0; c < gridSize; c++) { for (let r = 0; r < gridSize; r++) { if (board[c][r] === '' || board[c][r] === 'P_WALL') emptySpots.push({c, r}); } }
    pieces.sort(() => random(-1, 1));
    for (let p of pieces) {
      if (emptySpots.length > 0) {
        let spotIndex = floor(random(emptySpots.length)); let s = emptySpots.splice(spotIndex, 1)[0]; board[s.c][s.r] = p;
      }
    }
    return true;
  }

  if (id === 'GRAVITY') {
    for (let col = 0; col < gridSize; col++) {
      let stack = [];
      for (let row = 0; row < gridSize; row++) {
        let p = board[col][row];
        if (p !== '' && p !== '#' && p !== 'P_WALL' && !(p && p.endsWith('_A'))) { stack.push(p); board[col][row] = ''; }
      }
      let currentRow = gridSize - 1;
      while (stack.length > 0 && currentRow >= 0) {
        if (board[col][currentRow] === '' || board[col][currentRow] === 'P_WALL') { board[col][currentRow] = stack.pop(); }
        currentRow--;
      }
    }
    return true;
  }

  if (id === 'GUILLOTINE') {
    if (gridSize > 3) { gridSize--; winCondition = gridSize; board.pop(); for (let col = 0; col < board.length; col++) board[col].pop(); return true; }
    return false; 
  }

  if (id === 'EXPAND') {
    if (gridSize < 5) { gridSize++; winCondition = gridSize; for(let col = 0; col < board.length; col++) board[col].push(''); board.push(new Array(gridSize).fill('')); return true; }
    return false;
  }

  if (id === 'ROTATE') {
    let newBoard = [];
    for (let x = 0; x < gridSize; x++) newBoard.push(new Array(gridSize).fill(''));
    for (let c = 0; c < gridSize; c++) { for (let r = 0; r < gridSize; r++) { newBoard[gridSize - 1 - r][c] = board[c][r]; } }
    for (let c = 0; c < gridSize; c++) { for (let r = 0; r < gridSize; r++) board[c][r] = newBoard[c][r]; }
    return true;
  }

  if (id === 'LASER') {
    for (let col = 0; col < gridSize; col++) { if ((board[col][j] === opponent || board[col][j] === opponent + '_S') && !board[col][j].endsWith('_A')) { board[col][j] = ''; } }
    return true;
  }

  if (id === 'PHANTOM') {
    for (let c = 0; c < gridSize; c++) { for (let r = 0; r < gridSize; r++) { if (board[c][r] === '') board[c][r] = 'P_WALL'; } }
    return true;
  }

  if (id === 'MISERY') { isMiseryMode = !isMiseryMode; return true; }

  if (id === 'COPYCAT') {
    if (playerPowers[currentPlayer].length < MAX_POWER_SLOTS) { let r = random(powerDatabase); playerPowers[currentPlayer].push({...r, cd: 0}); return true; }
    return false;
  }

  // --- 4. META POWERS (SIDEBAR ATTACKS) ---
  if (id === 'SILENCE') { silencedPlayer = opponent; for (let p of playerPowers[opponent]) { p.cd += 3; } return true; }
  if (id === 'SABOTAGE') { for (let p of playerPowers[opponent]) { p.cd += 3; } return true; }
  if (id === 'REFRESH') { for (let p of playerPowers[currentPlayer]) { if (p.id !== 'REFRESH') p.cd = 0; } currentPlayer = opponent; return true; }
  if (id === 'STEAL') {
    if (playerPowers[opponent].length > 0 && playerPowers[currentPlayer].length < MAX_POWER_SLOTS) {
      let r = floor(random(playerPowers[opponent].length)); let stolen = playerPowers[opponent].splice(r, 1)[0]; stolen.cd = 0; playerPowers[currentPlayer].push(stolen); return true;
    }
    return false;
  }
  return false; 
}