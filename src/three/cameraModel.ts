import * as THREE from 'three';
import {
  createCarbonFiberTextures,
  createKnurlTexture,
  createBrushedMetalTexture,
  createLensMarkingsTexture,
  createFilmStripTexture,
  TelemetryScreenTexture,
  createCrinkleCoatingTexture,
} from './proceduralTextures';
import { CameraComponentKey, TelemetryData } from '../types';

export interface CameraModelParts {
  root: THREE.Group;
  carbonBody: THREE.Group;
  filmMagazine: THREE.Group;
  filmTransport: THREE.Group;
  lensAssembly: THREE.Group;
  telemetryDisplay: THREE.Group;
  reflexViewfinder: THREE.Group;
  monitoringModule: THREE.Group;
  acousticHousing: THREE.Group;
  mirrorArm: THREE.Group;
  sightline: THREE.Line;
  sightlineGlow: THREE.Mesh;
  filmStripMesh: THREE.Mesh;
  filmTransportSprockets: THREE.Group[];
  telemetryTexture: TelemetryScreenTexture;
  tallyLedMat: THREE.MeshStandardMaterial;
  lensFocusRing: THREE.Mesh;
  lensIrisRing: THREE.Mesh;
  matteBoxFlags: { top: THREE.Group; left: THREE.Group; right: THREE.Group };
  allMaterials: THREE.Material[];
}

