import React from 'react';
import { Piano } from 'react-piano';
import 'react-piano/dist/styles.css';
import usePianoBarInteractions from '../hooks/PianoBarInteractions';

export default function SimplePianoBar({ noteRange, playNote, stopNote, keyboardShortcuts, highlightedPianoKeys, hideLabels }) {
  const {
    pianoRef,
    handleLocalWheel,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePianoBarInteractions({ noteRange, playNote, stopNote, highlightedPianoKeys });

  return (
    <div
      className="relative h-[99%] overscroll-none"
      ref={pianoRef}
      onWheel={handleLocalWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      <Piano noteRange={noteRange} playNote={playNote} stopNote={stopNote} keyboardShortcuts={keyboardShortcuts} />
      {hideLabels && (
        <style jsx>{`
          .ReactPiano__NoteLabel--natural,
          .ReactPiano__NoteLabel--accidental {
            display: none !important;
          }
        `}</style>
      )}
      <style jsx>{`
        .ReactPiano__Keyboard{
          background-color: #c7c7c7;
        }

        .ReactPiano__Key--natural:hover {
          background-color: #cececf !important;
        }
        
        .ReactPiano__Key--natural.highlighted {
          border-bottom: 7px solid #36075f !important;
          marg
        }

        .ReactPiano__Key--accidental.highlighted {
          border-bottom: 7px solid #8b5cf6 !important;
        }
      `}</style>
    </div>
  );
}




