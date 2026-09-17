import React from 'react';
import { CameraComponentKey, ComponentSpec } from '../types';

interface ExplodedOverlayProps {
  hoveredPart: CameraComponentKey | null;
  onHoverPart: (part: CameraComponentKey | null) => void;
  isVisible: boolean;
}

export const COMPONENT_SPECS: ComponentSpec[] = [
  {
    id: 'carbonBody',
    name: 'Carbon-Fiber Main Body',
    category: 'CHASSIS & SKELETON',
    specs: 'Magnesium Subframe • 2x2 Twill Panels • 15mm Rod Mounts',
    description: 'Ultra-rigid lightweight carbon composite body engineered to absorb high-frequency motor torque.',
    screenPosition: { x: 0.48, y: 0.58 },
    leaderAnchor: { x: 0.48, y: 0.52 },
  },
  {
    id: 'filmMagazine',
    name: '65mm Dual-Drum Magazine',
    category: 'FILM CAPACITY',
    specs: '1,000 FT Load • 3.0 Min Run Time • Horizontal Dual-Core',
    description: 'Houses 65mm celluloid film rolls moving horizontally under constant electronic magnetic tension.',
    screenPosition: { x: 0.38, y: 0.22 },
    leaderAnchor: { x: 0.44, y: 0.32 },
  },
  {
    id: 'filmTransport',
    name: '15-Perf Vacuum Gate & Claws',
    category: 'MECHANICAL TRANSPORT',
    specs: '5.6 FT / SEC Velocity • Dual Registration Pins • ±0.0001" Tolerance',
    description: 'Precision horizontal pulldown mechanism with vacuum-assisted pressure plate for razor optical flatness.',
    screenPosition: { x: 0.76, y: 0.52 },
    leaderAnchor: { x: 0.58, y: 0.48 },
  },
  {
    id: 'lensAssembly',
    name: '65mm T1.4 Cinema Prime & Matte Box',
    category: 'OPTICAL SYSTEM',
    specs: '70mm Image Circle • LPL Mount • 4×5.65 Carbon Eyebrow Flags',
    description: 'Massive aspherical front glass elements with anti-reflective fluorite coating and 0.8 Mod cine focus gears.',
    screenPosition: { x: 0.26, y: 0.74 },
    leaderAnchor: { x: 0.42, y: 0.62 },
  },
  {
    id: 'telemetryDisplay',
    name: 'Body-Mounted Telemetry Screen',
    category: 'ELECTRONICS & POWER',
    specs: '24.000 Crystal Sync • 24.2V Rail • Shutter Angle Readout',
    description: 'High-contrast OLED telemetry panel displaying instantaneous transport velocity, voltage, and film counter.',
    screenPosition: { x: 0.16, y: 0.44 },
    leaderAnchor: { x: 0.32, y: 0.48 },
  },
  {
    id: 'reflexViewfinder',
    name: 'Reflex Optical Viewfinder',
    category: 'DIRECTOR MONITORING',
    specs: 'Rotating Optical Prism • Diopter -4 to +2 • Rubber Eyecup',
    description: 'Zero-latency optical view direct from the mirror shutter for operator focus verification.',
    screenPosition: { x: 0.78, y: 0.24 },
    leaderAnchor: { x: 0.58, y: 0.34 },
  },
  {
    id: 'monitoringModule',
    name: '7" Onboard Director Monitor',
    category: 'DIGITAL VIDEO ASSIST',
    specs: '2,500 Nits High-Bright • 12G-SDI Loop • Friction Arm',
    description: 'Electronic video assist monitor mounted on articulating arm with shielded BNC cable harness.',
    screenPosition: { x: 0.20, y: 0.28 },
    leaderAnchor: { x: 0.35, y: 0.36 },
  },
];

