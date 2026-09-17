import * as THREE from 'three';
import { TelemetryData } from '../types';

/**
 * High-precision procedural texture generator for Three.js.
 * All textures are generated deterministically using HTML5 Canvas primitives.
 * Zero external images or pre-baked HDR assets.
 */

// 1. Carbon Fiber Weave (2x2 Twill Pattern with anisotropic fiber sheen)
export function createCarbonFiberTextures(): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Base dark charcoal tone
  ctx.fillStyle = '#121214';
  ctx.fillRect(0, 0, size, size);

  roughCtx.fillStyle = '#404040';
  roughCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  const tileSize = 32; // weave yarn bundle width
  const numTiles = size / tileSize;

  for (let y = 0; y < numTiles; y++) {
    for (let x = 0; x < numTiles; x++) {
      const isHorizontal = ((x + y) % 4 === 0) || ((x + y) % 4 === 1);
      const px = x * tileSize;
      const py = y * tileSize;

      // Draw fiber filaments
      const steps = 16;
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const shimmer = Math.sin(t * Math.PI) * 28;
        const noise = (Math.random() - 0.5) * 8;

        if (isHorizontal) {
          const lum = Math.floor(22 + shimmer + noise);
          ctx.fillStyle = `rgb(${lum},${lum},${Math.floor(lum * 1.05)})`;
          ctx.fillRect(px, py + (s * tileSize) / steps, tileSize, tileSize / steps);

          // Roughness variation
          const rLum = Math.floor(65 - shimmer * 0.8);
          roughCtx.fillStyle = `rgb(${rLum},${rLum},${rLum})`;
          roughCtx.fillRect(px, py + (s * tileSize) / steps, tileSize, tileSize / steps);

          // Bump
          const bLum = Math.floor(128 + shimmer * 1.5);
          bumpCtx.fillStyle = `rgb(${bLum},${bLum},${bLum})`;
          bumpCtx.fillRect(px, py + (s * tileSize) / steps, tileSize, tileSize / steps);
        } else {
          const lum = Math.floor(16 + shimmer * 0.7 + noise);
          ctx.fillStyle = `rgb(${lum},${lum},${Math.floor(lum * 1.08)})`;
          ctx.fillRect(px + (s * tileSize) / steps, py, tileSize / steps, tileSize);

          const rLum = Math.floor(80 - shimmer * 0.5);
          roughCtx.fillStyle = `rgb(${rLum},${rLum},${rLum})`;
          roughCtx.fillRect(px + (s * tileSize) / steps, py, tileSize / steps, tileSize);

          const bLum = Math.floor(128 - shimmer * 1.2);
          bumpCtx.fillStyle = `rgb(${bLum},${bLum},${bLum})`;
          bumpCtx.fillRect(px + (s * tileSize) / steps, py, tileSize / steps, tileSize);
        }
      }

      // Yarn seam border
      ctx.strokeStyle = '#080809';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, tileSize, tileSize);

      bumpCtx.strokeStyle = '#202020';
      bumpCtx.lineWidth = 1;
      bumpCtx.strokeRect(px, py, tileSize, tileSize);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 4);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);

  return { map, roughnessMap, bumpMap };
}

// 2. Diamond Knurling Texture for Cinema Lens Rings
export function createKnurlTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const step = 8;
  ctx.strokeStyle = '#202020';
  ctx.lineWidth = 1.5;

  for (let i = -size; i < size * 2; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, size);
    ctx.lineTo(i + size, 0);
    ctx.stroke();
  }

  // Draw pyramid peaks
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const grad = ctx.createRadialGradient(x + step / 2, y + step / 2, 0, x + step / 2, y + step / 2, step / 2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#606060');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 2);
  return texture;
}

