// Get references to the HTML canvas, its drawing context, and the pivot slider.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const slider = document.getElementById("pivotSlider");

// ---- Vaste "logische" tekenruimte -----------------------------------------
// Alles wordt getekend in dit vaste coördinatensysteem en daarna geschaald
// naar de werkelijke canvasgrootte. Zo blijft de baan van de muzieknoot
// altijd kloppen, ongeacht het schermformaat.
const SPACE_W = 620;
const SPACE_H = 260;

const LEFT = 70;     // linkerkant van de balk (waar de muzieknoot start)
const RIGHT = 380;   // rechterkant van de balk (waar je op duwt)
const BEAM_Y = SPACE_H * 0.55;
const FLOOR_Y = 226;  // "grond"-lijn waar de muzieknoot kan landen

// Grenzen van de schuifregelaar (moeten overeenkomen met de HTML).
const SLIDER_MIN = 10;
const SLIDER_MAX = 88;

// Hoever de noot landt (in pixels voorbij LEFT) bij de uiterste standen
// van de schuifregelaar. Kleine arm1 (schuifregelaar laag) geeft een grotere
// hefboomverhouding en dus een grotere lanceersnelheid en meer bereik.
const RANGE_AT_MIN = 510; // bij SLIDER_MIN -> landingX = LEFT + 510 = 580
const RANGE_AT_MAX = 340; // bij SLIDER_MAX -> landingX = LEFT + 340 = 410

// Hoe dicht de noot bij het midden van het doel moet landen om te "raken".
const TOL = 20;


// Store the pivot position as a percentage of the beam's length.
// 0% = completely left, 100% = completely right.
let pivotPct = 35;

// Store the currently launched projectile (the musical note).
// null means that no projectile is currently flying.
let projectile = null;

// Prevent multiple projectiles from being launched at the same time.
let launching = false;

// Positie van het doel op de grond (x-coördinaat in de logische ruimte).
let targetX = 0;

// Score van de speler.
// let score = 0;


// Resize the canvas to match its displayed size.
function resize() {
  const rect = canvas.getBoundingClientRect();

  // Update the canvas dimensions using its CSS dimensions.
  canvas.height = rect.height;
  canvas.width = rect.width;

  // Redraw the lever using the new canvas dimensions.
  draw();
}


// Calculate the positions of the different parts of the lever system
// for a given pivot percentage, in the fixed logical coordinate space.
function layout(p = pivotPct) {
  const pivotX = LEFT + (RIGHT - LEFT) * (p / 100);

  return {
    left: LEFT,
    right: RIGHT,
    beamY: BEAM_Y,
    floorY: FLOOR_Y,
    pivotX
  };
}


// Bereken hoe ver (voorbij LEFT) de noot landt voor een bepaalde
// draaipunt-percentage. Dit is een eenvoudige, altijd-binnen-het-scherm
// afbeelding: lage schuifregelaarwaarde (kort arm1, lang arm2) => meer kracht
// op de noot => verder bereik.
function rangeForPivot(p) {
  const t = (p - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN);
  return RANGE_AT_MIN + (RANGE_AT_MAX - RANGE_AT_MIN) * t;
}

function landingXForPivot(p) {
  return LEFT + rangeForPivot(p);
}


// Kies een nieuwe, willekeurige positie voor het doel.
// De grenzen liggen ruim binnen het bereik dat met de schuifregelaar
// haalbaar is, zodat elk doel altijd te raken is.
function newTarget() {
  const min = 425;
  const max = 565;
  targetX = min + Math.random() * (max - min);
}


// Update the code values displayed on the screen.
function updateCode() {
  const { left, right, pivotX } = layout();

  // Calculate the lengths of the two arms of the lever.
  const arm1 = pivotX - left;
  const arm2 = right - pivotX;

  // Calculate the ratio between the two arm lengths.
  const ratio = arm1 / arm2;

  document.getElementById("d1").textContent =
    Math.max(1, Math.min(9, Math.round(ratio * 3)));

  document.getElementById("d2").textContent = Math.round(arm1 / 50);
  document.getElementById("d3").textContent = Math.round(arm2 / 50);
}


// Draw an arrow between two points.
function drawArrow(x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const angle = Math.atan2(y2 - y1, x2 - x1);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 12 * Math.cos(angle - 0.4), y2 - 12 * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - 12 * Math.cos(angle + 0.4), y2 - 12 * Math.sin(angle + 0.4));
  ctx.fill();
}


// Draw a musical note at the given logical coordinates.
function drawNote(x, y) {
  ctx.save();
  ctx.font = "26px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎵", x, y);
  ctx.restore();
}


// Draw the target (doel) on the ground.
function drawTarget(floorY) {
  ctx.save();

  // Gestippelde "vangzone" zodat kinderen zien hoeveel marge er is.
  ctx.strokeStyle = "#94a3b8";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(targetX, floorY, TOL, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = "30px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎯", targetX, floorY - 22);

  ctx.restore();
}


