"use strict";

// ---- DOM references --------------------------------------------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const slider = document.getElementById("strengthSlider");
const strengthPctEl = document.getElementById("strengthPct");
const launchBtn = document.getElementById("launchBtn");
const resetBtn = document.getElementById("resetBtn");
const scoreEl = document.getElementById("score");
const targetNameEl = document.getElementById("targetName");
const msgEl = document.getElementById("message");


// ---- Fixed logical drawing space -------------------------------------------
// Everything is drawn in this coordinate system and scaled to the real canvas,
// so the note's flight path stays correct on any screen size.
const SPACE_W = 620;
const SPACE_H = 300;
const GROUND_Y = 272;
const FONT = '"Right Grotesk Medium", Montserrat, Arial, sans-serif';


// ---- The notes and the ladder ----------------------------------------------
// Do is the lowest rung, So the highest.
const NOTES = [
  { name: "Do", freq: 261.63, color: "#d64545" }, // C4
  { name: "Re", freq: 293.66, color: "#e8892b" }, // D4
  { name: "Mi", freq: 329.63, color: "#f2c200" }, // E4
  { name: "Fa", freq: 349.23, color: "#3f9b5a" }, // F4
  { name: "So", freq: 392.00, color: "#3b6fd1" }  // G4
];

const LADDER_X = 500;       // horizontal centre of the ladder
const LADDER_HALF = 50;     // half the width of the ladder
const LADDER_TOP = 26;
const RUNG_Y0 = 232;        // y of the lowest rung (Do)
const RUNG_GAP = 42;        // vertical distance between rungs
const NOTE_LIFT = 9;        // a note "sits" this far above the rung's centre line
const TOL = 15;             // how close (in pixels) the note must be to a rung to hit it


// ---- Catapult geometry and strength ----------------------------------------
const PIVOT = { x: 120, y: 226 };
const ARM_LEN = 60;         // pivot to cup
const TAIL_LEN = 14;        // pivot to counterweight
const NOTE_OFF = 8;         // distance from the cup's tip to the note's head

const RELEASE_ANGLE = -14 * Math.PI / 180; // arm angle when the note is released (leaning forward)

// Height (y) at which the note arrives at the ladder for 0% and 100% strength.
// 0% falls below the lowest rung, 100% flies above the highest rung.
const REACH_LOW = 256;
const REACH_HIGH = 40;

const APEX_CLEARANCE = 24;  // how far above the lowest point of the path the arc peaks
const SWING_MS = 170;
const FLIGHT_MS = 1100;
const HIT_HOLD_MS = 1600;
const MISS_HOLD_MS = 1100;

// Values that map the strength onto the original lever "code" digits.
// 0% strength = pivot at 88%, 100% strength = pivot at 10%.
const CODE_LEFT = 70;
const CODE_RIGHT = 380;
const CODE_PIVOT_MIN = 10;
const CODE_PIVOT_MAX = 88;


// ---- Game state ------------------------------------------------------------
const state = {
  phase: "idle",   // idle -> swing -> flight -> settle -> idle
  t0: 0,
  power: Number(slider.value),
  armAngle: 0,
  swingFrom: 0,
  traj: null,
  noteX: 0,
  noteY: 0,
  target: -1,      // index in NOTES of the note the player has to place
  landedIndex: -1, // index of the rung the note landed on (-1 = between rungs)
  hit: false,
  score: 0
};
state.armAngle = cockedAngle(state.power);

let lastNow = performance.now();
let audioCtx = null;


// ---- Helpers ---------------------------------------------------------------
function rungY(i) {
  return RUNG_Y0 - RUNG_GAP * i;
}

function hitY(i) {
  return rungY(i) - NOTE_LIFT;
}

// Arrival height at the ladder for a given strength (0-100).
function reachForPower(p) {
  return REACH_LOW + (REACH_HIGH - REACH_LOW) * (p / 100);
}

// Arm angle (radians, positive = leaning back) for a given strength.
function cockedAngle(p) {
  return (10 + 50 * (p / 100)) * Math.PI / 180;
}

