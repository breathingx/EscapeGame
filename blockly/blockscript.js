
// =================================================
// BLOCK TYPES
// =================================================

Blockly.Blocks['start_block'] = {
  init: function() {
    this.appendDummyInput().appendField("Start");
    this.setNextStatement(true, null);
    this.setColour("#FFD700");
    this.setDeletable(false);
    this.setMovable(false);
  }
};

Blockly.Blocks['move_forward_n'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Loop")
        .appendField(new Blockly.FieldNumber(1, 1, 10), "STEPS")
        .appendField("blok(ken) vooruit");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#FF6800');
  }
};

Blockly.Blocks['turn_left'] = {
    init: function() {
        this.appendDummyInput().appendField("Draai naar links");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8268FF");
    }
};

Blockly.Blocks['turn_right'] = {
    init: function() {
        this.appendDummyInput().appendField("Draai naar rechts");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0091FF");
    }
};

Blockly.Blocks['repeat_n'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Herhaal")
        .appendField(new Blockly.FieldNumber(3, 1, 100), "N")
        .appendField("keer");
    this.appendStatementInput("DO").appendField("doe");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
  }
};


// =================================================
// SCRIPT GENERATION
// =================================================

javascript.javascriptGenerator.forBlock['start_block'] = function() {
  return ''; 
};

javascript.javascriptGenerator.forBlock['move_forward_n'] = function(block) {
  var steps = block.getFieldValue('STEPS');
  var code = '';
  for (var i = 0; i < steps; i++) {
    code += 'queueAction("forward");\n';
  }
  return code;
};

javascript.javascriptGenerator.forBlock['turn_left'] = function() {
  return 'queueAction("left");\n';
};

javascript.javascriptGenerator.forBlock['turn_right'] = function() {
  return 'queueAction("right");\n';
};

javascript.javascriptGenerator.forBlock['repeat_n'] = function(block) {
  var repeats = block.getFieldValue('N');
  var branch = javascript.javascriptGenerator.statementToCode(block, 'DO');
  return 'for (var i = 0; i < ' + Math.floor(repeats) + '; i++) {\n' + branch + '}\n';
};

// =================================================
// LEVEL & SCORING SETTINGS
// =================================================

const levelGrid = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 2, 0, 0, 0, 2, 1], 
  [1, 0, 2, 0, 0, 1, 1, 1, 0, 1], 
  [1, 0, 0, 1, 0, 1, 0, 0, 0, 1], 
  [1, 2, 1, 0, 2, 0, 0, 1, 2, 1],
  [1, 0, 0, 1, 0, 0, 2, 1, 0, 1], 
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1], 
  [1, 0, 0, 1, 0, 1, 1, 1, 0, 1], 
  [1, 2, 0, 0, 2, 0, 0, 0, 2, 1], 
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  
]; // contains the maze, 0 = empty, 1 = wall, 2 = goal, 3 = start
let workingGrid = []; // Used to track previously collected goals in a run
let currentScore = 0;
let actionQueue = [];
let isPlaying = false;
let moveTimer;
let maxBlocks = 10;

let tileX = 0, tileY = 0;
let startX = 0, startY = 0;
let playerAngle = 0;

let bestBlocklyScore = 0;

// =================================================
// GAME LOGIC
// =================================================

// Helper function to add actions to the queue. Called by the generated code from the blocks to schedule movements and turns.
function queueAction(action) {
    actionQueue.push(action);
}

// called after every move to update the player's position and the visuals of the goals. Also ensures the game area stays square and scales everything based on the current size.
function updatePlayerVisuals() {
  const area = document.getElementById('gameArea');
  const player = document.getElementById('player');
  if (!area || !player) return;

  area.style.setProperty('height', area.offsetWidth + 'px', 'important');
  
  const currentWidth = area.clientWidth;
  if (currentWidth === 0) return; 

  const step = currentWidth / 10;

  player.style.width = step + 'px';
  player.style.height = step + 'px';
  player.style.fontSize = (step * 0.7) + 'px';
  player.style.transform = `translate(${tileX * step}px, ${tileY * step}px) rotate(${playerAngle}deg)`;

  const tiles = area.querySelectorAll('.goal');
  tiles.forEach(t => {
    t.style.width = step + 'px';
    t.style.height = step + 'px';
    t.style.fontSize = (step*.7) + 'px';
    t.style.left = (t.dataset.x * step) + 'px';
    t.style.top = (t.dataset.y * step) + 'px';
    t.style.display = 'flex';
    t.style.alignItems = 'center';
    t.style.justifyContent = 'center';
  });
}

