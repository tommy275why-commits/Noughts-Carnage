let bgParticles = [];

// ---> NEW: DYNAMIC BACKGROUND <---
window.drawDynamicBackground = function() {
    if (bgParticles.length === 0) {
        for (let i = 0; i < 60; i++) {
            bgParticles.push({
                x: random(width), y: random(height), size: random(2, 5),
                speed: random(0.2, 0.8), alpha: random(30, 100)
            });
        }
    }

    let baseColor = C_BG;
    if (typeof activeEvent !== 'undefined' && activeEvent) {
        if (activeEvent === 'METEOR') baseColor = [40, 15, 10]; 
        else if (activeEvent === 'VOID') baseColor = [20, 10, 35]; 
        else if (activeEvent === 'VIRUS') baseColor = [15, 35, 20]; 
    }

    background(baseColor[0], baseColor[1], baseColor[2]);

    push();
    stroke(255, 255, 255, 10); 
    strokeWeight(1);
    
    let panX = (frameCount * 0.3) % 100;
    let panY = (frameCount * 0.3) % 100;

    for (let x = -100; x < width + 100; x += 100) line(x + panX, 0, x + panX, height);
    for (let y = -100; y < height + 100; y += 100) line(0, y + panY, width, y + panY);
    pop();

    noStroke();
    for (let p of bgParticles) {
        fill(200, 200, 255, p.alpha + sin(frameCount * 0.02 + p.x) * 20);
        circle(p.x, p.y, p.size);
        p.y -= p.speed; 
        if (p.y < -10) { p.y = height + 10; p.x = random(width); }
    }
};

function drawTurnBox() {
  fill(30, 35, 40); 
  noStroke();
  rect(0, 0, width, 80);
  
  if (typeof drawApocalypseWarning === "function" && drawApocalypseWarning()) return;
  
  let glowColor = currentPlayer === 'X' ? C_X : C_O;
  fill(glowColor[0], glowColor[1], glowColor[2]);
  
  textSize(40);
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]}, 0.8)`;
  text(`PLAYER ${currentPlayer}'S TURN`, width/2, 40);
  drawingContext.shadowBlur = 0; 
}

