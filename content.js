const timerDiv = document.createElement('div');
timerDiv.id = 'cf-timer-container';
timerDiv.innerHTML = `
  <div id="cf-pin-btn" title="Pin/Unpin">📌</div>
  <div id="cf-close-btn" title="Hide Timer (Alt+Shift+T)">✕</div>
  <span id="cf-timer-display">00:00:00</span>
  <button id="cf-start-pause" class="cf-timer-btn">Start</button>
  <button id="cf-reset" class="cf-timer-btn">Reset</button>
`;
document.body.appendChild(timerDiv);

const display = document.getElementById('cf-timer-display');
const pinBtn = document.getElementById('cf-pin-btn');
const closeBtn = document.getElementById('cf-close-btn');
const startBtn = document.getElementById('cf-start-pause');
const problemId = window.location.pathname;

let totalElapsedBeforeCurrentStart = 0;
let startTime = null;
let timerInterval = null;
let isPinned = false;
let isHidden = false; 
let currentLeft = window.innerWidth - 180, currentTop = window.innerHeight - 120;


chrome.storage.local.get([problemId, 'timer_left', 'timer_top', 'is_pinned', 'is_hidden'], (res) => {
    const data = res[problemId] || {};
    totalElapsedBeforeCurrentStart = data.elapsed || 0;
    startTime = data.startTime || null;

    if (res.timer_left !== undefined) currentLeft = res.timer_left;
    if (res.timer_top !== undefined) currentTop = res.timer_top;

    // Restore Pin State
    isPinned = !!res.is_pinned;
    updatePinUI();
    applyPosition();

    // Restore Hidden State
    isHidden = !!res.is_hidden;
    updateVisibilityUI();

    // Restore Time
    if (startTime) {
        startBtn.innerText = 'Pause';
        startTimerInterval();
    } else {
        updateDisplay(totalElapsedBeforeCurrentStart);
    }
});

function updateDisplay(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    display.innerText = `${h}:${m}:${s}`;
}

function startTimerInterval() {
    timerInterval = setInterval(() => {
        const now = Date.now();
        const currentSessionElapsed = Math.floor((now - startTime) / 1000);
        updateDisplay(totalElapsedBeforeCurrentStart + currentSessionElapsed);
    }, 1000);
}

// Visibility Logic 
function updateVisibilityUI() {
    if (isHidden) {
        timerDiv.classList.add('hidden');
    } else {
        timerDiv.classList.remove('hidden');
    }
}

function toggleVisibility() {
    isHidden = !isHidden;
    updateVisibilityUI();
    chrome.storage.local.set({ 'is_hidden': isHidden });
}

// Listen for Close Button Click
closeBtn.addEventListener('click', toggleVisibility);

// Listen for Background Messages (Toolbar click or Keyboard shortcut)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TOGGLE_TIMER") {
        toggleVisibility();
    }
});


// Controls
startBtn.addEventListener('click', () => {
    if (timerInterval) { // Pausing
        clearInterval(timerInterval);
        timerInterval = null;
        const sessionElapsed = Math.floor((Date.now() - startTime) / 1000);
        totalElapsedBeforeCurrentStart += sessionElapsed;
        startTime = null;
        startBtn.innerText = 'Start';
    } else { // Starting
        startTime = Date.now();
        startBtn.innerText = 'Pause';
        startTimerInterval();
    }
    chrome.storage.local.set({ [problemId]: { elapsed: totalElapsedBeforeCurrentStart, startTime: startTime } });
});

document.getElementById('cf-reset').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    totalElapsedBeforeCurrentStart = 0;
    startTime = null;
    updateDisplay(0);
    startBtn.innerText = 'Start';
    chrome.storage.local.set({ [problemId]: { elapsed: 0, startTime: null } });
});

// Position & Pin Helper functions
function applyPosition() {
    timerDiv.style.left = currentLeft + 'px';
    timerDiv.style.top = currentTop + 'px';
    timerDiv.style.position = isPinned ? 'absolute' : 'fixed';
}
function updatePinUI() {
    pinBtn.innerText = isPinned ? '📍' : '📌';
    timerDiv.classList.toggle('pinned', isPinned);
}
pinBtn.addEventListener('click', () => {
    if (!isPinned) { currentTop += window.scrollY; currentLeft += window.scrollX; }
    else { currentTop -= window.scrollY; currentLeft -= window.scrollX; }
    isPinned = !isPinned;
    applyPosition(); updatePinUI();
    chrome.storage.local.set({ is_pinned: isPinned, timer_left: currentLeft, timer_top: currentTop });
});

// 6. Drag Logic
let startX, startY, startL, startT;
let isDragging = false;
timerDiv.addEventListener('mousedown', (e) => {
    if (isPinned || e.target.tagName === 'BUTTON' || e.target.id === 'cf-pin-btn' || e.target.id === 'cf-close-btn') return;
    isDragging = true;
    startX = e.clientX; startY = e.clientY;
    startL = currentLeft; startT = currentTop;
});
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        e.preventDefault();
        currentLeft = startL + (e.clientX - startX);
        currentTop = startT + (e.clientY - startY);
        applyPosition();
    }
});
document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        chrome.storage.local.set({ 'timer_left': currentLeft, 'timer_top': currentTop });
    }
});