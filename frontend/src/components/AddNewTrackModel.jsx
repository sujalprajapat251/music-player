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
import { addTrack, setTrackType } from "../Redux/Slice/studio.slice";
import { getNextTrackColor } from "../Utils/colorUtils";

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

const AddNewTrackModel = ({ onClose }) => {
  const dispatch = useDispatch();
  const trackHeight = 80; // or get from redux

  // For file input
  const fileInputRef = React.useRef();

  // Add empty/instrument track
  const handleBoxSelect = (option) => {
    const newTrack = {
      id: Date.now(),
      name: option.label,
      iconKey: option.icon, 
      height: trackHeight,
    };
    dispatch(addTrack(newTrack));
    dispatch(setTrackType(option.label));
    onClose();
  };

  // Add audio track
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newTrack = {
      id: Date.now(),
      name: file.name,
      url: URL.createObjectURL(file),
      color: getNextTrackColor(), // Use unique color for each new track
      height: trackHeight,
    };
    dispatch(addTrack(newTrack));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-primary-light dark:bg-[#262529] rounded-sm shadow-lg w-full max-w-xl mx-4 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1414141A] dark:border-[#FFFFFF1A] pb-6 mb-6">
          <h2 className="text-secondary-light dark:text-secondary-dark text-lg font-semibold">Add New Track</h2>
          <button onClick={onClose} className="text-[#262529] dark:text-[#FFFFFF99]  text-2xl font-bold focus:outline-none">
            &times;
          </button>
        </div>
        {/* Instrument Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          {instrumentOptions.map((opt) => (
            <button key={opt.label} className="text-secondary-light dark:text-secondary-dark flex flex-col items-center justify-center bg-[#E5E5E5] dark:bg-primary-dark hover:bg-[#aaaaaa] dark:hover:bg-[#262529] rounded-[4px] p-4 transition-colors border border-transparent hover:border-[#1414141A] hover:dark:border-[#FFFFFF1A]" onClick={() => handleBoxSelect(opt)}>
              {opt.icon}
              <span className="mt-2 text-secondary-light dark:text-secondary-dark text-sm text-center font-medium leading-tight">{opt.label}</span>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-primary-light dark:bg-primary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] text-secondary-light dark:text-secondary-dark py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors">
            <ImpIcon className="rotate-90" />
            Import File
          </button>
          <button className="flex-1 bg-primary-light dark:bg-primary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] text-secondary-light dark:text-secondary-dark py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors">
            <Loop />
            Loop Library
          </button>
          <button className="flex-1 bg-primary-light dark:bg-primary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] text-secondary-light dark:text-secondary-dark py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors">
            Sampler
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddNewTrackModel
