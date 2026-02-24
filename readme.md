# 🎬 Video Slicer (Manual UI-Based Video Cutter)

A lightweight, UI-driven tool for manually slicing video files.  
Built with **Node.js**, **HTML**, **CSS**, and **vanilla JavaScript**, this app provides a simple interface for selecting in/out points and exporting clean video segments.

## 🚀 Features
- Manual slicing with UI controls  
- Local video preview with scrubbing  
- Precise segment extraction  
- Simple, extendable project structure  

## 📦 Tech Stack
| Layer | Technology |
|-------|------------|
| Backend | Node.js |
| Frontend | HTML, CSS, JavaScript |
| Processing | ffmpeg (if used) |

## 📁 Project Structure
video-slicer/  
├── package.json  
├── package-lock.json  
├── server.js  
└── public/  
  ├── index.html  
  ├── styles.css  
  └── script.js  

## 🛠️ Installation
git clone https://github.com/shogunfighter/video-slicer.git  
cd video-slicer  
npm install  

If your workflow uses ffmpeg, ensure it is installed and available in your system PATH.

## ▶️ Running the App
npm start  

Then open:  
http://localhost:3000

## 🧩 Usage
1. Launch the app  
2. Load a video file  
3. Mark **start** and **end** points  
4. Click **Slice**  
5. Exported segment will be saved to your output directory  

## 📚 Roadmap Ideas
- Frame-by-frame stepping  
- Multi-segment batch slicing  
- Keyboard shortcuts  
- Export presets  
- Dark mode  

## 🤝 Contributing
Pull requests are welcome.  
For major changes, open an issue first to discuss your ideas.

## 📜 License
MIT License (or specify your preferred license)
