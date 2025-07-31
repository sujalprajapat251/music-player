import React, { useState, useRef, useEffect } from "react";
import more from "../Images/more.svg"; // adjust path as needed
import { FaAngleRight } from "react-icons/fa6";
import importIcon from '../Images/import.svg';
import PencilIcon from '../Images/pencil.svg'
import DuplicateIcon from '../Images/duplicate.svg'
import TrashIcon from '../Images/trash.svg'
import FreezeIcon from '../Images/freeze.svg'
import waveIcon from '../Images/wave.svg'
import { useDispatch } from "react-redux";
import { updateTrack , renameTrack, removeTrack } from "../Redux/Slice/studio.slice";
const MENU_COLORS = [
  "#F05959", "#49B1A5", "#C579C8", "#5572F9",
  "#25A6CA", "#C059F0", "#4CAA47", "#F0F059",
  "#F09859" , "#8C8484"
];

const TrackMenu = ({ trackId, trackName, color, onRename }) => {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const menuRef = useRef();
  const dispatch = useDispatch();

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
      // Check if Shift + Backspace is pressed
      if (e.shiftKey && e.key === 'Backspace') {
        e.preventDefault(); // Prevent default browser behavior
        dispatch(removeTrack(trackId));
        setOpen(false);
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, trackId]);

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpen((v) => !v);
  };

  const handleRename = () => {
    const newName = window.prompt("Enter new track name:", trackName);
    if (newName && newName.trim() !== "" && newName !== trackName) {
      dispatch(renameTrack({ id: trackId, newName }));
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
            background: "#232323",
            color: "#fff",
            borderRadius: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            minWidth: 300,
            zIndex: 9999,
            padding: 8,
            fontFamily: "inherit",
            marginTop: 4
          }}
        >
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>Menu</div>
          <MenuItem
            icon={<img src={PencilIcon} alt="Rename" style={{ width: 16, height: 16, filter: "invert(1)" }} />}
            label="Rename"
            onClick={onRename}
          />
          <MenuItem icon={<img src={DuplicateIcon} alt="Duplicate track" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="Duplicate track" />
          <MenuItem 
            icon={<img src={TrashIcon} alt="Delete track" style={{ width: 16, height: 16, filter: "invert(1)" }} />} 
            label="Delete track" 
            onClick={() => {
                if (isShiftPressed) {
                    // If Shift is pressed, delete without confirmation
                    dispatch(removeTrack(trackId));
                    setOpen(false);
                } else {
                        dispatch(removeTrack(trackId));
                        setOpen(false);                  
                }
            }}
          />
          <MenuItem icon={<img src={FreezeIcon} alt="Freeze track" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="Freeze track (Free up CPU)" />
          <div style={{ borderTop: "1px solid #333", margin: "8px 0" }} />
          <MenuItem icon={<img src={importIcon} alt="Import" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="Import" />
          <MenuItem
            icon={<img src={importIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)", transform: "rotate(90deg)" }} />}
            label="Export"
            onClick={() => setSubmenu(submenu === "export" ? null : "export")}
            hasArrow
          />
          <MenuItem
            icon={<span style={{ display: "inline-block", width: 12, height: 12, background: color, borderRadius: 2 }} />}
            label="Color"
            onClick={() => setSubmenu(submenu === "color" ? null : "color")}
            hasArrow
          />

          {/* Export Submenu */}
          {submenu === "export" && (
            <div style={{
              position: "absolute", left: "100%", top: 250, background: "#232323", borderRadius: 8, minWidth: 300, zIndex: 10000, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", marginLeft: 4
            }}>
               <div className="mt-2 ms-3" style={{ fontSize: 13, color: "#aaa" }}>Export As</div>
              <MenuItem icon={<img src={waveIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="WAV audio file" onClick={() => { setOpen(false); setSubmenu(null); /* handle export */ }} />
              <MenuItem icon={<img src={waveIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="WAV audio file (no effects)" onClick={() => { setOpen(false); setSubmenu(null); /* handle export no effects */ }} />
            </div>
          )}

          {/* Color Submenu */}
          {submenu === "color" && (
            <div style={{
              position: "absolute", left: "100%", top: 280, background: "#232323", borderRadius: 8, minWidth: 200, zIndex: 10000, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", padding: 12, marginLeft: 4
            }}>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>Color</div>
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

const MenuItem = ({ icon, label, onMouseEnter, onMouseLeave, hasArrow, onClick }) => (
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
      position: "relative"
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