// Which rung is the given height close enough to? -1 when it is between rungs.
function rungAt(y) {
  for (let i = 0; i < NOTES.length; i++) {
    if (Math.abs(y - hitY(i)) <= TOL) return i;
  }
  return -1;
}

// Position of the tip of the cup and of the note lying in it for an arm angle.
function cupGeometry(theta) {
  const dx = -Math.sin(theta);
  const dy = -Math.cos(theta);
  const tipX = PIVOT.x + dx * ARM_LEN;
  const tipY = PIVOT.y + dy * ARM_LEN;
  return {
    dx, dy, tipX, tipY,
    noteX: tipX + dx * NOTE_OFF,
    noteY: tipY + dy * NOTE_OFF
  };
}

// A parabola from the cup to the ladder: y(t) = yA + c * (t - ta)^2, t = 0..1.
// The note always arrives at the ladder while coming down.
function buildTrajectory(x0, y0, yEnd) {
  const yA = Math.min(y0, yEnd) - APEX_CLEARANCE;
  const a = y0 - yA;
  const b = yEnd - yA;
  const r = Math.sqrt(a / b);
  const ta = r / (1 + r);
  const c = b / ((1 - ta) * (1 - ta));
  return { x0, x1: LADDER_X, y0, yEnd, yA, ta, c };
}

function setMessage(text, kind) {
  msgEl.textContent = text;
  msgEl.className = kind ? "message " + kind : "message";
}

function setControlsLocked(locked) {
  slider.disabled = locked;
  launchBtn.disabled = locked;
}

function nextNote() {
  let i;
  do {
    i = Math.floor(Math.random() * NOTES.length);
  } while (i === state.target && NOTES.length > 1);
  state.target = i;
  targetNameEl.textContent = NOTES[i].name;
}

// Update the (hidden) code values from the strength, using the same formulas
// as the original lever game so the codes stay compatible.
function updateCode() {
  const pivotPct = CODE_PIVOT_MAX - (CODE_PIVOT_MAX - CODE_PIVOT_MIN) * (state.power / 100);
  const pivotX = CODE_LEFT + (CODE_RIGHT - CODE_LEFT) * (pivotPct / 100);

  const arm1 = pivotX - CODE_LEFT;
  const arm2 = CODE_RIGHT - pivotX;
  const ratio = arm1 / arm2;

  document.getElementById("d1").textContent =
    Math.max(1, Math.min(9, Math.round(ratio * 3)));
  document.getElementById("d2").textContent = Math.round(arm1 / 50);
  document.getElementById("d3").textContent = Math.round(arm2 / 50);
}


// ---- Sound -----------------------------------------------------------------
// The audio context has to be created/resumed from a user action (the launch click).
function ensureAudio() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  } catch (e) {
    audioCtx = null;
  }
}

// A soft, bell-like tone: a triangle wave plus a quiet octave above it.
function playTone(freq) {
  if (!audioCtx) return;
  try {
    const t = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    master.connect(audioCtx.destination);

    [[freq, "triangle", 1], [freq * 2, "sine", 0.25]].forEach(([f, type, level]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      gain.gain.value = level;
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 1.7);
    });
  } catch (e) {
    // Sound is optional; ignore failures.
  }
}


// ---- Game flow -------------------------------------------------------------
function launch() {
  if (state.phase !== "idle") return;

  ensureAudio();
  setControlsLocked(true);
  setMessage("", "");

  state.phase = "swing";
  state.t0 = performance.now();
  state.swingFrom = state.armAngle;
}

function startFlight(now) {
  const start = cupGeometry(RELEASE_ANGLE);
  state.traj = buildTrajectory(start.noteX, start.noteY, reachForPower(state.power));
  state.noteX = start.noteX;
  state.noteY = start.noteY;
  state.phase = "flight";
  state.t0 = now;
}

