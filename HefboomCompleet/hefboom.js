// Get references to the HTML canvas, its drawing context, and the pivot slider.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const slider = document.getElementById("pivotSlider");

// Store the pivot position as a percentage of the beam's length.
// 0% = completely left, 100% = completely right.
let pivotPct = 35;

// Store the currently launched projectile.
// null means that no projectile is currently flying.
let projectile = null;

// Prevent multiple projectiles from being launched at the same time.
let launching = false;


// Resize the canvas to match its displayed size.
function resize () {
  const rect = canvas.getBoundingClientRect();

  // Update the canvas dimensions using its CSS dimensions.
  canvas.height = rect.height;
  canvas.width = rect.width;

  // Redraw the lever using the new canvas dimensions.
  draw();
}


// Calculate the positions of the different parts of the lever system.
function layout() {
  const H = canvas.height;
  const W = canvas.width;

  // Define the left and right ends of the beam.
  const left = 70;
  const right = 430;

  // Place the beam slightly below the vertical center of the canvas.
  const beamY = H*0.55;

  // Calculate the pivot position based on the slider percentage.
  // For example, 35% places the pivot 35% of the way from left to right.
  const pivotX = left+(right-left)*(pivotPct/100);

  // Return all calculated coordinates so they can be used by other functions.
  return {
    W, H, left, right, beamY, pivotX
  };
}


// Update the code values displayed on the screen.
function updateCode() {
  // Get the current positions of the beam and pivot.
  // These values change when the slider is moved.
  const {left,right,pivotX} = layout();

  // Calculate the lengths of the two arms of the lever.
  const arm1 = pivotX-left;
  const arm2 = right-pivotX;

  // Calculate the ratio between the two arm lengths.
  const ratio = arm1/arm2;

  // Update the displayed values.
  // d1 is limited to a value between 1 and 9.
  document.getElementById("d1").textContent =
    Math.max(1,Math.min(9,Math.round(ratio*3)));

  // d2 and d3 display the approximate lengths of the two arms.
  document.getElementById("d2").textContent = Math.round(arm1/50);
  document.getElementById("d3").textContent = Math.round(arm2/50);
}


// Draw an arrow between two points.
function drawArrow(x1,y1,x2,y2,color) {
  // Set the color and thickness of the arrow.
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  // Draw the main line of the arrow.
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();

  // Calculate the angle of the arrow.
  // This is used to rotate the arrowhead so it points in the correct direction.
  const angle = Math.atan2(y2-y1,x2-x1);

  // Draw the arrowhead at the end of the line.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-12*Math.cos(angle-0.4), y2-12*Math.sin(angle-0.4));
  ctx.lineTo(x2-12*Math.cos(angle+0.4), y2-12*Math.sin(angle+0.4));
  ctx.fill();
}


