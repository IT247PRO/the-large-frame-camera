export type CameraComponentKey =
  | 'carbonBody'
  | 'filmMagazine'
  | 'filmTransport'
  | 'lensAssembly'
  | 'telemetryDisplay'
  | 'reflexViewfinder'
  | 'monitoringModule';

export interface ComponentSpec {
  id: CameraComponentKey;
  name: string;
  category: string;
  specs: string;
  description: string;
  screenPosition: { x: number; y: number }; // normalized 0..1
  leaderAnchor: { x: number; y: number };
}

export interface TelemetryData {
  fps: number;
  filmRemainingFeet: number;
  filmCapacityFeet: number;
  temperatureC: number;
  voltageV: number;
  currentA: number;
  transportStatus: 'STBY' | 'RUN' | 'FWD' | 'GATE_LOCK';
  timecode: string;
  isRecording: boolean;
}

export interface FinaleControls {
  rackFocus: number; // 0 (near/rocks) to 0.5 (galley) to 1.0 (horizon/moon)
  pan: number; // -1 to 1
  tilt: number; // -1 to 1
  aspectRatio: '1.43' | '2.39';
  isRecording: boolean;
  isMuted: boolean;
  showHorizon: boolean;
  activeFilter: 'none' | 'monochrome' | 'warm';
}

export interface SectionInfo {
  id: number;
  title: string;
  sub: string;
  progressStart: number;
  progressEnd: number;
}
