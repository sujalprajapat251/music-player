import { useEffect, useRef } from 'react';

export default function usePianoBarInteractions({ noteRange, playNote, stopNote, highlightedPianoKeys }) {
  const pianoRef = useRef(null);
  const isMouseDown = useRef(false);
  const lastPlayedNote = useRef(null);
  const mouseMoveHandler = useRef(null);
  const debouncedMouseMove = useRef(null);

  const highlightKeys = () => {
    if (!pianoRef.current || !Array.isArray(highlightedPianoKeys) || highlightedPianoKeys.length === 0) return;

    const allKeys = pianoRef.current.querySelectorAll('.ReactPiano__Key--natural, .ReactPiano__Key--accidental');
    allKeys.forEach(key => key.classList.remove('highlighted'));

    highlightedPianoKeys.forEach(midiNumber => {
      if (midiNumber >= noteRange.first && midiNumber <= noteRange.last) {
        const keyIndex = midiNumber - noteRange.first;
        const keyElement = allKeys[keyIndex];
        if (keyElement) {
          keyElement.classList.add('highlighted');
        }
      }
    });
  };

  const getMidiNumberFromPosition = (clientX) => {
    if (!pianoRef.current) return null;
    const rect = pianoRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const pianoWidth = rect.width;
    const keyWidth = pianoWidth / (noteRange.last - noteRange.first + 1);
    const keyIndex = Math.floor(relativeX / keyWidth);
    const midiNumber = noteRange.first + keyIndex;
    if (midiNumber >= noteRange.first && midiNumber <= noteRange.last) {
      return midiNumber;
    }
    return null;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current) return;
    const midiNumber = getMidiNumberFromPosition(e.clientX);
    if (midiNumber && midiNumber !== lastPlayedNote.current) {
      if (lastPlayedNote.current !== null) {
        stopNote(lastPlayedNote.current);
      }
      playNote(midiNumber);
      lastPlayedNote.current = midiNumber;
    }
  };

  const handleMouseMoveDebounced = (e) => {
    if (debouncedMouseMove.current) {
      clearTimeout(debouncedMouseMove.current);
  }
    debouncedMouseMove.current = setTimeout(() => {
      handleMouseMove(e);
      // Re-apply highlights during drag so they don't disappear while sliding
      highlightKeys();
    }, 10);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    isMouseDown.current = true;
    const midiNumber = getMidiNumberFromPosition(e.clientX);
    if (midiNumber) {
      playNote(midiNumber);
      lastPlayedNote.current = midiNumber;
    }
    if (!mouseMoveHandler.current) {
      mouseMoveHandler.current = handleMouseMoveDebounced;
      document.addEventListener('mousemove', mouseMoveHandler.current);
    }
    // Ensure scale highlights persist after DOM updates caused by interaction
    setTimeout(highlightKeys, 0);
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    if (lastPlayedNote.current !== null) {
      stopNote(lastPlayedNote.current);
      lastPlayedNote.current = null;
    }
    if (mouseMoveHandler.current) {
      document.removeEventListener('mousemove', mouseMoveHandler.current);
      mouseMoveHandler.current = null;
    }
    // Re-apply highlights so selected scale stays visible
    setTimeout(highlightKeys, 0);
  };

  const handleMouseLeave = () => {
    if (isMouseDown.current) {
      handleMouseUp();
    }
    // Keep highlights after pointer leaves
    setTimeout(highlightKeys, 0);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      isMouseDown.current = true;
      const midiNumber = getMidiNumberFromPosition(touch.clientX);
      if (midiNumber) {
        playNote(midiNumber);
        lastPlayedNote.current = midiNumber;
      }
    }
    // Maintain highlights on touch start
    setTimeout(highlightKeys, 0);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (isMouseDown.current && e.touches.length > 0) {
      const touch = e.touches[0];
      const midiNumber = getMidiNumberFromPosition(touch.clientX);
      if (midiNumber && midiNumber !== lastPlayedNote.current) {
        if (lastPlayedNote.current !== null) {
          stopNote(lastPlayedNote.current);
        }
        playNote(midiNumber);
        lastPlayedNote.current = midiNumber;
      }
    }
    // Keep reapplying highlights while sliding
    setTimeout(highlightKeys, 0);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
    // Ensure highlights remain after touch end
    setTimeout(highlightKeys, 0);
  };

  const handleLocalWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown.current) {
        handleMouseUp();
      }
    };
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(highlightKeys, 100);
    return () => clearTimeout(timer);
  }, [highlightedPianoKeys, noteRange.first, noteRange.last]);

  useEffect(() => {
    const el = pianoRef.current;
    if (!el) return;
    const blockWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('wheel', blockWheel, { passive: false, capture: true });
    return () => {
      el.removeEventListener('wheel', blockWheel, { capture: true });
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mouseMoveHandler.current) {
        document.removeEventListener('mousemove', mouseMoveHandler.current);
      }
      if (debouncedMouseMove.current) {
        clearTimeout(debouncedMouseMove.current);
      }
    };
  }, []);

  return {
    pianoRef,
    handleLocalWheel,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}


