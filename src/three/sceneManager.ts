import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { buildCameraModel, CameraModelParts } from './cameraModel';
import { buildCinematicScene, CinematicSceneObjects } from './cinematicScene';
import { createStudioEnvironmentMap } from './proceduralTextures';
import { CameraComponentKey, FinaleControls, TelemetryData } from '../types';

/**
 * Custom Cinematic Post-Processing Shader
 * Implements subtle 35mm/65mm film grain, chromatic aberration,
 * cinematic vignette, and adjustable rack-focus blur simulation.
 */
const CinematicShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrainIntensity: { value: 0.045 },
    uAberration: { value: 0.0018 },
    uVignette: { value: 0.45 },
    uFocusBlur: { value: 0.0 }, // Dynamic blur applied when rack focus shifts
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrainIntensity;
    uniform float uAberration;
    uniform float uVignette;
    uniform float uFocusBlur;
    varying vec2 vUv;

    // High-frequency pseudo-random film grain
    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec2 distFromCenter = uv - 0.5;

      // Chromatic Aberration: chromatic fringe increases toward lens periphery
      float dist = length(distFromCenter);
      vec2 caOffset = distFromCenter * (uAberration * (1.0 + dist * 2.0));

      vec4 col;
      if (uFocusBlur > 0.005) {
        // Multi-tap bokeh disc sampling
        vec4 sum = vec4(0.0);
        float radius = uFocusBlur * 0.015;
        sum += texture2D(tDiffuse, uv + vec2(0.0, radius));
        sum += texture2D(tDiffuse, uv + vec2(0.0, -radius));
        sum += texture2D(tDiffuse, uv + vec2(radius, 0.0));
        sum += texture2D(tDiffuse, uv + vec2(-radius, 0.0));
        sum += texture2D(tDiffuse, uv + vec2(radius * 0.7, radius * 0.7));
        sum += texture2D(tDiffuse, uv + vec2(-radius * 0.7, -radius * 0.7));
        sum += texture2D(tDiffuse, uv);
        col = sum / 7.0;
      } else {
        col.r = texture2D(tDiffuse, uv - caOffset).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv + caOffset).b;
        col.a = 1.0;
      }

      // Vignette
      float vig = 1.0 - smoothstep(0.4, 0.95, dist) * uVignette;
      col.rgb *= vig;

      // Procedural 65mm fine silver halide grain
      float grain = (random(uv * 2.5 + fract(uTime * 17.0)) - 0.5) * uGrainIntensity;
      col.rgb += grain;

      gl_FragColor = col;
    }
  `,
};

export class CameraSceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private cinematicPass: ShaderPass;

  // 3D entities
  public cameraParts: CameraModelParts;
  public cinematicScene: CinematicSceneObjects;
  private studioEnvMap: THREE.CanvasTexture;

  // Studio Lights
  private keyLight: THREE.SpotLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.SpotLight;
  private amberAccentLight: THREE.PointLight;

  // State
  private scrollProgress: number = 0;
  private targetScrollProgress: number = 0;
  private clock: THREE.Clock = new THREE.Clock();
  private animFrameId: number | null = null;
  private isVisible: boolean = true;
  private hoveredPart: CameraComponentKey | null = null;
  private finaleControls: FinaleControls = {
    rackFocus: 0.5,
    pan: 0,
    tilt: 0,
    aspectRatio: '1.43',
    isRecording: false,
    isMuted: false,
    showHorizon: true,
    activeFilter: 'none',
  };
  private telemetryState: TelemetryData = {
    fps: 24.0,
    filmRemainingFeet: 984,
    filmCapacityFeet: 1000,
    temperatureC: 21.4,
    voltageV: 24.2,
    currentA: 3.1,
    transportStatus: 'STBY',
    timecode: '01:24:16:12',
    isRecording: false,
  };

  private onTelemetryUpdate?: (data: TelemetryData) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Renderer with ACES Filmic Tone Mapping & Linear Color Workflow
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Capped DPR for smooth 60fps
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Main Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 400);
    this.camera.position.set(0, 0.2, 5.2);

    // 4. Procedural Studio HDRI Environment Map
    this.studioEnvMap = createStudioEnvironmentMap();
    this.scene.environment = this.studioEnvMap;

    // 5. Studio Lighting Rig
    this.keyLight = new THREE.SpotLight(0xffffff, 4.2);
    this.keyLight.position.set(3.5, 5.0, 4.5);
    this.keyLight.angle = Math.PI / 4;
    this.keyLight.penumbra = 0.6;
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.bias = -0.0001;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xb0c4de, 1.2);
    this.fillLight.position.set(-4.0, 2.0, 2.0);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.SpotLight(0xffffff, 5.0);
    this.rimLight.position.set(0, 4.0, -4.5);
    this.rimLight.angle = Math.PI / 3;
    this.rimLight.penumbra = 0.8;
    this.scene.add(this.rimLight);

    this.amberAccentLight = new THREE.PointLight(0xe8a33d, 1.8, 10);
    this.amberAccentLight.position.set(-2.2, 0.8, -1.5);
    this.scene.add(this.amberAccentLight);

    // 6. Build Camera Model
    this.cameraParts = buildCameraModel();
    this.scene.add(this.cameraParts.root);

    // 7. Build Cinematic Scene for Section 7
    this.cinematicScene = buildCinematicScene();
    this.cinematicScene.group.visible = false;
    this.scene.add(this.cinematicScene.group);

    // 8. Post-Processing Pipeline
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Subtle bloom for OLED display, LED tally, and moon/lanterns
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.35, // strength
      0.3,  // radius
      0.82  // threshold
    );
    this.composer.addPass(this.bloomPass);

    // Film grain and chromatic aberration pass
    this.cinematicPass = new ShaderPass(CinematicShader);
    this.composer.addPass(this.cinematicPass);

    // Event listeners
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('visibilitychange', this.handleVisibility);

    // Start render loop
    this.tick();
  }

  public setTelemetryCallback(cb: (data: TelemetryData) => void) {
    this.onTelemetryUpdate = cb;
  }

  public setHoveredPart(part: CameraComponentKey | null) {
    this.hoveredPart = part;
  }

  public setScrollProgress(progress: number) {
    this.targetScrollProgress = Math.max(0, Math.min(1, progress));
  }

  public updateFinaleControls(controls: Partial<FinaleControls>) {
    this.finaleControls = { ...this.finaleControls, ...controls };
  }

  private handleResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.bloomPass.setSize(width, height);
  };

  private handleVisibility = () => {
    this.isVisible = document.visibilityState === 'visible';
    if (this.isVisible && !this.animFrameId) {
      this.clock.start();
      this.tick();
    }
  };

  private tick = () => {
    if (!this.isVisible) {
      this.animFrameId = null;
      return;
    }

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth inertia interpolation for scroll progress
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.085;

    // Update scene based on scroll progress
    this.updateScrollChoreography(this.scrollProgress, elapsedTime, delta);

    // Update post-processing uniforms
    this.cinematicPass.uniforms.uTime.value = elapsedTime;

    // Render pass
    this.composer.render();

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private updateScrollChoreography(progress: number, time: number, delta: number) {
    const p = this.cameraParts;

    // -------------------------------------------------------------
    // Telemetry & Film Transport Simulation
    // -------------------------------------------------------------
    let isRunning = this.finaleControls.isRecording;
    if (progress > 0.12 && progress < 0.28) {
      // Section 2: Format & film path animation
      isRunning = true;
    }

    if (isRunning) {
      this.telemetryState.transportStatus = 'RUN';
      this.telemetryState.filmRemainingFeet = Math.max(0, this.telemetryState.filmRemainingFeet - delta * 5.2);
      // Animate sprockets
      p.filmTransportSprockets.forEach((sp, idx) => {
        sp.rotation.y += delta * (idx === 0 ? 12 : -12);
      });
      // Scroll film texture offset
      if (p.filmStripMesh.material instanceof THREE.MeshStandardMaterial && p.filmStripMesh.material.map) {
        p.filmStripMesh.material.map.offset.x += delta * 1.5;
      }
    } else {
      this.telemetryState.transportStatus = 'STBY';
    }

    this.telemetryState.isRecording = this.finaleControls.isRecording;

    // Tally light glow when recording
    if (this.finaleControls.isRecording) {
      p.tallyLedMat.emissive.setHex(0xff0000);
      p.tallyLedMat.emissiveIntensity = 2.5 + Math.sin(time * 8) * 0.4;
    } else {
      p.tallyLedMat.emissive.setHex(0x000000);
      p.tallyLedMat.emissiveIntensity = 0.0;
    }

    // Push telemetry updates to canvas texture
    p.telemetryTexture.update(this.telemetryState);
    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({ ...this.telemetryState });
    }

    // -------------------------------------------------------------
    // SECTION 1: HERO (0.00 - 0.14)
    // Rotating assembled camera with shallow DoF
    // -------------------------------------------------------------
    if (progress <= 0.14) {
      const t = progress / 0.14;
      this.cinematicScene.group.visible = false;
      this.scene.fog!.color.setHex(0x0a0a0a);

      // Reassemble all parts
      this.resetExplodedOffsets();
      p.acousticHousing.position.y = 12.0;
      p.mirrorArm.position.x = 4.0;

      // Camera gentle orbit
      const angle = (time * 0.25) + t * 0.8;
      const radius = 4.8;
      this.camera.position.set(Math.sin(angle) * radius, 0.4 + Math.sin(time * 0.3) * 0.1, Math.cos(angle) * radius);
      this.camera.lookAt(0, 0.05, 0.4);

      this.cinematicPass.uniforms.uFocusBlur.value = 0.0;
    }
    // -------------------------------------------------------------
    // SECTION 2: THE FORMAT & HORIZONTAL FILM GATE (0.14 - 0.28)
    // -------------------------------------------------------------
    else if (progress > 0.14 && progress <= 0.28) {
      const t = (progress - 0.14) / 0.14;
      this.cinematicScene.group.visible = false;
      this.resetExplodedOffsets();
      p.acousticHousing.position.y = 12.0;
      p.mirrorArm.position.x = 4.0;

      // Close-up cinematic angle focusing squarely on the 65mm film gate & sprockets
      const startCam = new THREE.Vector3(1.8, 0.5, 3.8);
      const endCam = new THREE.Vector3(-0.4, 0.15, 1.85); // tight gate close-up
      this.camera.position.lerpVectors(startCam, endCam, t);
      this.camera.lookAt(0, 0.05, 0.55);

      // Rotate camera model gently to catch reflections on the celluloid ribbon
      p.root.rotation.y = THREE.MathUtils.lerp(0.1, -0.25, t);
      p.root.rotation.x = THREE.MathUtils.lerp(0, 0.08, t);
    }
    // -------------------------------------------------------------
    // SECTION 3: EXPLODED VIEW (0.28 - 0.48)
    // Separates 7 named components along mechanical axes
    // -------------------------------------------------------------
    else if (progress > 0.28 && progress <= 0.48) {
      const t = (progress - 0.28) / 0.2;
      this.cinematicScene.group.visible = false;
      p.acousticHousing.position.y = 12.0;
      p.mirrorArm.position.x = 4.0;

      // Camera pulls back to isometric cinematic vantage
      this.camera.position.set(-2.8, 2.0, 4.4);
      this.camera.lookAt(0, 0.1, 0.2);
      p.root.rotation.set(0.12, -0.35, 0);

      // Smoothly offset individual parts
      const factor = Math.sin(t * Math.PI * 0.5);

      // 1. Film Magazine lifts up and back
      p.filmMagazine.position.set(0, 1.35 * factor, -1.1 * factor);

      // 2. Film Transport slides out right/rear
      p.filmTransport.position.set(1.4 * factor, 0.1 * factor, -0.3 * factor);

      // 3. Central Lens Assembly (with Matte Box) moves straight forward
      p.lensAssembly.position.set(0, 0, 1.85 * factor);

      // 4. Digital Telemetry Display shifts left
      p.telemetryDisplay.position.set(-1.35 * factor, 0.2 * factor, 0);

      // 5. Reflex Viewfinder lifts up-right
      p.reflexViewfinder.position.set(1.1 * factor, 1.2 * factor, 0.4 * factor);

      // 6. Monitoring Module swings out left-rear
      p.monitoringModule.position.set(-1.2 * factor, 1.1 * factor, -0.6 * factor);

      // Carbon body stays central with subtle floating hover
      p.carbonBody.position.set(0, Math.sin(time * 1.5) * 0.04 * factor, 0);

      // Highlight hovered component and dim others
      this.applyPartHoverHighlight(this.hoveredPart);
    }
    // -------------------------------------------------------------
    // SECTION 4: THE NOISE PROBLEM / ACOUSTIC HOUSING (0.48 - 0.62)
    // Camera reassembles and lowers into heavy soundproof blimp
    // -------------------------------------------------------------
    else if (progress > 0.48 && progress <= 0.62) {
      const t = (progress - 0.48) / 0.14;
      this.cinematicScene.group.visible = false;
      this.resetExplodedOffsets();
      p.mirrorArm.position.x = 4.0;

      // Camera pulls back to wide shot to showcase scale of massive blimp enclosure
      this.camera.position.set(3.4, 2.2, 5.2);
      this.camera.lookAt(0, 0, 0);
      p.root.rotation.set(0.1, 0.4, 0);

      // Blimp enclosure lowers down from y=10.0 to y=0.0 with heavy industrial settling
      const blimpY = THREE.MathUtils.lerp(9.0, 0.0, Math.min(1, t * 1.15));
      p.acousticHousing.position.y = blimpY;

      // Heavy contact clunk / slight camera shake as it docks
      if (t > 0.85 && t < 0.95) {
        this.camera.position.y += (Math.random() - 0.5) * 0.04;
      }
    }
    // -------------------------------------------------------------
    // SECTION 5: THE MIRROR SOLUTION (0.62 - 0.76)
    // Attaches twin-mirror viewing arm, animates ray path
    // -------------------------------------------------------------
    else if (progress > 0.62 && progress <= 0.76) {
      const t = (progress - 0.62) / 0.14;
      this.cinematicScene.group.visible = false;
      this.resetExplodedOffsets();
      p.acousticHousing.position.y = 0.0; // blimp remains mounted

      // Camera frames the lens and twin-mirror viewing arm from front three-quarters
      this.camera.position.set(1.8, 1.2, 3.8);
      this.camera.lookAt(0.9, 0.1, 1.5);
      p.root.rotation.set(0.05, 0.15, 0);

      // Mirror arm mounts into place beside the lens
      const armX = THREE.MathUtils.lerp(2.8, 0.0, Math.min(1, t * 1.3));
      p.mirrorArm.position.x = armX;

      // Animate laser sightline pulse traveling through the two mirrors
      const pulseT = (time * 1.8) % 1.0;
      if (pulseT < 0.33) {
        // Leg 1: Scene to Mirror 1
        const lt = pulseT / 0.33;
        p.sightlineGlow.position.lerpVectors(new THREE.Vector3(0, 0.05, 3.5), new THREE.Vector3(0.95, 0.05, 1.95), lt);
      } else if (pulseT < 0.66) {
        // Leg 2: Mirror 1 to Mirror 2
        const lt = (pulseT - 0.33) / 0.33;
        p.sightlineGlow.position.lerpVectors(new THREE.Vector3(0.95, 0.05, 1.95), new THREE.Vector3(2.05, 0.05, 1.95), lt);
      } else {
        // Leg 3: Mirror 2 out to Actor Eyeline
        const lt = (pulseT - 0.66) / 0.34;
        p.sightlineGlow.position.lerpVectors(new THREE.Vector3(2.05, 0.05, 1.95), new THREE.Vector3(2.05, 0.05, 3.5), lt);
      }
    }
    // -------------------------------------------------------------
    // SECTION 6: ENGINEERING STORY (0.76 - 0.86)
    // Moodily lit cinematic profile on studio floor with glowing telemetry
    // -------------------------------------------------------------
    else if (progress > 0.76 && progress <= 0.86) {
      const t = (progress - 0.76) / 0.1;
      this.cinematicScene.group.visible = false;
      this.resetExplodedOffsets();
      p.acousticHousing.position.y = 12.0;
      p.mirrorArm.position.x = 4.0;

      // Moody studio profile framing the left flank telemetry screen and prime lens
      this.camera.position.set(-3.2, 0.2, 1.5);
      this.camera.lookAt(-0.2, 0.1, 0.2);
      p.root.rotation.set(0, -0.6 + t * 0.2, 0);

      // Dramatic amber rim light emphasis
      this.amberAccentLight.intensity = 3.5;
    }
    // -------------------------------------------------------------
    // SECTION 7: INTERACTIVE FINALE (0.86 - 1.00)
    // Points camera into live procedural 3D scene (moonlit ocean, galley)
    // -------------------------------------------------------------
    else {
      this.cinematicScene.group.visible = true;
      this.resetExplodedOffsets();
      p.acousticHousing.position.y = 12.0;
      p.mirrorArm.position.x = 4.0;

      // Update procedural wave displacement and ship motion
      this.cinematicScene.update(time);

      // Interactive user framing: Pan & Tilt controls
      const panOffset = this.finaleControls.pan * 14.0;
      const tiltOffset = this.finaleControls.tilt * 8.0;

      // Camera sits right behind the 65mm camera viewfinder / lens axis,
      // looking forward through the cinema framing into the moonlit scene
      const camX = 0 + this.finaleControls.pan * 2.5;
      const camY = 1.6 + this.finaleControls.tilt * 1.5;
      const camZ = -2.8;

      this.camera.position.set(camX, camY, camZ);

      // Target lookAt point into the procedural scene
      const lookTarget = new THREE.Vector3(panOffset, tiltOffset + 2.0, 45);
      this.camera.lookAt(lookTarget);

      // The 65mm camera body aims smoothly toward the same shot
      p.root.position.set(0, 0, 0);
      p.root.rotation.set(-this.finaleControls.tilt * 0.25, -this.finaleControls.pan * 0.35 + Math.PI, 0);

      // Rotate focus ring when user adjusts rack focus
      p.lensFocusRing.rotation.z = this.finaleControls.rackFocus * Math.PI * 1.8;

      // Real 65mm Cinema Prime Focus Breathing:
      // When pulling focus to near close-up, optical focal length subtly expands (field of view narrows slightly)
      const focusParam = this.finaleControls.rackFocus; // 0 = near rocks [8m], 0.5 = galley [40m], 1 = horizon [∞]
      const targetFov = 40.0 + (1.0 - focusParam) * 2.2;
      if (Math.abs(this.camera.fov - targetFov) > 0.01) {
        this.camera.fov = targetFov;
        this.camera.updateProjectionMatrix();
      }

      // Optical Bokeh & Blur Simulation:
      // Sharpest at discrete focal planes, soft transition blur between focus pulls
      const distToFocalPlane = Math.min(
        Math.abs(focusParam - 0.08), // Near rocks
        Math.abs(focusParam - 0.50), // Galley ship
        Math.abs(focusParam - 0.95)  // Moon / horizon
      );
      this.cinematicPass.uniforms.uFocusBlur.value = distToFocalPlane * 0.18;
    }
  }

  private resetExplodedOffsets() {
    const p = this.cameraParts;
    p.carbonBody.position.set(0, 0, 0);
    p.filmMagazine.position.set(0, 0, 0);
    p.filmTransport.position.set(0, 0, 0);
    p.lensAssembly.position.set(0, 0, 0);
    p.telemetryDisplay.position.set(0, 0, 0);
    p.reflexViewfinder.position.set(0, 0, 0);
    p.monitoringModule.position.set(0, 0, 0);

    // Reset all material opacities/highlights
    p.allMaterials.forEach((mat) => {
      if ('opacity' in mat && mat !== p.allMaterials.find(m => m === p.sightline.material)) {
        mat.opacity = 1.0;
      }
    });
  }

  private applyPartHoverHighlight(hoveredKey: CameraComponentKey | null) {
    const p = this.cameraParts;
    if (!hoveredKey) {
      this.resetMaterialDimming();
      return;
    }

    const groupsMap: Record<CameraComponentKey, THREE.Group> = {
      carbonBody: p.carbonBody,
      filmMagazine: p.filmMagazine,
      filmTransport: p.filmTransport,
      lensAssembly: p.lensAssembly,
      telemetryDisplay: p.telemetryDisplay,
      reflexViewfinder: p.reflexViewfinder,
      monitoringModule: p.monitoringModule,
    };

    // Dim non-hovered components subtly
    Object.entries(groupsMap).forEach(([key, group]) => {
      const isTarget = key === hoveredKey;
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (isTarget) {
            mat.emissive?.setHex?.(0x38bdf8);
            mat.emissiveIntensity = 0.25;
          } else {
            mat.emissive?.setHex?.(0x000000);
            mat.emissiveIntensity = 0.0;
          }
        }
      });
    });
  }

  private resetMaterialDimming() {
    this.cameraParts.root.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material && child.material !== this.cameraParts.tallyLedMat && child.material !== this.cameraParts.telemetryTexture.texture) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.emissive?.setHex?.(0x000000);
        mat.emissiveIntensity = 0.0;
      }
    });
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibility);

    this.renderer.dispose();
    this.composer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