function land(now) {
  const tr = state.traj;
  const target = NOTES[state.target];

  state.noteX = tr.x1;
  state.noteY = tr.yEnd;
  state.landedIndex = rungAt(tr.yEnd);
  state.hit = state.landedIndex === state.target;
  state.phase = "settle";
  state.t0 = now;

  if (state.hit) {
    state.score++;
    scoreEl.textContent = state.score;
    setMessage("Raak! Dat is " + target.name + ".", "hit");
    playTone(target.freq);
  } else {
    // The note landed lower than the target rung -> it needs more strength.
    const needs = tr.yEnd > hitY(state.target) ? "meer" : "minder";
    if (state.landedIndex >= 0) {
      setMessage(
        "Dat was " + NOTES[state.landedIndex].name + ", niet " + target.name +
        ". Geef " + needs + " kracht.",
        "miss"
      );
    } else {
      setMessage("Mis! Geef " + needs + " kracht.", "miss");
    }
  }
}

function endSettle() {
  if (state.hit) nextNote();
  state.phase = "idle";
  setControlsLocked(false);
}

function resetGame() {
  state.phase = "idle";
  state.power = 30;
  slider.value = 30;
  strengthPctEl.textContent = "30%";
  state.score = 0;
  scoreEl.textContent = "0";
  setMessage("", "");
  setControlsLocked(false);
  nextNote();
  updateCode();
}


// ---- Per-frame update ------------------------------------------------------
function update(now, dt) {
  switch (state.phase) {
    case "idle": {
      // The arm follows the strength slider smoothly.
      const goal = cockedAngle(state.power);
      state.armAngle += (goal - state.armAngle) * (1 - Math.exp(-dt / 80));
      break;
    }
    case "swing": {
      const t = Math.min(1, (now - state.t0) / SWING_MS);
      state.armAngle = state.swingFrom + (RELEASE_ANGLE - state.swingFrom) * t * t;
      if (t >= 1) startFlight(now);
      break;
    }
    case "flight": {
      const t = Math.min(1, (now - state.t0) / FLIGHT_MS);
      const tr = state.traj;
      state.noteX = tr.x0 + (tr.x1 - tr.x0) * t;
      state.noteY = tr.yA + tr.c * (t - tr.ta) * (t - tr.ta);
      if (t >= 1) land(now);
      break;
    }
    case "settle": {
      const hold = state.hit ? HIT_HOLD_MS : MISS_HOLD_MS;
      if (now - state.t0 >= hold) endSettle();
      break;
    }
  }
}


// ---- Drawing ---------------------------------------------------------------
// A quarter note: the head sits at (x, y), the stem points up.
function drawNote(x, y, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  ctx.translate(x, y);
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#111";
  ctx.fillStyle = color;

  // Stem and flag.
  ctx.beginPath();
  ctx.moveTo(6.4, -1);
  ctx.lineTo(6.4, -28);
  ctx.quadraticCurveTo(16, -23, 13, -12);
  ctx.stroke();

  // Head.
  ctx.beginPath();
  ctx.ellipse(0, 0, 7.5, 5.5, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawGround() {
  ctx.save();
  ctx.strokeStyle = "#cbd5e1";
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(SPACE_W, GROUND_Y);
  ctx.stroke();
  ctx.restore();
}

function drawLadder(now) {
  ctx.save();

  // Light up the rung that was hit.
  if (state.phase === "settle" && state.hit && state.landedIndex >= 0) {
    const y = rungY(state.landedIndex);
    ctx.fillStyle = NOTES[state.landedIndex].color + "40";
    ctx.fillRect(LADDER_X - LADDER_HALF - 10, y - 20, LADDER_HALF * 2 + 20, 40);
  }

  // Rails.
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  [LADDER_X - LADDER_HALF, LADDER_X + LADDER_HALF].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x, LADDER_TOP);
    ctx.stroke();
  });

  // Rungs and their names.
  ctx.lineCap = "butt";
  ctx.font = "700 20px " + FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  NOTES.forEach((n, i) => {
    const y = rungY(i);
    ctx.strokeStyle = n.color;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(LADDER_X - LADDER_HALF, y);
    ctx.lineTo(LADDER_X + LADDER_HALF, y);
    ctx.stroke();

    ctx.fillStyle = "#111";
    ctx.fillText(n.name, LADDER_X + LADDER_HALF + 14, y);
  });

  ctx.restore();
}

