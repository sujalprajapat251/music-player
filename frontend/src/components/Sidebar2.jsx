import React, { useState } from "react";
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
import { renameTrack, setCurrentTrackId } from "../Redux/Slice/studio.slice";
import FreezeIcon from "../Images/freeze.svg";

const Sidebar2 = () => {
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const tracks = useSelector((state) => state.studio.tracks);
  const trackHeight = useSelector((state) => state.studio.trackHeight);
  const dispatch = useDispatch();

  const currentTrackId = useSelector((state) => state.studio.currentTrackId);


  const handleChangeTrack = (trackId) => {
    dispatch(setCurrentTrackId(trackId));
  }

  return (
    <>
      <TopHeader />
      <div className="flex h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)] relative">
        <div className="border-r border-[#1414141A] dark:border-[#FFFFFF1A] w-[20%] sm:w-[23%] md:w-[22%] lg:w-[20%] xl:w-[17%] 2xl:w-[15%] bg-primary-light dark:bg-primary-dark">
          {/* Timeline ruler space - matches the ruler height in Timeline component */}
          <div className="h-[100px] border-b border-[#1414141A] dark:border-[#FFFFFF1A] flex items-end pb-2"></div>
          
          {/* Tracks container */}
          <div style={{ maxHeight: 'calc(100vh - 270px)' }}>
            {(tracks || []).map((track, idx) => (
              <div
                key={track.id}
                className={`flex items-center justify-between px-3 border-b border-[#1414141A] dark:border-[#FFFFFF1A] bg-[#232323] cursor-pointer ${track.id === currentTrackId ? 'border-l-4 border-[#a33bff]' : ''
                  }`}
                style={{
                  height: `${trackHeight + 1}px`, // 8px for padding
                  minHeight: `${trackHeight + 1}px`
                }}
                onClick={() => handleChangeTrack(track.id)}
              >
                <div className="flex items-center w-16 justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${track.frozen ? 'bg-[#2a2a2a]' : 'bg-black'
                    }`}>
                    <img src={mic} alt="mic" className={track.frozen ? 'opacity-60' : ''} />
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
                            dispatch(renameTrack({ id: track.id, newName: editingName.trim() }));
                          }
                          setEditingTrackId(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            if (editingName.trim() && editingName !== track.name) {
                              dispatch(renameTrack({ id: track.id, newName: editingName.trim() }));
                            }
                            setEditingTrackId(null);
                          }
                          if (e.key === "Escape") {
                            setEditingTrackId(null);
                          }
                        }}
                      />
                    ) : (
                      <span className={`font-bold text-sm truncate ${track.frozen ? 'text-[#4CAF50]' : 'text-white'
                        }`}>
                        {track.name || `Track ${idx + 1}`}
                      </span>
                    )}
                    {track.frozen && (
                      <img
                        src={FreezeIcon}
                        alt="Frozen"
                        className="w-4 h-4 opacity-80"
                        style={{ filter: "invert(1) brightness(1.5)" }}
                      />
                    )}
                  </div>
                  <div className="flex flex-row items-center justify-around gap-x-2 mt-1">
                    <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center bg-[#444] text-white`}>
                      R
                    </span>
                    <span className="w-8 h-8 rounded-full bg-transparent">
                      <img src={tk} alt="" className={`w-full h-full opacity-60`} />
                    </span>
                    <span>
                      <VolumeKnob />
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
                    <img
                      src={headphone}
                      alt="Headphone"
                      className={`w-6 h-6 opacity-60`}
                    />
                    <img src={mute} alt="Mute" className={`w-6 h-6 opacity-60`} />
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Track Button */}
            <div
              className="flex items-center justify-center gap-2 py-3 px-4 text-secondary-light dark:text-secondary-dark bg-[#1414141A] dark:bg-[#FFFFFF1A] hover:bg-[#232323] cursor-pointer"
              onClick={() => setShowAddTrackModal(true)}
              style={{ height: `${trackHeight + 8}px` }}
            >
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
      {showAddTrackModal && (
        <AddNewTrackModel onClose={() => setShowAddTrackModal(false)} />
      )}
    </>
  );
};

export default Sidebar2;