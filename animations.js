// ==========================================
// --- DETERMINISTIC PRNG ENGINE ---
// ==========================================
let currentSeed = 12345;

window.setSeed = function(newSeed) {
  currentSeed = newSeed;
};

function seededRandom(min, max) {
  currentSeed = (currentSeed * 9301 + 49297) % 233280;
  let rnd = currentSeed / 233280;
  
  if (min === undefined) return rnd;
  if (max === undefined) return rnd * min;
  return min + rnd * (max - min);
}

// ==========================================
// --- THE MAYHEM VISUAL EFFECTS ENGINE ---
// ==========================================

let shakeAmount = 0;
let flashAlpha = 0;
let flashColor = [255, 255, 255];

let particles = [];
let activeFX = [];

// --- THE MAIN ANIMATION LOOP ---
window.runAnimations = function() {
  if (shakeAmount > 0) {
    translate(seededRandom(-shakeAmount, shakeAmount), seededRandom(-shakeAmount, shakeAmount));
    shakeAmount *= 0.9;
    if (shakeAmount < 0.5) shakeAmount = 0;
  }

  for (let i = activeFX.length - 1; i >= 0; i--) {
    let fx = activeFX[i];
    fx.t++;
    
    // ---> CHECK FOR APOCALYPSE EVENTS FIRST <---
    if (typeof renderApocalypseFX === "function" && renderApocalypseFX(fx)) {
        // Handled securely by the Apocalypse Event power.js tab!
    }
    // ==========================================
    // ---> NEW: OMINOUS CURSED MIRROR <---
    // ==========================================
    else if (fx.id === 'CURSED_MIRROR') {
      let bnd = typeof getBoardBounds === 'function' ? getBoardBounds() : {x: 200, top: 80, w: 600, h: 520};
      push();
      
      let perimeter = (bnd.w * 2) + (bnd.h * 2);
      let dist = (fx.t * 15) % perimeter; 
      let lx = bnd.x, ly = bnd.top;
      
      if (dist < bnd.w) { lx += dist; } 
      else if (dist < bnd.w + bnd.h) { lx += bnd.w; ly += dist - bnd.w; } 
      else if (dist < bnd.w * 2 + bnd.h) { lx += bnd.w - (dist - bnd.w - bnd.h); ly += bnd.h; } 
      else { ly += bnd.h - (dist - bnd.w * 2 - bnd.h); }

      drawingContext.shadowBlur = 30; drawingContext.shadowColor = "red";
      fill(255, 0, 0); noStroke();
      circle(lx, ly, 15);
      
      noFill(); stroke(200, 0, 0, map(fx.t, 0, fx.maxT, 100, 0)); strokeWeight(4);
      rectMode(CORNER); rect(bnd.x, bnd.top, bnd.w, bnd.h);

      if (frameCount % 6 < 3) {
        fill(255, 0, 0, seededRandom(100, 255));
        textAlign(CENTER, CENTER);
        textSize(seededRandom(50, 80));
        let words = ["C U R S E D", "E R R O R", "S W A P", "V O I D"];
        text(words[frameCount % words.length], width/2 + seededRandom(-10, 10), height/2 + seededRandom(-10, 10));
      }
      pop();
    }
    // ==========================================
    // ---> NEW: ARCANE BLOOD MAGIC <---
    // ==========================================
    else if (fx.id === 'BLOOD_MAGIC') {
      push(); translate(width/2, height/2);
      
      noFill(); stroke(180, 0, 0, map(fx.t, 0, fx.maxT, 255, 0));
      strokeWeight(map(fx.t, 0, fx.maxT, 30, 2));
      circle(0, 0, fx.t * 25);
      circle(0, 0, fx.t * 15);
      
      stroke(80, 0, 20, map(fx.t, 0, fx.maxT, 255, 0));
      strokeWeight(6);
      for(let i = 0; i < 8; i++) {
          push(); rotate((TWO_PI / 8) * i + (fx.t * 0.02));
          beginShape();
          for(let j = 0; j < 6; j++) {
              vertex(j * fx.t * 3, seededRandom(-30, 30));
          }
          endShape();
          pop();
      }
      pop();
    }
    // ==========================================
    // ---> REVAMPED: TWO-PHASE TIME BOMB <---
    // ==========================================
    else if (fx.id === 'TIME_BOMB') {
      push(); translate(fx.x, fx.y);
      let tickPhase = 45; 
      
      if (fx.t < tickPhase) {
          let radius = map(fx.t, 0, tickPhase, 300, 0);
          drawingContext.shadowBlur = 15; drawingContext.shadowColor = "cyan";
          noFill(); stroke(0, 255, 255, 200); strokeWeight(4);
          circle(0, 0, radius);
          circle(0, 0, radius * 1.5);
          
          if (fx.t % 15 === 0) {
              if (typeof triggerScreenShake === "function") triggerScreenShake(5);
          }
      } else {
          let boomT = fx.t - tickPhase;
          let maxBoom = fx.maxT - tickPhase;
          let blastW = map(boomT, 0, maxBoom, 0, width * 1.2);
          
          drawingContext.shadowBlur = 40; drawingContext.shadowColor = "orange";
          noStroke(); 
          fill(0, 255, 255, map(boomT, 0, maxBoom, 255, 0)); 
          circle(0, 0, blastW);
          fill(255, 100, 0, map(boomT, 0, maxBoom, 255, 0)); 
          circle(0, 0, blastW * 0.7);
          fill(255, 255, 255, map(boomT, 0, maxBoom, 255, 0)); 
          circle(0, 0, blastW * 0.3);
      }
      pop();
    }
    else if (fx.id === 'VORTEX') {
      push(); translate(fx.x, fx.y); rotate(frameCount * 0.2);
      
      drawingContext.shadowBlur = 40;
      drawingContext.shadowColor = "purple";
      
      fill(80, 20, 150, map(fx.t, 0, fx.maxT, 255, 0));
      noStroke();
      ellipse(0, 0, fx.t * 20, fx.t * 8);

      stroke(200, 100, 255, map(fx.t, 0, fx.maxT, 200, 0));
      strokeWeight(6);
      noFill();
      arc(0, 0, fx.t * 25, fx.t * 10, 0, PI);
      
      drawingContext.shadowBlur = 0;
      fill(0, 0, 0, map(fx.t, 0, fx.maxT, 255, 0));
      noStroke();
      circle(0, 0, map(fx.t, 0, fx.maxT, 120, 0)); 
      pop();
    }
    else if (fx.id === 'LASER') {
      let bnd = typeof getBoardBounds === 'function' ? getBoardBounds() : {x:200, w:600};
      let w = bnd.w / gridSize; let bx = bnd.x + (w * fx.col) + w / 2;
      
      push(); rectMode(CENTER);
      let laserW = map(fx.t, 0, fx.maxT, w * 2.5, 0);

      if (fx.t < 15) {
         drawingContext.shadowBlur = 30; drawingContext.shadowColor = "cyan";
         noFill(); stroke(0, 255, 255, map(fx.t, 0, 15, 255, 0)); strokeWeight(8);
         push(); translate(bx, height/2); rotate(fx.t * 0.5);
         ellipse(0, 0, w * 1.5, w * 0.5); rotate(PI/2); ellipse(0, 0, w * 1.5, w * 0.5);
         pop();
      }

      if (fx.t < fx.maxT - 10) triggerScreenShake(10); 

      drawingContext.shadowBlur = 50; drawingContext.shadowColor = "red";
      fill(255, 20, 20, map(fx.t, 0, fx.maxT, 255, 0)); noStroke();
      rect(bx, height / 2, laserW, height);

      drawingContext.shadowBlur = 20; drawingContext.shadowColor = "white";
      fill(255, 255, 255, map(fx.t, 0, fx.maxT, 255, 0));
      rect(bx, height / 2, laserW * 0.4, height);

      stroke(255, 100, 100, map(fx.t, 0, fx.maxT, 255, 0)); strokeWeight(12); noFill();
      let ringY = (frameCount * 50) % height;
      ellipse(bx, ringY, laserW * 1.5, 30);
      ellipse(bx, (ringY + height/2) % height, laserW * 1.5, 30);

      if (fx.t < fx.maxT - 5) {
        for(let s = 0; s < 5; s++) activeFX.push({ id: 'LASER_SPARK', x: bx + seededRandom(-w, w), y: seededRandom(height), vy: seededRandom(-15, -40), t: 0, maxT: seededRandom(10, 20) });
      }
      pop();
    }
    else if (fx.id === 'LASER_SPARK') {
       push(); stroke(255, 200, 200, map(fx.t, 0, fx.maxT, 255, 0)); strokeWeight(4);
       line(fx.x, fx.y, fx.x, fx.y + fx.vy); fx.y += fx.vy; pop();
    }
    else if (fx.id === 'BOMB') {
      push(); translate(fx.x, fx.y); rectMode(CENTER);
      let blastW = map(fx.t, 0, fx.maxT, 0, width * 1.5);
      let thickness = map(fx.t, 0, fx.maxT, 120, 0);

      drawingContext.shadowBlur = 40; drawingContext.shadowColor = "red";
      fill(255, 80, 0, map(fx.t, 0, fx.maxT, 255, 0)); noStroke();
      rect(0, 0, blastW, thickness); rect(0, 0, thickness, blastW);

      fill(255, 255, 200, map(fx.t, 0, fx.maxT, 255, 0)); circle(0, 0, thickness * 1.5);

      noFill(); stroke(255, 200, 100, map(fx.t, 0, fx.maxT, 255, 0));
      strokeWeight(map(fx.t, 0, fx.maxT, 15, 0)); circle(0, 0, blastW * 0.4);
      pop();
    }
    else if (fx.id === 'NUKE_SHOCKWAVE') {
      push(); translate(fx.x, fx.y); noFill();
      strokeWeight(map(fx.t, 0, fx.maxT, 60, 0)); stroke(255, 100, 0, map(fx.t, 0, fx.maxT, 200, 0));
      circle(0, 0, fx.t * 40);
      strokeWeight(map(fx.t, 0, fx.maxT, 20, 0)); stroke(255, 255, 255, map(fx.t, 0, fx.maxT, 255, 0));
      circle(0, 0, fx.t * 50); pop();
    }
    else if (fx.id === 'MINDBEND') {
      push(); translate(width / 2, height / 2); noFill(); 
      drawingContext.shadowBlur = 20; drawingContext.shadowColor = "magenta";
      for(let r = 1; r <= 8; r++) { 
        strokeWeight(map(fx.t, 0, fx.maxT, 8, 1));
        stroke(seededRandom(150, 255), 50, 255, map(fx.t, 0, fx.maxT, 255, 0)); 
        rotate(fx.t * 0.05); 
        ellipse(0, 0, (fx.t * r * 15) + (fx.t*5), (fx.t * r * 5) + (fx.t*2)); 
      } 
      pop();
    }
    else if (fx.id === 'MINDBEND_FLIP') {
      push(); translate(fx.x, fx.y); rectMode(CENTER);
      drawingContext.shadowBlur = 30; drawingContext.shadowColor = "magenta";
      noStroke();
      let bnd = typeof getBoardBounds === 'function' ? getBoardBounds() : {w: 600};
      let cellW = (bnd.w / gridSize) * 0.8;
      
      if (fx.t < fx.waitT) {
          fill(255, 50, 255, seededRandom(200, 255));
          rect(0, 0, cellW, cellW, 15);
      } else {
          let progress = (fx.t - fx.waitT) / (fx.maxT - fx.waitT);
          let s = map(progress, 0, 1, cellW, 0);
          fill(255, 50, 255, map(progress, 0, 1, 255, 0));
          rotate(progress * PI);
          rect(0, 0, s, s, 15);
      }
      pop();
    }
    else if (fx.id === 'TELEPORT') {
      push(); translate(fx.x, fx.y); noFill(); 
      drawingContext.shadowBlur = 20; drawingContext.shadowColor = "cyan";
      strokeWeight(8); stroke(0, 255, 255, map(fx.t, 0, fx.maxT, 255, 0));
      circle(0, 0, map(fx.t, 0, fx.maxT, 10, 200)); 
      drawingContext.shadowColor = "magenta";
      strokeWeight(4); stroke(255, 0, 255, map(fx.t, 0, fx.maxT, 255, 0)); 
      circle(0, 0, map(fx.t, 0, fx.maxT, 200, 10)); pop();
    }
    else if (fx.id === 'GRAVITY_WELL') {
      push(); fill(100, 50, 200, map(fx.t, 0, fx.maxT, 150, 0)); rect(0, 0, width, height);
      stroke(255, map(fx.t, 0, fx.maxT, 200, 0)); strokeWeight(2);
      for(let k = 0; k < 20; k++) { line(seededRandom(width), seededRandom(height), seededRandom(width), seededRandom(height) + 100); } pop();
    }
    else if (fx.id === 'LABYRINTH') {
      push(); rectMode(CENTER); noFill(); translate(width / 2, height / 2); 
      for (let j = 1; j <= 3; j++) {
        let sizeOffset = (fx.t * 15 * j); strokeWeight(map(fx.t, 0, fx.maxT, 10, 0));
        stroke(255, 50, 50, map(fx.t, 0, fx.maxT, 255, 0)); 
        push(); rotate((fx.t * 0.05) * (j % 2 === 0 ? 1 : -1)); rect(0, 0, sizeOffset, sizeOffset); pop();
      } pop();
    }
    else if (fx.id === 'REWIND') {
      push(); translate(width / 2, height / 2); noFill(); strokeWeight(5); stroke(255, 215, 0, map(fx.t, 0, fx.maxT, 200, 0));
      circle(0, 0, 300); strokeWeight(8); rotate(-fx.t * 0.5); line(0, 0, 0, -100);
      strokeWeight(4); rotate(-fx.t * 0.8); line(0, 0, 120, 0); pop();
    }
    else if (fx.id === 'GUILLOTINE') {
      push(); fill(200, 20, 20, map(fx.t, 0, fx.maxT, 255, 0)); noStroke();
      let inset = map(fx.t, 0, fx.maxT, 0, 150); rect(0, 0, width, inset); rect(0, height - inset, width, inset);
      rect(0, 0, inset, height); rect(width - inset, 0, inset, height); pop();
    }
    else if (fx.id === 'DOUBLE') {
      push(); translate(width / 2, height / 2); noStroke(); fill(255, 215, 0, map(fx.t, 0, fx.maxT, 100, 0));
      let starSize = map(fx.t, 0, fx.maxT, 10, 800);
      for(let s = 0; s < 8; s++) { rotate(PI / 4); ellipse(0, 0, starSize, starSize / 10); } pop();
    }
    else if (fx.id === 'MAGNET') {
      push(); translate(width / 2, height / 2); strokeWeight(4); stroke(200, 200, 255, map(fx.t, 0, fx.maxT, 255, 0));
      for(let a=0; a<TWO_PI; a+=PI/4) { let r1 = map(fx.t, 0, fx.maxT, 400, 0); let r2 = r1 + 50; line(cos(a)*r1, sin(a)*r1, cos(a)*r2, sin(a)*r2); } pop();
    }
    else if (fx.id === 'ECLIPSE') {
      push(); translate(width / 2, height / 2); noStroke();
      fill(255, 255, 200, map(fx.t, 0, fx.maxT, 150, 0)); circle(0, 0, 400); 
      fill(10, 10, 15, map(fx.t, 0, fx.maxT, 255, 0)); circle(0, 0, 380); pop();
    }
    else if (fx.id === 'BULLDOZER') {
       let bnd = typeof getBoardBounds === 'function' ? getBoardBounds() : {top:80, h:520};
       let h = bnd.h / gridSize; let y = bnd.top + (h * fx.row) + (h / 2);
       push(); fill(255, 150, 50, map(fx.t, 0, fx.maxT, 200, 0)); noStroke(); rectMode(CENTER); rect(width/2, y, width, h); pop();
    }
    else if (fx.id === 'LIGHTNING') {
       push(); stroke(150, 255, 255, map(fx.t, 0, fx.maxT, 255, 0)); strokeWeight(8); noFill(); circle(fx.x, fx.y, fx.t * 10); pop();
    }
    else if (fx.id === 'MINE_TRIGGER') {
       push(); fill(255, 50, 0, map(fx.t, 0, fx.maxT, 200, 0)); noStroke(); circle(fx.x, fx.y, fx.t * 20); pop();
    }
    else if (fx.id === 'AEGIS') {
       push(); stroke(255, 215, 0, map(fx.t, 0, fx.maxT, 255, 0)); strokeWeight(5); noFill(); rectMode(CENTER); rect(fx.x, fx.y, 80 - fx.t, 80 - fx.t); pop();
    }
    else if (fx.id === 'TROJAN_POP') {
       push(); fill(150, 100, 50, map(fx.t, 0, fx.maxT, 200, 0)); noStroke(); rectMode(CENTER); rect(fx.x, fx.y, fx.t * 15, fx.t * 15); pop();
    }
    else if (fx.id === 'SLAM') {
        if (fx.t === fx.maxT) {
            if (typeof triggerScreenShake === "function") triggerScreenShake(4);
            
            let pos = getCellCenter(fx.i, fx.j);
            for (let k = 0; k < 12; k++) {
                let angle = seededRandom(TWO_PI); let speed = seededRandom(3, 8);
                activeFX.push({ id: 'DUST', x: pos.x, y: pos.y, vx: cos(angle) * speed, vy: sin(angle) * speed, t: 0, maxT: seededRandom(15, 30) });
            }
        }
    }
    else if (fx.id === 'DUST') {
        fx.x += fx.vx; fx.y += fx.vy; fx.vx *= 0.85; fx.vy *= 0.85; 
        push(); fill(220, 220, 255, map(fx.t, 0, fx.maxT, 150, 0)); noStroke();
        circle(fx.x, fx.y, map(fx.t, 0, fx.maxT, 12, 0)); pop();
    }

    if (fx.t >= fx.maxT) activeFX.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    if (p.behavior === 'suck') {
      let angle = atan2(p.targetY - p.y, p.targetX - p.x); p.vx += cos(angle) * 1.5; p.vy += sin(angle) * 1.5; p.vx *= 0.85; p.vy *= 0.85;
    } else if (p.behavior === 'fall') { p.vy += 0.5;
    } else if (p.behavior === 'float') { p.vy -= 0.2; p.x += sin(frameCount * 0.1 + p.y) * 2; 
    } else { p.vx *= 0.95; p.vy *= 0.95; }

    p.x += p.vx; p.y += p.vy; p.life -= p.decay;

    push(); fill(p.color[0], p.color[1], p.color[2], p.life * 255); noStroke(); translate(p.x, p.y); rotate(frameCount * 0.1 * p.vx); rectMode(CENTER);
    if (p.shape === 'rect') rect(0, 0, p.size, p.size); else circle(0, 0, p.size); pop();

    if (p.life <= 0) particles.splice(i, 1);
  }

  if (flashAlpha > 0) {
    push(); fill(flashColor[0], flashColor[1], flashColor[2], flashAlpha); noStroke(); rectMode(CORNER); rect(0, 0, width, height); flashAlpha -= 10; pop();
  }
};

