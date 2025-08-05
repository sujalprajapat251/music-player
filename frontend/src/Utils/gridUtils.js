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