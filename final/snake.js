const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const bgImage = new Image();
bgImage.src = 'download.jpg';


let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const SEGMENT_COUNT = 45;
const SEGMENT_LENGTH = 12;
const segments = [];

for (let i = 0; i < SEGMENT_COUNT; i++) {
  segments.push({
    x: mouse.x,
    y: mouse.y,
    angle: 0,
    swing: Math.random() * Math.PI * 2
  });
}

// Optional sound (you must provide "snake.mp3" in the same folder)
const enableSound = true;
let audio = null;
let movementTimer = null;

if (enableSound) {
  audio = new Audio('snake.mp3');

  const clipStart = 1;
  const clipEnd = 5;
  audio.currentTime = clipStart;
  audio.loop = true;
  audio.playing = false;

  // Keep looping the clipped part only
  audio.addEventListener('timeupdate', () => {
    if (audio.currentTime >= clipEnd) {
      audio.currentTime = clipStart;
    }
  });

  document.addEventListener('mousemove', () => {
    if (!audio.playing) {
      audio.currentTime = clipStart;
      audio.play().then(() => {
        audio.playing = true;
      }).catch(err => console.log("Play blocked:", err));
    }

    clearTimeout(movementTimer);
    movementTimer = setTimeout(() => {
      audio.pause();
      audio.currentTime = clipStart;
      audio.playing = false;
    }, 800);
  });

  // Needed for Chrome: must click once to allow audio
  document.addEventListener("click", () => {
    audio.play().then(() => audio.pause());
  }, { once: true });
}


function drawLegs(x, y, angle, swing, index) {
  const legLength = 10 + (index % 2); // alternate length
  const swingOffset = Math.sin(swing) * 0.6;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-legLength, legLength * swingOffset);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(legLength, legLength * -swingOffset);
  ctx.stroke();

  ctx.restore();
}

function drawHead(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Glow
  ctx.shadowColor = 'lime';
  ctx.shadowBlur = 25;

  // Head
  ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Eyes
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(4, -3, 2, 0, Math.PI * 2);
  ctx.arc(4, 3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function animate() {
  // Trail effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let targetX = mouse.x;
  let targetY = mouse.y;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dx = targetX - seg.x;
    const dy = targetY - seg.y;

    seg.angle = Math.atan2(dy, dx);
    seg.x += (targetX - seg.x) * 0.25;
    seg.y += (targetY - seg.y) * 0.25;

    const nextX = seg.x + Math.cos(seg.angle) * SEGMENT_LENGTH;
    const nextY = seg.y + Math.sin(seg.angle) * SEGMENT_LENGTH;

    // Thickness logic
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';

    if (i === 0) {
      drawHead(seg.x, seg.y, seg.angle);
    } else {
      ctx.beginPath();
      ctx.moveTo(seg.x, seg.y);
      ctx.lineTo(nextX, nextY);
      ctx.stroke();
      drawLegs(seg.x, seg.y, seg.angle, seg.swing, i);
    }

    seg.swing += 0.2;
    targetX = seg.x;
    targetY = seg.y;
  }

  requestAnimationFrame(animate);
}

animate();

// Countdown logic
const targetDate = new Date("2027-05-08T00:32:00").getTime();
const countdownEl = document.getElementById("countdown");

function startCountdown() {
  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (distance > 0) {
      countdownEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      clearInterval(timer);
      countdownEl.innerHTML = "Redirecting...";
      window.location.href = "http://localhost:3000"; // Change to your desired URL
    }
  }, 1000);
}

startCountdown();
