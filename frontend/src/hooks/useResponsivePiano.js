import { useState, useEffect } from 'react';
import { MidiNumbers } from 'react-piano';

// Custom hook for responsive piano configuration
export const useResponsivePiano = () => {
  const [screenSize, setScreenSize] = useState('desktop');

  useEffect(() => {
    const getScreenSize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth <= 425) return 'mobile';
        if (window.innerWidth <= 768) return 'tablet';
        return 'desktop';
      }
      return 'desktop';
    };

    const handleResize = () => setScreenSize(getScreenSize());
    
    // Set initial size
    setScreenSize(getScreenSize());
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define note ranges for different screen sizes
  // Each range must include complete octave sections with proper white/black key ratios
  const getNoteRange = (sectionIndex) => {
    const baseNote = MidiNumbers.fromNote('C3'); // Start from C3 as base
    
    switch (screenSize) {
      case 'mobile':
        // Mobile: 6 white keys + 5 black keys = 11 total keys
        // Half octave: C3, C#3, D3, D#3, E3, F3 (6 white + 5 black = 11 keys)
        return {
          first: baseNote,
          last: baseNote + 10 // 11 keys total (0-10 inclusive)
        };
      case 'tablet':
        // Tablet: 12 white keys + 11 black keys = 23 total keys  
        // One full octave: C3 to B3 (12 white + 11 black = 23 keys)
        return {
          first: baseNote,
          last: baseNote + 22 // 23 keys total (0-22 inclusive)
        };
      case 'desktop':
      default:
        // Desktop: 21 white keys + 15 black keys = 36 total keys
        // One and a half octaves: C3 to C5 (21 white + 15 black = 36 keys)
        return {
          first: baseNote,
          last: baseNote + 35 // 36 keys total (0-35 inclusive)
        };
    }
  };

  // Get keyboard shortcuts configuration based on screen size
  const getKeyboardShortcuts = (noteRange) => {
    const { first, last } = noteRange;
    const keyCount = last - first + 1;
    
    // Extended keyboard configuration to support up to 36 keys
    const baseConfig = [
      { natural: 'z', flat: 's', sharp: 's' },
      { natural: 'x', flat: 'd', sharp: 'd' },
      { natural: 'c', flat: 'f', sharp: 'f' },
      { natural: 'v', flat: 'g', sharp: 'g' },
      { natural: 'b', flat: 'h', sharp: 'h' },
      { natural: 'n', flat: 'j', sharp: 'j' },
      { natural: 'm', flat: 'k', sharp: 'k' },
      { natural: ',', flat: 'l', sharp: 'l' },
      { natural: '.', flat: ';', sharp: ';' },
      { natural: 'q', flat: '1', sharp: '1' },
      { natural: 'w', flat: '2', sharp: '2' },
      { natural: 'e', flat: '3', sharp: '3' },
      { natural: 'r', flat: '4', sharp: '4' },
      { natural: 't', flat: '5', sharp: '5' },
      { natural: 'y', flat: '6', sharp: '6' },
      { natural: 'u', flat: '7', sharp: '7' },
      { natural: 'i', flat: '8', sharp: '8' },
      { natural: 'o', flat: '9', sharp: '9' },
      { natural: 'p', flat: '0', sharp: '0' },
    ];

    // Return only the needed number of keys
    return baseConfig.slice(0, keyCount);
  };

  // Get label font size based on screen size
  const getLabelFontSize = () => {
    switch (screenSize) {
      case 'mobile':
        return 'text-[8px] sm:text-[8px]';
      case 'tablet':
        return 'text-[8px] sm:text-[10px] md:text-[12px]';
      case 'desktop':
      default:
        return 'text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px]';
    }
  };

  // Get piano height based on screen size
  const getPianoHeight = () => {
    switch (screenSize) {
      case 'mobile':
        return 'h-[80px] sm:h-[100px]';
      case 'tablet':
        return 'h-[100px] sm:h-[120px] md:h-[140px]';
      case 'desktop':
      default:
        return 'h-[120px] sm:h-[150px] md:h-[180px] lg:h-[200px]';
    }
  };

  return {
    screenSize,
    getNoteRange,
    getKeyboardShortcuts,
    getLabelFontSize,
    getPianoHeight
  };
};
