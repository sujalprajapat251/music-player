// Grid utility functions - centralized for reuse across components

export const getGridDivisions = (gridSize) => {
  switch (gridSize) {
    case "1/1":
      return 1;
    case "1/2":
      return 2;
    case "1/2 dotted":
      return 2;
    case "1/4":
      return 4;
    case "1/8":
      return 8;
    case "1/16":
      return 16;
    case "1/32":
      return 32;
    case "1/8 triplet":
      return 12;
    case "1/16 triplet":
      return 24;
    case "Automatic grid size":
      return 4;
    default:
      return 4;
  }
};

export const getGridSpacing = (gridSize) => {
  const divisions = getGridDivisions(gridSize);
  return 1 / divisions; // 1 second divided by number of divisions
};

export const snapToGrid = (time, gridSize, maxDuration = Infinity) => {
  const gridSpacing = getGridSpacing(gridSize);
  if (!gridSpacing || gridSpacing <= 0) return time;
  const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
  return Math.max(0, Math.min(maxDuration, gridPosition));
};

// Time signature utilities
export const parseTimeSignature = (timeSignature) => {
  const [beats, noteValue] = timeSignature.split('/').map(Number);
  return { beats, noteValue };
};

export const getBeatsPerBar = (timeSignature) => {
  const { beats } = parseTimeSignature(timeSignature);
  return beats;
};

export const getNoteValue = (timeSignature) => {
  const { noteValue } = parseTimeSignature(timeSignature);
  return noteValue;
};

// Convert time to musical notation (bars:beats:subdivisions)
export const timeToMusicalNotation = (timeInSeconds, timeSignature = "4/4") => {
  const { beats } = parseTimeSignature(timeSignature);
  const secondsPerBeat = 1; // 1 beat equals 1 second
  const secondsPerBar = secondsPerBeat * beats;
  
  const totalBeats = timeInSeconds / secondsPerBeat;
  const bars = Math.floor(totalBeats / beats);
  const beatsInBar = Math.floor(totalBeats % beats);
  const subdivisions = Math.floor((totalBeats % 1) * 2); // Two sections per beat
  
  return {
    bars: bars + 1, // Bars are 1-indexed
    beats: beatsInBar + 1, // Beats are 1-indexed
    subdivisions: subdivisions
  };
};

// Convert musical notation to time
export const musicalNotationToTime = (bars, beats, subdivisions = 0, timeSignature = "4/4") => {
  const { beats: beatsPerBar } = parseTimeSignature(timeSignature);
  const secondsPerBeat = 1; // 1 beat equals 1 second
  
  const totalBeats = (bars - 1) * beatsPerBar + (beats - 1) + (subdivisions / 2);
  return totalBeats * secondsPerBeat;
};

// Format time based on ruler type
export const formatTime = (timeInSeconds, ruler = "Time", timeSignature = "4/4") => {
  if (ruler === "Beats") {
    const notation = timeToMusicalNotation(timeInSeconds, timeSignature);
    return `${notation.bars}:${notation.beats.toString().padStart(2, '0')}:${notation.subdivisions.toString().padStart(2, '0')}`;
  } else {
    // Time ruler - show minutes:seconds
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

// Get grid spacing based on time signature and grid size
export const getGridSpacingWithTimeSignature = (gridSize, timeSignature = "4/4") => {
  const { beats, noteValue } = parseTimeSignature(timeSignature);
  const secondsPerBeat = 1; // 1 beat equals 1 second
  
  // Get the grid divisions for the selected grid size
  const divisions = getGridDivisions(gridSize);
  
  // Calculate the duration of one grid division in seconds
  // For note values: 1/4 = quarter note, 1/8 = eighth note, etc.
  const gridDivisionDuration = secondsPerBeat / divisions;
  
  return Math.max(0.01, gridDivisionDuration); // Ensure minimum spacing
};

// Grid options for UI components
export const gridSizes = [
  "Automatic grid size",
  "1/1",
  "1/2",
  "1/2 dotted",
  "1/4",
  "1/8",
  "1/16",
  "1/32",
  "1/8 triplet",
  "1/16 triplet",
];

export const timeSignatures = ["3/4", "4/4", "5/4", "6/4", "7/4", "6/8", "12/8"];
export const rulers = ["Beats", "Time"]; 