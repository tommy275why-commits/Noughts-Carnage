let powerDatabase = [
  { id: 'ERASER', name: 'The Eraser', desc: 'Obliterate an enemy piece AND claim its spot. Your piece takes its place.', maxCd: 4 },
  { id: 'WALL', name: 'The Wall', desc: 'Place an indestructible Wall. FREE ACTION: You still get a normal turn!', maxCd: 3 },
  { id: 'BOMB', name: 'Row Bomb', desc: 'Clear a row & column of clicked spot', maxCd: 5 },
  { id: 'QUAKE', name: 'Earthquake', desc: 'Scramble all pieces on the board', maxCd: 6 },
  { id: 'GRAVITY', name: 'Gravity Drop', desc: 'All pieces fall to the bottom row', maxCd: 5 },
  { id: 'WILDCARD', name: 'Wildcard', desc: 'Place 2 Walls that turn into Wild pieces (counts for both) next turn.', maxCd: 4 },
  { id: 'TELEPORT', name: 'Teleport', desc: 'Banish an enemy piece to a random spot, AND automatically take their old spot.', maxCd: 5 },
  { id: 'SWAP', name: 'Position Swap', desc: 'Swap one of your pieces with an enemy piece', maxCd: 7 },
  { id: 'LOCKDOWN', name: 'Lockdown', desc: 'Place your piece, and permanently seal all adjacent horizontal and vertical squares.', maxCd: 5 },
  { id: 'SACRIFICE', name: 'Blood Magic', desc: 'Destroy one of your pieces to completely take over TWO enemy pieces.', maxCd: 7 },
  { id: 'DOUBLE', name: 'Double Strike', desc: 'Play a piece and take an extra turn instantly', maxCd: 10 },
  { id: 'SHIELD', name: 'EMP Shield', desc: 'Place your piece AND put 3 random enemy powers on max cooldown.', maxCd: 6 },
  { id: 'REWIND', name: 'Time Rewind', desc: 'Wipes ALL enemy pieces that were placed on the board in the last 2 rounds.', maxCd: 5 },
  { id: 'COPYCAT', name: 'Copycat', desc: 'Gain a random power from the database', maxCd: 2 },
  { id: 'VORTEX', name: 'The Vortex', desc: 'Sucks all 8 surrounding pieces into the clicked empty square, destroying them.', maxCd: 5 },
  { id: 'CHRONO', name: 'Chrono-Lock', desc: 'Freeze an enemy piece for 2 turns so it cannot be used to win.', maxCd: 5 },
  { id: 'TIMEBOMB', name: 'Time Bomb', desc: 'Place a bomb that explodes in 3 turns, destroying all adjacent pieces.', maxCd: 6 },
  { id: 'ASSIMILATE', name: 'Assimilation', desc: 'Infects an enemy piece. In 2 turns, it completely becomes yours!', maxCd: 7 },
  { id: 'ROTATE', name: 'The Spin', desc: 'Rotates the entire board 90 degrees clockwise!', maxCd: 1 },
  { id: 'CORRUPT', name: 'Corruption', desc: 'Infect your piece. Every 2 of your turns, it converts a random adjacent enemy piece!', maxCd: 8 },
  { id: 'LASER', name: 'Orbital Laser', desc: 'Click a square. Destroys ALL enemy pieces in that row, but leaves yours safe.', maxCd: 5 },
  { id: 'PHANTOM', name: 'Phantom Walls', desc: 'Fills all empty spaces with fake walls that disappear if someone tries to play on them.', maxCd: 6 },
  { id: 'CLONE', name: 'The Swarm', desc: 'Select your piece. It instantly infects ALL adjacent empty squares with duplicates.', maxCd: 8 },
  { id: 'NUKE', name: 'Apocalypse', desc: 'Vaporize every piece on the board (except walls). Skips your turn.', maxCd: 8 },
  { id: 'MINDBEND', name: 'Mind Control', desc: 'Instantly swaps ALL of your pieces with the opponents pieces!', maxCd: 7 },
  { id: 'MIRAGE', name: 'Decoys', desc: 'Scatter 3 Ghosts. After 2 turns, 2 vanish and 1 becomes a REAL piece!', maxCd: 5 },
  { id: 'EXPAND', name: 'The Architect', desc: 'Expand the board size (Max 5x5). Increases win req.', maxCd: 7 },
  { id: 'GUILLOTINE', name: 'The Guillotine', desc: 'Shrinks an expanded board by 1 size, destroying edge pieces.', maxCd: 8 },
  { id: 'MISERY', name: 'Cursed Mirror', desc: 'Rule Change: Next person to get a winning line LOSES.', maxCd: 7 },
  { id: 'QUANTUM', name: 'Quantum Shift', desc: 'Instantly flip all X pieces to O, and O to X. FREE ACTION: You still get your turn!', maxCd: 7 },
  { id: 'GRAVITY_WELL', name: 'Gravity Well', desc: 'Rule Change: For 1 round (2 turns), the game becomes Connect-4. All pieces plummet to the bottom!', maxCd: 9 },
  { id: 'SHORTCUT', name: 'The Shortcut', desc: 'Rule Change: Lowers the win requirement by 1 (e.g., 3-in-a-row becomes 2) for YOUR TURN ONLY. FREE ACTION.', maxCd: 10 },
  { id: 'BLACKOUT', name: 'Fog of War', desc: 'Rule Change: Hides the entire board. Your opponent must take their next turn completely blind. FREE ACTION.', maxCd: 5 },
  { id: 'LABYRINTH', name: 'The Labyrinth', desc: 'Map Change: Drops 4 walls. Every 2 turns, they relocate, crushing ANY pieces they land on!', maxCd: 10 },
  { id: 'SINKHOLE', name: 'The Floor is Lava', desc: 'Map Change: Permanently deletes the entire bottom row. Everything above it drops down.', maxCd: 7 },
  { id: 'SILENCE', name: 'The Mute', desc: 'Opponent cannot use abilities for 3 entire turns, and cooldowns are frozen.', maxCd: 7 },
  { id: 'SABOTAGE', name: 'System Jam', desc: 'Add +3 turns to all enemy cooldowns.', maxCd: 5 },
  { id: 'REFRESH', name: 'Overdrive', desc: 'Reset your cooldowns, but skip your next move.', maxCd: 8 },
  { id: 'STEAL', name: 'Power Thief', desc: 'Take a random power from the opponent’s sidebar.', maxCd: 15 },
  { id: 'BULLDOZER', name: 'The Bulldozer', desc: 'Select a square. Shifts its entire ROW one space to the right, wrapping around!', maxCd: 6 },
  { id: 'LIGHTNING', name: 'Chain Lightning', desc: 'Strike an enemy piece. The lightning jumps and destroys up to 2 other connected enemy pieces!', maxCd: 9 },
  { id: 'MINE', name: 'Landmine', desc: 'Secretly trap an empty square. If the enemy plays there, it explodes and you steal the spot!', maxCd: 6 },
  { id: 'AEGIS', name: 'Fortify', desc: 'Turn one of your pieces into an Anchor. It can NEVER be destroyed, moved, or swapped.', maxCd: 7 },
  { id: 'TROJAN', name: 'Trojan Horse', desc: 'Place a piece that looks normal. In 2 turns, it bursts, replacing all 4 adjacent spots with your pieces!', maxCd: 7 },
  { id: 'MAGNET', name: 'The Magnet', desc: 'Pulls every single piece on the board exactly one square towards the center.', maxCd: 6 },
  { id: 'ECLIPSE', name: 'Total Eclipse', desc: 'Rule Change: Disables winning for ONE round. Even 3-in-a-row won\'t count until it passes!', maxCd: 8 }
];

