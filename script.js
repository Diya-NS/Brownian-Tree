

const canvas = document.getElementById('dlaCanvas');
const ctx = canvas.getContext('2d');

let grid = null; // Uint8Array for occupancy
let W = 600, H = 600; // canvas dimensions in px
let cellSize = 2; // particle size in pixels
let cols = Math.floor(W / cellSize);
let rows = Math.floor(H / cellSize);
let running = false;
let animationId = null;

// DOM controls
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const perFrameInput = document.getElementById('perFrame');
const particleSizeInput = document.getElementById('particleSize');
const maxStepsInput = document.getElementById('maxSteps');
const canvasSizeSelect = document.getElementById('canvasSize');

function initCanvas(size = 600, pSize = 2){
  W = size; H = size;
  cellSize = Math.max(1, Math.min(6, +pSize));
  cols = Math.floor(W / cellSize);
  rows = Math.floor(H / cellSize);
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  ctx.fillStyle = '#071026';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  grid = new Uint8Array(cols * rows); // 0 = empty, 1 = occupied

  // place seed at center
  const cx = Math.floor(cols/2);
  const cy = Math.floor(rows/2);
  setOccupied(cx, cy);
  drawCell(cx, cy, '#ffffff');
}

function index(x,y){
  return y * cols + x;
}

function inBounds(x,y){
  return x>=0 && x<cols && y>=0 && y<rows;
}

function setOccupied(x,y){
  grid[index(x,y)] = 1;
}

function isOccupied(x,y){
  return grid[index(x,y)] === 1;
}

function drawCell(x,y,color){
  ctx.fillStyle = color;
  ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
}

function spawnParticleOnBoundary(){
  
  const cx = cols/2;
  const cy = rows/2;
  const radius = Math.max(cols, rows) * 0.48; 
  const angle = Math.random() * Math.PI * 2;
  const x = Math.floor(cx + Math.cos(angle) * radius);
  const y = Math.floor(cy + Math.sin(angle) * radius);
  return {x,y};
}

function randomWalkParticle(maxSteps){
  let p = spawnParticleOnBoundary();
  // clamp in bounds
  if(!inBounds(p.x,p.y)){
    p.x = Math.max(0, Math.min(cols-1, p.x));
    p.y = Math.max(0, Math.min(rows-1, p.y));
  }

  for(let step=0; step<maxSteps; step++){
    // check neighbors if adjacent to occupied
    const neighbors = [
      {dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1},
      {dx:1,dy:1},{dx:1,dy:-1},{dx:-1,dy:1},{dx:-1,dy:-1}
    ];
    for(const n of neighbors){
      const nx = p.x + n.dx;
      const ny = p.y + n.dy;
      if(inBounds(nx,ny) && isOccupied(nx,ny)){
        // stick here
        setOccupied(p.x,p.y);

        const cx = cols/2; const cy = rows/2;
        const d = Math.hypot(p.x - cx, p.y - cy);
        const maxd = Math.hypot(cx, cy);
        const t = Math.min(1, d / maxd);
        const r = Math.floor(200 - 180 * t);
        const g = Math.floor(220 - 120 * t);
        const b = Math.floor(255 - 100 * t);
        drawCell(p.x,p.y, `rgb(${r},${g},${b})`);
        return true;
      }
    }


    const dir = Math.floor(Math.random() * 4);
    if(dir === 0) p.x++;
    else if(dir === 1) p.x--;
    else if(dir === 2) p.y++;
    else p.y--;


    if(!inBounds(p.x,p.y)){
      // respawn
      p = spawnParticleOnBoundary();
      if(!inBounds(p.x,p.y)){
        p.x = Math.max(0, Math.min(cols-1, p.x));
        p.y = Math.max(0, Math.min(rows-1, p.y));
      }
    }
  }
 
  return false;
}

function step(){
  const perFrame = Math.max(1, +perFrameInput.value);
  const maxSteps = Math.max(100, +maxStepsInput.value);
  let stuck = 0;
  for(let i=0;i<perFrame;i++){
    if(randomWalkParticle(maxSteps)) stuck++;
  }

  if(running) animationId = requestAnimationFrame(step);
}


startBtn.addEventListener('click', ()=>{
  if(running) return;
  running = true;
  animationId = requestAnimationFrame(step);
});

pauseBtn.addEventListener('click', ()=>{
  running = false;
  if(animationId) cancelAnimationFrame(animationId);
  animationId = null;
});

resetBtn.addEventListener('click', ()=>{
  running = false;
  if(animationId) cancelAnimationFrame(animationId);
  animationId = null;
  initCanvas(+canvasSizeSelect.value, +particleSizeInput.value);
});

canvasSizeSelect.addEventListener('change', ()=>{
  initCanvas(+canvasSizeSelect.value, +particleSizeInput.value);
});
particleSizeInput.addEventListener('change', ()=>{
  initCanvas(+canvasSizeSelect.value, +particleSizeInput.value);
});

// initialize default
initCanvas(600, 2);
