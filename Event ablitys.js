// ==========================================
// --- APOCALYPSE EVENT LOGIC ---
// ==========================================
let activeEvent = null; // Can be 'METEOR', 'VIRUS', or 'VOID'
let eventTurnCount = 0; 

function triggerApocalypse() {
  if (activeEvent) return;
  
  let possibleEvents = ['METEOR', 'VIRUS', 'VOID'];
  activeEvent = random(possibleEvents);
  eventTurnCount = 0;
  
  let oldSize = gridSize;
  gridSize = 6;
  winCondition = 3; 
  
  let newBoard = [];
  for (let c = 0; c < 6; c++) newBoard[c] = new Array(6).fill('');
  
  let offset = Math.floor((6 - oldSize) / 2);
  for (let c = 0; c < oldSize; c++) {
    for (let r = 0; r < oldSize; r++) {
      newBoard[c + offset][r + offset] = board[c][r];
    }
  }
  
  board.length = 0;
  for (let c = 0; c < 6; c++) board.push(newBoard[c]);
  
  // ---> EVENT SPECIFIC SETUP <---
  let spots = [];
  for(let c=0; c<6; c++) for(let r=0; r<6; r++) if(board[c][r] === '') spots.push({c,r});
  spots.sort(() => random(-1, 1));

  if (activeEvent === 'VIRUS') {
     for(let i = 0; i < 3 && i < spots.length; i++) board[spots[i].c][spots[i].r] = 'VIRUS';
  } else if (activeEvent === 'VOID') {
     for(let i = 0; i < 2 && i < spots.length; i++) board[spots[i].c][spots[i].r] = 'VOID_CENTER';
  }
  
  if (typeof triggerPowerAnimation === "function") triggerPowerAnimation('EVENT_START', 0, 0);
}

function handleApocalypseTurn() {
  if (!activeEvent) return;
  eventTurnCount++;

  let spots = [];
  for(let c = 0; c < gridSize; c++) for(let r = 0; r < gridSize; r++) spots.push({c, r});
  spots.sort(() => random(-1, 1));

  // --- 1. METEOR SHOWER ---
  if (activeEvent === 'METEOR') {
      let dropped = 0;
      for (let s of spots) {
        if (!board[s.c][s.r].startsWith('CRATER') && dropped < 3) {
            if (board[s.c][s.r] !== '#' && !(board[s.c][s.r] && board[s.c][s.r].endsWith('_A'))) {
               board[s.c][s.r] = 'CRATER_2'; // Lasts exactly 2 turns!
            }
            if (typeof triggerPowerAnimation === 'function') triggerPowerAnimation('METEOR', s.c, s.r);
            dropped++;
        }
      }
  }
  
  // --- 2. THE VIRUS ---
  else if (activeEvent === 'VIRUS') {
      if (eventTurnCount % 3 === 0) {
          let emptySpots = spots.filter(s => board[s.c][s.r] === '');
          if (emptySpots.length > 0) {
              board[emptySpots[0].c][emptySpots[0].r] = 'VIRUS';
              if (typeof triggerPowerAnimation === 'function') triggerPowerAnimation('VIRUS_SPAWN', emptySpots[0].c, emptySpots[0].r);
          }
      }
      
      if (eventTurnCount % 2 === 0) {
          let newInfections = [];
          for(let c=0; c<gridSize; c++) {
              for(let r=0; r<gridSize; r++) {
                  if(board[c][r] === 'VIRUS') {
                      let neighbors = [{dx:0,dy:-1}, {dx:0,dy:1}, {dx:-1,dy:0}, {dx:1,dy:0}];
                      for(let n of neighbors) {
                          let nx = c+n.dx, ny = r+n.dy;
                          if(nx>=0 && nx<gridSize && ny>=0 && ny<gridSize) {
                              let p = board[nx][ny];
                              if (p !== '' && p !== 'VIRUS' && p !== '#' && !p.startsWith('CRATER') && p !== 'VOID_CENTER' && p !== 'P_WALL' && p !== 'L_WALL' && !(p && p.endsWith('_A'))) {
                                  newInfections.push({c:nx, r:ny});
                              }
                          }
                      }
                  }
              }
          }
          for(let inf of newInfections) {
              board[inf.c][inf.r] = 'VIRUS';
              if (typeof triggerPowerAnimation === 'function') triggerPowerAnimation('VIRUS_INFECT', inf.c, inf.r);
          }
      }
  }
  
  // --- 3. THE VOID (TELEPORTING VORTEX) ---
  else if (activeEvent === 'VOID') {
      let voids = spots.filter(s => board[s.c][s.r] === 'VOID_CENTER');
      if (voids.length === 0) return;

      let movedThisTurn = [];
      
      for(let c=0; c<gridSize; c++) {
          for(let r=0; r<gridSize; r++) {
              let p = board[c][r];
              if (p !== '' && p !== 'VOID_CENTER' && p !== '#' && p !== 'P_WALL' && p !== 'L_WALL' && !(p && p.endsWith('_A')) && !movedThisTurn.includes(`${c},${r}`)) {
                  
                  // Find nearest void
                  let nearest = voids[0];
                  let minDist = dist(c, r, voids[0].c, voids[0].r);
                  if (voids.length > 1) {
                      let d2 = dist(c, r, voids[1].c, voids[1].r);
                      if (d2 < minDist) nearest = voids[1];
                  }

                  // Step 1 space towards it
                  let nc = c + Math.sign(nearest.c - c);
                  let nr = r + Math.sign(nearest.r - r);

                  if (board[nc][nr] === 'VOID_CENTER') {
                      // SPIT THEM OUT AT A RANDOM EMPTY SPOT!
                      let empties = spots.filter(s => board[s.c][s.r] === '');
                      if (empties.length > 0) {
                          let dest = random(empties);
                          board[dest.c][dest.r] = p;
                          board[c][r] = '';
                          movedThisTurn.push(`${dest.c},${dest.r}`);
                          if (typeof triggerPowerAnimation === 'function') triggerPowerAnimation('TELEPORT', dest.c, dest.r);
                      } else {
                          board[c][r] = ''; // Destroy if board is completely full
                      }
                  } else if (board[nc][nr] === '') {
                      // Move smoothly
                      board[nc][nr] = p;
                      board[c][r] = '';
                      movedThisTurn.push(`${nc},${nr}`);
                  }
              }
          }
      }
  }
}