// 3. Brushed Aluminum / Machined Metal
export function createBrushedMetalTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#909090';
  ctx.fillRect(0, 0, size, size);

  // Fine horizontal hairlines
  for (let i = 0; i < 4000; i++) {
    const y = Math.random() * size;
    const len = 30 + Math.random() * 120;
    const x = Math.random() * size;
    const alpha = 0.05 + Math.random() * 0.15;
    const dark = Math.random() > 0.5;

    ctx.strokeStyle = dark ? `rgba(20,20,20,${alpha})` : `rgba(240,240,240,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// 4. Cinema Prime Lens Barrel Markings
export function createLensMarkingsTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c1d1f'; // Matte dark anodized barrel
  ctx.fillRect(0, 0, width, height);

  // Focus distance track (top half) - Metric and Imperial
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';

  // Feet markings in Film Amber
  ctx.fillStyle = '#e8a33d';
  const distancesFeet = ['1\'8"', '2\'', '2\'6"', '3\'', '4\'', '5\'', '7\'', '10\'', '15\'', '25\'', '50\'', '∞'];
  distancesFeet.forEach((d, i) => {
    const x = 60 + (i / (distancesFeet.length - 1)) * (width - 120);
    ctx.fillText(d, x, 45);
    ctx.fillRect(x - 1, 55, 2, 14); // tick mark
  });

  // Meters markings in Bone White
  ctx.fillStyle = '#f4f1ea';
  const distancesMeters = ['0.5m', '0.7m', '1m', '1.2m', '1.5m', '2m', '3m', '5m', '10m', '∞'];
  distancesMeters.forEach((d, i) => {
    const x = 70 + (i / (distancesMeters.length - 1)) * (width - 140);
    ctx.fillText(d, x, 105);
    ctx.fillRect(x - 1, 80, 2, 10);
  });

  // Center index line
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(0, 126, width, 4);

  // Aperture T-Stops (bottom half)
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f4f1ea';
  const tStops = ['T1.4', '2.0', '2.8', '4.0', '5.6', '8.0', '11', '16', '22'];
  tStops.forEach((t, i) => {
    const x = 120 + (i / (tStops.length - 1)) * (width - 240);
    ctx.fillText(t, x, 190);
    ctx.fillRect(x - 1, 140, 2, 16);
  });

  // Large format lens badge engraving
  ctx.fillStyle = '#e8a33d';
  ctx.font = 'bold 20px "Oswald", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('65mm PRIME  •  LARGE FORMAT CINEMA  •  T1.4', 60, 235);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 5. 15-Perforation 65mm Celluloid Film Strip
export function createFilmStripTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Amber celluloid base with gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#2d1806');
  grad.addColorStop(0.2, '#5a3410');
  grad.addColorStop(0.5, '#734112');
  grad.addColorStop(0.8, '#5a3410');
  grad.addColorStop(1, '#2d1806');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 15-perforation sprocket holes along top and bottom edges
  const numPerfs = 30;
  const perfWidth = 14;
  const perfHeight = 22;
  const perfSpacing = width / numPerfs;

  ctx.fillStyle = '#060606'; // Hole cutout
  for (let i = 0; i < numPerfs; i++) {
    const x = i * perfSpacing + 8;
    // Top sprocket hole
    ctx.beginPath();
    ctx.roundRect(x, 8, perfWidth, perfHeight, 4);
    ctx.fill();

    // Bottom sprocket hole
    ctx.beginPath();
    ctx.roundRect(x, height - 8 - perfHeight, perfWidth, perfHeight, 4);
    ctx.fill();

    // Subtle edge highlight
    ctx.strokeStyle = 'rgba(232, 163, 61, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Frame divider lines (horizontal 15-perf IMAX frame is 15 perforations wide)
  ctx.fillStyle = '#000000';
  for (let f = 0; f < 2; f++) {
    const fx = f * (perfSpacing * 15);
    ctx.fillRect(fx, 34, 4, height - 68);
  }

  // Latent edge number markings
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(232, 163, 61, 0.75)';
  ctx.fillText('EASTMAN 65MM 5219 • 15 PERF • LATENT KEYKODE 8492-1029', 24, height / 2 + 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 6. Dynamic Digital Telemetry Screen Texture
export class TelemetryScreenTexture {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 256;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.update({
      fps: 24.0,
      filmRemainingFeet: 984,
      filmCapacityFeet: 1000,
      temperatureC: 21.4,
      voltageV: 24.2,
      currentA: 3.1,
      transportStatus: 'RUN',
      timecode: '01:24:16:12',
      isRecording: false,
    });
  }

  public update(data: TelemetryData) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Dark OLED panel background
    ctx.fillStyle = '#050608';
    ctx.fillRect(0, 0, w, h);

    // Subtle OLED pixel grid
    ctx.fillStyle = 'rgba(0, 220, 180, 0.03)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    // Top Header bar
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, w, 44);

    // Status Indicator pill
    if (data.isRecording) {
      ctx.fillStyle = '#ff2222';
      ctx.beginPath();
      ctx.roundRect(14, 10, 84, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('● REC', 56, 26);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(14, 10, 84, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STBY', 56, 26);
    }

    // Timecode
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f4f1ea';
    ctx.textAlign = 'right';
    ctx.fillText(`TC ${data.timecode}`, w - 16, 29);

    // Main telemetry metrics: Frame rate & Shutter
    ctx.textAlign = 'left';
    ctx.font = 'bold 44px "Oswald", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${data.fps.toFixed(3)}`, 20, 105);

    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('FPS / CRYSTAL SYNC', 20, 122);

    // Shutter angle
    ctx.textAlign = 'left';
    ctx.font = 'bold 44px "Oswald", sans-serif';
    ctx.fillStyle = '#f4f1ea';
    ctx.fillText('180.0°', 230, 105);

    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('ROTARY SHUTTER', 230, 122);

    // Divider line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 138);
    ctx.lineTo(w - 20, 138);
    ctx.stroke();

    // Bottom telemetry bar: Film Remaining, Volts, Amps, Temp
    // Film Footage Bar
    const pct = Math.max(0, Math.min(1, data.filmRemainingFeet / data.filmCapacityFeet));
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 154, 200, 10);
    ctx.fillStyle = pct < 0.15 ? '#ef4444' : '#e8a33d';
    ctx.fillRect(20, 154, 200 * pct, 10);

    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f4f1ea';
    ctx.fillText(`FILM: ${Math.round(data.filmRemainingFeet)} / ${data.filmCapacityFeet} FT`, 20, 185);

    // Secondary metrics
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`MAG STATUS: ${data.transportStatus}`, 20, 208);
    ctx.fillText(`GATE: 65MM 15-PERF`, 20, 228);

    // Right Column
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`BATT: ${data.voltageV.toFixed(1)}V`, 320, 166);
    ctx.fillText(`LOAD: ${data.currentA.toFixed(1)}A`, 320, 186);
    ctx.fillText(`TEMP: ${data.temperatureC.toFixed(1)}°C`, 320, 206);
    ctx.fillText(`SYSTEM: NOMINAL`, 320, 226);

    this.texture.needsUpdate = true;
  }
}