// Adjusts the size and position of all walls based on the current size of the game area. Called on window resize and after drawing the level to ensure everything scales correctly.
function renderLevel() {
  const area = document.getElementById('gameArea');
  const player = document.getElementById('player');
  if (!area || !player) return;

  area.style.setProperty('height', area.offsetWidth + 'px', 'important');

  const currentWidth = area.clientWidth;
  if (currentWidth === 0) return;

  const step = currentWidth / 10;

  const tiles = area.querySelectorAll('.wall');
  tiles.forEach(t => {
    t.style.width = step + 'px';
    t.style.height = step + 'px';
    t.style.fontSize = (step*1.05) + 'px';
    t.style.left = (t.dataset.x * step) + 'px';
    t.style.top = (t.dataset.y * step-step*0.07) + 'px';
    t.style.display = 'flex';
    t.style.alignItems = 'center';
    t.style.justifyContent = 'center';
  });
}

// Main function to draw the level based on the levelGrid. It creates wall and goal elements, sets the player's starting position, and renders everything visually. Also clears any previous elements to reset the board.
function drawLevel() {
  const area = document.getElementById('gameArea');
  const elements = area.querySelectorAll('.wall, .goal');
  elements.forEach(el => el.remove());

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      let val = levelGrid[y][x];
      if (val === 1) createTile(x, y, 'wall', '⬛');
      if (val === 2) createTile(x, y, 'goal', '🎵', `goal-${x}-${y}`);
      if (val === 3) { startX = x; startY = y; }
    }
  }
  tileX = startX; tileY = startY;
  setTimeout(renderLevel, 50);
  updatePlayerVisuals();
}

// Helper function to create wall and goal tiles visually. Sets the appropriate classes, icons, and data attributes for positioning.
function createTile(x, y, className, icon, id = null) {
  const div = document.createElement('div');
  div.className = className;
  if (id) div.id = id;
  div.innerHTML = icon;
  div.style.position = 'absolute';
  div.dataset.x = x;
  div.dataset.y = y;
  document.getElementById('gameArea').appendChild(div);
}

// Recursive function for playing the queued actions. Moves the player, checks for collisions and scoring, and continues until all actions are done. Also handles ending the run when finished.
function playNextMove() {
  if (!isPlaying || actionQueue.length === 0) {
    isPlaying = false;
    clearTimeout(moveTimer);
    setTimeout(endGameBlockly, 200);
    return;
  }

  let action = actionQueue.shift();
  if (action === "forward") {
    let facing = ((playerAngle % 360) + 360) % 360;
    let nextX = tileX, nextY = tileY;

    if (facing === 0) nextX++;
    else if (facing === 90) nextY++;
    else if (facing === 180) nextX--;
    else if (facing === 270) nextY--;

    if (nextX >= 0 && nextX < 10 && nextY >= 0 && nextY < 10) {
      if (levelGrid[nextY][nextX] !== 1) {
        tileX = nextX;
        tileY = nextY;
        
        if (workingGrid[tileY][tileX] === 2) {
          currentScore += 2;
          workingGrid[tileY][tileX] = 0; 
          
          let goalElement = document.getElementById(`goal-${tileX}-${tileY}`);
          if (goalElement) goalElement.style.opacity = '0';
          
          document.getElementById('currentScore').innerText = currentScore;
        }
      }
    }
  } 
  else if (action === "left") playerAngle -= 90;
  else if (action === "right") playerAngle += 90;

  updatePlayerVisuals();
  moveTimer = setTimeout(playNextMove, 250);
}

// Main loop for running the player's code. Evaluates the Blockly code, queues up the actions, and starts the animation. Also handles resetting the game state for retries.
function runGame() {
  let runBtn = document.getElementById('runBlocklyBtn');
  let advanceBtn = document.getElementById('advance-blockly');
  let isRetry = runBtn && runBtn.innerText.includes("OPNIEUW");

  if (isRetry) {
    runBtn.innerText = "▶ SPEEL PROGRAMMA";
    if (advanceBtn) advanceBtn.style.display = 'none';
  } else {
    let count = workspace.getAllBlocks(false).length - 1;
    if (count > maxBlocks) {
      alert(`Te veel blokken! Gebruik maximaal ${maxBlocks}.`);
      return;
    }
    if (advanceBtn) advanceBtn.style.display = 'none'; 
  }
  clearTimeout(moveTimer);
  isPlaying = false;
  actionQueue = [];
  currentScore = 0;
  document.getElementById('currentScore').innerText = "0";
  document.querySelectorAll('.goal').forEach(g => g.style.opacity = '1');
  workingGrid = levelGrid.map(row => [...row]);
  tileX = startX; tileY = startY; playerAngle = 0;
  
  let player = document.getElementById('player');
  player.style.transition = 'none';
  updatePlayerVisuals();
  player.offsetHeight; 
  player.style.transition = 'transform 0.4s ease';


  if (isRetry) {
    return; 
  }

  let code = javascript.javascriptGenerator.workspaceToCode(workspace);
  try { eval(code); } catch (e) { console.error(e); }

  if (actionQueue.length > 0) {
    isPlaying = true;
    playNextMove();
  } else {
    setTimeout(endGameBlockly, 200);
  }
}

