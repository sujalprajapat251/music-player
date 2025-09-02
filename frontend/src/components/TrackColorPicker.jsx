import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { changeTrackColorWithHistory } from '../Redux/Slice/studio.slice';

const TrackColorPicker = ({ trackId, currentColor, trackName, onClose }) => {
  const dispatch = useDispatch();
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Predefined color palette
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#F9E79F', '#ABEBC6', '#FAD7A0', '#D5A6BD', '#A9CCE3',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#F9E79F', '#ABEBC6', '#FAD7A0', '#D5A6BD', '#A9CCE3'
  ];

  // Custom colors for more variety
  const customColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#FFA500', '#FFC0CB', '#A52A2A', '#32CD32', '#4169E1', '#FF1493'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setIsOpen(false);
    
    // Dispatch the color change with undo/redo support
    dispatch(changeTrackColorWithHistory(trackId, color));
    
    onClose?.();
  };

  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setSelectedColor(color);
  };

  const handleCustomColorSubmit = () => {
    if (selectedColor && selectedColor !== currentColor) {
      dispatch(changeTrackColorWithHistory(trackId, selectedColor));
      setIsOpen(false);
      onClose?.();
    }
  };

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Color Preview Button */}
      <button
        onClick={togglePicker}
        className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center"
        style={{ backgroundColor: currentColor }}
        title={`Change color for ${trackName}`}
      >
        <svg 
          className="w-4 h-4 text-white drop-shadow-lg" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50 min-w-64">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Change color for "{trackName}"
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Current:</span>
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: currentColor }}
              />
              <span className="text-xs text-gray-500">New:</span>
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>

          {/* Predefined Color Palette */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Quick Colors
            </h4>
            <div className="grid grid-cols-8 gap-1">
              {colorPalette.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorSelect(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 hover:scale-110 transition-all duration-200"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Custom Color
            </h4>
            <div className="flex gap-2">
              <input
                type="color"
                value={selectedColor}
                onChange={handleCustomColorChange}
                className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={handleCustomColorChange}
                placeholder="#FF0000"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCustomColorSubmit}
                disabled={selectedColor === currentColor}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Additional Custom Colors */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              More Colors
            </h4>
            <div className="grid grid-cols-8 gap-1">
              {customColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorSelect(color)}
                  className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 hover:scale-110 transition-all duration-200"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackColorPicker;
