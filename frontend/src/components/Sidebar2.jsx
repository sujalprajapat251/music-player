import React, { useState, useEffect } from "react";
import TopHeader from "./Layout/TopHeader";
import { Outlet } from "react-router-dom";
import BottomToolbar from "./Layout/BottomToolbar";
import AddNewTrackModel from "./AddNewTrackModel";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import mic from "../Images/mic.svg";
import VolumeKnob from "./VolumnKnob";
import tk from "../Images/tk.svg";
import headphone from "../Images/headphone.svg";
import mute from "../Images/mute.svg";
import more from "../Images/more.svg";
import TrackMenu from "./TrackMenu";
import { renameTrack, setCurrentTrackId, setSidebarScrollOffset, toggleMuteTrack, setSoloTrackId, setTrackVolume, setTrackType, reorderTracks } from "../Redux/Slice/studio.slice";
import { selectStudioState } from "../Redux/rootReducer";
import FreezeIcon from "../Images/freeze.svg";
import { ReactComponent as Track1 } from '../Images/track1.svg'
import { ReactComponent as Track2 } from '../Images/track2.svg'
import { ReactComponent as Track3 } from '../Images/track3.svg'
import { ReactComponent as Track4 } from '../Images/track4.svg'
import { ReactComponent as Track5 } from '../Images/track5.svg'
import { ReactComponent as Track6 } from '../Images/track6.svg'
import { ReactComponent as Track7 } from '../Images/track7.svg'
import { ReactComponent as Track8 } from '../Images/track8.svg'
import { ReactComponent as Wav } from '../Images/wav.svg'
import Drum from "./Drum";
import NewProject from "./NewProjectModel";