function drawBoard() {
  let bnd = getBoardBounds();
  let w = bnd.w / gridSize;
  let h = bnd.h / gridSize;
  
  push(); 
  let pulseAlpha = map(sin(frameCount * 0.05), -1, 1, 50, 255);
  let pulseColor;
  
  if (typeof activeEvent !== 'undefined' && activeEvent === 'METEOR') pulseColor = color(255, 100, 0, pulseAlpha);
  else if (typeof activeEvent !== 'undefined' && activeEvent === 'VIRUS') pulseColor = color(50, 255, 50, pulseAlpha);
  else if (typeof activeEvent !== 'undefined' && activeEvent === 'VOID') pulseColor = color(150, 50, 255, pulseAlpha);
  else pulseColor = (currentPlayer === 'X') ? color(255, 50, 50, pulseAlpha) : color(50, 100, 255, pulseAlpha);
  
  stroke(pulseColor); 
  strokeWeight(5);
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = pulseColor;
  
  for (let n = 1; n < gridSize; n++) {
    line(bnd.x + w * n, bnd.top, bnd.x + w * n, bnd.bottom);
    line(bnd.x, bnd.top + h * n, bnd.x + bnd.w, bnd.top + h * n);
  }
  pop(); 
  
  textSize(gridSize > 3 ? 40 : 64);
  for (let j = 0; j < gridSize; j++) {
    for (let i = 0; i < gridSize; i++) {
      let spot = board[i][j];
      let x = bnd.x + (w * i) + (w / 2); 
      let y = bnd.top + (h * j) + (h / 2);
      
      let glowColor = null; let displayChar = ''; let drawBox = false; let boxColor = null;
      
      if (!spot) continue;

      if (spot === 'X' || spot === 'X_S') {
        fill(C_X[0], C_X[1], C_X[2]); glowColor = C_X; displayChar = spot.charAt(0);
      } else if (spot === 'O' || spot === 'O_S') {
        fill(C_O[0], C_O[1], C_O[2]); glowColor = C_O; displayChar = spot.charAt(0);
      } else if (spot.endsWith('_A')) { 
        let caster = spot.charAt(0);
        fill(255, 215, 0); glowColor = [255, 215, 0]; displayChar = caster;
        drawBox = true; boxColor = [255, 215, 0, 60]; 
      } else if (spot.startsWith('TROJAN_')) {
        let caster = spot.split('_')[2];
        let cArr = caster === 'X' ? C_X : C_O;
        if (caster === currentPlayer) {
           fill(cArr[0], cArr[1], cArr[2]); glowColor = cArr; displayChar = caster;
           drawBox = true; boxColor = [cArr[0], cArr[1], cArr[2], map(sin(frameCount*0.1), -1, 1, 30, 80)];
        } else { fill(cArr[0], cArr[1], cArr[2]); glowColor = cArr; displayChar = caster; }
      } else if (spot.startsWith('MINE_')) {
        let caster = spot.split('_')[1];
        if (caster === currentPlayer) { fill(255, 100, 100, 150); glowColor = [255, 50, 50]; displayChar = '⚠'; } 
        else continue; 
      } else if (spot === 'L_WALL') {
        fill(80, 20, 20); glowColor = [80, 20, 20]; displayChar = '█';
      } else if (spot.startsWith('W_WALL_2')) {
        fill(70, 70, 70); glowColor = [70, 70, 70]; displayChar = '█';
      } else if (spot.startsWith('W_WALL_1')) {
        fill(150, 150, 150); glowColor = [150, 150, 150]; displayChar = '█';
      } else if (spot === 'W') {
        fill(255, 215, 0); glowColor = [255, 215, 0]; displayChar = 'W';
      } else if (spot === 'P_WALL') {
        fill(50, 50, 70, 150); glowColor = [50, 50, 70]; displayChar = '▒'; 
      } else if (spot.startsWith('ICE_')) {
        let orig = spot.split('_').slice(2).join('_'); 
        fill(150, 230, 255); glowColor = [150, 230, 255]; 
        displayChar = orig.charAt(0);
        drawBox = true; boxColor = [100, 200, 255, 80]; 
      } else if (spot.startsWith('ASSIM_')) {
        let parts = spot.split('_'); let turns = parseInt(parts[1]); let caster = parts[2];
        fill(0, 255, 100); glowColor = [0, 255, 100];
        displayChar = caster === 'X' ? 'O' : 'X'; 
        drawBox = true; boxColor = [0, 255, 100, map(turns, 1, 3, 150, 40)]; 
      } else if (spot.startsWith('CORRUPT_')) {
        let parts = spot.split('_'); let turns = parseInt(parts[1]); let caster = parts[2];
        fill(180, 50, 255); glowColor = [180, 50, 255]; 
        displayChar = caster; 
        drawBox = true; boxColor = [180, 50, 255, map(turns, 1, 2, 120, 40)]; 
      } else if (spot.startsWith('BOMB_')) {
        let turns = spot.split('_')[1];
        fill(255, 50, 50); glowColor = [255, 50, 50]; displayChar = turns; 
      } else if (spot.startsWith('FAKE_')) {
        let parts = spot.split('_'); let turns = parseInt(parts[1]); let fakeOwner = parts[2];
        let cArr = fakeOwner === 'X' ? C_X : C_O;
        fill(cArr[0], cArr[1], cArr[2], 100); glowColor = [cArr[0], cArr[1], cArr[2]]; 
        displayChar = fakeOwner; drawBox = true; boxColor = [cArr[0], cArr[1], cArr[2], map(turns, 1, 2, 80, 30)];
      } 
      else if (spot.startsWith('CRATER_')) {
        let turns = parseInt(spot.split('_')[1]);
        fill(40, 15, 10); 
        glowColor = turns === 2 ? [255, 50, 0] : [150, 50, 0]; 
        displayChar = turns === 2 ? '🔥' : '💨'; 
        drawBox = true; 
        boxColor = [30, 10, 10, turns === 2 ? 200 : 100]; 
      } 
      else if (spot === 'VIRUS') {
        fill(20, 255, 50); glowColor = [20, 255, 50]; displayChar = '☣'; drawBox = true; boxColor = [10, 40, 10, 200]; 
      }
      else if (spot === 'VOID_CENTER') {
        fill(0, 0, 0); glowColor = [150, 50, 255]; displayChar = '🕳'; drawBox = true; boxColor = [30, 0, 50, 200]; 
      }
      else if (spot !== '') {
        fill(C_DUST_DARK[0], C_DUST_DARK[1], C_DUST_DARK[2]); glowColor = C_DUST_DARK;
        displayChar = spot.charAt(0);
      }

      // ---> NEW: SCALING LOGIC FOR THE SLAM EFFECT <---
      let slam = typeof getSlamEffect === 'function' ? getSlamEffect(i, j) : null;
      if (slam) {
          push();
          translate(x, y);
          let progress = slam.t / slam.maxT;
          // Mathematical ease-in: Accelerates rapidly into the board
          let ease = Math.pow(progress, 3);
          let scl = map(ease, 0, 1, 4, 1);
          scale(scl);
          
          x = 0; y = 0; // Temporarily center coordinates for the transformed block
      }

      if (drawBox) {
        push(); rectMode(CENTER); fill(boxColor[0], boxColor[1], boxColor[2], boxColor[3]);
        noStroke(); rect(x, y, w - 15, h - 15, 15); pop();
      }
      
      if (powerSource && powerSource.i === i && powerSource.j === j) {
        push(); rectMode(CENTER); fill(255, 215, 0, 80); 
        stroke(255, 215, 0); strokeWeight(3); rect(x, y, w - 10, h - 10, 15); pop();
      }

      if (spot !== '' && !spot.startsWith('MINE_')) {
        push(); drawingContext.shadowBlur = 20; drawingContext.shadowColor = `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]}, 0.7)`;
        
        // White Flash upon impact
        if (slam && slam.t >= slam.maxT - 2) {
            fill(255, 255, 255);
            drawingContext.shadowColor = "white";
            drawingContext.shadowBlur = 40;
        }
        text(displayChar, x, y); pop(); 
      } else if (spot.startsWith('MINE_') && spot.endsWith(currentPlayer)) {
        push(); drawingContext.shadowBlur = 0; text(displayChar, x, y); pop();
      }
      
      if (slam) pop(); // Restore the original canvas translation
    }
  }

  if (blackoutPlayer === currentPlayer) {
    push(); fill(10, 10, 15, 245); noStroke(); rectMode(CORNER);
    rect(bnd.x - 10, bnd.top - 10, bnd.w + 20, bnd.h + 20); fill(255, 50, 50); textSize(40);
    text(`FOG OF WAR ACTIVE (${blackoutTurnsLeft} turns left)`, width/2, height/2); pop();
  }

  if (eclipseTurnsLeft > 0) {
    push(); fill(0, 0, 0, 150); noStroke(); rectMode(CORNER); rect(0, 80, width, height - 180);
    fill(200, 200, 255); textSize(30); text("TOTAL ECLIPSE ACTIVE: WINNING DISABLED", width/2, height/2); pop();
  }
}

