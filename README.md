# 🌸 Zen Voxel Rain

> A tranquil, aesthetic typing sanctuary built with Vanilla JS and Three.js.

![Zen Voxel Rain](https://img.shields.io/badge/Status-Complete-success?style=for-the-badge) ![Tech Stack](https://img.shields.io/badge/Tech-Three.js_|_Web_Audio_API-blue?style=for-the-badge)

Zen Voxel Rain is a relaxing, vibe-coded typing game designed to help you unwind while practicing your keyboard skills. It features a lush, low-poly 3D environment, dynamic particle effects, and a fully procedural Web Audio API synthesizer that generates lo-fi ambient chord progressions as you type.

## ✨ Features

- **3D Voxel Aesthetic**: A beautifully rendered low-poly island, water lilies, and a pastel skybox built in Three.js.
- **Procedural Ambient Audio**: A custom-built Web Audio API engine that generates infinite, relaxing lo-fi chord progressions—no external MP3s needed!
- **Dynamic Typing Mechanics**: Words rain from the sky in 3D space and are seamlessly projected onto a responsive HTML/CSS glassmorphism overlay.
- **Particle Effects**: Satisfying golden sparks when you complete a word, and water ripples when you miss one.
- **Zero Build Tools**: 100% Vanilla JavaScript, HTML, and CSS. No Webpack, no Babel, no node_modules.

## 🚀 How to Play

Because the game uses ES6 features and the Web Audio API, you need to run it through a local web server (opening the `index.html` directly via `file://` may be blocked by browser CORS/Autoplay policies).

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/zen-voxel-rain.git
   cd zen-voxel-rain
   ```
2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```
4. Click **Enter Sanctuary** and start typing!

## 🛠️ Architecture

* `index.html`: The core document structure and glassmorphism UI overlays.
* `styles.css`: Styling, transitions, and text-shadow typography.
* `game_graphics.js`: The Three.js engine. Handles lighting, geometry, particle systems (sparks & rain), and 3D-to-2D projection mapping.
* `game_logic.js`: The typing loop. Handles physics, word tracking, keyboard events, and HUD updates.
* `audio.js`: The algorithmic Web Audio synthesizer.
* `words.js`: The categorized word dictionary.

## 🎮 Gameplay Mechanics

- Type the falling words before they hit the pond.
- Successfully typing a word earns points, increases your WPM (Words Per Minute), and triggers a soothing chime and spark effect.
- Letting a word hit the water triggers a failure splash, a deep splop sound, and damages your pond's "stability".
- If stability reaches zero, your zen is broken and the session ends.

## 🤝 Contributing

Feel free to fork this project and add new low-poly assets, more complex typing modes, or even new procedurally generated audio scales!


<!-- Docs reviewed and formatted -->