function drawCatapult() {
  const g = cupGeometry(state.armAngle);
  const tailX = PIVOT.x - g.dx * TAIL_LEN;
  const tailY = PIVOT.y - g.dy * TAIL_LEN;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#111";

  // Wheels.
  ctx.fillStyle = "#fff";
  ctx.lineWidth = 4;
  [PIVOT.x - 38, PIVOT.x + 38].forEach((wx) => {
    ctx.beginPath();
    ctx.arc(wx, GROUND_Y - 9, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Base beam.
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(PIVOT.x - 58, GROUND_Y - 22);
  ctx.lineTo(PIVOT.x + 58, GROUND_Y - 22);
  ctx.stroke();

  // Support under the pivot.
  ctx.fillStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PIVOT.x, PIVOT.y - 6);
  ctx.lineTo(PIVOT.x + 20, GROUND_Y - 26);
  ctx.lineTo(PIVOT.x - 20, GROUND_Y - 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Throwing arm.
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(g.tipX, g.tipY);
  ctx.stroke();

  // Counterweight.
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(tailX, tailY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Cup at the end of the arm.
  ctx.save();
  ctx.translate(g.tipX, g.tipY);
  ctx.rotate(-state.armAngle);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -10, 10, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  // Pivot pin.
  ctx.fillStyle = "#ffd700";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(PIVOT.x, PIVOT.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // The note waiting in the cup.
  if (state.phase === "idle" || state.phase === "swing") {
    drawNote(g.noteX, g.noteY, NOTES[state.target].color);
  }
}

function drawFlyingNote(now) {
  if (state.phase !== "flight" && state.phase !== "settle") return;

  const note = NOTES[state.target];
  let alpha = 1;

  if (state.phase === "settle") {
    const elapsed = now - state.t0;

    // A ring that spreads out from the landing spot.
    const t = Math.min(1, elapsed / 500);
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.strokeStyle = state.hit ? note.color : "#94a3b8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(state.noteX, state.noteY, 8 + 26 * t, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // A missed note fades away before the next try.
    if (!state.hit) {
      alpha = Math.max(0, Math.min(1, 1 - (elapsed - 500) / 500));
    }
  }

  drawNote(state.noteX, state.noteY, note.color, alpha);
}

// Card in the corner that shows which note the player has to place.
function drawBadge() {
  const note = NOTES[state.target];
  if (!note) return;

  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2.5;
  ctx.fillRect(12, 10, 116, 64);
  ctx.strokeRect(12, 10, 116, 64);

  ctx.fillStyle = "#111";
  ctx.font = "600 18px " + FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("De noot:", 22, 27);

  drawNote(34, 60, note.color);

  ctx.fillStyle = "#111";
  ctx.font = "700 30px " + FONT;
  ctx.textBaseline = "middle";
  ctx.fillText(note.name, 62, 52);
  ctx.restore();
}

function draw(now) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Scale the logical space so it fits the real canvas, and centre it.
  const scale = Math.min(canvas.width / SPACE_W, canvas.height / SPACE_H);
  const offX = (canvas.width - SPACE_W * scale) / 2;
  const offY = (canvas.height - SPACE_H * scale) / 2;
  ctx.setTransform(scale, 0, 0, scale, offX, offY);

  drawGround();
  drawLadder(now);
  drawCatapult();
  drawFlyingNote(now);
  drawBadge();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}


// ---- Main loop and events --------------------------------------------------
function frame(now) {
  const dt = Math.min(64, now - lastNow);
  lastNow = now;
  update(now, dt);
  draw(now);
  requestAnimationFrame(frame);
}

// Match the canvas resolution to its displayed size (sharp on high-DPI screens).
function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  draw(lastNow);
}

slider.addEventListener("input", () => {
  state.power = Number(slider.value);
  strengthPctEl.textContent = state.power + "%";
  updateCode();
});

launchBtn.addEventListener("click", launch);
resetBtn.addEventListener("click", resetGame);
window.addEventListener("resize", resize);


// ---- Start -----------------------------------------------------------------
nextNote();
updateCode();
resize();
requestAnimationFrame(frame);