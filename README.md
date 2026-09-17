# The Large-Format Camera (65mm 15-Perforation)

An interactive, scroll-driven 3D web experience showcasing the precision mechanics, acoustics, and optics of a 65mm 15-perforation cinema camera.

Built entirely in code with procedural geometry, custom canvas-generated physical textures, a procedural post-processing pipeline, and a real-time Web Audio API mechanical sound synthesizer—with zero imported 3D model files (no OBJ/GLTF/FBX) or external image/audio assets.

---

## Overview

Large-format 65mm 15-perforation celluloid represents the pinnacle of photochemical cinema. With an aperture area roughly 10 times larger than standard 35mm film, a massive 1,000-foot magazine runs through the gate horizontally at 5.6 feet per second—running out in just three minutes.

This interactive demonstration breaks down the mechanics, optical pathways, and acoustic engineering behind this legendary format across seven scroll-driven chapters:

1. **Hero Reveal**: Continuous 360-degree rotation of the carbon-fiber and magnesium chassis, 65mm T1.4 cinema prime lens, matte box, and dual-drum magazine.
2. **The Format**: Visualizing the 15-perf 70mm horizontal pull-down transport, negative gate area ($70.4 \times 48.5\text{ mm}$), and 24fps crystal sync velocity.
3. **Exploded Disassembly View**: Dynamic mechanical separation of key subsystems (carbon chassis, dual-drum magazine, vacuum gate, optical block, OLED telemetry screen, reflex viewfinder, and onboard monitor) with interactive HUD telemetry cards and SVG leader lines.
4. **The Noise Problem**: The docking of an acoustic sound blimp enclosure around the camera to dampen the mechanical roar of 65mm film moving at high speeds for dialogue capture.
5. **The Mirror Solution**: Deployment of a front-surface gold reflector mirror arm to restore actor eyelines when shooting through bulky sound-dampened housings.
6. **Engineering Story**: Historical records and operational metrics highlighting the logistical scale of shooting full-length narrative features on 65mm film.
7. **Interactive Operating Deck (Finale)**: Hands-on cinematic viewfinder mode overlooking a procedural moonlit sea with a wooden galley ship. Features interactive pan/tilt controls, multi-plane rack focus with realistic optical focus breathing, 1.43:1 vs. 2.39:1 aspect ratio masking, and a live roll-film trigger with tally LEDs and synthesized audio.

---

## Key Features

- **100% Procedural 3D Model**: Every screw, rod, knurled ring, lens element, carbon weave panel, and magnesium rib is constructed with Three.js procedural geometries.
- **Dynamic PBR Materials & Canvas Textures**:
  - 2×2 twill carbon fiber weave with anisotropic roughness
  - Machined aluminum and knurled focus grips
  - Multi-element transmissive physical glass with an anti-reflective fluorite coating
  - 12-blade internal mechanical iris diaphragm
  - Working OLED telemetry panel displaying live fps, voltage, and film counters
- **True Cinema Focus Breathing & Bokeh**: Adjusting the rack focus control shifts the focal plane between foreground rocks (8m), the galley ship (40m), and the distant horizon ($\infty$) while dynamically altering the lens's field of view and multi-tap bokeh blur.
- **Web Audio API Mechanical Synthesizer**: Synthesizes 24fps motor hum, registration claw ticks, and mechanical shutter clicks in real time with zero external audio samples.
- **65mm Film Strip Navigation**: A persistent celluloid scroll strip featuring 15-perf sprockets, KeyKode markings, and frame playhead tracking.
- **Responsive Layout**: Designed for seamless interaction across both desktop and mobile screens.

---

## Tools & Technologies Used

- **Three.js**: WebGL rendering, procedural geometry creation, PBR materials, custom shaders, and post-processing (ACES tone mapping, cinematic bloom, depth-of-field blur).
- **React 19**: Modern component architecture, state orchestration, and reactive DOM overlays.
- **TypeScript**: Strict type definitions for camera subsystems, telemetry metrics, and operating controls.
- **Tailwind CSS v4**: High-contrast typography, cinematic palette (`#0a0a0a`, `#f4f1ea`, `#e8a33d`, `#38bdf8`), and responsive layouts.
- **Lucide React**: Clean vector iconography for camera controls and audio toggles.
- **Web Audio API**: Real-time procedural audio synthesis using oscillators, gain nodes, and bandpass filters.
- **Vite**: Fast local development server and optimized production builds.

---

## Getting Started

### Prerequisites

Ensure you have **Node.js** (version 18.0 or later) and **npm** installed on your system.

To check your Node.js and npm versions:
```bash
node -v
npm -v
```

---

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **View the application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### Available Scripts

- **`npm run dev`**: Starts the Vite development server on `http://0.0.0.0:3000`.
- **`npm run build`**: Compiles TypeScript and creates an optimized production build in the `dist` directory.
- **`npm run preview`**: Previews the production build locally.
- **`npm run lint`**: Runs TypeScript type checking (`tsc --noEmit`) to verify code integrity.
- **`npm run clean`**: Removes the `dist` build directory.

---

## Project Structure

```
├── index.html                      # HTML entry point with typography and metadata
├── metadata.json                   # Application metadata configuration
├── package.json                    # Project dependencies and npm scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── src/
    ├── types.ts                    # TypeScript interfaces for telemetry, specs, and controls
    ├── index.css                   # Global Tailwind CSS styles and custom font definitions
    ├── main.tsx                    # React application mounting point
    ├── App.tsx                     # Main application layout and scroll coordinator
    ├── audio/
    │   └── cameraAudio.ts          # Procedural Web Audio API film transport sound engine
    ├── components/
    │   ├── FilmScrollStrip.tsx     # 15-perf celluloid navigation bar with sprockets
    │   ├── ExplodedOverlay.tsx     # Exploded subsystem spec cards and dynamic leader lines
    │   ├── FinaleControls.tsx      # Viewfinder operating console (rack focus, pan/tilt, record)
    │   └── SectionsOverlay.tsx     # Narrative typography overlays for chapters 1 through 7
    └── three/
        ├── proceduralTextures.ts   # Canvas texture generators (carbon weave, metal, OLED, markings)
        ├── cameraModel.ts          # Detailed 65mm camera assembly, blimp housing, and mirror arm
        ├── cinematicScene.ts       # Procedural moonlit sea, animated ocean waves, and galley ship
        └── sceneManager.ts         # Three.js animation loops, camera pathing, and post-processing
```

---

## License

This project is licensed under the Apache-2.0 License. See the header comments in individual source files for details.
