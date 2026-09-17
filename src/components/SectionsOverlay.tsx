import React from 'react';

interface SectionsOverlayProps {
  scrollProgress: number;
}

export const SectionsOverlay: React.FC<SectionsOverlayProps> = ({ scrollProgress }) => {
  // Compute active section visibility based on progress thresholds
  const s1Active = scrollProgress <= 0.14;
  const s2Active = scrollProgress > 0.14 && scrollProgress <= 0.28;
  const s3Active = scrollProgress > 0.28 && scrollProgress <= 0.48;
  const s4Active = scrollProgress > 0.48 && scrollProgress <= 0.62;
  const s5Active = scrollProgress > 0.62 && scrollProgress <= 0.76;
  const s6Active = scrollProgress > 0.76 && scrollProgress <= 0.86;
  const s7Active = scrollProgress > 0.86;

  return (
    <div
      id="sections-narrative-overlay"
      className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-12 md:p-16 max-w-7xl mx-auto"
    >
      {/* SECTION 1 - HERO */}
      <div
        className={`transition-all duration-700 max-w-2xl ${
          s1Active
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-8 pointer-events-none absolute'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-[1px] bg-[#e8a33d]" />
          <span className="text-[11px] font-mono-code tracking-[0.25em] text-[#e8a33d] uppercase font-semibold">
            65MM 15-PERFORATION SPECIFICATION
          </span>
        </div>
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-condensed tracking-tight uppercase text-[#f4f1ea] leading-[0.9] font-bold">
          THE LARGE-FORMAT <br />
          <span className="text-[#e8a33d]">CAMERA</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-[#f4f1ea]/80 font-sans max-w-lg leading-relaxed">
          A machine built to capture cinema at its largest scale.
        </p>

        <div className="mt-10 flex items-center gap-4 text-xs font-mono-code text-[#f4f1ea]/50">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e8a33d] animate-ping" />
            SCROLL TO ADVANCE TRANSPORT
          </span>
          <span>•</span>
          <span>70MM HORIZONTAL GATE</span>
        </div>
      </div>

      {/* SECTION 2 - THE FORMAT */}
      <div
        className={`transition-all duration-700 max-w-xl ${
          s2Active
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none absolute'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-[1px] bg-[#e8a33d]" />
          <span className="text-[11px] font-mono-code tracking-[0.2em] text-[#e8a33d] uppercase">
            SECTION 02 — THE FORMAT
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-condensed tracking-tight uppercase text-[#f4f1ea] leading-none font-bold">
          15 PERFORATIONS <br />
          PER FRAME
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#f4f1ea]/90 leading-relaxed font-sans">
          Fifteen-perforation large-format film moves more than five feet every second. Its scale
          creates extraordinary image detail - and extraordinary mechanical noise.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#f4f1ea]/15 pt-4 text-xs font-mono-code text-[#f4f1ea]/70">
          <div>
            <span className="block text-[#e8a33d] text-lg font-bold">5.6 FT/S</span>
            <span>PULLDOWN SPEED</span>
          </div>
          <div>
            <span className="block text-[#f4f1ea] text-lg font-bold">70.4 × 48.5 MM</span>
            <span>NEGATIVE GATE AREA</span>
          </div>
        </div>
      </div>

      {/* SECTION 3 - EXPLODED VIEW */}
      <div
        className={`transition-all duration-700 max-w-xl ${
          s3Active
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none absolute'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-[1px] bg-[#e8a33d]" />
          <span className="text-[11px] font-mono-code tracking-[0.2em] text-[#e8a33d] uppercase">
            SECTION 03 — DISASSEMBLY
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-condensed tracking-tight uppercase text-[#f4f1ea] leading-none font-bold">
          EXPLODED VIEW
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#f4f1ea]/80 leading-relaxed font-sans">
          Separable, named components designed to withstand intense mechanical stresses while isolating the optical axis.
        </p>
        <p className="mt-2 text-xs font-mono-code text-[#e8a33d]">
          [ HOVER ANY COMPONENT TO ISOLATE SUBSYSTEM SPECIFICATIONS ]
        </p>
      </div>

      {/* SECTION 4 - THE NOISE PROBLEM */}
      <div
        className={`transition-all duration-700 max-w-xl ${
          s4Active
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none absolute'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-[1px] bg-[#e8a33d]" />
          <span className="text-[11px] font-mono-code tracking-[0.2em] text-[#e8a33d] uppercase">
            SECTION 04 — ACOUSTICS
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-condensed tracking-tight uppercase text-[#f4f1ea] leading-none font-bold">
          THE NOISE <br />
          PROBLEM
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#f4f1ea]/90 leading-relaxed font-sans">
          Large-format film moves fast, and fast film is loud. The solution is a heavy acoustic
          enclosure engineered to make dialogue recording possible.
        </p>
        <div className="mt-6 border-l-2 border-[#e8a33d] pl-4 text-xs font-mono-code text-[#f4f1ea]/70">
          CAST HOUSING WEIGHT: ~240 LBS • CRANE BALANCED • NEOPRENE ACOUSTIC SEALS
        </div>
      </div>

      {/* SECTION 5 - THE MIRROR SOLUTION */}
      <div
        className={`transition-all duration-700 max-w-xl ${
          s5Active
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none absolute'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-[1px] bg-[#e8a33d]" />
          <span className="text-[11px] font-mono-code tracking-[0.2em] text-[#e8a33d] uppercase">
            SECTION 05 — OPTICAL REDIRECTION
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-condensed tracking-tight uppercase text-[#f4f1ea] leading-none font-bold">
          THE MIRROR <br />
          SOLUTION
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#f4f1ea]/90 leading-relaxed font-sans">
          When the acoustic enclosure blocks direct eyelines, a twin-mirror system can redirect the
          actors' view while the camera remains between them.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs font-mono-code text-[#e8a33d]">
          <span className="w-2 h-2 rounded-full bg-[#e8a33d]" />
          <span>GOLD-COATED FRONT-SURFACE REFLECTORS • ZERO OPTICAL LOSS</span>
        </div>
      </div>

      {/* SECTION 6 - ENGINEERING STORY */}
      <div
        className={`transition-all duration-700 max-w-2xl ${
          s6Active
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none absolute'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-[1px] bg-[#e8a33d]" />
          <span className="text-[11px] font-mono-code tracking-[0.2em] text-[#e8a33d] uppercase">
            SECTION 06 — HISTORICAL RECORD
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-condensed tracking-tight uppercase text-[#f4f1ea] leading-none font-bold">
          ENGINEERING STORY
        </h2>
        <p className="mt-6 text-base sm:text-lg text-[#f4f1ea]/90 leading-relaxed font-sans">
          The challenge was simple to describe and difficult to solve: build a large-format camera
          system capable of recording an entire dialogue-driven feature.
        </p>

        {/* Three Animated Stat Callouts */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#f4f1ea]/15 pt-6">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-condensed text-[#e8a33d] font-bold">
              2,000,000+
            </span>
            <p className="text-xs font-mono-code text-[#f4f1ea]/70">
              More than two million feet of film
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-condensed text-[#38bdf8] font-bold">
              GLOBAL
            </span>
            <p className="text-xs font-mono-code text-[#f4f1ea]/70">
              Filming across multiple countries
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-condensed text-[#f4f1ea] font-bold">
              100%
            </span>
            <p className="text-xs font-mono-code text-[#f4f1ea]/70">
              A complete feature captured in large format
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 7 - FINALE TITLE & TRIBUTE CARD */}
      <div
        className={`transition-all duration-700 max-w-xl ${
          s7Active
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none absolute'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-[1px] bg-[#e8a33d]" />
          <span className="text-[11px] font-mono-code tracking-[0.2em] text-[#e8a33d] uppercase">
            SECTION 07 — INTERACTIVE FINALE
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-condensed tracking-tight uppercase text-[#f4f1ea] leading-none font-bold">
          THE LARGE-FORMAT CAMERA
        </h2>
        <p className="mt-2 text-sm text-[#f4f1ea]/80 font-sans">
          A quiet tribute to the engineers who pushed photochemical cinema forward.
        </p>
      </div>

      {/* Ambient footer metadata */}
      <footer className="w-full flex items-center justify-between text-[10px] font-mono-code text-[#f4f1ea]/40 border-t border-[#f4f1ea]/10 pt-4 mt-auto">
        <div className="flex items-center gap-4">
          <span>65MM HIGH-PRECISION CELLULOID GATE</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">24.000 CRYSTAL SYNC MOTOR</span>
        </div>
        <div>
          <span>PROVING BENCHMARK 01</span>
        </div>
      </footer>
    </div>
  );
};