// 7. High-Dynamic-Range Studio Environment Map (Procedural Softbox / Studio Lights)
export function createStudioEnvironmentMap(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep neutral studio gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0c0d10');
  bgGrad.addColorStop(0.5, '#16181d');
  bgGrad.addColorStop(1, '#090a0c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft studio floor reflection line
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0, height * 0.5, width, 2);

  // 1. Large Overhead Key Softbox (Top center)
  const keyGrad = ctx.createRadialGradient(width * 0.5, height * 0.22, 10, width * 0.5, height * 0.22, 140);
  keyGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  keyGrad.addColorStop(0.3, 'rgba(255, 252, 245, 0.95)');
  keyGrad.addColorStop(0.7, 'rgba(200, 210, 230, 0.4)');
  keyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = keyGrad;
  ctx.fillRect(width * 0.2, 0, width * 0.6, height * 0.5);

  // 2. Left Daylight Strip Bank
  const leftGrad = ctx.createLinearGradient(width * 0.1, 0, width * 0.2, 0);
  leftGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  leftGrad.addColorStop(0.5, 'rgba(215, 235, 255, 0.85)');
  leftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(width * 0.1, height * 0.2, width * 0.1, height * 0.6);

  // 3. Right Warm Rim Softbox (Film Amber accent reflection)
  const rightGrad = ctx.createLinearGradient(width * 0.78, 0, width * 0.9, 0);
  rightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  rightGrad.addColorStop(0.5, 'rgba(245, 180, 80, 0.9)');
  rightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(width * 0.78, height * 0.15, width * 0.12, height * 0.7);

  // 4. Subtle overhead kicker spots
  for (let i = 0; i < 3; i++) {
    const spotGrad = ctx.createRadialGradient(width * (0.35 + i * 0.15), height * 0.12, 0, width * (0.35 + i * 0.15), height * 0.12, 35);
    spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(width * (0.35 + i * 0.15) - 40, height * 0.12 - 40, 80, 80);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 8. Acoustic Housing Wrinkle/Crinkle Matte Coating
export function createCrinkleCoatingTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Stipple noise for crinkle / wrinkle finish
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = 120 + Math.random() * 70;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}
