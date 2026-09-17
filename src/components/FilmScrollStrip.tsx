import React from 'react';

interface FilmScrollStripProps {
  progress: number;
  activeSection: number;
  onJumpToSection: (sectionIndex: number) => void;
}

const SECTIONS = [
  { id: 1, label: 'HERO', frame: 'FR 001' },
  { id: 2, label: 'FORMAT', frame: 'FR 084' },
  { id: 3, label: 'EXPLODED', frame: 'FR 168' },
  { id: 4, label: 'ACOUSTIC', frame: 'FR 252' },
  { id: 5, label: 'MIRROR', frame: 'FR 336' },
  { id: 6, label: 'ENGINEERING', frame: 'FR 420' },
  { id: 7, label: 'FINALE', frame: 'FR 504' },
];

export const FilmScrollStrip: React.FC<FilmScrollStripProps> = ({
  progress,
  activeSection,
  onJumpToSection,
}) => {
  return (
    <aside
      id="film-scroll-strip"
      aria-label="65mm Film Transport Scroll Navigation"
      className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center select-none pointer-events-auto"
    >
      {/* 65mm Celluloid Film Strip Container */}
      <div className="relative w-11 sm:w-13 h-[420px] sm:h-[480px] bg-[#120a04]/90 border border-[#e8a33d]/30 rounded-xs flex flex-col justify-between py-3 backdrop-blur-xs shadow-2xl overflow-hidden">
        
        {/* Left Sprocket Column */}
        <div className="absolute left-1.5 top-0 bottom-0 w-2 flex flex-col justify-around pointer-events-none py-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={`sprocket-l-${i}`}
              className="w-1.5 h-2.5 rounded-[1px] bg-[#0a0a0a] border border-[#e8a33d]/20 my-0.5"
            />
          ))}
        </div>

        {/* Right Sprocket Column */}
        <div className="absolute right-1.5 top-0 bottom-0 w-2 flex flex-col justify-around pointer-events-none py-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={`sprocket-r-${i}`}
              className="w-1.5 h-2.5 rounded-[1px] bg-[#0a0a0a] border border-[#e8a33d]/20 my-0.5"
            />
          ))}
        </div>

        {/* Film Strip Frame Markers */}
        <div className="relative z-10 flex flex-col justify-between h-full px-3 text-[9px] font-mono-code">
          {SECTIONS.map((sec, idx) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                id={`film-frame-btn-${sec.id}`}
                onClick={() => onJumpToSection(idx)}
                className={`group flex items-center justify-between py-1 transition-all text-left ${
                  isActive ? 'text-[#e8a33d] font-bold' : 'text-[#f4f1ea]/40 hover:text-[#f4f1ea]'
                }`}
                title={`Jump to Section ${sec.id}: ${sec.label}`}
              >
                <span className="text-[8px] tracking-tight">{sec.id}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isActive
                      ? 'bg-[#e8a33d] shadow-[0_0_8px_#e8a33d] scale-125'
                      : 'bg-[#f4f1ea]/20 group-hover:bg-[#f4f1ea]/60'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Scrub Playhead Ribbon Indicator */}
        <div
          className="absolute left-0 right-0 h-4 border-y border-[#e8a33d] bg-[#e8a33d]/20 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            top: `${Math.min(96, Math.max(2, progress * 96))}%`,
          }}
        >
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-2 bg-[#e8a33d] rounded-r" />
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-2 bg-[#e8a33d] rounded-l" />
        </div>

        {/* Film Edge Latent KeyKode imprint */}
        <div className="absolute inset-x-0 bottom-0 py-0.5 bg-[#0a0a0a]/80 text-center">
          <p className="text-[6.5px] font-mono-code text-[#e8a33d]/60 tracking-widest uppercase">
            65MM 15-PERF
          </p>
        </div>
      </div>

      {/* Progress Telemetry Readout */}
      <div className="mt-2 text-center font-mono-code">
        <span className="text-[10px] text-[#e8a33d] font-bold">
          {(progress * 100).toFixed(0)}%
        </span>
        <span className="block text-[8px] text-[#f4f1ea]/40 uppercase tracking-tighter">
          GATE PULL
        </span>
      </div>
    </aside>
  );
};