function drawPowerInventory() { drawPlayerPowers('X', 20, 100); drawPlayerPowers('O', width - 200, 100); }

function drawPlayerPowers(playerStr, startX, startY) {
  let powers = playerPowers[playerStr];
  
  // Use swappingPlayer to determine who's turn it visually is during Trash Mode
  let activeP = (gameState === "POWER_SWAP" && typeof swappingPlayer !== 'undefined' && swappingPlayer) ? swappingPlayer : currentPlayer;
  let isMyTurn = (activeP === playerStr);

  for (let i = 0; i < powers.length; i++) {
    let pwr = powers[i];
    let boxY = startY + (i * 70) + 15; let boxW = 180; let boxH = 50;
    let boxColor = playerStr === 'X' ? [C_X[0], C_X[1], C_X[2]] : [C_O[0], C_O[1], C_O[2]];

    if (!isMyTurn || pwr.cd > 0) boxColor = [60, 60, 60, 180]; 
    else if (activePower === pwr) boxColor = [C_GLOW[0], C_GLOW[1], C_GLOW[2]]; 

    push();
    fill(boxColor[0], boxColor[1], boxColor[2], boxColor[3] || 255);
    stroke(20); strokeWeight(2); 
    
    // ---> DRAW TRASH PULSE EFFECT IF IN SWAP MODE <---
    if (gameState === "POWER_SWAP" && isMyTurn) {
        strokeWeight(4);
        stroke(255, 50, 50, map(sin(frameCount * 0.2), -1, 1, 100, 255));
    }
    
    rect(startX, boxY, boxW, boxH, 10); 

    fill(255); noStroke(); let textY = boxY + boxH/2;
    if (pwr.cd > 0) { 
        textSize(14); textAlign(CENTER, CENTER); text(pwr.name, startX + boxW/2, textY - 8); 
        fill(255, 100, 100); text(`CD: ${pwr.cd}`, startX + boxW/2, textY + 12); 
    } 
    else { 
        textSize(16); textAlign(CENTER, CENTER); text(pwr.name, startX + boxW/2, textY); 
    }
    
    // ---> DRAW THE TRASH CAN ICON OVER THE BUTTON <---
    if (gameState === "POWER_SWAP" && isMyTurn) {
        fill(255, 50, 50, 200);
        rectMode(CORNER);
        rect(startX + boxW - 35, boxY + 10, 25, 30, 5); // Little trash box
        fill(255); textSize(20); textAlign(LEFT, BASELINE);
        text("🗑", startX + boxW - 32, boxY + 32);
    }
    pop();
  }
}

