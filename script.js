const navButtons = document.querySelectorAll(".nav button");
const pages = document.querySelectorAll(".page");

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");

    pages.forEach(page => page.classList.remove("active"));
    const target = document.getElementById(button.dataset.page);
    if (target) target.classList.add("active");
  });
});


// ===============================
// SLEEP TRACKER + TIMER
// ===============================
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const trackingText = document.getElementById("trackingText");
const sleepTimer = document.getElementById("sleepTimer");

let timerInterval = null;
let startTime = null;

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

if (startBtn && stopBtn) {
  startBtn.addEventListener("click", () => {
    trackingText.textContent = "Tracking started... Sleep well 🌙";
    startBtn.disabled = true;
    stopBtn.disabled = false;

    startTime = Date.now();
    sleepTimer.textContent = "00:00:00";

    timerInterval = setInterval(() => {
      sleepTimer.textContent = formatTime(Date.now() - startTime);
    }, 1000);
  });

  stopBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    trackingText.textContent =
      'Tracking stopped ✅ Press "Start Tracking Sleep" when ready again.';
  });
}


// ===============================
// SLEEP HISTORY (LOCAL STORAGE)
// ===============================
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("sleepHistory")) || [];
  const list = document.getElementById("historyList");
  if (!list) return;

  list.innerHTML = "";

  if (history.length === 0) {
    list.innerHTML = `<p class="card-text">No sleep history yet 🌙</p>`;
    return;
  }

  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `<div>${item.date}</div><span>${item.hours} hrs</span>`;
    list.appendChild(div);
  });
}

function addSleep() {
  const date = document.getElementById("sleepDate").value;
  const hours = document.getElementById("sleepHours").value;
  if (!date || !hours) return alert("Enter date and hours");

  const history = JSON.parse(localStorage.getItem("sleepHistory")) || [];
  history.unshift({ date, hours });
  localStorage.setItem("sleepHistory", JSON.stringify(history));

  document.getElementById("sleepDate").value = "";
  document.getElementById("sleepHours").value = "";
  loadHistory();
}

function clearHistory() {
  localStorage.removeItem("sleepHistory");
  loadHistory();
}

window.addEventListener("load", loadHistory);


// ===============================
// SOUNDSCAPES (FULLY FIXED)
// ===============================
const soundItems = document.querySelectorAll(".sound-item");
const stopMusicBtn = document.getElementById("stopMusicBtn");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");

let audioCtx = null;
let gainNode = null;
let activeNodes = [];

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;
    gainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function stopAllSounds() {
  activeNodes.forEach(node => {
    try { node.stop(); node.disconnect(); } catch {}
  });
  activeNodes = [];
  stopMusicBtn.disabled = true;
}

function createNoise() {
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function playSound(type) {
  initAudio();
  stopAllSounds();

  if (type === "white") {
    const noise = createNoise();
    noise.connect(gainNode);
    noise.start();
    activeNodes.push(noise);
  }

  if (type === "rain") {
    const noise = createNoise();
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();
    activeNodes.push(noise);
  }

  if (type === "ocean") {
    const noise = createNoise();
    const waveGain = audioCtx.createGain();
    waveGain.gain.value = 0.4;

    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.25;

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);
    noise.connect(waveGain);
    waveGain.connect(gainNode);

    noise.start();
    lfo.start();
    activeNodes.push(noise, lfo);
  }

  stopMusicBtn.disabled = false;
}

soundItems.forEach(item => {
  item.addEventListener("click", () => {
    playSound(item.dataset.sound);
  });
});

stopMusicBtn.addEventListener("click", stopAllSounds);

volumeSlider.addEventListener("input", () => {
  const vol = volumeSlider.value / 100;
  volumeValue.textContent = volumeSlider.value + "%";
  if (gainNode) gainNode.gain.value = vol;
});
