import React from 'react'
import track1 from '../Images/track1.svg'
import track2 from '../Images/track2.svg'
import track3 from '../Images/track3.svg'
import track4 from '../Images/track4.svg'
import track5 from '../Images/track5.svg'
import track6 from '../Images/track6.svg'
import track7 from '../Images/track7.svg'
import track8 from '../Images/track8.svg'
import impIcon from '../Images/import.svg'
import loop from '../Images/loop.svg'
import { useDispatch } from "react-redux";
import { addTrack } from "../Redux/Slice/studio.slice";
const instrumentOptions = [
  { label: 'Voice & Mic', icon: (
    <img src={track1} alt="Voice & Mic" />
  ) },
  { label: 'Keys', icon: (
    <img src={track2} alt="Keys" />
  ) },
  { label: 'Bass & 808', icon: (
    <img src={track3} alt="Bass & 808" />
  ) },
  { label: 'Guitar', icon: (
    <img src={track4} alt="Guitar" />
  ) },
  { label: 'Drums & Machines', icon: (
    <img src={track5} alt="Drums & Machines" />
  ) },
  { label: 'Guitar/Bass Amp', icon: (
    <img src={track6} alt="Guitar/Bass Amp" />
  ) },
  { label: 'Synth', icon: (
    <img src={track7} alt="Synth" />
  ) },
  { label: 'Orchestral', icon: (
    <img src={track8} alt="Orchestral" />
  ) },
];

const AddNewTrackModel = ({ onClose }) => {
  const dispatch = useDispatch();
  const trackHeight = 80; // or get from redux

  // For file input
  const fileInputRef = React.useRef();

  // Add empty/instrument track
  const handleBoxSelect = (trackType) => {
    const newTrack = {
      id: Date.now(),
      name: trackType,
      height: trackHeight,
      // No url property!
    };
    dispatch(addTrack(newTrack));
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
      color: '#FFB6C1',
      height: trackHeight,
    };
    dispatch(addTrack(newTrack));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#232323] rounded-sm shadow-lg w-full max-w-xl mx-4 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#FFFFFF1A] pb-6 mb-6">
          <h2 className="text-white text-lg font-semibold">Add New Track</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold focus:outline-none">
            &times;
          </button>
        </div>
        {/* Instrument Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
          {instrumentOptions.map((opt) => (
            <button key={opt.label} className="flex flex-col items-center justify-center bg-[#141414] hover:bg-[#333] rounded-sm p-4 transition-colors border border-transparent hover:border-gray-600" onClick={() => handleBoxSelect(opt.label)}>
              {opt.icon}
              <span className="mt-2 text-white text-sm text-center font-medium leading-tight">{opt.label}</span>
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
          <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-[#181818] hover:bg-[#333] text-white py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors">
            <img src={impIcon} alt="Import File" className="rotate-90" />
            Import File
          </button>
          <button className="flex-1 bg-[#181818] hover:bg-[#333] text-white py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors">
            <img src={loop} alt="Loop Library" />
            Loop Library
          </button>
          <button className="flex-1 bg-[#181818] hover:bg-[#333] text-white py-2 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors">
            Sampler
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddNewTrackModel
