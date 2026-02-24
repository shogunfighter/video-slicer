const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/thumbs", express.static("thumbs"));
app.use("/videos_in", express.static("videos_in"));

const INPUT = "videos_in";
const OUTPUT = "videos_out";
const THUMBS = "thumbs";

const DEFAULT_START_TRIM = 0;
const DEFAULT_END_TRIM = 5.874; // absolute end time

if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT);
if (!fs.existsSync(THUMBS)) fs.mkdirSync(THUMBS);

function generateThumbnails() {
  const files = fs.readdirSync(INPUT).filter(f => f.endsWith(".mp4"));
  files.forEach(file => {
    const inputPath = path.join(INPUT, file);
    const thumbPath = path.join(THUMBS, file.replace(".mp4", ".jpg"));
    if (!fs.existsSync(thumbPath)) {
      exec(`ffmpeg -y -i "${inputPath}" -ss 00:00:01 -vframes 1 "${thumbPath}"`);
    }
  });
}
generateThumbnails();

app.get("/config", (req, res) => {
  res.json({
    defaultStartMs: DEFAULT_START_TRIM * 1000,
    defaultEndMs: DEFAULT_END_TRIM * 1000
  });
});

app.get("/videos", (req, res) => {
  const files = fs.readdirSync(INPUT).filter(f => f.endsWith(".mp4"));
  res.json(files.map(f => ({
    file: f,
    thumb: `/thumbs/${f.replace(".mp4", ".jpg")}`
  })));
});

app.post("/trim", (req, res) => {
  const { file, startMs, endMs, reencode } = req.body;

  const startSec = (startMs / 1000).toFixed(3);
  const endSec = (endMs / 1000).toFixed(3);

  const inputPath = path.join(INPUT, file);
  const outputPath = path.join(OUTPUT, file.replace(".mp4", "_clean.mp4"));

  console.log("\n==============================");
  console.log("🎬 TRIM REQUEST RECEIVED");
  console.log("==============================");
  console.log("File:", file);
  console.log("Start:", startSec, "sec");
  console.log("End:", endSec, "sec");
  console.log("Re‑encode:", reencode ? "YES" : "NO");

  let cmd;

  if (reencode) {
    cmd = `ffmpeg -y -fflags +genpts -i "${inputPath}" -ss ${startSec} -to ${endSec} -c:v libx264 -c:a aac -preset veryfast -crf 18 "${outputPath}"`;
  } else {
    cmd = `ffmpeg -y -i "${inputPath}" -ss ${startSec} -to ${endSec} -c copy "${outputPath}"`;
  }

  console.log("\n🔧 Running FFmpeg command:");
  console.log(cmd);
  console.log("");

  exec(cmd, (error, stdout, stderr) => {
    console.log("📄 FFmpeg STDOUT:");
    console.log(stdout);

    console.log("\n⚠️ FFmpeg STDERR:");
    console.log(stderr);

    if (error) {
      console.log("\n❌ FFmpeg ERROR:");
      console.log(error.message);

      return res.json({
        status: "failed",
        error: error.message,
        stderr
      });
    }

    // Check if output file exists
    if (!fs.existsSync(outputPath)) {
      console.log("\n❌ Output file missing — trim failed.");
      return res.json({
        status: "failed",
        error: "Output file not created",
        stderr
      });
    }

    console.log("\n✅ SUCCESS — Output created:");
    console.log(outputPath);

    res.json({
      status: "success",
      file,
      startSec,
      endSec,
      reencode,
      output: outputPath
    });
  });
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
