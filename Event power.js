// ==========================================
// --- APOCALYPSE VISUALS & UI ---
// ==========================================

function drawApocalypseWarning() {
  if (typeof activeEvent !== 'undefined' && activeEvent) {
      let bText = "!!! CRITICAL ANOMALY DETECTED !!!";
      let bCol = [255, 0, 0];
      
      if (activeEvent === 'METEOR') { bText = "!!! METEOR SHOWER ACTIVE !!!"; bCol = [255, 100, 0]; }
      if (activeEvent === 'VIRUS') { bText = "!!! VIRUS OUTBREAK DETECTED !!!"; bCol = [50, 255, 50]; }
      if (activeEvent === 'VOID') { bText = "!!! DIMENSIONAL VORTEX OPENED !!!"; bCol = [150, 50, 255]; }

      fill(bCol[0], bCol[1], bCol[2], map(sin(frameCount * 0.1), -1, 1, 100, 255));
      textSize(40); textStyle(BOLD);
      drawingContext.shadowBlur = 20; drawingContext.shadowColor = `rgb(${bCol[0]}, ${bCol[1]}, ${bCol[2]})`;
      text(bText, width/2, 40);
      drawingContext.shadowBlur = 0; textStyle(NORMAL);
      return true; 
  }
  return false;
}

function renderApocalypseFX(fx) {
    if (fx.id === 'EVENT_START') {
      let col = [255, 50, 0];
      if (activeEvent === 'VIRUS') col = [50, 255, 50];
      if (activeEvent === 'VOID') col = [150, 50, 255];
        
      push(); fill(col[0], col[1], col[2], map(fx.t, 0, fx.maxT, 150, 0));
      noStroke(); rectMode(CORNER); rect(0, 0, width, height); 
      translate(width / 2, height / 2); noFill();
      stroke(col[0], col[1], col[2], map(fx.t, 0, fx.maxT, 255, 0));
      strokeWeight(map(fx.t, 0, fx.maxT, 30, 0)); circle(0, 0, fx.t * 30); pop();
      return true;
    }
    // ---> MASSIVELY UPGRADED METEOR EXPLOSION <---
    else if (fx.id === 'METEOR') {
       push(); 
       translate(fx.x, fx.y);
       
       // Massive shockwave ring
       noFill(); stroke(255, 100, 0, map(fx.t, 0, fx.maxT, 255, 0));
       strokeWeight(map(fx.t, 0, fx.maxT, 15, 0));
       circle(0, 0, fx.t * 8);

       // Core explosion
       fill(255, 200, 50, map(fx.t, 0, fx.maxT, 255, 0)); 
       noStroke(); 
       circle(0, 0, 40 + sin(fx.t) * 20 - fx.t); 

       // Falling trail
       stroke(255, 150, 0, map(fx.t, 0, fx.maxT, 255, 0));
       strokeWeight(8 - fx.t/4);
       line(0, 0, fx.t * 15, -fx.t * 30);
       pop();
       return true;
    }
    else if (fx.id === 'VIRUS_SPAWN' || fx.id === 'VIRUS_INFECT') {
       push(); translate(fx.x, fx.y); fill(50, 255, 100, map(fx.t, 0, fx.maxT, 200, 0));
       noStroke(); triangle(0, -fx.t*2, -fx.t*2, fx.t*2, fx.t*2, fx.t*2); pop();
       return true;
    }
    else if (fx.id === 'CHASM_OPEN') {
       push(); translate(fx.x, fx.y); fill(20, 0, 40, map(fx.t, 0, fx.maxT, 255, 0));
       noStroke(); circle(0, 0, 100 - fx.t * 2); 
       stroke(150, 50, 255, map(fx.t, 0, fx.maxT, 255, 0)); strokeWeight(2); circle(0, 0, fx.t * 10); pop();
       return true;
    }
    return false;
}

function triggerApocalypseFX(id, pos) {
    if (id === 'EVENT_START') {
      if (typeof triggerScreenShake === 'function') triggerScreenShake(40);
      activeFX.push({ id: 'EVENT_START', t: 0, maxT: 60 }); return true;
    }
    if (id === 'METEOR') { 
      if (typeof triggerScreenShake === 'function') triggerScreenShake(20);
      activeFX.push({ id: 'METEOR', x: pos.x, y: pos.y, t: 0, maxT: 30 }); return true; 
    }
    if (id === 'VIRUS_SPAWN' || id === 'VIRUS_INFECT') { activeFX.push({ id: id, x: pos.x, y: pos.y, t: 0, maxT: 30 }); return true; }
    if (id === 'CHASM_OPEN') { activeFX.push({ id: 'CHASM_OPEN', x: pos.x, y: pos.y, t: 0, maxT: 40 }); return true; }
    return false;
}