window.triggerScreenShake = function(amt) { shakeAmount = amt; };
window.triggerFlash = function(r, g, b, startAlpha = 200) { flashColor = [r, g, b]; flashAlpha = startAlpha; };

function getCellCenter(c, r) {
  let gSize = (typeof gridSize !== 'undefined') ? gridSize : 3; 
  let bnd = typeof getBoardBounds === 'function' ? getBoardBounds() : { x: 200, top: 80, w: 600, h: 520 };
  let w = bnd.w / gSize; let h = bnd.h / gSize;
  return { x: bnd.x + (w * c) + (w / 2), y: bnd.top + (h * r) + (h / 2) };
}

window.triggerPowerAnimation = function(id, i, j) {
  let pos = getCellCenter(i, j);

  // ---> CHECK FOR APOCALYPSE EVENTS FIRST <---
  if (typeof triggerApocalypseFX === "function" && triggerApocalypseFX(id, pos)) {
      // Handled securely by the Apocalypse Event power.js tab!
  }
  // ==========================================
  // ---> NEW TRIGGERS FOR THE NEW POWERS <---
  // ==========================================
  else if (id === 'CURSED_MIRROR') { 
     activeFX.push({ id: 'CURSED_MIRROR', t: 0, maxT: 100 }); 
     triggerScreenShake(15); 
     triggerFlash(150, 0, 0, 120); 
  }
  else if (id === 'BLOOD_MAGIC') { 
     activeFX.push({ id: 'BLOOD_MAGIC', t: 0, maxT: 60 }); 
     triggerScreenShake(25); 
     triggerFlash(200, 0, 0, 180); 
  }
  else if (id === 'TIME_BOMB') { 
     // 45 frames of ticking, 30 frames of explosive detonation
     activeFX.push({ id: 'TIME_BOMB', x: pos.x, y: pos.y, t: 0, maxT: 75 }); 
  }
  // ==========================================
  else if (id === 'VORTEX') {
    activeFX.push({ id: 'VORTEX', x: pos.x, y: pos.y, t: 0, maxT: 50 }); triggerScreenShake(20);
    for (let k = 0; k < 60; k++) {
      let angle = seededRandom(TWO_PI); let dist = seededRandom(100, 300);
      particles.push({ x: pos.x + cos(angle) * dist, y: pos.y + sin(angle) * dist, vx: 0, vy: 0, targetX: pos.x, targetY: pos.y, life: 1.0, decay: seededRandom(0.01, 0.03), color: seededRandom() > 0.5 ? [220, 40, 40] : [60, 100, 255], size: seededRandom(8, 15), shape: 'rect', behavior: 'suck' });
    }
  } 
  else if (id === 'NUKE') {
    triggerFlash(255, 255, 255, 255); triggerScreenShake(40);
    activeFX.push({ id: 'NUKE_SHOCKWAVE', x: width / 2, y: height / 2, t: 0, maxT: 50 });
    for (let k = 0; k < 120; k++) { 
       let angle = seededRandom(TWO_PI); let speed = seededRandom(10, 30);
       particles.push({ x: width/2, y: height/2, vx: cos(angle)*speed, vy: sin(angle)*speed, life: 1.0, decay: seededRandom(0.01, 0.04), color: seededRandom() > 0.5 ? [255, 100, 0] : [255, 200, 50], size: seededRandom(20, 60), shape: 'circle', behavior: 'normal' }); 
    }
    for (let k = 0; k < 50; k++) {
       particles.push({ x: seededRandom(width), y: seededRandom(height/2), vx: seededRandom(-2, 2), vy: seededRandom(2, 6), life: 1.0, decay: seededRandom(0.005, 0.02), color: [100, 255, 100], size: seededRandom(4, 10), shape: 'rect', behavior: 'fall' });
    }
  }
  else if (id === 'BOMB') { activeFX.push({ id: 'BOMB', x: pos.x, y: pos.y, t: 0, maxT: 30 }); triggerScreenShake(20); triggerFlash(255, 200, 150, 150); }
  else if (id === 'LASER') { activeFX.push({ id: 'LASER', col: i, t: 0, maxT: 45 }); triggerScreenShake(30); triggerFlash(255, 100, 100, 200); }
  else if (id === 'GRAVITY' || id === 'GRAVITY_WELL') { activeFX.push({ id: 'GRAVITY_WELL', t: 0, maxT: 40 }); triggerScreenShake(15); }
  else if (id === 'SINKHOLE') { triggerScreenShake(20); for (let k = 0; k < 40; k++) { particles.push({ x: seededRandom(200, 800), y: height - 100, vx: seededRandom(-5, 5), vy: seededRandom(-10, 0), life: 1.0, decay: seededRandom(0.02, 0.05), color: [80, 80, 90], size: seededRandom(10, 25), shape: 'rect', behavior: 'fall' }); } }
  else if (id === 'ERASER') { triggerScreenShake(5); for (let k = 0; k < 20; k++) { particles.push({ x: pos.x, y: pos.y, vx: seededRandom(-8, 8), vy: seededRandom(-8, 8), life: 1.0, decay: seededRandom(0.03, 0.08), color: [0, 255, 100], size: seededRandom(5, 12), shape: 'rect', behavior: 'normal' }); } }
  else if (id === 'QUANTUM') { triggerFlash(0, 255, 255, 180); triggerScreenShake(12); }
  else if (id === 'LABYRINTH') { triggerScreenShake(25); triggerFlash(100, 20, 20, 180); activeFX.push({ id: 'LABYRINTH', t: 0, maxT: 50 }); }
  else if (id === 'REWIND') { triggerFlash(255, 215, 0, 150); triggerScreenShake(10); activeFX.push({ id: 'REWIND', t: 0, maxT: 50 }); }
  else if (id === 'GUILLOTINE') { triggerScreenShake(20); activeFX.push({ id: 'GUILLOTINE', t: 0, maxT: 30 }); }
  else if (id === 'QUAKE') { triggerScreenShake(35); triggerFlash(150, 130, 100, 100); for (let k = 0; k < 60; k++) { particles.push({ x: seededRandom(200, 800), y: seededRandom(100, 600), vx: seededRandom(-2, 2), vy: seededRandom(-1, -5), life: 1.0, decay: seededRandom(0.01, 0.03), color: [150, 140, 120], size: seededRandom(10, 30), shape: 'circle', behavior: 'float' }); } }
  else if (id === 'MINDBEND') { 
    triggerScreenShake(20); triggerFlash(200, 50, 255, 150); 
    activeFX.push({ id: 'MINDBEND', t: 0, maxT: 60 }); 
    let delay = 0;
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r < gridSize; r++) {
         let cell = board[c][r];
         if (cell === 'X' || cell === 'O' || cell === 'X_S' || cell === 'O_S' || cell.startsWith('ICE_') || cell.startsWith('TROJAN_')) {
            let p = getCellCenter(c, r);
            activeFX.push({ id: 'MINDBEND_FLIP', x: p.x, y: p.y, t: 0, waitT: delay, maxT: delay + 20 });
            delay += 5; // Delays the flip by 5 frames for each piece!
         }
      }
    }
  }
  else if (id === 'TELEPORT') { triggerScreenShake(12); triggerFlash(0, 255, 255, 100); activeFX.push({ id: 'TELEPORT', x: pos.x, y: pos.y, t: 0, maxT: 30 }); }
  else if (id === 'DOUBLE') { triggerFlash(255, 255, 100, 100); activeFX.push({ id: 'DOUBLE', t: 0, maxT: 30 }); }
  else if (id === 'BLACKOUT') { triggerFlash(0, 0, 0, 255); triggerScreenShake(5); for (let k = 0; k < 50; k++) { particles.push({ x: seededRandom(width), y: seededRandom(height), vx: seededRandom(-3, 3), vy: seededRandom(-3, 3), life: 1.0, decay: seededRandom(0.01, 0.02), color: [20, 20, 25], size: seededRandom(40, 100), shape: 'circle', behavior: 'float' }); } }
  else if (id === 'MAGNET') { triggerScreenShake(25); activeFX.push({ id: 'MAGNET', t: 0, maxT: 30 }); }
  else if (id === 'ECLIPSE') { triggerFlash(0, 0, 0, 200); activeFX.push({ id: 'ECLIPSE', t: 0, maxT: 50 }); }
  else if (id === 'BULLDOZER') { triggerScreenShake(15); activeFX.push({ id: 'BULLDOZER', row: j, t: 0, maxT: 30 }); }
  else if (id === 'LIGHTNING') { triggerFlash(200, 255, 255, 150); triggerScreenShake(10); activeFX.push({ id: 'LIGHTNING', x: pos.x, y: pos.y, t: 0, maxT: 20 }); }
  else if (id === 'MINE_TRIGGER') { triggerScreenShake(25); triggerFlash(255, 50, 0, 200); activeFX.push({ id: 'MINE_TRIGGER', x: pos.x, y: pos.y, t: 0, maxT: 40 }); }
  else if (id === 'AEGIS') { triggerFlash(255, 215, 0, 100); activeFX.push({ id: 'AEGIS', x: pos.x, y: pos.y, t: 0, maxT: 30 }); }
  else if (id === 'TROJAN_POP') { triggerScreenShake(15); activeFX.push({ id: 'TROJAN_POP', x: pos.x, y: pos.y, t: 0, maxT: 30 }); }
};

window.triggerPieceSlam = function(i, j) {
    activeFX = activeFX.filter(fx => !(fx.id === 'SLAM' && fx.i === i && fx.j === j));
    activeFX.push({ id: 'SLAM', i: i, j: j, t: 0, maxT: 12 });
};

window.getSlamEffect = function(i, j) {
    return activeFX.find(fx => fx.id === 'SLAM' && fx.i === i && fx.j === j);
};

setTimeout(() => {
  if (typeof window.executePower === "function") {
    const originalExecute = window.executePower;
    window.executePower = function(id, i, j) {
      let success = originalExecute(id, i, j);
      if (success === true || success === "FREE_ACTION") window.triggerPowerAnimation(id, i, j);
      return success;
    };
    console.log("Visual Effects Engine Successfully Hooked!");
  }
}, 500);
