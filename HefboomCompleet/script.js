const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const slider = document.getElementById("pivotSlider");

let pivotPct = 35;
let projectile = null;
let launching = false;

function resize () {
  const rect = canvas.getBoundingClientRect();
  canvas.height = rect.height;
  canvas.width = rect.width;
  draw();
}

function layout() {
  const H = canvas.height;
  const W = canvas.width;
  const left = 70;
  const right = 430;
  const beamY = H*0.55;
  const pivotX = left+(right-left)*(pivotPct/100);

  return {
    W, H, left, right, beamY, pivotX
  };
}

function updateCode() {
  const {left,right,pivotX} = layout();
  const arm1 = pivotX-left;
  const arm2 = right-pivotX;
  const ratio = arm1/arm2;

  document.getElementById("d1").textContent = Math.max(1,Math.min(9,Math.round(ratio*3)));
  document.getElementById("d2").textContent = Math.round(arm1/50);
  document.getElementById("d3").textContent = Math.round(arm2/50);
}

function drawArrow(x1,y1,x2,y2,color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();

  const angle = Math.atan2(y2-y1,x2-x1);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x2-12*Math.cos(angle-0.4), y2-12*Math.sin(angle-0.4));
  ctx.lineTo(x2-12*Math.cos(angle+0.4), y2-12*Math.sin(angle+0.4));
  ctx.fill();
}

function draw() {
  const spaceWidth = 500;
  const spaceHeight = 260;
  const scale = Math.min(canvas.width/spaceWidth, canvas.height/spaceHeight);
  const spaceX = (canvas.width-spaceWidth*scale)/2;
  const spaceY = (canvas.height-spaceHeight*scale)/2;
  ctx.setTransform(scale, 0, 0, scale, spaceX, spaceY);

  const {
    W,H,left,right,beamY,pivotX
  } = layout();

  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(left, beamY);
  ctx.lineTo(right, beamY);
  ctx.stroke();
  ctx.fillStyle = "#ff00ff";
  ctx.beginPath();
  ctx.moveTo(pivotX, beamY-10);
  ctx.lineTo(pivotX+18, beamY+24);
  ctx.lineTo(pivotX-18, beamY+24);
  ctx.fill();

  if(!projectile) {
    ctx.fillStyle = "#ff6800";
    ctx.beginPath();
    ctx.arc(left, beamY-16,12,0,Math.PI*2);
    ctx.fill();
  }

  drawArrow(left,beamY-45,pivotX-15,beamY-45,"#00f280"); //arm1
  ctx.fillStyle = "#00f280";
  ctx.font = "20px Montserrat";
  ctx.textAlign = "center";
  ctx.fillText("arm1",(left+pivotX)/2,beamY-55);

  drawArrow(right,beamY-45,pivotX+15,beamY-45,"#ff6800"); //arm2
  ctx.fillStyle = "#ff6800";
  ctx.fillText("arm2",(right+pivotX)/2,beamY-55);

  drawArrow(left,beamY+5,left,beamY+60,"#00f280"); //fspier
  ctx.fillStyle = "#00f280";
  ctx.fillText("Fspier",left,beamY+88);

  drawArrow(right,beamY+5,right,beamY+60,"#ff6800"); //fzwaartekracht
  ctx.fillStyle = "#ff6800";
  ctx.fillText("Fz",right,beamY+88);

  if(projectile) {
    const age = (Date.now()-projectile.t0)/1000;
    const x = projectile.x0+projectile.vx*age;
    const y = projectile.y0+projectile.vy*age+350*age*age;
    
    ctx.fillStyle = "#ff6800";
    ctx.beginPath();
    ctx.arc(x,y,12,0,Math.PI*2);
    ctx.fill();

    if(y > H+100) {
      projectile = null;
      launching = false;

      document.getElementById("launchBtn").disabled = false;
    }
  }
  updateCode();

  ctx.setTransform(1,0,0,1,0,0);
}

function launch(){
  if (launching) return;
  launching = true;

  document.getElementById("launchBtn").disabled = true;

  const {left,beamY,pivotX,right} = layout();
  const arm1 = pivotX-left;
  const arm2 = right-pivotX;
  const ratio = arm1/arm2;
  const speed=140+ratio*120;

  projectile = {x0:left, y0:beamY-16, vx:speed, vy:-speed*0.8, t0:Date.now()};
  animate();
}

function animate() {
  draw();

  if (projectile || launching) {
    requestAnimationFrame(animate);
  }
}

slider.addEventListener("input",()=>{
  pivotPct = slider.value;
  document.getElementById("pivotPct").textContent = pivotPct + "%";
  draw();
});

document.getElementById("launchBtn").addEventListener("click",launch);
document.getElementById("resetBtn").addEventListener("click",()=>{
  projectile = null;
  launching = false;
  pivotPct = 35;
  slider.value = 35;
  document.getElementById("pivotPct").textContent = "35%";
  draw();
});

window.addEventListener("resize",resize);

resize();