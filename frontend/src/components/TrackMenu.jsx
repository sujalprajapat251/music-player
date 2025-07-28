import React, { useState, useRef, useEffect } from "react";
import more from "../Images/more.svg"; // adjust path as needed

const MENU_COLORS = [
  "#FF5A5A", "#FFB86C", "#FFD966", "#7CFF6B",
  "#6BFFEA", "#6B8CFF", "#B86CFF", "#FF6BCE",
  "#A0A0A0"
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

  return (
    <div style={{ position: "relative", display: "inline-block" }}  >
      <img
        src={more}
        alt="Menu"
        className="w-5 h-5 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      />
      {open && (
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: 30,
            left: 0,
            background: "#232323",
            color: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 12px #0003",
            minWidth: 220,
            zIndex: 1000,
            padding: 8,
            fontFamily: "inherit"
          }}
        >
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>Menu</div>
          <MenuItem icon="✏️" label="Rename" />
          <MenuItem icon="📋" label="Duplicate track" />
          <MenuItem icon="🗑️" label="Delete track" />
          <MenuItem icon="❄️" label="Freeze track (Free up CPU)" />
          <div style={{ borderTop: "1px solid #333", margin: "8px 0" }} />
          <MenuItem icon="↪️" label="Import" />
          <MenuItem
            icon="⬇️"
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
              position: "absolute", left: "100%", top: 110, background: "#232323", borderRadius: 8, minWidth: 180, zIndex: 1001, boxShadow: "0 2px 12px #0003"
            }}>
              <MenuItem icon="🎵" label="WAV audio file" />
              <MenuItem icon="🎵" label="WAV audio file (no effects)" />
            </div>
          )}

          {/* Color Submenu */}
          {submenu === "color" && (
            <div style={{
              position: "absolute", left: "100%", top: 150, background: "#232323", borderRadius: 8, minWidth: 180, zIndex: 1001, boxShadow: "0 2px 12px #0003", padding: 12
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
    <span style={{ marginRight: 12 }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {hasArrow && <span style={{ marginLeft: 8 }}>▶</span>}
  </div>
);

export default TrackMenu;