let draftOptions = [];
let isDraftingSetup = false;

function drawDraftScreen() {
  if (!isDraftingSetup) {
    draftOptions = [];
    let p = draftQueue[0];
    
    let ownedIds = playerPowers[p].map(pwr => pwr.id);
    let tempDB = powerDatabase.filter(pwr => !ownedIds.includes(pwr.id));
    
    for (let i = 0; i < 3; i++) {
      if (tempDB.length === 0) break; 
      let r = floor(random(tempDB.length));
      draftOptions.push(tempDB[r]);
      tempDB.splice(r, 1);
    }
    isDraftingSetup = true;
  }

  background(15, 20, 25, 240); 
  
  let p = draftQueue[0];
  let pColor = (p === 'X') ? C_X : C_O;
  
  fill(pColor[0], pColor[1], pColor[2]);
  textSize(42);
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = `rgba(${pColor[0]},${pColor[1]},${pColor[2]}, 0.6)`;
  text(`PLAYER ${p}: CHOOSE AN ABILITY`, width/2, 100);
  drawingContext.shadowBlur = 0;
  
  // CENTERED DYNAMIC COORDINATES FOR CARDS
  let totalW = (3 * 250) - 30; 
  let startX = width/2 - totalW/2;

  for (let i = 0; i < draftOptions.length; i++) {
    let opt = draftOptions[i];
    let x = startX + i * 250;
    let y = height/2 - 160;
    let w = 220;
    let h = 320;
    
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
      fill(50, 60, 70); stroke(pColor[0], pColor[1], pColor[2]); strokeWeight(4); y -= 10; 
    } else {
      fill(30, 35, 40); stroke(80); strokeWeight(2);
    }
    
    rect(x, y, w, h, 15);
    
    noStroke(); fill(255); textSize(20); textStyle(BOLD); text(opt.name, x + w/2, y + 40);
    textStyle(NORMAL); textSize(14); fill(180);
    text(opt.desc, x + 20, y + 80, w - 40, h - 140);
    
    fill(pColor[0], pColor[1], pColor[2]); textSize(16);
    text(`COOLDOWN: ${opt.maxCd}`, x + w/2, y + h - 30);
  }

  // ---> DRAW SKIP BUTTON <---
  let skipW = 200;
  let skipH = 50;
  let skipX = width/2 - skipW/2;
  let skipY = height/2 + 200;
  
  if (mouseX > skipX && mouseX < skipX + skipW && mouseY > skipY && mouseY < skipY + skipH) {
      fill(80, 40, 40); stroke(255, 100, 100); strokeWeight(3); skipY -= 2;
  } else {
      fill(40, 35, 35); stroke(100); strokeWeight(2);
  }
  rect(skipX, skipY, skipW, skipH, 10);
  fill(255); noStroke(); textSize(20); textStyle(BOLD); 
  text("SKIP REWARD", width/2, skipY + skipH/2);
}

