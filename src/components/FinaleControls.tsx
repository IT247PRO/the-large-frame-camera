import React from 'react';
import { FinaleControls, TelemetryData } from '../types';
import { Volume2, VolumeX, Crosshair, Film, Disc } from 'lucide-react';

interface FinaleControlsProps {
  controls: FinaleControls;
  telemetry: TelemetryData;
  onChange: (updated: Partial<FinaleControls>) => void;
  onTriggerRecord: () => void;
  isVisible: boolean;
}

export const FinaleControlDeck: React.FC<FinaleControlsProps> = ({
  controls,
  telemetry,
  onChange,
  onTriggerRecord,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      id="finale-operating-deck"
      className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-6"
    >
      {/* 1. CINEMA RETICLE & FORMAT FRAME LINES (Viewfinder overlay) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Aspect Ratio Framing Mask */}
        <div
          className={`relative border transition-all duration-300 pointer-events-none ${
            controls.aspectRatio === '1.43'
              ? 'w-[88vw] max-w-[720px] aspect-[1.43/1] border-[#e8a33d]/70 shadow-[0_0_0_9999px_rgba(10,10,10,0.55)]'
              : 'w-[94vw] max-w-[920px] aspect-[2.39/1] border-[#38bdf8]/70 shadow-[0_0_0_9999px_rgba(10,10,10,0.78)]'
          }`}
        >
          {/* Format Label Stamp */}
          <div className="absolute top-2 left-3 flex items-center gap-2">
            <span
              className={`text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded-xs ${
                controls.aspectRatio === '1.43'
                  ? 'bg-[#e8a33d] text-[#0a0a0a]'
                  : 'bg-[#38bdf8] text-[#0a0a0a]'
              }`}
            >
              {controls.aspectRatio === '1.43' ? '65MM FULL GATE (1.43:1)' : 'CONVENTIONAL SCOPE (2.39:1)'}
            </span>
            <span className="text-[9px] font-mono-code text-[#f4f1ea]/60 hidden sm:inline">
              15-PERFORATION APERTURE
            </span>
          </div>

          {/* Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-0.5 bg-[#f4f1ea]/40" />
            <div className="h-12 w-0.5 bg-[#f4f1ea]/40 absolute" />
            <div className="w-4 h-4 border border-[#f4f1ea]/30 rounded-full absolute" />
          </div>

          {/* Action Safe (90%) and Title Safe (80%) guide tick marks */}
          <div className="absolute inset-[5%] border border-[#f4f1ea]/15 pointer-events-none" />
          <div className="absolute inset-[10%] border border-[#f4f1ea]/10 pointer-events-none" />

          {/* Horizon Level Indicator */}
          {controls.showHorizon && (
            <div className="absolute left-1/2 bottom-8 -translate-x-1/2 flex items-center gap-2 bg-[#0a0a0a]/80 px-2 py-0.5 border border-[#f4f1ea]/20 rounded-xs">
              <span className="text-[8px] font-mono-code text-[#38bdf8]">HORIZON</span>
              <div className="w-16 h-1 bg-[#1a1a1a] rounded relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-[#38bdf8] transition-all"
                  style={{ left: `${50 + controls.tilt * 40}%` }}
                />
              </div>
              <span className="text-[8px] font-mono-code text-[#f4f1ea]">
                {(controls.tilt * 10).toFixed(1)}°
              </span>
            </div>
          )}

          {/* Live Recording Watermark */}
          {controls.isRecording && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#dc2626] text-white px-2 py-0.5 rounded-xs animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-[10px] font-mono-code font-bold">REC 24 FPS</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. TOP STATUS BAR */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto bg-[#0a0a0a]/85 border border-[#f4f1ea]/10 p-2 sm:p-3 backdrop-blur-md max-w-3xl mx-auto w-full rounded-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                controls.isRecording ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-mono-code font-bold tracking-wider text-[#f4f1ea]">
              {controls.isRecording ? 'CAPTURING 65MM' : 'OPERATOR STANDBY'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono-code text-[#f4f1ea]/70 border-l border-[#f4f1ea]/20 pl-3">
            <span>FPS: <strong className="text-[#38bdf8]">{telemetry.fps.toFixed(1)}</strong></span>
            <span>SHUTTER: <strong className="text-[#f4f1ea]">180.0°</strong></span>
            <span>MAG: <strong className="text-[#e8a33d]">{Math.round(telemetry.filmRemainingFeet)} FT</strong></span>
          </div>
        </div>

        {/* Mute and Horizon Toggles */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-audio-btn"
            onClick={() => onChange({ isMuted: !controls.isMuted })}
            className="p-1.5 border border-[#f4f1ea]/20 hover:border-[#e8a33d] text-[#f4f1ea] rounded-xs transition-colors"
            title={controls.isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {controls.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          <button
            id="toggle-horizon-btn"
            onClick={() => onChange({ showHorizon: !controls.showHorizon })}
            className={`p-1.5 border rounded-xs transition-colors ${
              controls.showHorizon
                ? 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/10'
                : 'border-[#f4f1ea]/20 text-[#f4f1ea]/60'
            }`}
            title="Toggle Reticle & Horizon Gauge"
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM OPERATING CONTROL CONSOLE */}
      <div className="relative z-10 pointer-events-auto bg-[#0a0a0a]/92 border border-[#e8a33d]/30 p-3 sm:p-4 backdrop-blur-md max-w-3xl mx-auto w-full rounded-xs shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* CONTROL 1: RACK FOCUS */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono-code">
              <span className="text-[#e8a33d] font-bold uppercase">1. RACK FOCUS</span>
              <span className="text-[#f4f1ea]/60">
                {controls.rackFocus < 0.25
                  ? 'NEAR (ROCKS ~8M)'
                  : controls.rackFocus < 0.75
                  ? 'MID (GALLEY ~40M)'
                  : 'INF (HORIZON/MOON)'}
              </span>
            </div>

            <input
              id="rack-focus-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={controls.rackFocus}
              onChange={(e) => onChange({ rackFocus: parseFloat(e.target.value) })}
              className="w-full accent-[#e8a33d] cursor-pointer h-1.5 bg-[#1e232d] rounded"
            />

            {/* Quick focus presets */}
            <div className="flex justify-between gap-1 text-[8px] font-mono-code">
              <button
                id="focus-preset-near"
                onClick={() => onChange({ rackFocus: 0.05 })}
                className={`px-1.5 py-0.5 border rounded-xs transition-all ${
                  controls.rackFocus <= 0.2 ? 'border-[#e8a33d] text-[#e8a33d] bg-[#e8a33d]/10' : 'border-[#f4f1ea]/15 text-[#f4f1ea]/50'
                }`}
              >
                ROCKS [8M]
              </button>
              <button
                id="focus-preset-ship"
                onClick={() => onChange({ rackFocus: 0.5 })}
                className={`px-1.5 py-0.5 border rounded-xs transition-all ${
                  controls.rackFocus > 0.2 && controls.rackFocus < 0.8 ? 'border-[#e8a33d] text-[#e8a33d] bg-[#e8a33d]/10' : 'border-[#f4f1ea]/15 text-[#f4f1ea]/50'
                }`}
              >
                SHIP [40M]
              </button>
              <button
                id="focus-preset-moon"
                onClick={() => onChange({ rackFocus: 0.95 })}
                className={`px-1.5 py-0.5 border rounded-xs transition-all ${
                  controls.rackFocus >= 0.8 ? 'border-[#e8a33d] text-[#e8a33d] bg-[#e8a33d]/10' : 'border-[#f4f1ea]/15 text-[#f4f1ea]/50'
                }`}
              >
                MOON [∞]
              </button>
            </div>
          </div>

          {/* CONTROL 2: PAN & TILT FRAMING */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-mono-code">
              <span className="text-[#e8a33d] font-bold uppercase">2. FRAME SHOT</span>
              <button
                id="reset-frame-btn"
                onClick={() => onChange({ pan: 0, tilt: 0 })}
                className="text-[8px] text-[#38bdf8] hover:underline"
              >
                RE-CENTER
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[8px] font-mono-code text-[#f4f1ea]/50 mb-0.5">
                  <span>PAN</span>
                  <span>{(controls.pan * 45).toFixed(0)}°</span>
                </div>
                <input
                  id="pan-slider"
                  type="range"
                  min="-1"
                  max="1"
                  step="0.02"
                  value={controls.pan}
                  onChange={(e) => onChange({ pan: parseFloat(e.target.value) })}
                  className="w-full accent-[#38bdf8] cursor-pointer h-1.5 bg-[#1e232d] rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-[8px] font-mono-code text-[#f4f1ea]/50 mb-0.5">
                  <span>TILT</span>
                  <span>{(controls.tilt * 25).toFixed(0)}°</span>
                </div>
                <input
                  id="tilt-slider"
                  type="range"
                  min="-1"
                  max="1"
                  step="0.02"
                  value={controls.tilt}
                  onChange={(e) => onChange({ tilt: parseFloat(e.target.value) })}
                  className="w-full accent-[#38bdf8] cursor-pointer h-1.5 bg-[#1e232d] rounded"
                />
              </div>
            </div>
          </div>

          {/* CONTROL 3 & 4: FORMAT TOGGLE & RECORD TRIGGER */}
          <div className="flex items-center justify-between gap-3">
            {/* Format toggle button */}
            <div className="space-y-1">
              <span className="block text-[10px] font-mono-code text-[#e8a33d] font-bold uppercase">
                3. GATE FORMAT
              </span>
              <div className="flex gap-1">
                <button
                  id="format-btn-143"
                  onClick={() => onChange({ aspectRatio: '1.43' })}
                  className={`px-2 py-1.5 text-[9px] font-mono-code border rounded-xs transition-all flex items-center gap-1 ${
                    controls.aspectRatio === '1.43'
                      ? 'border-[#e8a33d] bg-[#e8a33d] text-[#0a0a0a] font-bold'
                      : 'border-[#f4f1ea]/20 text-[#f4f1ea]/70 hover:border-[#f4f1ea]'
                  }`}
                >
                  <Film size={10} />
                  1.43:1
                </button>
                <button
                  id="format-btn-239"
                  onClick={() => onChange({ aspectRatio: '2.39' })}
                  className={`px-2 py-1.5 text-[9px] font-mono-code border rounded-xs transition-all flex items-center gap-1 ${
                    controls.aspectRatio === '2.39'
                      ? 'border-[#38bdf8] bg-[#38bdf8] text-[#0a0a0a] font-bold'
                      : 'border-[#f4f1ea]/20 text-[#f4f1ea]/70 hover:border-[#f4f1ea]'
                  }`}
                >
                  <Disc size={10} />
                  2.39:1
                </button>
              </div>
            </div>

            {/* Big Record Button */}
            <div className="text-right">
              <span className="block text-[10px] font-mono-code text-[#e8a33d] font-bold uppercase mb-1">
                4. RECORD
              </span>
              <button
                id="record-trigger-btn"
                onClick={onTriggerRecord}
                className={`relative px-4 py-2 border rounded-xs font-mono-code text-xs font-bold transition-all flex items-center gap-2 ${
                  controls.isRecording
                    ? 'bg-[#dc2626] border-[#ef4444] text-white shadow-[0_0_15px_#dc2626] animate-pulse'
                    : 'bg-[#181a20] border-[#f4f1ea]/20 text-[#f4f1ea] hover:border-red-500 hover:text-red-400'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    controls.isRecording ? 'bg-white' : 'bg-red-500'
                  }`}
                />
                {controls.isRecording ? 'CUT SHOT' : 'ROLL FILM'}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