export function buildCameraModel(): CameraModelParts {
  const root = new THREE.Group();
  root.name = 'CameraMasterRoot';

  const allMaterials: THREE.Material[] = [];

  // 1. Procedural Textures & Materials
  const carbonTextures = createCarbonFiberTextures();
  const knurlTexture = createKnurlTexture();
  const brushedMetalTexture = createBrushedMetalTexture();
  const lensMarkingsTexture = createLensMarkingsTexture();
  const filmTexture = createFilmStripTexture();
  const telemetryTexture = new TelemetryScreenTexture();
  const crinkleTexture = createCrinkleCoatingTexture();

  // Carbon Fiber Material
  const carbonMat = new THREE.MeshStandardMaterial({
    map: carbonTextures.map,
    roughnessMap: carbonTextures.roughnessMap,
    bumpMap: carbonTextures.bumpMap,
    bumpScale: 0.015,
    roughness: 0.45,
    metalness: 0.15,
  });
  allMaterials.push(carbonMat);

  // Matte Anodized Dark Metal (Arri / Panavision style titanium grey)
  const anodizedDarkMat = new THREE.MeshStandardMaterial({
    color: 0x181a1d,
    roughness: 0.35,
    metalness: 0.85,
    bumpMap: brushedMetalTexture,
    bumpScale: 0.003,
  });
  allMaterials.push(anodizedDarkMat);

  // Precision Machined Silver / Steel (screws, rods, mount rings)
  const machinedSteelMat = new THREE.MeshStandardMaterial({
    color: 0xd8dce0,
    roughness: 0.22,
    metalness: 0.95,
    bumpMap: brushedMetalTexture,
    bumpScale: 0.002,
  });
  allMaterials.push(machinedSteelMat);

  // Amber Accent Metal (witness marks, indices, latch levers)
  const amberMetalMat = new THREE.MeshStandardMaterial({
    color: 0xe8a33d,
    roughness: 0.28,
    metalness: 0.85,
  });
  allMaterials.push(amberMetalMat);

  // Knurled Grip Rings
  const knurledRingMat = new THREE.MeshStandardMaterial({
    color: 0x1f2126,
    roughness: 0.55,
    metalness: 0.8,
    bumpMap: knurlTexture,
    bumpScale: 0.02,
  });
  allMaterials.push(knurledRingMat);

  // Rubber Grips
  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x121315,
    roughness: 0.92,
    metalness: 0.02,
  });
  allMaterials.push(rubberMat);

  // Transmissive Multi-Coated Cinema Lens Glass
  const lensGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.96,
    opacity: 1,
    transparent: true,
    roughness: 0.04,
    ior: 1.54,
    reflectivity: 0.95,
    attenuationColor: new THREE.Color(0x38bdf8),
    attenuationDistance: 0.8,
    specularIntensity: 1.0,
  });
  allMaterials.push(lensGlassMat);

  // Anti-reflective Violet/Magenta Coating Element
  const arCoatingMat = new THREE.MeshPhysicalMaterial({
    color: 0x9333ea,
    transmission: 0.94,
    transparent: true,
    roughness: 0.05,
    ior: 1.62,
    reflectivity: 0.98,
    attenuationColor: new THREE.Color(0xec4899),
    attenuationDistance: 0.5,
  });
  allMaterials.push(arCoatingMat);

  // Mirror Surface Material (for twin-mirror viewing arm)
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.02,
    metalness: 1.0,
  });
  allMaterials.push(mirrorMat);

  // Tally LED Light
  const tallyLedMat = new THREE.MeshStandardMaterial({
    color: 0x220505,
    emissive: 0x000000,
    emissiveIntensity: 0.0,
    roughness: 0.2,
    metalness: 0.1,
  });
  allMaterials.push(tallyLedMat);

  // Telemetry Screen Material
  const telemetryMat = new THREE.MeshStandardMaterial({
    map: telemetryTexture.texture,
    emissive: 0xffffff,
    emissiveMap: telemetryTexture.texture,
    emissiveIntensity: 0.85,
    roughness: 0.15,
    metalness: 0.05,
  });
  allMaterials.push(telemetryMat);

  // Film Strip Material (Celluloid semi-translucent)
  const filmMat = new THREE.MeshStandardMaterial({
    map: filmTexture,
    transparent: true,
    opacity: 0.92,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  allMaterials.push(filmMat);

  // Acoustic Housing Blimp Material (Heavy cast crinkle-coat dark finish)
  const acousticMat = new THREE.MeshStandardMaterial({
    color: 0x1a1c1e,
    bumpMap: crinkleTexture,
    bumpScale: 0.02,
    roughness: 0.82,
    metalness: 0.65,
  });
  allMaterials.push(acousticMat);

  // Helper function to add recessed hex screws
  const addHexScrew = (parent: THREE.Object3D, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, scale = 1) => {
    const screwGroup = new THREE.Group();
    screwGroup.position.set(x, y, z);
    screwGroup.rotation.set(rx, ry, rz);
    screwGroup.scale.setScalar(scale);

    // Rim
    const rimGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.012, 16);
    const rim = new THREE.Mesh(rimGeo, machinedSteelMat);
    rim.castShadow = true;
    screwGroup.add(rim);

    // Hex socket recess
    const hexGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.014, 6);
    const hex = new THREE.Mesh(hexGeo, anodizedDarkMat);
    hex.position.y = 0.002;
    screwGroup.add(hex);

    parent.add(screwGroup);
  };

  // Helper for chamfered box (using rounded box approximation via grouped primitives)
  const createBeveledPanel = (w: number, h: number, d: number, mat: THREE.Material) => {
    const group = new THREE.Group();
    const mainGeo = new THREE.BoxGeometry(w, h, d);
    const mainMesh = new THREE.Mesh(mainGeo, mat);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    group.add(mainMesh);
    return group;
  };

  // ==========================================
  // COMPONENT 1: CARBON-FIBER MAIN BODY
  // ==========================================
  const carbonBody = new THREE.Group();
  carbonBody.name = 'carbonBody';
  root.add(carbonBody);

  // Main chassis box
  const chassis = createBeveledPanel(1.6, 1.4, 1.8, carbonMat);
  chassis.position.set(0, 0, 0);
  carbonBody.add(chassis);

  // Side reinforcement ribs & magnesium alloy skeleton frames
  const frameGeo = new THREE.BoxGeometry(1.64, 1.44, 0.12);
  const frontFrame = new THREE.Mesh(frameGeo, anodizedDarkMat);
  frontFrame.position.set(0, 0, 0.86);
  frontFrame.castShadow = true;
  carbonBody.add(frontFrame);

  const rearFrame = new THREE.Mesh(frameGeo, anodizedDarkMat);
  rearFrame.position.set(0, 0, -0.86);
  rearFrame.castShadow = true;
  carbonBody.add(rearFrame);

  // Cooling Vents & Heat Sinks (Left side)
  const ventHousingGeo = new THREE.BoxGeometry(0.08, 0.6, 0.9);
  const ventHousing = new THREE.Mesh(ventHousingGeo, anodizedDarkMat);
  ventHousing.position.set(0.82, -0.1, 0);
  carbonBody.add(ventHousing);

  for (let i = 0; i < 7; i++) {
    const finGeo = new THREE.BoxGeometry(0.12, 0.02, 0.8);
    const fin = new THREE.Mesh(finGeo, machinedSteelMat);
    fin.position.set(0.82, -0.3 + i * 0.08, 0);
    carbonBody.add(fin);
  }

  // 15mm Studio Rods and Baseplate
  const baseplateGeo = new THREE.BoxGeometry(1.4, 0.16, 2.6);
  const baseplate = new THREE.Mesh(baseplateGeo, anodizedDarkMat);
  baseplate.position.set(0, -0.78, 0.2);
  baseplate.castShadow = true;
  carbonBody.add(baseplate);

  // Two 15mm Stainless Steel Iris Rods
  const rodGeo = new THREE.CylinderGeometry(0.035, 0.035, 3.8, 24);
  const rodLeft = new THREE.Mesh(rodGeo, machinedSteelMat);
  rodLeft.rotation.x = Math.PI / 2;
  rodLeft.position.set(-0.4, -0.82, 0.6);
  rodLeft.castShadow = true;
  carbonBody.add(rodLeft);

  const rodRight = rodLeft.clone();
  rodRight.position.x = 0.4;
  carbonBody.add(rodRight);

  // Ergonomic Top Handle with 3/8"-16 threads
  const handleGroup = new THREE.Group();
  const handleBarGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.6, 24);
  const handleBar = new THREE.Mesh(handleBarGeo, rubberMat);
  handleBar.rotation.x = Math.PI / 2;
  handleBar.position.set(0, 1.05, 0);
  handleGroup.add(handleBar);

  const handlePostGeo = new THREE.BoxGeometry(0.1, 0.35, 0.12);
  const handlePostFront = new THREE.Mesh(handlePostGeo, anodizedDarkMat);
  handlePostFront.position.set(0, 0.88, 0.55);
  handleGroup.add(handlePostFront);

  const handlePostRear = new THREE.Mesh(handlePostGeo, anodizedDarkMat);
  handlePostRear.position.set(0, 0.88, -0.55);
  handleGroup.add(handlePostRear);

  carbonBody.add(handleGroup);

  // Arri Rosette mounts on right and left body sides
  const rosetteGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32);
  const rosetteR = new THREE.Mesh(rosetteGeo, machinedSteelMat);
  rosetteR.rotation.z = Math.PI / 2;
  rosetteR.position.set(0.82, -0.2, 0.6);
  carbonBody.add(rosetteR);

  const rosetteL = rosetteR.clone();
  rosetteL.position.x = -0.82;
  carbonBody.add(rosetteL);

  // Precision Machined Ports: 24V 2-pin Lemo DC Input & BNC SDI Out
  const lemoPortGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.03, 16);
  const lemoPort = new THREE.Mesh(lemoPortGeo, machinedSteelMat);
  lemoPort.rotation.z = Math.PI / 2;
  lemoPort.position.set(0.825, -0.45, -0.4);
  carbonBody.add(lemoPort);

  // Gold connector pins inside Lemo port
  const pinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.035, 8);
  const pin1 = new THREE.Mesh(pinGeo, amberMetalMat);
  pin1.rotation.z = Math.PI / 2;
  pin1.position.set(0.83, -0.44, -0.4);
  carbonBody.add(pin1);

  const pin2 = pin1.clone();
  pin2.position.y = -0.46;
  carbonBody.add(pin2);

  // BNC SDI connector
  const bncGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16);
  const bncPort = new THREE.Mesh(bncGeo, machinedSteelMat);
  bncPort.rotation.z = Math.PI / 2;
  bncPort.position.set(0.825, -0.45, -0.15);
  carbonBody.add(bncPort);

  // Recessed hex screws around the carbon chassis
  addHexScrew(carbonBody, 0.72, 0.6, 0.92, Math.PI / 2, 0, 0);
  addHexScrew(carbonBody, -0.72, 0.6, 0.92, Math.PI / 2, 0, 0);
  addHexScrew(carbonBody, 0.72, -0.6, 0.92, Math.PI / 2, 0, 0);
  addHexScrew(carbonBody, -0.72, -0.6, 0.92, Math.PI / 2, 0, 0);

  addHexScrew(carbonBody, 0.72, 0.6, -0.92, -Math.PI / 2, 0, 0);
  addHexScrew(carbonBody, -0.72, 0.6, -0.92, -Math.PI / 2, 0, 0);

  // Tally LED indicator on front top
  const tallyHousingGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16);
  const tallyHousing = new THREE.Mesh(tallyHousingGeo, anodizedDarkMat);
  tallyHousing.rotation.x = Math.PI / 2;
  tallyHousing.position.set(-0.55, 0.58, 0.92);
  carbonBody.add(tallyHousing);

  const tallyLedGeo = new THREE.SphereGeometry(0.03, 16, 16);
  const tallyLed = new THREE.Mesh(tallyLedGeo, tallyLedMat);
  tallyLed.position.set(-0.55, 0.58, 0.94);
  carbonBody.add(tallyLed);

  // ==========================================
  // COMPONENT 2: LARGE CENTRAL LENS ASSEMBLY
  // ==========================================
  const lensAssembly = new THREE.Group();
  lensAssembly.name = 'lensAssembly';
  root.add(lensAssembly);

  // Cinema PL / LPL Mount Flange
  const mountRingGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.15, 48);
  const mountRing = new THREE.Mesh(mountRingGeo, machinedSteelMat);
  mountRing.rotation.x = Math.PI / 2;
  mountRing.position.set(0, 0.05, 0.98);
  mountRing.castShadow = true;
  lensAssembly.add(mountRing);

  // Locking Collar with Amber Flange Levers
  const lockCollarGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.08, 48);
  const lockCollar = new THREE.Mesh(lockCollarGeo, anodizedDarkMat);
  lockCollar.rotation.x = Math.PI / 2;
  lockCollar.position.set(0, 0.05, 1.08);
  lensAssembly.add(lockCollar);

  const lockLeverGeo = new THREE.BoxGeometry(0.06, 0.14, 0.06);
  const lockLever1 = new THREE.Mesh(lockLeverGeo, amberMetalMat);
  lockLever1.position.set(0.62, 0.05, 1.08);
  lensAssembly.add(lockLever1);

  // Lens Main Barrel with Engraved Markings
  const barrelMarkingsMat = new THREE.MeshStandardMaterial({
    map: lensMarkingsTexture,
    roughness: 0.35,
    metalness: 0.85,
  });
  allMaterials.push(barrelMarkingsMat);

  const barrelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.9, 48);
  const barrel = new THREE.Mesh(barrelGeo, barrelMarkingsMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.05, 1.6);
  barrel.castShadow = true;
  lensAssembly.add(barrel);

  // Geared Focus Ring (0.8 Mod cine gear)
  const focusRingGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.22, 64);
  const lensFocusRing = new THREE.Mesh(focusRingGeo, knurledRingMat);
  lensFocusRing.rotation.x = Math.PI / 2;
  lensFocusRing.position.set(0, 0.05, 1.4);
  lensFocusRing.castShadow = true;
  lensAssembly.add(lensFocusRing);

  // Geared Iris Ring
  const irisRingGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.16, 64);
  const lensIrisRing = new THREE.Mesh(irisRingGeo, knurledRingMat);
  lensIrisRing.rotation.x = Math.PI / 2;
  lensIrisRing.position.set(0, 0.05, 1.85);
  lensIrisRing.castShadow = true;
  lensAssembly.add(lensIrisRing);

  // 12-Blade Mechanical Iris Diaphragm inside optical barrel
  const irisBladesGroup = new THREE.Group();
  irisBladesGroup.position.set(0, 0.05, 1.6);
  for (let b = 0; b < 12; b++) {
    const bladeAngle = (b / 12) * Math.PI * 2;
    const bladeGeo = new THREE.PlaneGeometry(0.24, 0.42);
    const bladeMesh = new THREE.Mesh(bladeGeo, anodizedDarkMat);
    bladeMesh.rotation.z = bladeAngle + 0.35;
    bladeMesh.position.set(Math.cos(bladeAngle) * 0.22, Math.sin(bladeAngle) * 0.22, 0);
    irisBladesGroup.add(bladeMesh);
  }
  lensAssembly.add(irisBladesGroup);

  // Large-Format Massive Front Element Hood
  const frontHoodGeo = new THREE.CylinderGeometry(0.68, 0.54, 0.35, 48);
  const frontHood = new THREE.Mesh(frontHoodGeo, anodizedDarkMat);
  frontHood.rotation.x = Math.PI / 2;
  frontHood.position.set(0, 0.05, 2.15);
  frontHood.castShadow = true;
  lensAssembly.add(frontHood);

  // Convincing Multi-Element Optical Glass
  // Convex Front Aspherical Element
  const frontGlassGeo = new THREE.SphereGeometry(0.62, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const frontGlass = new THREE.Mesh(frontGlassGeo, lensGlassMat);
  frontGlass.rotation.x = -Math.PI / 2;
  frontGlass.position.set(0, 0.05, 2.18);
  lensAssembly.add(frontGlass);

  // Deep Inner Violet AR Coated Element
  const innerGlassGeo = new THREE.SphereGeometry(0.48, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.4);
  const innerGlass = new THREE.Mesh(innerGlassGeo, arCoatingMat);
  innerGlass.rotation.x = Math.PI / 2;
  innerGlass.position.set(0, 0.05, 1.7);
  lensAssembly.add(innerGlass);

  // 4x5.65 Carbon Fiber Cinema Matte Box
  const matteBoxRoot = new THREE.Group();
  matteBoxRoot.position.set(0, 0.05, 2.45);

  const matteBoxFrameGeo = new THREE.BoxGeometry(1.65, 1.35, 0.28);
  const matteBoxFrame = new THREE.Mesh(matteBoxFrameGeo, carbonMat);
  matteBoxFrame.castShadow = true;
  matteBoxRoot.add(matteBoxFrame);

  // Sunshade cone cutout
  const coneGeo = new THREE.ConeGeometry(0.85, 0.25, 4);
  const cone = new THREE.Mesh(coneGeo, anodizedDarkMat);
  cone.rotation.x = Math.PI / 2;
  cone.rotation.y = Math.PI / 4;
  cone.position.z = 0.12;
  matteBoxRoot.add(cone);

  // Adjustable Top Eyebrow Flag
  const flagTopGroup = new THREE.Group();
  flagTopGroup.position.set(0, 0.68, 0.14);
  const flagTopGeo = new THREE.BoxGeometry(1.7, 0.45, 0.02);
  const flagTop = new THREE.Mesh(flagTopGeo, carbonMat);
  flagTop.position.set(0, 0.22, 0);
  flagTopGroup.add(flagTop);
  flagTopGroup.rotation.x = -0.3; // angled forward
  matteBoxRoot.add(flagTopGroup);

  // Adjustable Side Flags
  const flagLeftGroup = new THREE.Group();
  flagLeftGroup.position.set(-0.84, 0, 0.14);
  const flagSideGeo = new THREE.BoxGeometry(0.02, 1.3, 0.4);
  const flagLeft = new THREE.Mesh(flagSideGeo, carbonMat);
  flagLeft.position.set(0, 0, 0.2);
  flagLeftGroup.add(flagLeft);
  flagLeftGroup.rotation.y = -0.25;
  matteBoxRoot.add(flagLeftGroup);

  const flagRightGroup = new THREE.Group();
  flagRightGroup.position.set(0.84, 0, 0.14);
  const flagRight = new THREE.Mesh(flagSideGeo, carbonMat);
  flagRight.position.set(0, 0, 0.2);
  flagRightGroup.add(flagRight);
  flagRightGroup.rotation.y = 0.25;
  matteBoxRoot.add(flagRightGroup);

  lensAssembly.add(matteBoxRoot);

  // ==========================================
  // COMPONENT 3: FILM MAGAZINE & TRANSPORT
  // ==========================================
  const filmMagazine = new THREE.Group();
  filmMagazine.name = 'filmMagazine';
  root.add(filmMagazine);

  // Large-format 65mm Dual Drum Magazine (upper rear mounting)
  const drumGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.75, 48);

  // Feed Drum (Supply spool)
  const feedDrum = new THREE.Mesh(drumGeo, carbonMat);
  feedDrum.rotation.z = Math.PI / 2;
  feedDrum.position.set(-0.42, 0.75, -0.65);
  feedDrum.castShadow = true;
  filmMagazine.add(feedDrum);

  // Take-up Drum (Takeup spool)
  const takeupDrum = new THREE.Mesh(drumGeo, carbonMat);
  takeupDrum.rotation.z = Math.PI / 2;
  takeupDrum.position.set(0.42, 0.75, -0.65);
  takeupDrum.castShadow = true;
  filmMagazine.add(takeupDrum);

  // Magazine Bridge & Latch mechanism
  const magBridgeGeo = new THREE.BoxGeometry(1.2, 0.6, 0.74);
  const magBridge = new THREE.Mesh(magBridgeGeo, anodizedDarkMat);
  magBridge.position.set(0, 0.75, -0.65);
  filmMagazine.add(magBridge);

  // Heavy metal latches
  const magLatchGeo = new THREE.BoxGeometry(0.12, 0.25, 0.1);
  const magLatch = new THREE.Mesh(magLatchGeo, amberMetalMat);
  magLatch.position.set(0, 1.15, -0.65);
  filmMagazine.add(magLatch);

  // COMPONENT 3B: FILM TRANSPORT AND GATE
  const filmTransport = new THREE.Group();
  filmTransport.name = 'filmTransport';
  root.add(filmTransport);

  // Precision 65mm 15-Perf Film Gate Block
  const gateBlockGeo = new THREE.BoxGeometry(0.85, 0.7, 0.35);
  const gateBlock = new THREE.Mesh(gateBlockGeo, machinedSteelMat);
  gateBlock.position.set(0, 0.05, 0.45);
  gateBlock.castShadow = true;
  filmTransport.add(gateBlock);

  // 15-Perf Aperture Cutout (approx 70mm x 48.5mm aspect)
  const apertureGeo = new THREE.BoxGeometry(0.54, 0.38, 0.08);
  const apertureCut = new THREE.Mesh(apertureGeo, new THREE.MeshBasicMaterial({ color: 0x020202 }));
  apertureCut.position.set(0, 0.05, 0.6);
  filmTransport.add(apertureCut);

  // Horizontal Film Ribbon passing through gate
  const filmStripGeo = new THREE.PlaneGeometry(1.6, 0.42);
  const filmStripMesh = new THREE.Mesh(filmStripGeo, filmMat);
  filmStripMesh.position.set(0, 0.05, 0.58);
  filmStripMesh.castShadow = true;
  filmTransport.add(filmStripMesh);

  // Continuous Film loop threading into the drums
  const filmLoopPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.7, 0.05, 0.58),
    new THREE.Vector3(-0.5, 0.4, 0.1),
    new THREE.Vector3(-0.42, 0.75, -0.4),
    new THREE.Vector3(0, 0.85, -0.65),
    new THREE.Vector3(0.42, 0.75, -0.4),
    new THREE.Vector3(0.5, 0.4, 0.1),
    new THREE.Vector3(0.7, 0.05, 0.58),
  ]);
  const filmTubeGeo = new THREE.TubeGeometry(filmLoopPath, 32, 0.02, 8, false);
  const filmLoopMesh = new THREE.Mesh(filmTubeGeo, amberMetalMat);
  filmTransport.add(filmLoopMesh);

  // Sprocket Drive Rollers
  const filmTransportSprockets: THREE.Group[] = [];
  [-0.55, 0.55].forEach((sx) => {
    const spGroup = new THREE.Group();
    spGroup.position.set(sx, 0.05, 0.48);

    const rollerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.38, 24);
    const roller = new THREE.Mesh(rollerGeo, machinedSteelMat);
    spGroup.add(roller);

    // Sprocket teeth pins
    for (let t = 0; t < 12; t++) {
      const angle = (t / 12) * Math.PI * 2;
      const toothGeo = new THREE.BoxGeometry(0.015, 0.02, 0.035);
      const tooth = new THREE.Mesh(toothGeo, amberMetalMat);
      tooth.position.set(Math.cos(angle) * 0.13, 0.15, Math.sin(angle) * 0.13);
      spGroup.add(tooth);

      const toothB = tooth.clone();
      toothB.position.y = -0.15;
      spGroup.add(toothB);
    }

    filmTransport.add(spGroup);
    filmTransportSprockets.push(spGroup);
  });

  // Pressure Plate & Vacuum Back
  const pressurePlateGeo = new THREE.BoxGeometry(0.65, 0.48, 0.04);
  const pressurePlate = new THREE.Mesh(pressurePlateGeo, anodizedDarkMat);
  pressurePlate.position.set(0, 0.05, 0.35);
  filmTransport.add(pressurePlate);

  // ==========================================
  // COMPONENT 4: DIGITAL TELEMETRY SCREEN
  // ==========================================
  const telemetryDisplay = new THREE.Group();
  telemetryDisplay.name = 'telemetryDisplay';
  root.add(telemetryDisplay);

  // Screen housing bevel on left camera flank
  const screenHousingGeo = new THREE.BoxGeometry(0.08, 0.65, 1.15);
  const screenHousing = new THREE.Mesh(screenHousingGeo, anodizedDarkMat);
  screenHousing.position.set(-0.84, 0.05, -0.05);
  screenHousing.castShadow = true;
  telemetryDisplay.add(screenHousing);

  // OLED Screen Glass Surface
  const screenGeo = new THREE.PlaneGeometry(0.96, 0.52);
  const screenMesh = new THREE.Mesh(screenGeo, telemetryMat);
  screenMesh.rotation.y = -Math.PI / 2;
  screenMesh.position.set(-0.885, 0.05, -0.05);
  telemetryDisplay.add(screenMesh);

  // Physical tactile control buttons beneath display
  for (let b = 0; b < 4; b++) {
    const btnGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16);
    const btn = new THREE.Mesh(btnGeo, machinedSteelMat);
    btn.rotation.z = Math.PI / 2;
    btn.position.set(-0.885, -0.28, -0.35 + b * 0.22);
    telemetryDisplay.add(btn);
  }

  // ==========================================
  // COMPONENT 5: REFLEX VIEWFINDER & MONITORING MODULE
  // ==========================================
  const reflexViewfinder = new THREE.Group();
  reflexViewfinder.name = 'reflexViewfinder';
  root.add(reflexViewfinder);

  // Top-right optical prism arm
  const prismHousingGeo = new THREE.BoxGeometry(0.28, 0.26, 0.6);
  const prismHousing = new THREE.Mesh(prismHousingGeo, anodizedDarkMat);
  prismHousing.position.set(0.68, 0.65, 0.3);
  prismHousing.castShadow = true;
  reflexViewfinder.add(prismHousing);

  // Rotating eyepiece barrel
  const eyepieceGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.45, 32);
  const eyepiece = new THREE.Mesh(eyepieceGeo, machinedSteelMat);
  eyepiece.rotation.x = Math.PI / 2;
  eyepiece.position.set(0.68, 0.65, -0.2);
  reflexViewfinder.add(eyepiece);

  // Ergonomic Rubber Eyecup
  const eyecupGeo = new THREE.CylinderGeometry(0.14, 0.09, 0.12, 32);
  const eyecup = new THREE.Mesh(eyecupGeo, rubberMat);
  eyecup.rotation.x = Math.PI / 2;
  eyecup.position.set(0.68, 0.65, -0.45);
  reflexViewfinder.add(eyecup);

  // Monitoring Module (electronic onboard LCD monitor on articulating arm)
  const monitoringModule = new THREE.Group();
  monitoringModule.name = 'monitoringModule';
  root.add(monitoringModule);

  // Articulating friction arm
  const armBaseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 16);
  const armBase = new THREE.Mesh(armBaseGeo, machinedSteelMat);
  armBase.position.set(-0.65, 0.82, 0.4);
  monitoringModule.add(armBase);

  // 7" High-Bright Onboard Director's Monitor
  const monitorFrameGeo = new THREE.BoxGeometry(0.06, 0.55, 0.85);
  const monitorFrame = new THREE.Mesh(monitorFrameGeo, carbonMat);
  monitorFrame.position.set(-0.85, 0.95, 0.4);
  monitorFrame.rotation.y = -0.35;
  monitorFrame.castShadow = true;
  monitoringModule.add(monitorFrame);

  // Monitor Display Panel
  const monitorScreenGeo = new THREE.PlaneGeometry(0.75, 0.48);
  const monitorScreen = new THREE.Mesh(
    monitorScreenGeo,
    new THREE.MeshStandardMaterial({
      color: 0x050c18,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.1,
    })
  );
  monitorScreen.rotation.y = -Math.PI / 2 - 0.35;
  monitorScreen.position.set(-0.88, 0.95, 0.4);
  monitoringModule.add(monitorScreen);

  // BNC SDI Coaxial Cable coiled to body
  const sdiCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.85, 0.8, 0.3),
    new THREE.Vector3(-0.78, 0.4, 0.1),
    new THREE.Vector3(-0.8, -0.3, -0.4),
  ]);
  const sdiGeo = new THREE.TubeGeometry(sdiCurve, 24, 0.014, 8, false);
  const sdiCable = new THREE.Mesh(sdiGeo, rubberMat);
  monitoringModule.add(sdiCable);

  // ==========================================
  // COMPONENT 6: ACOUSTIC HOUSING (BLIMP ENCLOSURE)
  // ==========================================
  const acousticHousing = new THREE.Group();
  acousticHousing.name = 'acousticHousing';
  acousticHousing.position.y = 12.0; // starts high above camera in initial sections
  root.add(acousticHousing);

  // Massive soundproof cast enclosure
  const blimpShellGeo = new THREE.BoxGeometry(2.6, 2.3, 3.4);
  const blimpShell = new THREE.Mesh(blimpShellGeo, acousticMat);
  blimpShell.castShadow = true;
  blimpShell.receiveShadow = true;
  acousticHousing.add(blimpShell);

  // Optical Port Front Glass Window
  const blimpPortGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 48);
  const blimpPort = new THREE.Mesh(blimpPortGeo, lensGlassMat);
  blimpPort.rotation.x = Math.PI / 2;
  blimpPort.position.set(0, 0.05, 1.72);
  acousticHousing.add(blimpPort);

  const portBezelGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.08, 48);
  const portBezel = new THREE.Mesh(portBezelGeo, machinedSteelMat);
  portBezel.rotation.x = Math.PI / 2;
  portBezel.position.set(0, 0.05, 1.74);
  acousticHousing.add(portBezel);

  // Sound dampening seal gaskets (neoprene rubber)
  const gasketGeo = new THREE.BoxGeometry(2.64, 0.08, 3.44);
  const gasket = new THREE.Mesh(gasketGeo, rubberMat);
  gasket.position.set(0, 0, 0);
  acousticHousing.add(gasket);

  // Heavy-duty overhead crane lifting eye-bolts
  for (let eye = 0; eye < 4; eye++) {
    const ex = eye % 2 === 0 ? -1.0 : 1.0;
    const ez = eye < 2 ? -1.2 : 1.2;
    const eyeGeo = new THREE.TorusGeometry(0.1, 0.03, 16, 24);
    const eyeMesh = new THREE.Mesh(eyeGeo, amberMetalMat);
    eyeMesh.position.set(ex, 1.2, ez);
    acousticHousing.add(eyeMesh);
  }

  // Heavy cam-action compression latches
  for (let cl = 0; cl < 4; cl++) {
    const cx = cl % 2 === 0 ? -1.32 : 1.32;
    const cz = cl < 2 ? -0.8 : 0.8;
    const latchGeo = new THREE.BoxGeometry(0.08, 0.35, 0.12);
    const latchMesh = new THREE.Mesh(latchGeo, machinedSteelMat);
    latchMesh.position.set(cx, 0, cz);
    acousticHousing.add(latchMesh);
  }

  // Heavy shock mounts at bottom
  const shockPadGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.2, 24);
  for (let sp = 0; sp < 4; sp++) {
    const sx = sp % 2 === 0 ? -0.9 : 0.9;
    const sz = sp < 2 ? -1.2 : 1.2;
    const shockPad = new THREE.Mesh(shockPadGeo, rubberMat);
    shockPad.position.set(sx, -1.22, sz);
    acousticHousing.add(shockPad);
  }

  // ==========================================
  // COMPONENT 7: TWIN-MIRROR VIEWING ARM
  // ==========================================
  const mirrorArm = new THREE.Group();
  mirrorArm.name = 'mirrorArm';
  mirrorArm.position.set(3.5, 0, 0); // hidden / retracted until Section 5
  root.add(mirrorArm);

  // Main tubular arm bracket mounted beside lens
  const armTubeGeo = new THREE.BoxGeometry(0.18, 0.18, 1.6);
  const armTube = new THREE.Mesh(armTubeGeo, anodizedDarkMat);
  armTube.position.set(0.95, 0.05, 1.2);
  mirrorArm.add(armTube);

  // Mirror Box 1 (45-degree angled first surface mirror)
  const mirror1BoxGeo = new THREE.BoxGeometry(0.4, 0.4, 0.35);
  const mirror1Box = new THREE.Mesh(mirror1BoxGeo, carbonMat);
  mirror1Box.position.set(0.95, 0.05, 1.95);
  mirrorArm.add(mirror1Box);

  const mirror1PlateGeo = new THREE.PlaneGeometry(0.32, 0.32);
  const mirror1Plate = new THREE.Mesh(mirror1PlateGeo, mirrorMat);
  mirror1Plate.rotation.y = -Math.PI / 4;
  mirror1Plate.position.set(0.95, 0.05, 1.95);
  mirrorArm.add(mirror1Plate);

  // Lateral Extension Tube
  const latTubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 24);
  const latTube = new THREE.Mesh(latTubeGeo, machinedSteelMat);
  latTube.rotation.z = Math.PI / 2;
  latTube.position.set(1.5, 0.05, 1.95);
  mirrorArm.add(latTube);

  // Mirror Box 2 (Offset actor eyeline mirror)
  const mirror2BoxGeo = new THREE.BoxGeometry(0.4, 0.4, 0.35);
  const mirror2Box = new THREE.Mesh(mirror2BoxGeo, carbonMat);
  mirror2Box.position.set(2.05, 0.05, 1.95);
  mirrorArm.add(mirror2Box);

  const mirror2Plate = new THREE.Mesh(mirror1PlateGeo, mirrorMat);
  mirror2Plate.rotation.y = Math.PI / 4;
  mirror2Plate.position.set(2.05, 0.05, 1.95);
  mirrorArm.add(mirror2Plate);

  // Animated Laser Sightline showing reflection path
  const sightlinePoints = [
    new THREE.Vector3(0, 0.05, 3.5),      // Scene / subject in front of lens
    new THREE.Vector3(0.95, 0.05, 1.95),  // Mirror 1 (45 deg bounce)
    new THREE.Vector3(2.05, 0.05, 1.95),  // Lateral transit to Mirror 2
    new THREE.Vector3(2.05, 0.05, 3.5),   // Redirected eyeline directly to actor!
  ];
  const sightlineGeo = new THREE.BufferGeometry().setFromPoints(sightlinePoints);
  const sightlineMat = new THREE.LineBasicMaterial({
    color: 0xe8a33d,
    linewidth: 3,
    transparent: true,
    opacity: 0.9,
  });
  allMaterials.push(sightlineMat);
  const sightline = new THREE.Line(sightlineGeo, sightlineMat);
  mirrorArm.add(sightline);

  // Animated Pulse bead along sightline
  const pulseGeo = new THREE.SphereGeometry(0.035, 16, 16);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const sightlineGlow = new THREE.Mesh(pulseGeo, pulseMat);
  mirrorArm.add(sightlineGlow);

  return {
    root,
    carbonBody,
    filmMagazine,
    filmTransport,
    lensAssembly,
    telemetryDisplay,
    reflexViewfinder,
    monitoringModule,
    acousticHousing,
    mirrorArm,
    sightline,
    sightlineGlow,
    filmStripMesh,
    filmTransportSprockets,
    telemetryTexture,
    tallyLedMat,
    lensFocusRing,
    lensIrisRing,
    matteBoxFlags: { top: flagTopGroup, left: flagLeftGroup, right: flagRightGroup },
    allMaterials,
  };
}
