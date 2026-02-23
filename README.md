# ⏱️ Codeforces Problem Timer

![Preview 2](preview/preview_2.png)

A lightweight, highly integrated Chrome extension built for competitive programmers to track their problem-solving speed directly on [Codeforces](https://codeforces.com).

## ✨ Features

* **Native UI Integration:** Styled precisely to match the classic Codeforces interface. It looks like it belongs there!
* **Smart Auto-Stop:** Automatically pauses the timer the exact moment you click the "Submit" button.
* **Draggable & Pinnable:** Drag the timer anywhere on your screen. Click the 📌 icon to "pin" it to the document so it scrolls seamlessly with the page.
* **100% Persistent & Accurate:** Powered by background timestamps and Chrome Local Storage. You can close the tab, switch windows, or restart your browser—your elapsed time is tracked with absolute precision.
* **Per-Problem Memory:** Remembers your exact time, screen position, and pin preference for every individual problem URL.


## 🛠️ How to Install 
1. **Download:** Click the green **Code** button above and select **Download ZIP**.
2. **Unzip:** Extract the file to a folder on your computer.
3. **Open Chrome:** Go to `chrome://extensions/` in your address bar.
4. **Enable Mode:** Toggle **Developer mode** on in the top right corner.
5. **Load:** Click **Load unpacked** (top left) and select the folder you just unzipped.

## 🖱️ Usage

* **Start / Pause:** Click to begin or halt the timer.
* **Reset:** Clears the time completely for the current problem.
* **Drag:** Click and hold the empty space on the widget to move it around your screen.
* **Pin (📌/📍):** Toggles between floating on your screen (follows you as you scroll) and sticking to the webpage (stays next to the problem text).

## 💻 Tech Stack
* **JavaScript (ES6+)** - Core timer logic, DOM manipulation, and drag-and-drop math.
* **Chrome Extension API** - `chrome.storage.local` for persistent state management.
* **CSS3** - Custom styling to match Codeforces standard UI guidelines.