// ---> NEW: RENDERS THE CENTER SWAP UI (PERFECTLY ALIGNED) <---
window.drawSwapUI = function() {
    push();
    // Title
    fill(255, 100, 100); textSize(32); textStyle(BOLD); textAlign(CENTER, CENTER);
    text("INVENTORY FULL: SELECT A POWER TO REPLACE", width/2, 100);
    
    if (pendingNewPower) {
        // EXACT dimensions copied from drawDraftScreen to perfectly align text
        let cw = 220; let ch = 320;
        let x = width/2 - cw/2;
        let y = height/2 - 160; 
        
        // Bobbing animation
        y += Math.sin(frameCount * 0.05) * 10;
        
        let pColor;
        if (typeof swappingPlayer !== 'undefined' && swappingPlayer) {
            pColor = (swappingPlayer === 'X') ? C_X : C_O;
        } else {
            pColor = (currentPlayer === 'X') ? C_X : C_O;
        }
        
        fill(30, 35, 40); stroke(pColor[0], pColor[1], pColor[2]); strokeWeight(4);
        rectMode(CORNER); 
        rect(x, y, cw, ch, 15);
        
        noStroke(); fill(255); textSize(20); textStyle(BOLD); textAlign(CENTER, CENTER);
        text(pendingNewPower.name, x + cw/2, y + 40);
        
        textStyle(NORMAL); textSize(14); fill(180); textAlign(LEFT, TOP); textWrap(WORD);
        text(pendingNewPower.desc, x + 20, y + 80, cw - 40, ch - 140);
        
        fill(pColor[0], pColor[1], pColor[2]); textSize(16); textAlign(CENTER, CENTER);
        text(`COOLDOWN: ${pendingNewPower.maxCd}`, x + cw/2, y + ch - 30);
    }
    
    // Draw the "CANCEL" Button at the bottom
    let btnW = 200; let btnH = 50;
    let btnX = width/2; let btnY = height/2 + 200;
    
    rectMode(CENTER);
    if (mouseX > btnX - btnW/2 && mouseX < btnX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
        fill(80, 40, 40); stroke(255, 100, 100); strokeWeight(3);
    } else {
        fill(40, 35, 35); stroke(100); strokeWeight(2);
    }
    rect(btnX, btnY, btnW, btnH, 10);
    fill(255); noStroke(); textSize(20); textStyle(BOLD); textAlign(CENTER, CENTER);
    text("KEEP ORIGINAL", btnX, btnY);
    
    pop();
};

window.handleSwapClick = function() {
    let btnW = 200; let btnH = 50;
    let btnX = width/2; let btnY = height/2 + 200;
    
    if (mouseX > btnX - btnW/2 && mouseX < btnX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
        if (typeof closeSwapUI === "function") closeSwapUI();
        return;
    }
    
    if (typeof getClickedPowerIndex === "function") {
        let index = getClickedPowerIndex();
        if (index !== -1) {
            if (typeof executeSwap === "function") executeSwap(index);
        }
    }
};