function handleDraftClick() {
  let p = draftQueue[0];
  let selectedCard = null;

  // ---> CHECK IF 'SKIP' WAS CLICKED <---
  let skipW = 200; let skipH = 50;
  let skipX = width/2 - skipW/2; let skipY = height/2 + 200;
  
  if (mouseX > skipX && mouseX < skipX + skipW && mouseY > skipY && mouseY < skipY + skipH) {
      draftQueue.shift();
      isDraftingSetup = false;
      if (draftQueue.length === 0) {
          resetBoard(); gameState = "PLAYING";
      }
      return; // Stop processing further clicks
  }

  // MUST MATCH THE CENTERED DRAWING MATH EXACTLY
  let totalW = (3 * 250) - 30; 
  let startX = width/2 - totalW/2;

  for (let i = 0; i < draftOptions.length; i++) {
    let x = startX + i * 250; 
    let y = height/2 - 160; 
    let w = 220; 
    let h = 320;
    
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) { 
        selectedCard = draftOptions[i]; 
    }
  }

  if (selectedCard) {
    let earnedPower = {
        id: selectedCard.id, name: selectedCard.name, desc: selectedCard.desc, maxCd: selectedCard.maxCd, cd: 0 
    };

    if (playerPowers[p].length < MAX_POWER_SLOTS) {
      // Standard acquisition
      playerPowers[p].push(earnedPower);
      draftQueue.shift(); 
      isDraftingSetup = false; 

      if (draftQueue.length === 0) {
        resetBoard(); gameState = "PLAYING";
      }
    } else {
      // ---> INVENTORY IS FULL: TRIGGER SWAP MODE! <---
      draftQueue.shift(); 
      isDraftingSetup = false; 

      // We smartly override closeSwapUI here to ensure multiplayer drafting doesn't break
      window.closeSwapUI = function() {
          pendingNewPower = null;
          isTrashMode = false;
          if (typeof swappingPlayer !== 'undefined') swappingPlayer = null;
          
          // If there is another player waiting to draft, go back to drafting screen!
          if (draftQueue.length > 0) {
              gameState = "DRAFTING";
          } else {
              resetBoard();
              gameState = "PLAYING";
          }
      };

      if (typeof window.startDeletionProcess === "function") {
          window.startDeletionProcess(earnedPower, p); // Pass 'p' to ensure the correct player's inventory updates
      } else {
          console.error("Missing Swap Engine Functions!");
          if (draftQueue.length === 0) { resetBoard(); gameState = "PLAYING"; }
      }
    }
  }
}