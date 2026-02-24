let videos = [];
let activeFile = null;

let durationMs = 0;
let startMs = 0;
let endMs = 0;

let defaultStartMs = 0;
let defaultEndMs = 0;

const video = document.getElementById("preview");
const startSlider = document.getElementById("startMarker");
const endSlider = document.getElementById("endMarker");
const highlight = document.getElementById("rangeHighlight");

const startDisplay = document.getElementById("startTimeDisplay");
const endDisplay = document.getElementById("endTimeDisplay");

const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Remove after animation
  setTimeout(() => {
    toast.remove();
  }, 3500);
}


function secondsToMs(sec) {
  return Math.round(sec * 1000);
}

function msToSeconds(ms) {
  return (ms / 1000).toFixed(3);
}

async function loadConfig() {
  const res = await fetch("/config");
  const cfg = await res.json();
  defaultStartMs = cfg.defaultStartMs;
  defaultEndMs = cfg.defaultEndMs;
}

async function loadVideos() {
  const res = await fetch("/videos");
  videos = await res.json();

  const grid = document.getElementById("thumbGrid");
  grid.innerHTML = videos
    .map(v => `<img src="${v.thumb}" onclick="selectVideo('${v.file}', this)">`)
    .join("");

  if (videos.length > 0) {
    selectVideo(videos[0].file, grid.querySelector("img"));
  }
}

function selectVideo(file, imgEl) {
  activeFile = file;

  document.querySelectorAll("#thumbGrid img").forEach(i => i.classList.remove("active"));
  imgEl.classList.add("active");

  video.src = `/videos_in/${file}`;

  video.onloadedmetadata = () => {
    durationMs = secondsToMs(video.duration);

    startMs = defaultStartMs;
    endMs = defaultEndMs;  // FIXED: absolute end time

    startSlider.max = durationMs;
    endSlider.max = durationMs;

    updateAll();
    buildRuler(video.duration);
  };
}

function buildRuler(dur) {
  const ruler = document.getElementById("ruler");
  ruler.innerHTML = "";

  for (let t = 0; t <= dur; t += 1) {
    const tick = document.createElement("div");
    tick.classList.add("tick");
    tick.classList.add(t % 5 === 0 ? "big" : "small");
    tick.style.left = (t / dur) * 100 + "%";
    ruler.appendChild(tick);

    if (t % 5 === 0) {
      const label = document.createElement("div");
      label.classList.add("label");
      label.style.left = (t / dur) * 100 + "%";
      label.textContent = t + "s";
      ruler.appendChild(label);
    }
  }
}

function updateHighlight() {
  const left = (startMs / durationMs) * 100;
  const right = (endMs / durationMs) * 100;

  highlight.style.left = left + "%";
  highlight.style.width = (right - left) + "%";
}

function updateAll() {
  if (startMs < 0) startMs = 0;
  if (endMs > durationMs) endMs = durationMs;
  if (endMs <= startMs) endMs = startMs + 10;

  startSlider.value = startMs;
  endSlider.value = endMs;

  startDisplay.textContent = msToSeconds(startMs) + "s";
  endDisplay.textContent = msToSeconds(endMs) + "s";

  startInput.value = msToSeconds(startMs);
  endInput.value = msToSeconds(endMs);

  updateHighlight();
}

/* SLIDERS */
startSlider.addEventListener("input", e => {
  startMs = parseInt(e.target.value);
  updateAll();
  video.currentTime = startMs / 1000;
});

endSlider.addEventListener("input", e => {
  endMs = parseInt(e.target.value);
  updateAll();
  video.currentTime = endMs / 1000;
});

/* NUDGE BUTTONS */
document.querySelectorAll(".nudge").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    const step = parseInt(btn.dataset.step);

    if (target === "start") {
      startMs += step;
      updateAll();
      video.currentTime = startMs / 1000;
    } else {
      endMs += step;
      updateAll();
      video.currentTime = endMs / 1000;
    }
  });
});

/* MANUAL INPUT */
startInput.addEventListener("change", () => {
  startMs = secondsToMs(parseFloat(startInput.value));
  updateAll();
  video.currentTime = startMs / 1000;
});

endInput.addEventListener("change", () => {
  endMs = secondsToMs(parseFloat(endInput.value));
  updateAll();
  video.currentTime = endMs / 1000;
});

/* FRAME TRACKING */
video.addEventListener("timeupdate", () => {
  console.log("Current frame:", video.currentTime.toFixed(3));
});

/* APPLY TRIM */
document.getElementById("apply").addEventListener("click", async () => {
    const reencode = document.getElementById("reencodeCheckbox").checked;

    await fetch("/trim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            file: activeFile,
            startMs,
            endMs,
            reencode
        })
    });

    // alert(`Trimming ${activeFile} from ${msToSeconds(startMs)}s to ${msToSeconds(endMs)}s`);

    showToast("Starting trim…", "info");

    const res = await fetch("/trim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        file: activeFile,
        startMs,
        endMs,
        reencode: document.getElementById("reencodeCheckbox").checked
    })
    });

    const data = await res.json();

    if (data.status === "success") {
    showToast("Trim completed successfully!", "success");
    } else {
    showToast("Trim failed — check server logs.", "error");
    }



});

(async function init() {
  await loadConfig();
  await loadVideos();
})();