function drawScores() {
  fill(15, 15, 18); noStroke(); rect(0, height - 100, width, 100);
  fill(220); textSize(24); textAlign(CENTER, CENTER);
  text(`Player X: ${scores['X']}   |   Player O: ${scores['O']}`, width/2, height - 70);
  
  if (lastChanceActive) {
    push();
    let btnX = width/2; let btnY = height - 30; let btnW = 220; let btnH = 36;
    let isHover = mouseX > btnX - btnW/2 && mouseX < btnX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2;
    fill(isHover ? color(80, 20, 20) : color(40, 15, 15)); stroke(150, 50, 50); strokeWeight(2); rectMode(CENTER);
    rect(btnX, btnY, btnW, btnH, 8);
    fill(255); noStroke(); textSize(16); textStyle(BOLD); textAlign(CENTER, CENTER); text("SURRENDER", btnX, btnY); pop();
  }
}

function drawMiseryOverlay() {
  push(); noFill(); stroke(255, 0, 0, map(sin(frameCount * 0.1), -1, 1, 50, 150)); strokeWeight(10); rect(200, 80, width - 400, height - 180);
  fill(255, 0, 0, 100); textSize(20); textAlign(CENTER, CENTER); text(`CURSED RULE: ${winCondition}-IN-A-ROW LOSES`, width/2, 105); pop();
}

function drawLastChanceOverlay() {
  let defender = pendingWinner === 'X' ? 'O' : 'X';
  let timeLeft = Math.max(0, Math.ceil((lastChanceEndTime - millis()) / 1000));
  push(); fill(180, 0, 0, map(sin(frameCount * 0.2), -1, 1, 150, 255)); rectMode(CORNER); noStroke(); rect(0, 0, width, 80);
  fill(255); textSize(32); textStyle(BOLD); textAlign(CENTER, CENTER); drawingContext.shadowBlur = 10; drawingContext.shadowColor = "black";
  text(`LAST CHANCE! PLAYER ${defender}: DEFEND OR SURRENDER (${timeLeft}s)`, width/2, 40); pop();
}

