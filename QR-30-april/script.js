// =================================================
// QR 
// =================================================

const qr = qrcode(0, 'M');
qr.addData("index.html");
qr.make();

const size = qr.getModuleCount();
const SCALE = 8;

const base = document.createElement("canvas");
base.width = size*SCALE;
base.height = size*SCALE;

const ctx = base.getContext("2d");

for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    ctx.fillStyle = qr.isDark(r, c) ? "#000" : "#fff";
    ctx.fillRect(c*SCALE, r*SCALE, SCALE, SCALE);
  }
}

const rows = 6;
const cols = 6;
const TOTAL = rows * cols;

const tileW = Math.floor(base.width / cols);
const tileH = Math.floor(base.height / rows);

let tiles = [];

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    let canvas = document.createElement("canvas");
    canvas.width = tileW;
    canvas.height = tileH;

    let cx = canvas.getContext("2d");
    cx.drawImage(base, c*tileW, r*tileH, tileW, tileH, 0, 0, tileW, tileH);

    tiles.push(canvas);
  }
}

const letters = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");

let tileToLetter = {};

function isHoekCell(i) {
  let r = Math.floor(i/cols);
  let c = i%cols;

  return((r<2 && c<2) || (r<2 && c>=cols-2) || (r>=rows-2 && c<2));
}

let letterIndex = 0;

for (let i = 0; i < TOTAL; i++) {
  if (!isHoekCell(i)) {
    tileToLetter[i] = letters[letterIndex++];
  }
}

let dragged = null;
let gridState = Array(TOTAL).fill(null);
let history = [];

function shuffle(arr) {
  return arr
    .map(v => ({v, r: Math.random()}))
    .sort((a,b)=>a.r-b.r)
    .map(x=>x.v)
}

let bankOrder = shuffle([...Array(TOTAL).keys()]);

function fit(canvas) {
  canvas.style.width="100%";
  canvas.style.height="100%";
  canvas.style.display="block";
}

const bank = document.getElementById("alfabet")

function renderBank() {
  bank.innerHTML = "";

  bankOrder.forEach(i=>{
    let d = document.createElement("div");
    d.className = "tile";

    let label = document.createElement("div");

    if(isHoekCell(i)) {
      let r = Math.floor(i/cols);
      let c = i%cols;

      if(r < 2 && c< 2) label.innerText = "hoek1";
      else if(r<2 && c>=cols-2) label.innerText = "hoek2";
      else label.innerText = "hoek3";
    } else {
      label.innerText = tileToLetter[i];
    }

    d.appendChild(label); d.appendChild(tiles[i]);
    d.draggable = true; d.ondragstart = () => {dragged = i;};
    bank.appendChild(d);
  });
}

const grid = document.getElementById("grid");

function renderGrid() {
  grid.innerHTML = "";
  for(let i = 0; i < TOTAL; i++) {
    let cell = document.createElement("div");
    cell.className = "cell";

    if(isHoekCell(i)) {
      let tag = document.createElement("div");
      tag.className = "cornerLabel";

      let r = Math.floor(i/cols);
      let c = i%cols;
      if(r < 2 && c< 2) tag.innerText = "hoek1";
      else if(r<2 && c>=cols-2) tag.innerText = "hoek2";
      else tag.innerText = "hoek3";

      cell.appendChild(tag);
    } else {
      cell.innerText = tileToLetter[i];
    }

    cell.ondragover = (e)=>{
      e.preventDefault();
      cell.classList.add("over");
    };

    cell.ondragleave = ()=>{
      cell.classList.remove("over");
    };

    cell.ondrop = (e)=>{
      e.preventDefault();
      cell.classList.remove("over");
      if(dragged === null) return;

      history.push({cell:i,prev:gridState[i]});
      gridState[i] = dragged;
      dragged = null;

      renderBank();
      renderGrid();
    };

    if(gridState[i] !== null) {
      cell.innerHTML="";
      fit(tiles[gridState[i]]);
      cell.appendChild(tiles[gridState[i]]);
    }

    grid.appendChild(cell);
  }
}

document.getElementById("check").onclick = () => {
  let correct = true;

  for(let i = 0; i < TOTAL; i++) {
    if(gridState[i] !== i) {
      correct = false;
      break;
    }
  }

  const result = document.getElementById("result");

  if(!correct) {
    result.innerText = "Fout, probeer het opnieuw";
  } else {
    result.innerText = "Goed gedaan! De QR-code is correct in elkaar gepuzzeld!";
  }
};

document.getElementById("undo").onclick = ()=> {
  let last = history.pop();
  if(!last) return;

  gridState[last.cell] = last.prev;
  renderBank();
  renderGrid();
};

renderBank();
renderGrid();
