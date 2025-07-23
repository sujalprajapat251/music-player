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
  const dispatch = useDispatch();

  return (
    <>
      <TopHeader />
      <div className="flex h-[calc(100vh-70px)] sm:h-[calc(100vh-54px)] md:h-[calc(100vh-96px)]">
        <div className="border-r border-[#1414141A] dark:border-[#FFFFFF1A] w-[20%] sm:w-[23%] md:w-[22%] lg:w-[20%] xl:w-[17%] 2xl:w-[15%] bg-primary-light dark:bg-primary-dark">
          <div className="mt-12 sm:mt-16 md:mt-20">
            {(tracks || []).map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center justify-between py-3 px-3 my-3 bg-[#232323] border-b border-[#232323]"
              >
                <div className="flex items-center w-16 justify-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black">
                    <img src={mic} alt="mic" />
                  </div>
                </div>
                <div className="flex flex-col border-e-[0.5px] border-[#FFFFFF1A] pe-2">
                  <div>
                    <span className="font-bold text-white text-sm truncate">
                      {track.name || `Track ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-x-2 mt-2">
                    <span className="w-6 h-6 rounded bg-[#444] text-xs font-bold flex items-center justify-center text-white">
                      R
                    </span>
                    <span className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center">
                      <img src={tk} alt="" className="w-full h-full" />
                    </span>
                    <VolumeKnob />
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end h-full w-28">
                  <div className="flex justify-end w-full me-2">
                    <img src={more} alt="Menu" className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-center gap-x-8 w-full">
                    <img
                      src={headphone}
                      alt="Headphone"
                      className="w-8 h-8 opacity-60"
                    />
                    <img src={mute} alt="Mute" className="w-8 h-8 opacity-60 mt-2" />
                  </div>
                </div>
              </div>
            ))}
            <div
              className="flex items-center gap-2 py-3 px-4 text-secondary-light dark:text-secondary-dark bg-[#1414141A] dark:bg-[#FFFFFF1A] hover:bg-[#232323] cursor-pointer mt-2"
              onClick={() => setShowAddTrackModal(true)}
            >
              <span className="text-xl font-bold">+</span>
              <span>Add New Track</span>
            </div>
          </div>
        </div>
        <div className="w-[80%] sm:w-[77%] md:w-[78%]  lg:w-[80%] xl:w-[83%] 2xl:w-[85%] bg-primary-light dark:bg-primary-dark   ">
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