function drawGameOver() {
  // 1. Safely track the exact moment the game ends
  if (gameState !== "GAME_OVER") {
    window.gameOverStartFrame = null;
    return;
  }
  
  // Setup the explosion particles exactly once
  if (!window.gameOverStartFrame) {
    window.gameOverStartFrame = frameCount;
    window.victoryParticles = [];
    for (let i = 0; i < 80; i++) {
      window.victoryParticles.push({
        angle: random(TWO_PI),
        speed: random(15, 50),
        dist: random(0, 50),
        length: random(20, 100),
        thickness: random(2, 8)
      });
    }
  }
  
  let timer = frameCount - window.gameOverStartFrame;
  
  // Safety checks for colors and names
  let wCol = [255, 255, 255];
  if (typeof roundWinner !== 'undefined') {
    if (roundWinner === 'X') wCol = C_X;
    else if (roundWinner === 'O') wCol = C_O;
    else if (roundWinner === 'VIRUS') wCol = [50, 255, 50];
  }
  
  let titleText = (typeof roundWinner !== 'undefined' && roundWinner === 'VIRUS') ? "CONSUMED BY THE VIRUS" : "GAME OVER";
  let subText = (typeof roundWinner !== 'undefined' && roundWinner === 'VIRUS') ? "VIRUS CONSUMED EVERYTHING." : `VICTOR: PLAYER ${roundWinner || 'UNKNOWN'}`;

  // 2. Darken the background (Using rect instead of background() to prevent glitches)
  push();
  rectMode(CORNER);
  fill(10, 10, 15, min(timer * 15, 220));
  noStroke();
  rect(0, 0, width, height);
  pop();

  push();
  translate(width / 2, height / 2);

  // 3. The Particle Explosion (Neon sparks shooting outward)
  for (let i = 0; i < window.victoryParticles.length; i++) {
    let p = window.victoryParticles[i];
    p.dist += p.speed;
    p.speed *= 0.85; // Friction slows them down quickly
    
    let alpha = map(p.speed, 0, 50, 0, 255);
    if (alpha > 5) {
      stroke(wCol[0], wCol[1], wCol[2], alpha);
      strokeWeight(p.thickness);
      let x1 = cos(p.angle) * p.dist;
      let y1 = sin(p.angle) * p.dist;
      let x2 = cos(p.angle) * (p.dist + p.length * (p.speed / 10));
      let y2 = sin(p.angle) * (p.dist + p.length * (p.speed / 10));
      line(x1, y1, x2, y2);
    }
  }

  // 4. Initial White Flash Impact
  if (timer < 10) {
    fill(255, 255, 255, map(timer, 0, 10, 255, 0));
    noStroke();
    circle(0, 0, map(timer, 0, 10, 200, width * 2));
  }

  // 5. THE TEXT SLAM
  if (timer > 2) { 
    let textScl = 1;
    
    if (timer < 15) {
      // Start 4x size and violently scale down to 1
      textScl = map(timer, 2, 15, 4, 1);
    } else {
      // Continuous heartbeat pulse once settled
      textScl = 1 + sin((timer - 15) * 0.1) * 0.02;
    }
    
    scale(textScl);

    // Add a brutal screen shake to the text immediately after it lands
    if (timer >= 15 && timer < 30) {
        let shake = map(timer, 15, 30, 12, 0);
        translate(random(-shake, shake), random(-shake, shake));
    }

    // Intense Glow Effects
    drawingContext.shadowBlur = map(sin(frameCount * 0.15), -1, 1, 30, 80);
    drawingContext.shadowColor = `rgba(${wCol[0]}, ${wCol[1]}, ${wCol[2]}, 1)`;

    fill(wCol[0], wCol[1], wCol[2]);
    textSize(80);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(titleText, 0, -40);
    
    fill(255);
    textSize(40);
    text(subText, 0, 60);
    
    drawingContext.shadowBlur = 0; // Reset shadow so it doesn't bleed
  }
  pop();

  // 6. Reset Prompt (Fades in gently after the chaos settles)
  if (timer > 60) {
    push();
    textStyle(NORMAL);
    textSize(20);
    fill(200, map(sin(frameCount * 0.08), -1, 1, 50, 255));
    textAlign(CENTER, CENTER);
    text("- CLICK ANYWHERE TO RESET ENTIRELY -", width / 2, height - 100);
    pop();
  } 
}

function drawTooltips() {
  let hoveredPower = checkPowerHover();
  if (hoveredPower) {
    let powerKey = hoveredPower.id || hoveredPower.name || ""; powerKey = powerKey.toUpperCase(); 
    let dbEntry = powerDatabase.find(p => p.id.toUpperCase() === powerKey); let desc = dbEntry ? dbEntry.desc : `A mysterious power... (${powerKey})`;
    push();
    let tooltipW = 220; let tooltipH = 100; let tipX = mouseX + 15; let tipY = mouseY + 15;
    if (tipX + tooltipW > width) tipX = mouseX - tooltipW - 15; if (tipY + tooltipH > height) tipY = mouseY - tooltipH - 15;
    fill(20, 25, 30, 240); stroke(C_GLOW[0], C_GLOW[1], C_GLOW[2]); strokeWeight(2); rect(tipX, tipY, tooltipW, tooltipH, 8);
    fill(255); noStroke(); textSize(14); textAlign(LEFT, TOP); textWrap(WORD);
    text(desc, tipX + 10, tipY + 10, tooltipW - 20, tooltipH - 20); pop();
  }
}

function checkPowerHover() {
  for (let i = 0; i < playerPowers['X'].length; i++) {
    let boxY = 100 + (i * 70) + 15; if (mouseX > 20 && mouseX < 200 && mouseY > boxY && mouseY < boxY + 50) return playerPowers['X'][i];
  }
  for (let i = 0; i < playerPowers['O'].length; i++) {
    let boxY = 100 + (i * 70) + 15; if (mouseX > width - 200 && mouseX < width - 20 && mouseY > boxY && mouseY < boxY + 50) return playerPowers['O'][i];
  }
  return null;
}