export const ExplodedOverlay: React.FC<ExplodedOverlayProps> = ({
  hoveredPart,
  onHoverPart,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      id="exploded-view-overlay"
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
    >
      {/* Background SVG for Thin Leader Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block">
        {COMPONENT_SPECS.map((comp) => {
          const isHovered = hoveredPart === comp.id;
          const x1 = comp.screenPosition.x * 100;
          const y1 = comp.screenPosition.y * 100;
          const x2 = comp.leaderAnchor.x * 100;
          const y2 = comp.leaderAnchor.y * 100;

          return (
            <g key={`leader-${comp.id}`} className="transition-opacity duration-300">
              <line
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke={isHovered ? '#e8a33d' : 'rgba(244, 241, 234, 0.25)'}
                strokeWidth={isHovered ? 1.5 : 1}
                strokeDasharray={isHovered ? 'none' : '3 3'}
              />
              <circle
                cx={`${x2}%`}
                cy={`${y2}%`}
                r={isHovered ? 4 : 2.5}
                fill={isHovered ? '#e8a33d' : '#f4f1ea'}
              />
            </g>
          );
        })}
      </svg>

      {/* Desktop Floating HUD Component Cards */}
      <div className="hidden md:block w-full h-full relative">
        {COMPONENT_SPECS.map((comp) => {
          const isHovered = hoveredPart === comp.id;
          const isOtherHovered = hoveredPart !== null && !isHovered;

          return (
            <div
              key={comp.id}
              id={`spec-card-${comp.id}`}
              onMouseEnter={() => onHoverPart(comp.id)}
              onMouseLeave={() => onHoverPart(null)}
              className={`absolute pointer-events-auto transition-all duration-300 cursor-pointer ${
                isOtherHovered ? 'opacity-35 scale-95' : 'opacity-100 scale-100'
              }`}
              style={{
                left: `${comp.screenPosition.x * 100}%`,
                top: `${comp.screenPosition.y * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`w-64 p-3 border transition-colors duration-200 backdrop-blur-md ${
                  isHovered
                    ? 'bg-[#121418]/95 border-[#e8a33d] shadow-[0_0_20px_rgba(232,163,61,0.2)]'
                    : 'bg-[#0a0a0a]/85 border-[#f4f1ea]/15 hover:border-[#e8a33d]/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono-code text-[#e8a33d] uppercase tracking-widest">
                    {comp.category}
                  </span>
                  <span className="text-[9px] font-mono-code text-[#f4f1ea]/40">
                    65MM-MOD
                  </span>
                </div>
                <h4 className="text-xs font-condensed uppercase tracking-wider text-[#f4f1ea] font-semibold">
                  {comp.name}
                </h4>
                <p className="text-[10px] font-mono-code text-[#e8a33d]/90 mt-1">
                  {comp.specs}
                </p>
                {isHovered && (
                  <p className="text-[11px] text-[#f4f1ea]/80 mt-1.5 leading-tight font-sans">
                    {comp.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Drawer list for Exploded View */}
      <div className="md:hidden absolute bottom-4 inset-x-3 pointer-events-auto max-h-[35vh] overflow-y-auto bg-[#0a0a0a]/95 border border-[#e8a33d]/30 p-3 backdrop-blur-md rounded-xs">
        <div className="text-[10px] font-mono-code text-[#e8a33d] mb-2 uppercase tracking-widest">
          EXPLODED 65MM SUBSYSTEMS (TAP TO INSPECT)
        </div>
        <div className="space-y-2">
          {COMPONENT_SPECS.map((comp) => {
            const isHovered = hoveredPart === comp.id;
            return (
              <button
                key={comp.id}
                id={`mobile-spec-btn-${comp.id}`}
                onClick={() => onHoverPart(isHovered ? null : comp.id)}
                className={`w-full text-left p-2 border transition-all ${
                  isHovered
                    ? 'border-[#e8a33d] bg-[#1a1c22]'
                    : 'border-[#f4f1ea]/10 bg-[#0e1014]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-condensed text-[#f4f1ea] font-bold uppercase">
                    {comp.name}
                  </span>
                  <span className="text-[8px] font-mono-code text-[#e8a33d]">
                    {isHovered ? 'ACTIVE' : 'SELECT'}
                  </span>
                </div>
                <p className="text-[9px] font-mono-code text-[#e8a33d]/80 mt-0.5">
                  {comp.specs}
                </p>
                {isHovered && (
                  <p className="text-[10px] text-[#f4f1ea]/80 mt-1">
                    {comp.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
