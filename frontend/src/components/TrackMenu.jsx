import React, { useState, useRef, useEffect } from "react";
import more from "../Images/more.svg"; // adjust path as needed
import { FaAngleRight } from "react-icons/fa6";
import importIcon from '../Images/import.svg';
import PencilIcon from '../Images/pencil.svg'
import DuplicateIcon from '../Images/duplicate.svg'
import TrashIcon from '../Images/trash.svg'
import FreezeIcon from '../Images/freeze.svg'
import waveIcon from '../Images/wave.svg'
import { useDispatch, useSelector } from "react-redux";
import { updateTrack, renameTrack, removeTrack, freezeTrack, duplicateTrack, updateTrackAudio, exportTrack } from "../Redux/Slice/studio.slice";
const MENU_COLORS = [
  "#F05959", "#49B1A5", "#C579C8", "#5572F9",
  "#25A6CA", "#C059F0", "#4CAA47", "#F0F059",
  "#F09859", "#8C8484"
];

const TrackMenu = ({ trackId, color, onRename }) => {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const menuRef = useRef();
  const fileInputRef = useRef();
  const dispatch = useDispatch();

  // Get track data to check frozen state
  const track = useSelector((state) =>
    state.studio.tracks.find(t => t.id === trackId)
  );
  
  const isFrozen = track?.frozen || false;

  // Close menu if track is removed while menu is open
  useEffect(() => {
    if (!track && open) {
      setOpen(false);
      setSubmenu(null);
    }
  }, [track, open]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setSubmenu(null);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard event handling for Shift + Backspace
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore global delete shortcut while typing in inputs
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      // Check if Shift + Backspace is pressed
      if (e.shiftKey && e.key === 'Backspace') {
        e.preventDefault(); // Prevent default browser behavior
        // Ensure track exists before removing
        if (track) {
          dispatch(removeTrack(trackId));
          setOpen(false);
        }
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, trackId, track]);

  // If track doesn't exist, don't render the menu
  if (!track) {
    return null;
  }

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpen((v) => !v);
  };
  const handleFreezeTrack = () => {
    dispatch(freezeTrack(trackId));
    setOpen(false);
  };

  const handleDuplicateTrack = () => {
    dispatch(duplicateTrack(trackId));
    setOpen(false);
  };

  const handleImportAudio = () => {
    fileInputRef.current.click();
    setOpen(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Create object URL for the file
      const url = URL.createObjectURL(file);

      // Get audio duration
      let duration = null;
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        duration = audioBuffer.duration;
      } catch (err) {
        console.error('Error getting audio duration:', err);
        duration = 0;
      }

      // Prepare audio data
      const audioData = {
        url: url,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        duration: duration,
        trimStart: 0,
        trimEnd: duration,
        soundData: {
          filename: file.name,
          size: file.size,
          type: file.type
        }
      };

      // Update the track with audio data
      dispatch(updateTrackAudio({ trackId, audioData }));
    } catch (error) {
      console.error('Error importing audio file:', error);
    }
  };

  const handleExportTrack = async (includeEffects = true) => {
    if (!track || !track.url) {
      console.error('No audio data to export');
      return;
    }

    try {
      // Fetch the audio data
      const response = await fetch(track.url);
      const audioBlob = await response.blob();

      // Create a new blob with the appropriate MIME type
      const exportBlob = new Blob([audioBlob], { type: 'audio/wav' });

      // Create download link
      const downloadUrl = URL.createObjectURL(exportBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Set filename based on track name and export type
      const filename = includeEffects
        ? `${track.name || 'track'}_with_effects.wav`
        : `${track.name || 'track'}_no_effects.wav`;

      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(downloadUrl);

      // Dispatch export action for tracking
      dispatch(exportTrack({ trackId, exportType: includeEffects ? 'with_effects' : 'no_effects' }));

      setOpen(false);
      setSubmenu(null);
    } catch (error) {
      console.error('Error exporting track:', error);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}  >
      <img
        src={more}
        alt="Menu"
        className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleMenuClick}
      />
      {open && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "#1F1F1F",
            color: "#fff",
            borderRadius: "4px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            minWidth: 300,
            zIndex: 9999,
            // padding: 8,
            fontFamily: "inherit",
            marginTop: 4
          }}
        >
          <MenuItem
            icon={<img src={PencilIcon} alt="Rename" style={{ width: 16, height: 16, filter: "invert(1)" }} />}
            label="Rename"
            onClick={onRename}
            className="py-2 px-3"
          />
          <MenuItem
            icon={<img src={DuplicateIcon} alt="Duplicate track" style={{ width: 16, height: 16, filter: "invert(1)" }} />}
            label="Duplicate track"
            onClick={handleDuplicateTrack}
            className="py-2 px-3"
          />
          <MenuItem
            icon={<img src={TrashIcon} alt="Delete track" style={{ width: 16, height: 16, filter: "invert(1)" }} />}
            label="Delete track"
            onClick={() => {
              // Ensure track exists before removing
              if (track) {
                if (isShiftPressed) {
                  // If Shift is pressed, delete without confirmation
                  dispatch(removeTrack(trackId));
                  setOpen(false);
                } else {
                  dispatch(removeTrack(trackId));
                  setOpen(false);
                }
              }
            }}
            className="py-2 px-3"
          />
          <MenuItem
            icon={
              <img
                src={FreezeIcon}
                alt="Freeze track"
                style={{
                  width: 16,
                  height: 16,
                  filter: isFrozen ? "invert(1) brightness(1.5)" : "invert(1)",
                  opacity: isFrozen ? 1 : 0.7
                }}
              />
            }
            label={`${isFrozen ? 'Unfreeze' : 'Freeze'} track (Free up CPU)`}
            onClick={handleFreezeTrack}
            style={{
              color: isFrozen ? "#4CAF50" : "#fff",
              fontWeight: isFrozen ? "bold" : "normal"
            }}
            className="py-2 px-3"
          />
          <div style={{ borderTop: "1px solid #333", margin: "8px 0" }} />
          <MenuItem
            icon={<img src={importIcon} alt="Import" style={{ width: 16, height: 16, filter: "invert(1)" }} />}
            label="Import"
            onClick={handleImportAudio}
            className="py-2 px-3"
          />
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <MenuItem
            icon={<img src={importIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)", transform: "rotate(90deg)" }} />}
            label="Export"
            onClick={() => setSubmenu(submenu === "export" ? null : "export")}
            hasArrow
            className="py-2 px-3"
          />
          <MenuItem
            icon={<span style={{ display: "inline-block", width: 12, height: 12, background: color, borderRadius: 2 }} />}
            label="Color"
            onClick={() => setSubmenu(submenu === "color" ? null : "color")}
            hasArrow
            className="py-2 px-3"
          />

          {/* Export Submenu */}
          {submenu === "export" && (
            <div style={{
              position: "absolute", left: "100%", top: 250, background: "#232323", minWidth: 300, zIndex: 10000, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", marginLeft: 4
            }}>
              <MenuItem
                icon={<img src={waveIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />}
                label="WAV audio file"
                onClick={() => handleExportTrack(true)}
              />
              <MenuItem
                icon={<img src={waveIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />}
                label="WAV audio file (no effects)"
                onClick={() => handleExportTrack(false)}
              />
            </div>
          )}

          {/* Color Submenu */}
          {submenu === "color" && (
            <div style={{
              position: "absolute", left: "100%", top: 280, background: "#232323", minWidth: 200, zIndex: 10000, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", padding: 12, marginLeft: 4
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MENU_COLORS.map((menuColor) => (
                  <div
                    key={menuColor}
                    style={{
                      width: 28,
                      height: 28,
                      background: menuColor,
                      borderRadius: 4,
                      cursor: "pointer",
                      border: `2px solid ${color === menuColor ? "#fff" : "#232323"}`,
                      boxSizing: "border-box"
                    }}
                    onClick={() => {
                      dispatch(updateTrack({ id: trackId, updates: { color: menuColor } }));
                      setOpen(false); setSubmenu(null);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, label, onMouseEnter, onMouseLeave, hasArrow, onClick, style }) => (
  <div
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: 15,
      borderRadius: 6,
      transition: "background 0.2s",
      position: "relative",
      ...style
    }}
    className="hover:bg-[#333]"
  >
    <span style={{ marginRight: 12, display: "flex", alignItems: "center" }}>
      {typeof icon === 'string' ? (
        icon
      ) : (
        icon
      )}
    </span>
    <span style={{ flex: 1 }}>{label}</span>
    {hasArrow && <span style={{ marginLeft: 8 }}><FaAngleRight /></span>}
  </div>
);

export default TrackMenu;