// Draw the entire lever system, the target, and any active projectile.
function draw() {

  // Reset the canvas transformation before clearing it.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate a scale that allows the entire logical drawing space to fit
  // inside the real canvas, and center it.
  const scale = Math.min(
    canvas.width / SPACE_W,
    canvas.height / SPACE_H
  );
  const offX = (canvas.width - SPACE_W * scale) / 2;
  const offY = (canvas.height - SPACE_H * scale) / 2;

  ctx.setTransform(scale, 0, 0, scale, offX, offY);

  const { left, right, beamY, floorY, pivotX } = layout();

  // Grond-lijn.
  ctx.save();
  ctx.strokeStyle = "#cbd5e1";
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(SPACE_W, floorY);
  ctx.stroke();
  ctx.restore();

  // Draw the main beam.
  ctx.strokeStyle = "black";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(left, beamY);
  ctx.lineTo(right, beamY);
  ctx.stroke();

  // Draw the triangular pivot underneath the beam.
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.moveTo(pivotX, beamY - 10);
  ctx.lineTo(pivotX + 18, beamY + 24);
  ctx.lineTo(pivotX - 18, beamY + 24);
  ctx.fill();

  // Draw a small "catapult cup" and the musical note waiting to be launched.
  // It disappears from this position once it has been launched.
  if (!projectile) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(left, beamY - 4, 10, 0, Math.PI, false);
    ctx.stroke();

    drawNote(left, beamY - 18);
  }

  // Draw the two horizontal arrows representing the arm lengths.
  drawArrow(left, beamY - 45, pivotX - 15, beamY - 45, "#00f280"); // arm1
  ctx.fillStyle = "#00f280";
  ctx.font = "20px Montserrat";
  ctx.textAlign = "center";
  ctx.fillText("arm1", (left + pivotX) / 2, beamY - 55);

  drawArrow(right, beamY - 45, pivotX + 15, beamY - 45, "#ff6800"); // arm2
  ctx.fillStyle = "#ff6800";
  ctx.fillText("arm2", (right + pivotX) / 2, beamY - 55);

  // Draw the downward force arrow on the left side.
  drawArrow(left, beamY + 5, left, beamY + 45, "#00f280"); // Fz
  ctx.fillStyle = "#00f280";
  ctx.fillText("Fz", left, beamY + 65);

  // Draw the downward force arrow on the right side.
  drawArrow(right, beamY + 5, right, beamY + 45, "#ff6800"); // Fspier
  ctx.fillStyle = "#ff6800";
  ctx.fillText("Fspier", right, beamY + 65);

  // Draw the target.
  drawTarget(floorY);

  // If a projectile has been launched, calculate and draw its current position.
  if (projectile) {
    const now = Date.now();
    let t = (now - projectile.t0) / projectile.T;
    if (t > 1) t = 1;

    // Simple, controlled parabolic arc from the catapult to the landing point.
    const x = projectile.x0 + (projectile.xEnd - projectile.x0) * t;
    const y = projectile.y0 + (floorY - projectile.y0) * t
      - projectile.peak * 4 * t * (1 - t);

    drawNote(x, y);

    // Once the flight is finished, check whether the note hit the target.
    if (t >= 1) {
      const xEnd = projectile.xEnd;
      projectile = null;
      finalize(xEnd);
    }
  }

  // Update the displayed code values using the current pivot position.
  updateCode();

  // Reset the transformation so future canvas operations are not affected.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}


// Handle the end of a flight: check for a hit, update score/message,
// and (on a hit) set up a fresh target after a short pause.
function finalize(xEnd) {
  const msgEl = document.getElementById("message");
  const hit = Math.abs(xEnd - targetX) <= TOL;

  if (hit) {
    score++;
    document.getElementById("score").textContent = score;
    msgEl.textContent = "🎉 Raak! Goed gedaan.";
    msgEl.className = "message hit";

    setTimeout(() => {
      newTarget();
      msgEl.textContent = "";
      msgEl.className = "message";
      draw();
    }, 900);
  } else if (xEnd < targetX - TOL) {
    msgEl.textContent = "Te kort! Schuif het draaipunt naar links voor meer bereik.";
    msgEl.className = "message miss";
  } else {
    msgEl.textContent = "Te ver! Schuif het draaipunt naar rechts voor minder bereik.";
    msgEl.className = "message miss";
  }

  launching = false;
  document.getElementById("launchBtn").disabled = false;
}


// Launch the musical note from the left side of the beam.
function launch() {

  // Stop the function if a note is already being launched.
  if (launching) return;

  launching = true;
  document.getElementById("launchBtn").disabled = true;

  const msgEl = document.getElementById("message");
  msgEl.textContent = "";
  msgEl.className = "message";

  const { left, beamY } = layout();

  // Bereken waar de noot gaat landen op basis van de huidige draaipuntstand.
  const xEnd = landingXForPivot(pivotPct);
  const distance = xEnd - left;

  // Vlucht duurt iets langer naarmate de afstand groter is, en de boog
  // is iets hoger, zodat het er altijd natuurlijk uitziet.
  const T = 900 + distance * 1.1;
  const peak = 55 + distance * 0.09;

  projectile = {
    x0: left,
    y0: beamY - 16,
    xEnd,
    t0: Date.now(),
    T,
    peak
  };

  animate();
}


// Continuously redraw the canvas while the note is flying.
function animate() {
  draw();

  if (projectile || launching) {
    requestAnimationFrame(animate);
  }
}


// Update the pivot position whenever the slider value changes.
slider.addEventListener("input", () => {
  pivotPct = Number(slider.value);

  document.getElementById("pivotPct").textContent = pivotPct + "%";

  draw();
});


// Launch the note when the launch button is clicked.
document.getElementById("launchBtn").addEventListener("click", launch);


// Reset the game when the reset button is clicked.
document.getElementById("resetBtn").addEventListener("click", () => {
  projectile = null;
  launching = false;

  pivotPct = 35;
  slider.value = 35;
  document.getElementById("pivotPct").textContent = "35%";

  score = 0;
  document.getElementById("score").textContent = "0";

  const msgEl = document.getElementById("message");
  msgEl.textContent = "";
  msgEl.className = "message";

  document.getElementById("launchBtn").disabled = false;

  newTarget();
  draw();
});


// Resize the canvas whenever the browser window changes size.
window.addEventListener("resize", resize);


// Perform the initial setup: pick a first target and draw the lever.
newTarget();
resize();