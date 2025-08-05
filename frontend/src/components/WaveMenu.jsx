import React, { useState } from 'react'
import Cut from '../Images/cut.svg';
import Copy from '../Images/copy.svg';
import Paste from '../Images/paste.svg';
import Delete from '../Images/delete.svg';
import Editname from '../Images/editname.svg';
import Split from '../Images/split.svg';
import Mutere from '../Images/mutere.svg';
import Pitch from '../Images/pitch.svg';
import Vocal from '../Images/vocal.svg';
import Voicemic from '../Images/voicemic.svg';
import Reverse from '../Images/reverse.svg';
import Effect from '../Images/effects.svg';
import Prokey from '../Images/prokey.svg';
import Music from '../Images/music.svg';
import Sampler from '../Images/sampler.svg';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';

const WaveMenu = ({ isOpen, position, onClose, onAction }) => {
  const [pitchDropdownOpen, setPitchDropdownOpen] = useState(false);
  const [voiceTransformDropdownOpen, setVoiceTransformDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleItemClick = (action) => {
    if (onAction) {
      onAction(action);
    }
    onClose();
  };

  const handleClose = () => {
    setPitchDropdownOpen(false);
    setVoiceTransformDropdownOpen(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-[999]"
        onClick={handleClose}
      />

      {/* Menu Container */}
      <div
        className="absolute bg-[#1F1F1F] rounded-[4px] py-2 min-w-[220px] shadow-lg z-[1000] text-sm text-white max-h-[400px] overflow-y-auto"
        style={{
          top: position?.y || 0,
          left: position?.x || 0,
        }}
      >
        {/* Section 1: Basic Editing Operations */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('cut')}
        >
          <img src={Cut} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Cut</span>
          <span className="text-gray-400 text-xs">Ctrl+X</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('copy')}
        >
          <img src={Copy} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Copy</span>
          <span className="text-gray-400 text-xs">Ctrl+C</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('paste')}
        >
          <img src={Paste} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Paste</span>
          <span className="text-gray-400 text-xs">Ctrl+V</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('delete')}
        >
          <img src={Delete} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Delete</span>
          <span className="text-gray-400 text-xs">Backspace</span>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-600 my-1"></div>

        {/* Section 2: Region/Track Management */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('editName')}
        >
          <img src={Editname} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Edit name</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('splitRegion')}
        >
          <img src={Split} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Split Region</span>
          <span className="text-gray-400 text-xs">Ctrl+E</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('muteRegion')}
        >
          <img src={Mutere} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Mute Region</span>
          <span className="text-gray-400 text-xs">Ctrl+M</span>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-600 my-1"></div>

        {/* Section 3: Audio Processing and Transformation */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600 relative"
          onClick={() => {
            setPitchDropdownOpen((open) => !open);
            setVoiceTransformDropdownOpen(false);
          }}
        >
          <img src={Pitch} className="w-4 h-4 flex items-center justify-center text-white" />
          <span className="flex-1">Change pitch</span>
          <MdOutlineKeyboardArrowRight className="text-white text-[20px]" />
          {/* Dropdown */}
          {pitchDropdownOpen && (
            <div className="absolute left-full top-0 bg-[#232323] rounded shadow-lg z-[1100] min-w-[180px]">
              {[...Array(25)].map((_, i) => {
                const value = 12 - i;
                return (
                  <div
                    key={value}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(value);
                      setPitchDropdownOpen(false);
                    }}
                  >
                    {value > 0 ? `+${value}` : value}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('vocalCleanup')}
        >
          <img src={Vocal} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Vocal Cleanup</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('vocalTuner')}
        >
          <img src={Vocal} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Vocal Tuner</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600 relative"
          onClick={() => {
            setVoiceTransformDropdownOpen((open) => !open);
            setPitchDropdownOpen(false);
          }}
        >
          <img src={Voicemic} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Voice Transform</span>
          <MdOutlineKeyboardArrowRight className={`text-white text-[20px] transition-transform ${voiceTransformDropdownOpen ? 'rotate-90' : ''}`} />
          {/* Dropdown */}
          {voiceTransformDropdownOpen && (
            <div className="absolute left-full top-0 bg-[#232323] rounded shadow-lg z-[1100] min-w-[200px]">
              <p className='text-[#FFFFFF99] text-sm px-2 py-2'>Pitch and Character:</p>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('+Fifth');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                +Fifth
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('+1 Octave');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                +1 Octave
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('+2 Octave');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                +2 Octave
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('-Fourth');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                -Fourth
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('-1 Octave');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                -1 Octave
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('-2 Octave');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                -2 Octave
              </div>
              <div className="h-px bg-gray-600 my-1"></div>
              <p className='text-[#FFFFFF99] text-sm px-2 py-2'>Character:</p>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('A little darker');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                A little darker
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('Darker');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                Darker
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('Very dark');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                Very dark
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('A little brighter');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                A little brighter
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('Brighter');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                Brighter
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('Very bright');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                Very bright
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('Baby');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                Baby
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('Robot');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                Robot
              </div>
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick('Alien');
                  setVoiceTransformDropdownOpen(false);
                }}
              >
                Alien
              </div>

            </div>
          )}
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('reverse')}
        >
          <img src={Reverse} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Reverse</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('effects')}
        >
          <img src={Effect} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Effects</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('matchProjectKey')}
        >
          <img src={Prokey} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Match Project Key</span>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-600 my-1"></div>

        {/* Section 4: Library and Sampler Integration */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('addToLoopLibrary')}
        >
          <img src={Music} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Add to loop Library..</span>
        </div>

        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('openInSampler')}
        >
          <img src={Sampler} className="w-4 h-4 flex items-center justify-center text-white"></img>
          <span className="flex-1">Open in sampler</span>
        </div>
      </div>
    </>
  )
}

export default WaveMenu