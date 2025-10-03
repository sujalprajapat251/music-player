import React, { useState } from 'react'
import { ReactComponent as Track1 } from '../Images/track1.svg'
import { ReactComponent as Track2 } from '../Images/track2.svg'
import { ReactComponent as Track3 } from '../Images/track3.svg'
import { ReactComponent as Track4 } from '../Images/track4.svg'
import { ReactComponent as Track5 } from '../Images/track5.svg'
import { ReactComponent as Track6 } from '../Images/track6.svg'
import { ReactComponent as Track7 } from '../Images/track7.svg'
import { ReactComponent as Track8 } from '../Images/track8.svg'
import { ReactComponent as ImpIcon } from '../Images/import.svg'
import { ReactComponent as Loop } from '../Images/loop.svg'
import { useDispatch } from "react-redux";
import { addTrack, setCurrentTrackId, setTrackType, createTrackWithDefaults, setSelectedInstrument } from "../Redux/Slice/studio.slice";
import { getNextTrackColor } from "../Utils/colorUtils";
import { selectStudioState } from "../Redux/rootReducer";
import PricingModel from './PricingModel'
import { useI18n } from "../Utils/i18n";

const instrumentOptions = [
  {
    label: 'Voice & Mic', icon: (
      <Track1 />
    )
  },
  {
    label: 'Keys', icon: (
      <Track2 />
    )
  },
  {
    label: 'Bass & 808', icon: (
      <Track3 />
    )
  },
  {
    label: 'Guitar', icon: (
      <Track4 />
    )
  },
  {
    label: 'Drums & Machines', icon: (
      <Track5 />
    )
  },
  {
    label: 'Guitar/Bass Amp', icon: (
      <Track6 />
    )
  },
  {
    label: 'Synth', icon: (
      <Track7 />
    )
  },
  {
    label: 'Orchestral', icon: (
      <Track8 />
    )
  },
];

const AddNewTrackModel = ({ onClose, onOpenLoopLibrary }) => {
  const dispatch = useDispatch();
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [hideSelf, setHideSelf] = useState(false);
  const trackHeight = 80; // or get from redux

  const { t } = useI18n();

  // For file input
  const fileInputRef = React.useRef();

  // Add empty/instrument track
  const handleBoxSelect = (option) => {
    const defaultInstrumentByType = {
      'Keys': 'acoustic_grand_piano',
      'Guitar': 'acoustic_guitar_nylon',
      'Orchestral': 'orchestral_harp'
    };

    const newTrack = {
      id: Date.now(),
      name: option.label,
      iconKey: option.icon,
      height: trackHeight,
      type: option.label,
    };
    
    // Use the grouped action creator for better undo/redo
    dispatch(createTrackWithDefaults(newTrack));
    // If it's a piano/guitar/orchestral track, set the default instrument to the first option
    if (defaultInstrumentByType[option.label]) {
      dispatch(setSelectedInstrument(defaultInstrumentByType[option.label]));
    }
    onClose();
  };

  const getAudioDuration = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer.duration;
  };

  function generateRandomHexColor() {
    let randomNumber = Math.floor(Math.random() * 16777215);
    let hexColor = randomNumber.toString(16);
    hexColor = hexColor.padStart(6, '0');
    return `#${hexColor}`;
  }

  // Add audio track
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const blob = file;
      const url = URL.createObjectURL(blob);
      const duration = await getAudioDuration(blob);

      const trackColor = generateRandomHexColor();
      const newClip = {
        id: Date.now() + Math.random(),
        name: file.name,
        url,
        duration,
        trimStart: 0,
        trimEnd: duration,
        startTime: 0,
        color: trackColor,
      };

      const newTrack = {
        id: Date.now() + Math.random(),
        name: file.name,
        color: trackColor,
        volume: 80,
        audioClips: [newClip],
        type: 'audio',
      };

      // Use the grouped action creator for better undo/redo
      dispatch(createTrackWithDefaults(newTrack));
    } catch (err) {
      // Failed to import audio file
    } finally {
      e.target.value = '';
    }
    onClose();
  };

  return (
    <>

      {!hideSelf && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-primary-light dark:bg-[#262529] rounded-sm shadow-lg w-full max-w-xl mx-4 p-6 relative sm:p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1414141A] dark:border-[#FFFFFF1A] pb-6 mb-6 sm:pb-4 md:pb-6 sm:mb-4 md:mb-6">
            <h2 className="text-secondary-light dark:text-secondary-dark text-lg font-semibold">{t('addNewTrack')}</h2>
            <button onClick={onClose} className="text-[#262529] dark:text-[#FFFFFF99]  text-2xl font-bold focus:outline-none">
              &times;
            </button>
          </div>
          {/* Instrument Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8 sm:gap-2 md:gap-4 sm:my-4 md:my-8">
            {instrumentOptions.map((opt) => (
              <button key={opt.label} className="text-secondary-light dark:text-secondary-dark flex flex-col items-center justify-center bg-[#E5E5E5] dark:bg-primary-dark hover:bg-[#aaaaaa] dark:hover:bg-[#262529] rounded-[4px] p-4 transition-colors border border-transparent hover:border-[#1414141A] hover:dark:border-[#FFFFFF1A] sm:p-2 md:p-4" onClick={() => handleBoxSelect(opt)}>
                {opt.icon}
                <span className="mt-2 text-secondary-light dark:text-secondary-dark text-sm text-center font-medium leading-tight sm:text-xs md:text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 md:gap-3">
            <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-primary-light dark:bg-primary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] text-secondary-light dark:text-secondary-dark py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors p-2 sm:text-[10px] md:text-sm">
              <ImpIcon className="rotate-90" />
              Import File
            </button>
            <button onClick={() => { if (onOpenLoopLibrary) { onOpenLoopLibrary(); onClose && onClose(); } }} className="flex-1 bg-primary-light dark:bg-primary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] text-secondary-light dark:text-secondary-dark py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors p-2 sm:text-[10px] md:text-sm">
              <Loop />
              Loop Library
            </button>
            <button onClick={() => { setPricingModalOpen(true); setHideSelf(true); }} className="flex-1 bg-primary-light dark:bg-primary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] text-secondary-light dark:text-secondary-dark py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors p-2 sm:text-[10px] md:text-sm">
              Sampler
            </button>
          </div>
        </div>
      </div>
      )}

      {/* MusicOff removed */}

      <PricingModel pricingModalOpen={pricingModalOpen} setPricingModalOpen={(val) => { setPricingModalOpen(val); if (!val) { onClose && onClose(); } }} />

    </>
  )
}

export default AddNewTrackModel
