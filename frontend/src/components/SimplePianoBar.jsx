import React from 'react';
import { Piano } from 'react-piano';
import 'react-piano/dist/styles.css';
import usePianoBarInteractions from '../hooks/PianoBarInteractions';
import { useSelector } from 'react-redux';
import { selectStudioState } from '../Redux/rootReducer';

export default function SimplePianoBar({ noteRange, playNote, stopNote, keyboardShortcuts, highlightedPianoKeys, hideLabels }) {

  const getTrackType = useSelector((state) => selectStudioState(state).newtrackType);
  
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
      className={`relative h-full overscroll-none`}
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
        }

        .ReactPiano__Key--accidental.highlighted {
          border-bottom: 7px solid #8b5cf6 !important;
        }

        /* Responsive label styling */
        .ReactPiano__NoteLabel--natural,
        .ReactPiano__NoteLabel--accidental {
          font-size: 10px !important;
        }

        @media (min-width: 640px) {
          .ReactPiano__NoteLabel--natural,
          .ReactPiano__NoteLabel--accidental {
            font-size: 10px !important;
          }
        }

        @media (min-width: 768px) {
          .ReactPiano__NoteLabel--natural,
          .ReactPiano__NoteLabel--accidental {
            font-size: 10px !important;
          }
        }

        @media (min-width: 1024px) {
          .ReactPiano__NoteLabel--natural,
          .ReactPiano__NoteLabel--accidental {
            font-size: 12px !important;
          }

          .ReactPiano__NoteLabel--accidental {
            padding: 6px 8px !important;
          }
        }
      `}</style>
      {getTrackType === 'Bass & 808' && (
        <style jsx>{`
          .ReactPiano__Key--active {
            background: #f69e2b !important;
          }
          .ReactPiano__Key--natural:hover {
            background-color: #f69e2b !important;
          }
        `}</style>
      )}
    </div>
  );
}