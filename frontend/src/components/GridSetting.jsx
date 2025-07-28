import React, { useState, useEffect } from "react";

const gridSizes = [
  "Automatic grid size",
  "1/1",
  "1/2",
  "1/2 dotted",
  "1/4",
  "1/8",
  "1/16",
  "1/32",
  "1/8 triplet",
  "1/16 triplet",
];

const timeSignatures = ["3/4", "4/4", "5/4", "6/4", "7/4", "6/8", "12/8"];
const rulers = ["Beats", "Time"];

const sectionLabelStyle = {
  color: "#aaa",
  fontSize: "12px",
  margin: "16px 0 4px 0",
  paddingLeft: "16px",
};

const optionStyle = (selected) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  background: selected ? "rgba(255,255,255,0.05)" : "transparent",
  color: "#fff",
  cursor: "pointer",
  fontSize: "15px",
  transition: "background-color 0.2s ease",
  userSelect: "none",
});

const checkmarkStyle = {
  marginRight: "8px",
  color: "#FFFFFF",
  fontSize: "18px",
  width: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const containerStyle = {
  background: "#181818",
  borderRadius: "8px",
  width: "220px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
  padding: "8px 0",
  fontFamily: "inherit",
  maxHeight: "700px",
  overflowY: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  zIndex: 1000,
  position: "relative",
};

const GridSetting = ({
  selectedGrid = "1/1",
  selectedTime = "4/4",
  selectedRuler = "Beats",
  onGridChange,
  onTimeChange,
  onRulerChange,
}) => {
  const handleGridSelect = (size) => {
    console.log("Grid selected:", size);
    if (onGridChange) {
      onGridChange(size);
    }
  };

  const handleTimeSelect = (sig) => {
    console.log("Time signature selected:", sig);
    if (onTimeChange) {
      onTimeChange(sig);
    }
  };

  const handleRulerSelect = (ruler) => {
    console.log("Ruler selected:", ruler);
    if (onRulerChange) {
      onRulerChange(ruler);
    }
  };

  return (
    <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
      <div style={sectionLabelStyle}>Grid size:</div>
      {gridSizes.map((size) => {
        const isSelected = selectedGrid === size;

        return (
          <div
            key={size}
            style={optionStyle(isSelected)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGridSelect(size);
            }}
          >
            <span style={checkmarkStyle}>{isSelected ? "✓" : ""}</span>
            {size}
          </div>
        );
      })}

      <div style={{ ...sectionLabelStyle, marginTop: "20px" }}>
        Time signature:
      </div>
      {timeSignatures.map((sig) => {
        const isSelected = selectedTime === sig;

        return (
          <div
            key={sig}
            style={optionStyle(isSelected)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTimeSelect(sig);
            }}
          >
            <span style={checkmarkStyle}>{isSelected ? "✓" : ""}</span>
            {sig}
          </div>
        );
      })}

      <div style={{ ...sectionLabelStyle, marginTop: "20px" }}>Ruler:</div>
      {rulers.map((ruler) => {
        const isSelected = selectedRuler === ruler;
        return (
          <div
            key={ruler}
            style={optionStyle(isSelected)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRulerSelect(ruler);
            }}
          >
            <span style={checkmarkStyle}>{isSelected ? "✓" : ""}</span>
            {ruler}
          </div>
        );
      })}
    </div>
  );
};

export default GridSetting;
