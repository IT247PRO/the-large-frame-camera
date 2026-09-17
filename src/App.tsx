/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CameraSceneManager } from './three/sceneManager';
import { FilmScrollStrip } from './components/FilmScrollStrip';
import { ExplodedOverlay } from './components/ExplodedOverlay';
import { FinaleControlDeck } from './components/FinaleControls';
import { SectionsOverlay } from './components/SectionsOverlay';
import { cameraAudio } from './audio/cameraAudio';
import { CameraComponentKey, FinaleControls, TelemetryData } from './types';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<CameraSceneManager | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(1);
  const [hoveredPart, setHoveredPart] = useState<CameraComponentKey | null>(null);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    fps: 24.0,
    filmRemainingFeet: 984,
    filmCapacityFeet: 1000,
    temperatureC: 21.4,
    voltageV: 24.2,
    currentA: 3.1,
    transportStatus: 'STBY',
    timecode: '01:24:16:12',
    isRecording: false,
  });

  const [finaleControls, setFinaleControls] = useState<FinaleControls>({
    rackFocus: 0.5,
    pan: 0,
    tilt: 0,
    aspectRatio: '1.43',
    isRecording: false,
    isMuted: false,
    showHorizon: true,
    activeFilter: 'none',
  });

  // Initialize Three.js scene manager
  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new CameraSceneManager(containerRef.current);
    sceneManagerRef.current = manager;

    manager.setTelemetryCallback((data) => {
      setTelemetry(data);
    });

    return () => {
      manager.destroy();
      sceneManagerRef.current = null;
    };
  }, []);

  // Window scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
      setScrollProgress(progress);

      // Determine active section (1 to 7)
      let sec = 1;
      if (progress <= 0.14) sec = 1;
      else if (progress <= 0.28) sec = 2;
      else if (progress <= 0.48) sec = 3;
      else if (progress <= 0.62) sec = 4;
      else if (progress <= 0.76) sec = 5;
      else if (progress <= 0.86) sec = 6;
      else sec = 7;

      setActiveSection(sec);

      if (sceneManagerRef.current) {
        sceneManagerRef.current.setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update hovered part in 3D scene
  const handleHoverPart = useCallback((part: CameraComponentKey | null) => {
    setHoveredPart(part);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setHoveredPart(part);
    }
  }, []);

  // Update finale controls
  const handleFinaleControlsChange = useCallback((updated: Partial<FinaleControls>) => {
    setFinaleControls((prev) => {
      const next = { ...prev, ...updated };
      if (sceneManagerRef.current) {
        sceneManagerRef.current.updateFinaleControls(next);
      }
      if (updated.isMuted !== undefined) {
        cameraAudio.setMuted(updated.isMuted);
      }
      return next;
    });
  }, []);

  // Toggle record button
  const handleTriggerRecord = useCallback(() => {
    setFinaleControls((prev) => {
      const nextRecording = !prev.isRecording;
      const next = { ...prev, isRecording: nextRecording };

      if (sceneManagerRef.current) {
        sceneManagerRef.current.updateFinaleControls(next);
      }

      if (nextRecording) {
        cameraAudio.playShutterClick();
        cameraAudio.startFilmTransport(1.0);
      } else {
        cameraAudio.playShutterClick();
        cameraAudio.stopFilmTransport();
      }

      return next;
    });
  }, []);

  // Jump to specific section from film scroll strip
  const handleJumpToSection = useCallback((sectionIdx: number) => {
    const sectionProgressMap = [0.0, 0.21, 0.38, 0.55, 0.69, 0.81, 0.94];
    const targetProg = sectionProgressMap[sectionIdx] ?? 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: targetProg * maxScroll,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="relative bg-[#0a0a0a] text-[#f4f1ea] min-h-screen selection:bg-[#e8a33d] selection:text-[#0a0a0a]">
      {/* 1. FIXED 3D CANVAS CONTAINER */}
      <div
        id="webgl-3d-canvas-container"
        ref={containerRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* 2. FILM SCROLL STRIP MOTIF (Always visible on side) */}
      <FilmScrollStrip
        progress={scrollProgress}
        activeSection={activeSection}
        onJumpToSection={handleJumpToSection}
      />

      {/* 3. CINEMATIC TEXT NARRATIVE OVERLAY */}
      <SectionsOverlay scrollProgress={scrollProgress} />

      {/* 4. INTERACTIVE EXPLODED VIEW HUD (Active during Section 3) */}
      <ExplodedOverlay
        hoveredPart={hoveredPart}
        onHoverPart={handleHoverPart}
        isVisible={scrollProgress > 0.26 && scrollProgress <= 0.49}
      />

      {/* 5. FINALE OPERATING DECK (Active during Section 7) */}
      <FinaleControlDeck
        controls={finaleControls}
        telemetry={telemetry}
        onChange={handleFinaleControlsChange}
        onTriggerRecord={handleTriggerRecord}
        isVisible={scrollProgress > 0.84}
      />

      {/* 6. VIRTUAL SCROLL TRACK (7 Full-Height Sections) */}
      <div className="relative z-10 pointer-events-none">
        {/* Section 1: Hero */}
        <section id="section-1-hero" className="h-screen w-full" />

        {/* Section 2: The Format */}
        <section id="section-2-format" className="h-screen w-full" />

        {/* Section 3: Exploded View */}
        <section id="section-3-exploded" className="h-[150vh] w-full" />

        {/* Section 4: The Noise Problem */}
        <section id="section-4-noise" className="h-screen w-full" />

        {/* Section 5: The Mirror Solution */}
        <section id="section-5-mirror" className="h-screen w-full" />

        {/* Section 6: Engineering Story */}
        <section id="section-6-engineering" className="h-screen w-full" />

        {/* Section 7: Interactive Finale */}
        <section id="section-7-finale" className="h-[180vh] w-full" />
      </div>
    </div>
  );
}
