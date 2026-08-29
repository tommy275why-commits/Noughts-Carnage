let devConsoleActive = false;
let devInputText = "";
let devLog = ["=== MAYHEM ENGINE DEV CONSOLE ===", "Type 'help' for commands."];
let devMaxLines = 13; // Max lines that fit in the window

// Draws the console overlay
function drawDevConsole() {
  if (!devConsoleActive) return;

  push();
  // 1. Console Background (Simple dark grey)
  fill(30, 30, 30, 240);
  noStroke();
  rect(0, 0, width, 300);

  // 2. Bottom border (Plain white)
  stroke(255);
  strokeWeight(2);
  line(0, 300, width, 300);

  // 3. Setup Text Settings (Plain white Arial)
  textAlign(LEFT, TOP);
  textSize(16);
  textFont('Arial'); // Normal, plain text font

  // 4. Draw Logs (Scrolling up)
  let startIdx = Math.max(0, devLog.length - devMaxLines);
  for (let i = 0; i < devLog.length - startIdx; i++) {
     let lineText = devLog[startIdx + i];
     
     // Color code the output
     if (lineText.startsWith('!')) fill(255, 100, 100); // Soft red for errors
     else if (lineText.startsWith('>')) fill(100, 255, 100); // Soft green for success
     else fill(255); // PURE WHITE for normal text
     
     text(lineText, 15, 15 + (i * 18));
  }

  // 5. Draw Input Line & Blinking Cursor
  fill(255); // White text for typing
  let inputY = 265;
  let cursor = (frameCount % 60 < 30) ? "|" : ""; // Normal typing cursor
  text("DEV: " + devInputText + cursor, 15, inputY);
  pop();
}

// Intercepts typing when the console is open
function handleDevInput(k, code) {
  if (code === BACKSPACE) {
    devInputText = devInputText.substring(0, devInputText.length - 1);
  } else if (code === ENTER || code === RETURN) {
    if (devInputText.trim() !== "") {
      executeDevCommand(devInputText);
      devInputText = ""; // Clear input after sending
    }
  } else if (k.length === 1) { // Only allow printable characters
    devInputText += k;
  }
}

// Processes the cheat codes!
function executeDevCommand(cmdStr) {
  devLog.push("DEV: " + cmdStr);
  let args = cmdStr.trim().split(' ');
  let cmd = args[0].toLowerCase();

  try {
    if (cmd === 'help') {
      devLog.push(" AVAILABLE COMMANDS:");
      devLog.push("  give <X/O> <ID>   - Gives a specific power");
      devLog.push("  powers            - Lists all valid Power IDs");
      devLog.push("  event             - Triggers an Anomaly instantly");
      devLog.push("  turn <X/O>        - Forces turn to X or O");
      devLog.push("  gameover <X/O/VIRUS> - Forces the game to end");
      devLog.push("  clear             - Clears the console text");
    } 
    else if (cmd === 'powers' || (cmd === 'powers' && args[1] === 'list')) {
      devLog.push("> AVAILABLE POWER IDs:");
      
      // Group the powers 5 per line so they don't run off the edge of the screen!
      let currentLine = "  ";
      for (let i = 0; i < powerDatabase.length; i++) {
          currentLine += powerDatabase[i].id + ", ";
          if ((i + 1) % 5 === 0 || i === powerDatabase.length - 1) {
              // Remove the last comma and space from the end of the line
              if (i === powerDatabase.length - 1) currentLine = currentLine.slice(0, -2);
              devLog.push(currentLine);
              currentLine = "  ";
          }
      }
    }
    else if (cmd === 'give') {
      let player = args[1] ? args[1].toUpperCase() : null;
      let powerId = args[2] ? args[2].toUpperCase() : null;
      
      if (player !== 'X' && player !== 'O') {
        devLog.push("! Error: Player must be X or O. (e.g. give X NUKE)");
        return;
      }
      
      let pDef = powerDatabase.find(p => p.id === powerId);
      if (pDef) {
        if (playerPowers[player].length < MAX_POWER_SLOTS) {
          playerPowers[player].push({...pDef, cd: 0});
          devLog.push(`> SUCCESS: Gave [${pDef.name}] to Player ${player}`);
        } else {
          devLog.push(`! Error: Player ${player} has no open power slots!`);
        }
      } else {
        devLog.push(`! Error: Power ID '${powerId}' not found.`);
      }
    } 
    else if (cmd === 'event') {
      if (typeof triggerApocalypse === 'function') {
        triggerApocalypse();
        devLog.push(`> CRITICAL: Event forced! Active Event: ${activeEvent}`);
      } else {
        devLog.push("! Error: triggerApocalypse() not found.");
      }
    }
    else if (cmd === 'turn') {
      let targetPlayer = args[1] ? args[1].toUpperCase() : null;
      if (targetPlayer === 'X' || targetPlayer === 'O') {
        currentPlayer = targetPlayer;
        devLog.push(`> Turn forced to Player ${currentPlayer}`);
      } else {
        devLog.push("! Error: Specify X or O (e.g. turn X)");
      }
    }
    else if (cmd === 'gameover') {
      let targetWinner = args[1] ? args[1].toUpperCase() : null;
      if (targetWinner === 'X' || targetWinner === 'O' || targetWinner === 'VIRUS') {
        // Set the global state variables to trigger the end screen
        roundWinner = targetWinner;
        gameState = "GAME_OVER";
        
        devLog.push(`> GAME OVER FORCED. Victor: ${roundWinner}`);
        devConsoleActive = false; // Automatically close the console so you can see the explosion!
      } else {
        devLog.push("! Error: Specify X, O, or VIRUS (e.g. gameover X)");
      }
    }
    else if (cmd === 'clear') {
      devLog = ["=== MAYHEM ENGINE DEV CONSOLE ==="];
    }
    else {
      devLog.push(`! Unknown command: ${cmd}. Type 'help'.`);
    }
  } catch (err) {
    devLog.push("! SYSTEM ERROR: " + err.message);
  }
}