// initializes Blockly workspace and loads any saved blocks. Also sets up listeners for resizing and block changes to update the UI size if needed
function initBlockly() {
  const toolboxElement = document.getElementById('toolbox');
  if (!toolboxElement) {
    console.error("Toolbox element not found!");
    return;
  }

  blocklyDiv.innerHTML = '';
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolboxElement,
    trashcan: true,
    horizontalLayout: true, 
    toolboxPosition: 'start',
    scrollbars: true,
    renderer: 'geras' 
  });
  const workspaceBlocksElement = document.getElementById('workspaceBlocks');
  if (workspaceBlocksElement) {
    Blockly.Xml.domToWorkspace(workspaceBlocksElement, workspace);
  }
  updatePlayerVisuals();
  drawLevel();
  workspace.addChangeListener(() => {
    let count = workspace.getAllBlocks(false).length - 1;
    document.getElementById('blockCount').innerText = count+"/"+maxBlocks;
    document.getElementById('blockCount').style.color = count > maxBlocks ? 'red' : 'white';
  });
  document.fonts.ready.then(function() {
    window.requestAnimationFrame(() => {
      if (workspace && document.getElementById('toolbox')) {
        try {
          workspace.updateToolbox(document.getElementById('toolbox'));
          Blockly.svgResize(workspace);
        } catch (e) {
          console.warn("Blockly resize deferred:", e);
        }
      }
    });
  });
  
  window.addEventListener('resize', function() {
    if (workspace) {
        Blockly.svgResize(workspace);
        updatePlayerVisuals();
        renderLevel();
    }
  });
  
  setTimeout(() => {
      if (workspace) {
          Blockly.svgResize(workspace);
          updatePlayerVisuals();
          renderLevel();
      }
  }, 250);
}

// Evaluates the player's code and updates the score and buttons accordingly. Called at the end of a run. Max points = no retry anymore
function endGameBlockly(bestscore=bestBlocklyScore) {
    let runBtn = document.getElementById('runBlocklyBtn');
    let advanceBtn = document.getElementById('advance-blockly');
    
    // Save the best attempt
    if (currentScore > bestBlocklyScore) {
        bestBlocklyScore = currentScore;
    }
    // max score: only show advance button
    if (currentScore >= 20) {
        if (runBtn) runBtn.style.display = 'none'; 
        if (advanceBtn) {
            advanceBtn.style.display = 'block';
            advanceBtn.innerText = "Verder (Max Score!)";
        }
    } 
    // no points: only show retry button
    else if (currentScore === 0) {
        if (runBtn) {
            runBtn.style.display = 'block';
            runBtn.innerText = "↻OPNIEUW PROBEREN";
        }
    } 
    // some points but not max: show both buttons
    else {
        if (runBtn) {
            runBtn.style.display = 'block';
            runBtn.innerText = "↻OPNIEUW PROBEREN";
        }
        if (advanceBtn) {
            advanceBtn.style.display = 'block';
            advanceBtn.innerText = "Verder";
        }
    }

    if (advanceBtn && !advanceBtn.hasAttribute("data-bound")) {
        advanceBtn.setAttribute("data-bound", "true");
        advanceBtn.addEventListener("pointerdown", (e) => {
            if (e.cancelable) e.preventDefault();
            submitBlocklyScore();
        }, { passive: false });
    }
}

// overwrites scoring function with blockly score and moves to next screen.
function submitBlocklyScore() {
    if (localStorage.getItem("blockly_done") !== "true") {
        localStorage.setItem("blockly_done", "true");
 
        window.blockly_punten = bestBlocklyScore;

        if(typeof score !== 'undefined') {
            score += bestBlocklyScore;
            localStorage.setItem("score", score);
            if (document.getElementById("scoreDisplay")) {
                document.getElementById("scoreDisplay").textContent = "Score: " + score;
            }

            correcteAntwoorden++;
            localStorage.setItem("correct", correcteAntwoorden);
            if (typeof updateProgressBar === "function") {
                updateProgressBar();
            }
        }
    }

    // Move to the next screen
    if (typeof huidigeOpdracht !== 'undefined' && huidigeOpdracht < 5) {
        if (typeof toonTussenPagina === "function") toonTussenPagina();
    } else {
        if (typeof volgendeOpdracht === "function") volgendeOpdracht();
    }
}

// Catches the case where the player has already completed the game and returns to the page, forcing the next page.
if (localStorage.getItem("blockly_done") === "true") {
  if (typeof huidigeOpdracht !== 'undefined' && huidigeOpdracht < 5) {
      if (typeof toonTussenPagina === "function") toonTussenPagina();
  } else {
      if (typeof volgendeOpdracht === "function") volgendeOpdracht();
  }
}

