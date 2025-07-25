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

const Sidebar2 = () => {
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const tracks = useSelector((state) => state.studio.tracks);
  const trackHeight = useSelector((state) => state.studio.trackHeight);
  const dispatch = useDispatch();

  return (
    <>
      <TopHeader />
      <div className="flex h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)]">
        <div className="border-r border-[#1414141A] dark:border-[#FFFFFF1A] w-[20%] sm:w-[23%] md:w-[22%] lg:w-[20%] xl:w-[17%] 2xl:w-[15%] bg-primary-light dark:bg-primary-dark">
          {/* Timeline ruler space - matches the ruler height in Timeline component */}
          <div className="h-[100px] border-b border-[#1414141A] dark:border-[#FFFFFF1A] flex items-end pb-2"></div>
          
          {/* Tracks container */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 270px)' }}>
            {(tracks || []).map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center justify-between px-3 bg-[#232323] border-b border-[#1414141A] dark:border-[#FFFFFF1A]"
                style={{ 
                  height: `${trackHeight + 1}px`, // 8px for padding
                  minHeight: `${trackHeight + 1}px`
                }}
              >
                <div className="flex items-center w-16 justify-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black">
                    <img src={mic} alt="mic" />
                  </div>
                </div>
                
                <div className="flex flex-col border-e-[0.5px] border-[#FFFFFF1A] pe-2 flex-1">
                  <div>
                    <span className="font-bold text-white text-sm truncate">
                      {track.name || `Track ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex flex-row items-center justify-around gap-x-2 mt-1">
                    <span className="w-6 h-6 rounded bg-[#444] text-xs font-bold flex items-center justify-center text-white">
                      R
                    </span>
                    <span className="w-8 h-8 rounded-full bg-transparent">
                      <img src={tk} alt="" className="w-full h-full" />
                    </span>
                   <span>
                   <VolumeKnob />
                   </span>
                  </div>
                </div>
                
                <div className="flex flex-col justify-between items-end h-full w-20">
                  <div className="flex justify-end w-full me-2 mt-1">
                    <img src={more} alt="Menu" className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-center gap-x-4 w-full pb-4">
                    <img
                      src={headphone}
                      alt="Headphone"
                      className="w-6 h-6 opacity-60"
                    />
                    <img src={mute} alt="Mute" className="w-6 h-6 opacity-60" />
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