import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addSectionLabel, updateSectionLabel } from "../Redux/Slice/studio.slice";
import { getGridSpacing } from "../Utils/gridUtils";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import close from '../Images/close.svg';

const MySection = ({ timelineContainerRef, audioDuration, selectedGrid }) => {
  const dispatch = useDispatch();
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [selectedSection, setSelectedSection] = useState("My Section");
  const [customenamodal, setCustomenamodal] = useState(false);
  const [customName, setCustomName] = useState("");
  // Grid snapping function
  const snapToGrid = (time) => {
    const gridSpacing = getGridSpacing(selectedGrid);
    if (!gridSpacing || gridSpacing <= 0) return time;
    const gridPosition = Math.round(time / gridSpacing) * gridSpacing;
    return Math.max(0, Math.min(audioDuration, gridPosition));
  };

  // Handle mouse movement over the timeline
  const handleMouseMove = useCallback((e) => {
    if (!timelineContainerRef?.current) return;

    const rect = timelineContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (width <= 0 || audioDuration <= 0) return;
    
    // Calculate time position based on cursor
    let rawTime = (x / width) * audioDuration;
    rawTime = Math.max(0, Math.min(audioDuration, rawTime));
    
    // Snap to grid
    const snappedTime = snapToGrid(rawTime);
    
    // Calculate percentage position
    const percentage = (snappedTime / audioDuration) * 100;
    
    setCursorPosition(percentage);
    setIsVisible(true);
  }, [timelineContainerRef, audioDuration, selectedGrid]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Add event listeners
  useEffect(() => {
    const container = timelineContainerRef?.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Close dropdown on outside click
  // useEffect(() => {
  //   if (!dropdownOpen) return;
  //   const handleClick = (e) => setDropdownOpen(false);
  //   document.addEventListener("mousedown", handleClick);
  //   return () => document.removeEventListener("mousedown", handleClick);
  // }, [dropdownOpen]);

  // Calculate dropdown position relative to viewport
  const handleDropdownToggle = useCallback((e) => {
    e.stopPropagation();
    
    if (!timelineContainerRef?.current) return;
    
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const timelineWidth = rect.width;
    const cursorX = (cursorPosition / 100) * timelineWidth;
    
    // Calculate absolute position relative to viewport
    const absoluteX = rect.left + cursorX;
    const absoluteY = rect.top + 110; // Position below the section label
    
    // Calculate start time based on cursor position
    const startTime = (cursorPosition / 100) * audioDuration;
    const snappedStartTime = snapToGrid(startTime);
    
    console.log('=== MySection Dropdown Opened ===');
    console.log('Cursor Position:', cursorPosition + '%');
    console.log('Start Time:', formatTime(snappedStartTime) + ' (' + snappedStartTime + ' seconds)');
    console.log('Audio Duration:', formatTime(audioDuration) + ' (' + audioDuration + ' seconds)');
    console.log('Timeline Width:', timelineWidth + 'px');
    console.log('Cursor X Position:', cursorX + 'px');
    console.log('================================');
    
    setDropdownPosition({ x: absoluteX, y: absoluteY });
    setDropdownOpen((open) => !open);
  }, [cursorPosition, timelineContainerRef, audioDuration, selectedGrid]);

  // Handle section selection
  const handleSectionSelect = (sectionName) => {
    console.log("sectionName----------------------------------------------------", sectionName);
    // Calculate start time based on cursor position
    const startTime = (cursorPosition / 100) * audioDuration;
    const snappedStartTime = snapToGrid(startTime);
    
    // Calculate end time based on section type
    const gridSpacing = getGridSpacing(selectedGrid);
    const sectionDuration = getSectionDuration(sectionName, gridSpacing);
    const endTime = Math.min(audioDuration, snappedStartTime + sectionDuration);
    
    console.log('=== Section Selected ===');
    console.log('Selected Section:', sectionName);
    console.log('Start Time:', formatTime(snappedStartTime) + ' (' + snappedStartTime + ' seconds)');
    console.log('End Time:', formatTime(endTime) + ' (' + endTime + ' seconds)');
    console.log('Section Duration:', formatTime(endTime - snappedStartTime) + ' (' + (endTime - snappedStartTime) + ' seconds)');
    console.log('Calculated Duration:', formatTime(sectionDuration) + ' (' + sectionDuration + ' seconds)');
    console.log('Cursor Position:', cursorPosition + '%');
    console.log('Grid Spacing:', formatTime(gridSpacing) + ' (' + gridSpacing + ' seconds)');
    console.log('========================');
    
    if (sectionName === "Custom Name") {
      // Open the custom name modal
      setCustomenamodal(true);
      return; // Don't close dropdown yet, wait for modal input
    } else {
      setSelectedSection(sectionName);
      
             // Calculate width based on section duration
       const timelineWidth = timelineContainerRef?.current?.clientWidth || 1200;
       const sectionWidth = ((endTime - snappedStartTime) / audioDuration) * timelineWidth;
       
       // Add to Redux state with start and end times
       dispatch(addSectionLabel({
         name: sectionName,
         startTime: snappedStartTime,
         endTime: endTime,
         position: cursorPosition,
         width: sectionWidth
       }));
    }
    
    setDropdownOpen(false);
  };

  // Helper function to format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to calculate section duration based on section type
  const getSectionDuration = (sectionName, gridSpacing) => {
    const baseDuration = gridSpacing * 4; // 4 grid units as default
    
    switch (sectionName) {
      case "Intro":
        return gridSpacing * 2; // Shorter intro
      case "Verse":
        return gridSpacing * 8; // Longer verse
      case "Chorus":
        return gridSpacing * 6; // Medium chorus
      case "Pre Chorus":
        return gridSpacing * 3; // Short pre-chorus
      case "Bridge":
        return gridSpacing * 4; // Medium bridge
      case "Outro":
        return gridSpacing * 3; // Short outro
      case "Interlude":
        return gridSpacing * 2; // Short interlude
      case "Solo":
        return gridSpacing * 8; // Longer solo
      case "Hook":
        return gridSpacing * 4; // Medium hook
      case "Breakdown":
        return gridSpacing * 2; // Short breakdown
      case "Drop":
        return gridSpacing * 4; // Medium drop
      case "Build Up":
        return gridSpacing * 3; // Short build up
      default:
        return baseDuration;
    }
  };

  // Handle custom name submission
  const handleCustomNameSubmit = () => {
    if (customName && customName.trim()) {
      // Calculate start time based on cursor position
      const startTime = (cursorPosition / 100) * audioDuration;
      const snappedStartTime = snapToGrid(startTime);
      
      // Calculate end time based on section type
      const gridSpacing = getGridSpacing(selectedGrid);
      const sectionDuration = getSectionDuration("Custom", gridSpacing);
      const endTime = Math.min(audioDuration, snappedStartTime + sectionDuration);
      
      setSelectedSection(customName.trim());
      
      // Calculate width based on section duration
      const timelineWidth = timelineContainerRef?.current?.clientWidth || 1200;
      const sectionWidth = ((endTime - snappedStartTime) / audioDuration) * timelineWidth;
      
      // Add to Redux state with start and end times
      dispatch(addSectionLabel({
        name: customName.trim(),
        startTime: snappedStartTime,
        endTime: endTime,
        position: cursorPosition,
        width: sectionWidth
      }));
      
      // Close modal and reset
      setCustomenamodal(false);
      setCustomName("");
      setDropdownOpen(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setCustomenamodal(false);
    setCustomName("");
    setDropdownOpen(false);
  };

  const sectionOptions = [
    "Intro", "Verse", "Chorus", "Pre Chorus", "Bridge", "Outro",
    "Interlude", "Solo", "Hook", "Breakdown", "Drop", "Build Up", "Custom Name"
  ];

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "75px", // Position below the loop bar
          left: 0,
          width: "100%",
          height: "20px",
          background: "transparent",
          zIndex: 5,
          pointerEvents: "none", // Don't interfere with other interactions
        }}
      >
        {/* Section Label - follows cursor and shows selected section */}
        <div
          style={{
            position: "absolute",
            top: "35px",
            left: `${cursorPosition}%`,
            width: "100px",
            height: "25px",
            background: "#2A2A2A",
            borderRadius: "4px",
            padding: "3px 10px 0 10px",
            color: "white",
            fontSize: "12px",
            fontWeight: "500",
            border: "1px solid #444",
            textAlign: "center",
            transform: "translateX(-50%)", // Center the label on cursor
            transition: "opacity 0.2s ease",
            cursor: "pointer",
            zIndex: 10,
            pointerEvents: "auto", // Make it clickable
          }}
          onClick={handleDropdownToggle}
        >
          my section
        </div>
      </div>

      {/* Dropdown rendered outside timeline container */}
      {dropdownOpen && (
        <div
          style={{
            position: "fixed",
            top: `${dropdownPosition.y}px`,
            left: `${dropdownPosition.x}px`,
            transform: "translateX(-50%)",
            background: "#23232A",
            borderRadius: "6px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            border: "1px solid #444",
            minWidth: "200px",
            zIndex: 9999, // Very high z-index to ensure it's on top
            color: "white",
            padding: "6px 0",
          }}
        >
          {sectionOptions.map((item, idx) => (
            <div
              key={item}
              style={{
                padding: "8px 20px",
                cursor: "pointer",
                background: idx === 12 ? "#23232A" : "none",
                borderTop: idx === 12 ? "1px solid #333" : "none",
                transition: "background-color 0.2s ease",
              }}
              onClick={() => handleSectionSelect(item)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#3A3A3A";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
              onMouseDown={e => e.preventDefault()}
            >
              {item}
            </div>
          ))}
        </div>
      )}

              <Dialog open={customenamodal} onClose={handleModalClose} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:px-[10px] px-[20px]">
                                <div className="md:py-[20px] py-[10px] md:px-[10px] bg-[#1F1F1F] border-b-[0.5px] border-b-[#FFFFFF1A]">
                                    <div className="flex justify-between items-center">
                                        <div className="sm:text-xl text-lg font-[600] text-[#fff]">Custom Section Name</div>
                                        <img src={close} alt="" onClick={handleModalClose} className="cursor-pointer" />
                                    </div>
                                </div>
                                <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                    <div className=''>
                                        <div className='text-sm text-[#FFFFFF] font-[400] mb-[10px]'>Name</div>
                                        <input 
                                            type="text" 
                                            placeholder='Enter section name' 
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleCustomNameSubmit();
                                                }
                                            }}
                                            className='text-[#FFFFFF99] rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]' 
                                        />
                                    </div>
                                    <div className="text-center md:pt-[40px] pt-[20px]">
                                        <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={handleModalClose}>Cancel </button>
                                        <button className="d_btn d_createbtn" onClick={handleCustomNameSubmit}>Create</button>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

    </>
  );
};

export default MySection; 