// Color utility for generating different background colors for audio tracks

// Predefined color palette for audio tracks
const TRACK_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8C471', // Orange
  '#82E0AA', // Light Green
  '#F1948A', // Salmon
  '#85C1E9', // Sky Blue
  '#F7DC6F', // Yellow
  '#D7BDE2', // Lavender
  '#A9DFBF', // Mint Green
  '#FAD7A0', // Peach
  '#AED6F1', // Baby Blue
  '#F9E79F', // Light Yellow
];

let currentColorIndex = 0;

/**
 * Get the next color from the predefined palette
 * @returns {string} Hex color code
 */
export const getNextTrackColor = () => {
  const color = TRACK_COLORS[currentColorIndex % TRACK_COLORS.length];
  currentColorIndex++;
  return color;
};

/**
 * Reset the color index (useful for testing or when starting fresh)
 */
export const resetColorIndex = () => {
  currentColorIndex = 0;
};

/**
 * Generate a random color (fallback if needed)
 * @returns {string} Hex color code
 */
export const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 30); // 60-90%
  const lightness = 50 + Math.floor(Math.random() * 20); // 50-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Get a color by index (useful for consistent colors)
 * @param {number} index - The index of the color to get
 * @returns {string} Hex color code
 */
export const getColorByIndex = (index) => {
  return TRACK_COLORS[index % TRACK_COLORS.length];
};

/**
 * Get the total number of available colors
 * @returns {number} Number of colors in the palette
 */
export const getTotalColors = () => {
  return TRACK_COLORS.length;
}; 