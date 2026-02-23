// Create the UI
const timerDiv = document.createElement('div');
timerDiv.id = 'cf-timer-container';
timerDiv.innerHTML = `
  <div id="cf-pin-btn" title="Pin/Unpin Timer">📌</div>
  <span id="cf-timer-display">00:00:00</span>
  <button id="cf-start-pause" class="cf-timer-btn">Start</button>
  <button id="cf-reset" class="cf-timer-btn">Reset</button>
`;
document.body.appendChild(timerDiv);

let seconds = 0;
let timerInterval = null;
const display = document.getElementById('cf-timer-display');
const pinBtn = document.getElementById('cf-pin-btn');
const problemId = window.location.pathname;

// --- STATE VARIABLES ---
let isDragging = false;
let isPinned = false;

// Default starting position (Bottom Right)
let currentLeft = window.innerWidth - 180;
let currentTop = window.innerHeight - 120;
let startX, startY, startLeft, startTop;

// Load saved data
chrome.storage.local.get([problemId, 'timer_left', 'timer_top', 'is_pinned'], (result) => {
    if (result[problemId]) {
        seconds = result[problemId];
        updateDisplay();
    }
    if (result.timer_left !== undefined) currentLeft = result.timer_left;
    if (result.timer_top !== undefined) currentTop = result.timer_top;
    if (result.is_pinned !== undefined) isPinned = result.is_pinned;

    applyPosition();
    updatePinUI();
});

function updateDisplay() {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    display.innerText = `${h}:${m}:${s}`;
}

// Applies exact pixel coordinates and position type
function applyPosition() {
    timerDiv.style.left = currentLeft + 'px';
    timerDiv.style.top = currentTop + 'px';
    // If pinned, stick to document. If unpinned, float on screen.
    timerDiv.style.position = isPinned ? 'absolute' : 'fixed';
}

// --- PIN LOGIC ---
function updatePinUI() {
    if (isPinned) {
        pinBtn.innerText = '📍';
        pinBtn.style.opacity = '1';
        timerDiv.classList.add('pinned');
    } else {
        pinBtn.innerText = '📌';
        pinBtn.style.opacity = '0.5';
        timerDiv.classList.remove('pinned');
    }
}

pinBtn.addEventListener('click', () => {
    if (!isPinned) {
        // Switching to Pinned: Add scroll offsets so it glues to the document
        currentTop += window.scrollY;
        currentLeft += window.scrollX;
    } else {
        // Switching to Unpinned: Subtract scroll offsets so it floats on camera view
        currentTop -= window.scrollY;
        currentLeft -= window.scrollX;
    }

    isPinned = !isPinned;
    applyPosition();
    updatePinUI();

    chrome.storage.local.set({
        'is_pinned': isPinned,
        'timer_left': currentLeft,
        'timer_top': currentTop
    });
});

// 3. Button Logic
document.getElementById('cf-start-pause').addEventListener('click', (e) => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        e.target.innerText = 'Start';
    } else {
        e.target.innerText = 'Pause';
        timerInterval = setInterval(() => {
            seconds++;
            updateDisplay();
            chrome.storage.local.set({ [problemId]: seconds });
        }, 1000);
    }
});

document.getElementById('cf-reset').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    seconds = 0;
    updateDisplay();
    document.getElementById('cf-start-pause').innerText = 'Start';
    chrome.storage.local.set({ [problemId]: 0 });
});

// 4. Auto-stop on submit
document.addEventListener('click', (e) => {
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'submit') {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            document.getElementById('cf-start-pause').innerText = 'Start';
            chrome.storage.local.set({ [problemId]: seconds });
        }
    }
});

// 5. Drag Logic (Now uses exact pixel math)
timerDiv.addEventListener('mousedown', (e) => {
    if (isPinned || e.target.tagName === 'BUTTON' || e.target.id === 'cf-pin-btn') return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = currentLeft;
    startTop = currentTop;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        e.preventDefault();
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;

        currentLeft = startLeft + dx;
        currentTop = startTop + dy;
        applyPosition();
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        chrome.storage.local.set({ 'timer_left': currentLeft, 'timer_top': currentTop });
    }
});