const Sidebar2 = () => {
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showNewProject, setShowNewProject] = useState(true);
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editingName, setEditingName] = useState("");
  // Use Redux for open instrument; avoid local UI duplication
  const tracks = useSelector((state) => selectStudioState(state).tracks);
  console.log("tracks ::::: > ", tracks)
 
  const trackHeight = useSelector((state) => selectStudioState(state).trackHeight);
  const dispatch = useDispatch();

  const currentTrackId = useSelector((state) => selectStudioState(state).currentTrackId);
  const soloTrackId = useSelector((state) => selectStudioState(state).soloTrackId);
  const isRecording = useSelector(state => selectStudioState(state).isRecording);
  const openTrackType = useSelector((state) => selectStudioState(state).newtrackType);

  const selectedInstrument = useSelector((state) => selectStudioState(state)?.selectedInstrument || 'acoustic_grand_piano');
  const [dragIndex, setDragIndex] = useState(null);  
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    dispatch(setSidebarScrollOffset(scrollTop));
  }
  
  const handleChangeTrack = (trackId) => {
    dispatch(setCurrentTrackId(trackId));

    const clickedTrack = tracks.find(track => track.id === trackId);

    if (!clickedTrack) return;

    const isDrumTrack = clickedTrack.name === 'Drums & Machines' || clickedTrack.type === 'drum';
    const isPianoTrack = clickedTrack.name === 'Keys' || clickedTrack.type === 'piano';

    // Clicking a row selects track and opens instrument if applicable
    if (isDrumTrack) {
      dispatch(setTrackType('Drums & Machines'));
      return;
    }
    if (isPianoTrack) {
      dispatch(setTrackType('Keys'));
      return;
    }
    // Non-instrument tracks close any open instrument
    dispatch(setTrackType(null));
  }

  const handleIconToggle = (e, track) => {
    e.stopPropagation();
    if (!track) return;

    const isDrumTrack = track.name === 'Drums & Machines' || track.type === 'drum';
    const isPianoTrack = track.name === 'Keys' || track.type === 'piano';
    const isGuitarTrack = track.name === 'Guitar' || track.type === 'Guitar';
    const isOrchestralTrack = track.name === 'Orchestral' || track.type === 'Orchestral';
    
    // Ensure track selection
    if (currentTrackId !== track.id) {
      dispatch(setCurrentTrackId(track.id));
    }

    if (isDrumTrack) {
      const isOpen = openTrackType === 'Drums & Machines' && currentTrackId === track.id;
      dispatch(setTrackType(isOpen ? null : 'Drums & Machines'));
      return;
    }

    if (isPianoTrack) {
      const isOpen = openTrackType === 'Keys' && currentTrackId === track.id;
      dispatch(setTrackType(isOpen ? null : 'Keys'));
      return;
    }

    if (isGuitarTrack) {
      const isOpen = openTrackType === 'Guitar' && currentTrackId === track.id;
      dispatch(setTrackType(isOpen ? null : 'Guitar'));
      return;
    }

    if (isOrchestralTrack) {
      const isOpen = openTrackType === 'Orchestral' && currentTrackId === track.id;
      dispatch(setTrackType(isOpen ? null : 'Orchestral'));
      return;
    }

    // For non-instrument tracks, just close
    dispatch(setTrackType(null));
  }

  const handleMuteTrack = (trackId) => {
    dispatch(toggleMuteTrack(trackId));
  };

  const handleSoloTrack = (trackId) => {
    if (soloTrackId === trackId) {
      dispatch(setSoloTrackId(null));
    } else {
      dispatch(setSoloTrackId(trackId));
    }
  };

  const handleTrackVolumeChange = (volume, trackId) => {
    dispatch(setTrackVolume({ trackId, volume }));
  };

  const getInstrumentDisplayName = (instrumentId) => {
    const instruments = [
      { id: 'acoustic_grand_piano', name: 'Piano', category: 'Jazz Chord Memos' },
      { id: 'whistle', name: 'Whistle', category: 'Effects' },
      { id: 'fx_1_rain', name: 'Rain', category: 'Atmospheric' },
      { id: 'fx_3_crystal', name: 'Crystal', category: 'Ambient' },
      { id: 'fx_4_atmosphere', name: 'Atmosphere', category: 'Ambient' },
      { id: 'fx_5_brightness', name: 'Brightness', category: 'Effects' },
      { id: 'fx_6_goblins', name: 'Goblins', category: 'Fantasy' },
      { id: 'fx_7_echoes', name: 'Echoes', category: 'Reverb' },
      { id: 'fx_8_scifi', name: 'Sci-Fi', category: 'Futuristic' },
      { id: 'glockenspiel', name: 'Glockenspiel', category: 'Percussion' },
      { id: 'guitar_fret_noise', name: 'Guitar Fret', category: 'String' },
      { id: 'guitar_harmonics', name: 'Guitar Harmonics', category: 'String' },
      { id: 'gunshot', name: 'Gunshot', category: 'Effects' },
      { id: 'harmonica', name: 'Harmonica', category: 'Wind' },
      { id: 'harpsichord', name: 'Harpsichord', category: 'Baroque' },
      { id: 'honkytonk_piano', name: 'Honky Tonk', category: 'Piano' },
      { id: 'kalimba', name: 'Kalimba', category: 'African' },
      { id: 'koto', name: 'Koto', category: 'Japanese' }
    ];
    const instrument = instruments.find(inst => inst.id === instrumentId);
    return instrument ? instrument.name : 'Piano';
  };
  return (
    <>
      <div style={{ pointerEvents: showNewProject ? 'none' : 'auto' }}>
      <TopHeader />
      <div className="flex h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)] relative">
      <div className="border-r border-[#1414141A] dark:border-[#b463631a] w-[20%] sm:w-[23%] md:w-[22%] lg:w-[20%] xl:w-[17%] 2xl:w-[15%] bg-primary-light dark:bg-primary-dark">
          <div className="h-[100px] border-b border-[#1414141A] dark:border-[#FFFFFF1A] flex items-end pb-2"></div>

          <div style={{
            maxHeight: 'calc(100vh - 240px)',
            marginTop: "40px",
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* Internet Explorer 10+ */
          }}
            onScroll={handleScroll}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none; 
              }
            `}</style>
            {(tracks || []).map((track, idx) => {
              console.log(":llll", track)
              const isMuted = soloTrackId ? soloTrackId !== track.id : (track?.muted || false);
              const borderColor = track.id === currentTrackId ? track.color : '';
              const isDrumTrack = track.name === 'Drums & Machines' || track.type === 'drum';
              const isPianoTrack = track.name === 'Keys' || track.type === 'piano';
              const isGuitarTrack = track.name === 'Guitar' || track.type === 'Guitar';
              const isOrchestralTrack = track.name === 'Orchestral' || track.type === 'Orchestral';
              const isComponentOpen = (track.id === currentTrackId) && ((openTrackType === 'Drums & Machines' && isDrumTrack) || (openTrackType === 'Keys' && isPianoTrack) || (openTrackType === 'Guitar' && isGuitarTrack) || (openTrackType === 'Orchestral' && isOrchestralTrack));

              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between px-3 border-l-4 border-b border-b-[#1414141A] dark:border-b-[#FFFFFF1A] bg-[#232323] cursor-pointer hover:bg-[#2A2A2A] transition-colors duration-200`}
                  style={{
                    height: `${trackHeight + 1}px`, 
                    minHeight: `${trackHeight + 1}px`,
                    borderLeftColor: track.id === currentTrackId && borderColor ? borderColor : '#232323',
                  }}
                  onClick={() => handleChangeTrack(track.id)}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== idx) {
                      dispatch(reorderTracks({ fromIndex: dragIndex, toIndex: idx }));
                    }
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                >
                  <div className="flex items-center w-16 justify-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${track.frozen ? 'bg-[#7F7B87]' : 'bg-black'}`} style={{ backgroundColor: isComponentOpen ? borderColor : (track.frozen ? '#7F7B87' : '#000000') }} onClick={(e) => handleIconToggle(e, track)}>
                      {track.name === 'Voice & Mic' && <Track1 className="w-6 h-6" />}
                      {track.name === 'Keys' && <Track2 className="w-6 h-6" />}
                      {track.name === 'Bass & 808' && <Track3 className="w-6 h-6" />}
                      {track.name === 'Guitar' && <Track4 className="w-6 h-6" />}
                      {track.name === 'Drums & Machines' && <Track5 className="w-6 h-6" />}
                      {track.name === 'Guitar/Bass Amp' && <Track6 className="w-6 h-6" />}
                      {track.name === 'Synth' && <Track7 className="w-6 h-6" />}
                      {track.name === 'Orchestral' && <Track8 className="w-6 h-6" />}
                      {track.url && <Wav className="w-6 h-6" />}
                    </div>
                  </div>

                  <div className="flex flex-col border-e-[0.5px] border-[#FFFFFF1A] pe-2 flex-1">
                    <div className="flex items-center gap-2">
                      {editingTrackId === track.id ? (
                        <input
                        type="text"
                        className="font-bold text-white text-sm truncate bg-[#232323] border border-[#AD00FF] rounded px-1 py-0.5 outline-none"
                        value={editingName}
                        autoFocus
                        onChange={e => setEditingName(e.target.value)}
                          onBlur={() => {
                            if (editingName.trim() && editingName !== track.name) {
                              dispatch(renameTrack({ trackId: track.id, newName: editingName.trim() }));
                            }
                            setEditingTrackId(null);
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              if (editingName.trim() && editingName !== track.name) {
                                dispatch(renameTrack({ trackId: track.id, newName: editingName.trim() }));
                              }
                              setEditingTrackId(null);
                            }
                            if (e.key === "Escape") {
                              setEditingTrackId(null);
                            }
                          }}
                        />
                      ) : (
                        <span className={`font-bold text-sm truncate flex-[0_0_auto] overflow-hidden whitespace-normal break-all w-[120px] [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical] ${track.frozen ? 'text-[#4CAF50]' : 'text-white'}`}>
                          { track.id == currentTrackId ? getInstrumentDisplayName(selectedInstrument) : (track.name || `Track ${idx + 1}`)}
                        </span>
                      )}
                      {track.frozen && (
                        <img src={FreezeIcon} alt="Frozen" className="w-4 h-4 opacity-80" style={{ filter: "invert(1) brightness(1.5)" }}/>
                      )}
                    </div>
                    <div className="flex flex-row items-center justify-around gap-x-2 mt-1">
                      <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${isRecording ? 'bg-[#FF006B]' : 'bg-[#444]'} text-white`}>R</span>
                      <span className="w-8 h-8 rounded-full bg-transparent">
                        <img src={tk} alt="" className={`w-full h-full opacity-60`} />
                      </span>
                      <span>
                        <VolumeKnob  initialVolume={track.volume || 80} onChange={handleTrackVolumeChange} trackId={track.id}/>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end h-full w-20">
                    <TrackMenu
                      trackId={track.id}
                      color={track.color}
                      onRename={() => {
                        setEditingTrackId(track.id);
                        setEditingName(track.name || "");
                      }}
                    />
                    <div className="flex items-center justify-center gap-x-4 w-full pb-4">
                      <img src={headphone} alt="Headphone" className={`${soloTrackId === track.id ? 'd_muteicon' : ''}`}
                        onClick={e => {
                          e.stopPropagation();
                          handleSoloTrack(track.id);
                        }}
                      />
                      <img src={mute} alt="Mute"
                        onClick={e => {
                          e.stopPropagation();
                          handleMuteTrack(track.id);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Track Button */}
            <div className="flex items-center justify-center gap-2 py-3 px-4 text-secondary-light dark:text-secondary-dark cursor-pointer" onClick={() => setShowAddTrackModal(true)} style={{ height: `${trackHeight + 8}px` }}>
              <span className="text-xl font-bold">+</span>
              <span>Add New Track</span>
            </div>
          </div>
        </div>

        <div className="w-[80%] sm:w-[77%] md:w-[78%] lg:w-[80%] xl:w-[83%] 2xl:w-[85%] bg-primary-light dark:bg-primary-dark">
          <Outlet />
        </div>
      </div>
      <BottomToolbar />
      </div>
      <NewProject open={showNewProject} setOpen={setShowNewProject} />
      {showAddTrackModal && (
        <AddNewTrackModel onClose={() => setShowAddTrackModal(false)} onOpenLoopLibrary={() => setShowAddTrackModal(false)} />
      )}

    </>
  );
};

export default Sidebar2;