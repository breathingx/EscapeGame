
// =================================================
// BLOK SOORTEN
// =================================================
Blockly.Blocks['start_block'] = {
  init: function() {
    this.appendDummyInput().appendField("Start");
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setDeletable(false);
    this.setMovable(false);
  }
};


Blockly.Blocks['move_forward'] = {
    init: function() {
        this.appendDummyInput().appendField("Loop 1 blok naar voren");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
    }
};

Blockly.Blocks['turn_left'] = {
    init: function() {
        this.appendDummyInput().appendField("Draai naar links");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
    }
};

Blockly.Blocks['turn_right'] = {
    init: function() {
        this.appendDummyInput().appendField("Draai naar rechts");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
    }
};

Blockly.Blocks['repeat_n'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Herhaal")
        .appendField(new Blockly.FieldNumber(3, 1, 100), "N")
        .appendField("keer");
    this.appendStatementInput("DO").appendField("do");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
  }
};

// =================================================
// SCRIPT GENERATIE
// =================================================

javascript.javascriptGenerator.forBlock['start_block'] = function() {
  return ''; 
};
javascript.javascriptGenerator.forBlock['move_forward'] = function() {
  return 'queueAction("forward");\n';
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
// SPEL LOGIC
// =================================================
let moveTimer;
let actionQueue = [];
let isPlaying = false;
let gridMax = 9;
let tileX = 0; 
let tileY = 0;
let playerAngle = 0;
let goalTileX = 9;
let goalTileY = 2;

function queueAction(action) {
    actionQueue.push(action);
}

function updatePlayerVisuals() {
  let player = document.getElementById('player');
  let area = document.getElementById('gameArea');
  let goal = document.getElementById('goal');

  if (!player || !area) return;

  let currentWidth = area.clientWidth;
  let dynamicStep = currentWidth / 10;

  // Move Player
  let xPixels = tileX * dynamicStep;
  let yPixels = tileY * dynamicStep;
  
  player.style.width = dynamicStep + "px";
  player.style.height = dynamicStep + "px";
  player.style.fontSize = (dynamicStep * 0.8) + "px";
  player.style.transform = `translate(${xPixels}px, ${yPixels}px) rotate(${playerAngle}deg)`;
  if (goal) {
    goal.style.width = dynamicStep + "px";
    goal.style.height = dynamicStep + "px";
    goal.style.left = (goalTileX * dynamicStep) + "px";
    goal.style.top = (goalTileY * dynamicStep) + "px";
    goal.style.fontSize = (dynamicStep * 0.8) + "px";
  }
}

function playNextMove() {
  if (!isPlaying || actionQueue.length === 0) {
    isPlaying = false;
    if (tileX === goalTileX && tileY === goalTileY) {
      setTimeout(() => alert("Je bent er! De vlag is bereikt! 🏁"), 100);
    }
    return;
  }

  let action = actionQueue.shift();
  if (action === "forward") {
    let facing = ((playerAngle % 360) + 360) % 360;
    
    if (facing === 0 && tileX < gridMax) tileX++;      // right
    else if (facing === 90 && tileY < gridMax) tileY++; // down
    else if (facing === 180 && tileX > 0) tileX--;      // left
    else if (facing === 270 && tileY > 0) tileY--;      // up
  } 
  else if (action === "left") {
    playerAngle -= 90;
  } 
  else if (action === "right") {
    playerAngle += 90;
  }
  
  updatePlayerVisuals();
  moveTimer = setTimeout(playNextMove, 500);
}

function runGame() {
    clearTimeout(moveTimer)
    tileX = 0; 
    tileY = 0; 
    playerAngle = 0;
    
    updatePlayerVisuals();
    actionQueue = [];
    isPlaying = false;

    let code = javascript.javascriptGenerator.workspaceToCode(workspace);
    try { eval(code); } catch (e) { console.error(e); }
    
    if (actionQueue.length > 0) {
        isPlaying = true;
        moveTimer = setTimeout(playNextMove, 500);
    }
}


var workspace;
function initBlockly() {
  let isMobile = window.innerWidth <= 800;

  workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    trashcan: true,
    horizontalLayout: isMobile, 
    toolboxPosition: isMobile ? 'bottom' : 'start' 
  });

  Blockly.Xml.domToWorkspace(document.getElementById('workspaceBlocks'), workspace);

  document.fonts.ready.then(function() {
    setTimeout(function() {
      const toolboxElement = document.getElementById('toolbox');
      if (workspace && toolboxElement) {
        workspace.updateToolbox(toolboxElement);
        Blockly.svgResize(workspace);
        updatePlayerVisuals();
      }
    }, 100);
  });
  
  window.addEventListener('resize', function() {
    if (workspace) {
      Blockly.svgResize(workspace);
      updatePlayerVisuals();
    }
});
}

window.onload = initBlockly;