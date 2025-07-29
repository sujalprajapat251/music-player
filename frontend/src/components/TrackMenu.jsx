import React, { useState, useRef, useEffect } from "react";
import more from "../Images/more.svg"; // adjust path as needed
import { FaAngleRight } from "react-icons/fa6";
import importIcon from '../Images/import.svg';
import PencilIcon from '../Images/pencil.svg'
import DuplicateIcon from '../Images/duplicate.svg'
import TrashIcon from '../Images/trash.svg'
import FreezeIcon from '../Images/freeze.svg'
import waveIcon from '../Images/wave.svg'
const MENU_COLORS = [
  "#F05959", "#49B1A5", "#C579C8", "#5572F9",
  "#25A6CA", "#C059F0", "#4CAA47", "#F0F059",
  "#F09859" , "#8C8484"
];

const TrackMenu = () => {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState(null);
  const menuRef = useRef();

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

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpen((v) => !v);
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
          <MenuItem icon={<img src={PencilIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="Rename" />
          <MenuItem icon={<img src={DuplicateIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="Duplicate track" />
          <MenuItem icon={<img src={TrashIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="Delete track" />
          <MenuItem icon={<img src={FreezeIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="Freeze track (Free up CPU)" />
          <div style={{ borderTop: "1px solid #333", margin: "8px 0" }} />
          <MenuItem icon={<img src={importIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="Import" />
          <MenuItem
            icon={<img src={importIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)", transform: "rotate(90deg)" }} />}
            label="Export"
            onMouseEnter={() => setSubmenu("export")}
            onMouseLeave={() => setSubmenu(null)}
            hasArrow
          />
          <MenuItem
            icon={<span style={{ display: "inline-block", width: 12, height: 12, background: "#FF5A5A", borderRadius: 2 }} />}
            label="Color"
            onMouseEnter={() => setSubmenu("color")}
            onMouseLeave={() => setSubmenu(null)}
            hasArrow
          />

          {/* Export Submenu */}
          {submenu === "export" && (
            <div style={{
              position: "absolute", left: "100%", top: 250, background: "#232323", borderRadius: 8, minWidth: 300, zIndex: 10000, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", marginLeft: 4
            }}>
               <div className="mt-2 ms-3" style={{ fontSize: 13, color: "#aaa" }}>Export As</div>
              <MenuItem icon={<img src={waveIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="WAV audio file" />
              <MenuItem icon={<img src={waveIcon} alt="Export" style={{ width: 16, height: 16, filter: "invert(1)" }} />} label="WAV audio file (no effects)" />
            </div>
          )}

          {/* Color Submenu */}
          {submenu === "color" && (
            <div style={{
              position: "absolute", left: "100%", top: 280, background: "#232323", borderRadius: 8, minWidth: 200, zIndex: 10000, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", padding: 12, marginLeft: 4
            }}>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>Color</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MENU_COLORS.map((color) => (
                  <div
                    key={color}
                    style={{
                      width: 28, height: 28, background: color, borderRadius: 4, cursor: "pointer", border: "2px solid #232323"
                    }}
                    onClick={() => {
                      // handle color change here
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

const MenuItem = ({ icon, label, onMouseEnter, onMouseLeave, hasArrow }) => (
  <div
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
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