// Draw the entire lever system and any active projectile.
function draw() {

  // Reset the canvas transformation before clearing it.
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Define the size of the coordinate system used for drawing.
  // The actual canvas is scaled to fit this space.
  const spaceWidth = 460;
  const spaceHeight = 260;

  // Calculate a scale that allows the entire drawing to fit inside the canvas.
  const scale = Math.min(
    canvas.width/spaceWidth,
    canvas.height/spaceHeight
  );

  // Center the scaled drawing inside the canvas.
  const spaceX = (canvas.width-spaceWidth*scale)/2;
  const spaceY = (canvas.height-spaceHeight*scale)/2;

  // Apply the scale and position to the drawing context.
  ctx.setTransform(scale,0,0,scale,spaceX,spaceY);

  // Get the current positions of the lever components.
  const {
    W,H,left,right,beamY,pivotX
  } = layout();

  // Clear the drawing area again using the coordinate system above.
  ctx.clearRect(0,0,W,H);

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
  ctx.moveTo(pivotX, beamY-10);
  ctx.lineTo(pivotX+18, beamY+24);
  ctx.lineTo(pivotX-18, beamY+24);
  ctx.fill();

  // Draw the blue projectile at the left end of the beam.
  // It disappears from this position once it has been launched.
  if(!projectile) {
    ctx.fillStyle = "#0091FF";
    ctx.beginPath();
    ctx.arc(left, beamY-16,12,0,Math.PI*2);
    ctx.fill();
  }

  // Draw the two horizontal arrows representing the arm lengths.
  drawArrow(left,beamY-45,pivotX-15,beamY-45,"#00f280"); // arm1
  ctx.fillStyle = "#00f280";
  ctx.font = "20px Montserrat";
  ctx.textAlign = "center";
  ctx.fillText("arm1",(left+pivotX)/2,beamY-55);

  drawArrow(right,beamY-45,pivotX+15,beamY-45,"#ff6800"); // arm2
  ctx.fillStyle = "#ff6800";
  ctx.fillText("arm2",(right+pivotX)/2,beamY-55);

  // Draw the downward force arrow on the left side.
  drawArrow(left,beamY+5,left,beamY+60,"#00f280"); // fz
  ctx.fillStyle = "#00f280";
  ctx.fillText("Fz",left,beamY+88);

  // Draw the downward force arrow on the right side.
  drawArrow(right,beamY+5,right,beamY+60,"#ff6800"); // fspier
  ctx.fillStyle = "#ff6800";
  ctx.fillText("Fspier",right,beamY+88);

  // If a projectile has been launched, calculate and draw its current position.
  if(projectile) {

    // Calculate how many seconds have passed since the projectile was launched.
    const age = (Date.now()-projectile.t0)/1000;

    // Calculate the projectile's current horizontal position.
    // vx is its horizontal velocity.
    const x = projectile.x0+projectile.vx*age;

    // Calculate the projectile's current vertical position.
    // vy is its initial vertical velocity.
    // 350*age*age simulates the effect of gravity.
    const y = projectile.y0+projectile.vy*age+350*age*age;

    // Draw the projectile as an orange circle.
    ctx.fillStyle = "#ff6800";
    ctx.beginPath();
    ctx.arc(x,y,12,0,Math.PI*2);
    ctx.fill();

    // Once the projectile has fallen far enough below the canvas,
    // remove it and allow the user to launch another one.
    if(y > H+100) {
      projectile = null;
      launching = false;

      document.getElementById("launchBtn").disabled = false;
    }
  }

  // Update the displayed code values using the current pivot position.
  updateCode();

  // Reset the transformation so future canvas operations are not affected.
  ctx.setTransform(1,0,0,1,0,0);
}


// Launch the projectile from the left side of the beam.
function launch() {

  // Stop the function if a projectile is already being launched.
  if (launching) return;

  // Mark the launch as active.
  launching = true;

  // Disable the launch button until the projectile has finished flying.
  document.getElementById("launchBtn").disabled = true;

  // Get the current lever positions.
  const {left,beamY,pivotX,right} = layout();

  // Calculate the lengths of the two arms.
  const arm1 = pivotX-left;
  const arm2 = right-pivotX;

  // Calculate the launch ratio.
  // A shorter arm1 results in a higher ratio.
  const ratio = arm2/Math.max(arm1,1);

  // Calculate the projectile's launch speed based on the ratio.
  const speed=140+ratio*120;

  // Create the projectile object.
  // x0 and y0 are its starting coordinates.
  // vx and vy are its horizontal and vertical velocities.
  // t0 stores the time at which the projectile was launched.
  projectile = {
    x0:left,
    y0:beamY-16,
    vx:speed,
    vy:-speed*0.8,
    t0:Date.now()
  };

  // Start the animation loop.
  animate();
}


// Continuously redraw the canvas while the projectile is active.
function animate() {
  // Redraw the lever and projectile at their current positions.
  draw();

  // Continue the animation as long as a projectile exists
  // or a launch is still in progress.
  if (projectile || launching) {
    requestAnimationFrame(animate);
  }
}


// Update the pivot position whenever the slider value changes.
slider.addEventListener("input",()=>{

  // Store the new slider value as the pivot percentage.
  pivotPct = slider.value;

  // Update the percentage displayed on the screen.
  document.getElementById("pivotPct").textContent = pivotPct + "%";

  // Redraw the lever with the new pivot position.
  draw();
});


// Launch the projectile when the launch button is clicked.
document.getElementById("launchBtn").addEventListener("click",launch);


// Reset the lever and projectile when the reset button is clicked.
document.getElementById("resetBtn").addEventListener("click",()=>{

  // Remove any active projectile.
  projectile = null;

  // Allow launching again.
  launching = false;

  // Reset the pivot to its default position.
  pivotPct = 35;
  slider.value = 35;

  // Update the displayed percentage.
  document.getElementById("pivotPct").textContent = "35%";

  // Redraw the reset lever.
  draw();
});


// Resize the canvas whenever the browser window changes size.
window.addEventListener("resize",resize);


// Perform the initial canvas setup and draw the lever.
resize();