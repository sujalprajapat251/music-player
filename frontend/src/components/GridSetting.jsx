import React, { useEffect, useState } from "react";
import { gridSizes, timeSignatures, rulers } from "../Utils/gridUtils";

// const sectionLabelStyle = {
//   // color: "#aaa",
//   color: colors.sectionLabel,
//   fontSize: "12px",
//   margin: "16px 0 4px 0",
//   paddingLeft: "16px",
// };

// const optionStyle = (selected) => ({
//   display: "flex",
//   alignItems: "center",
//   padding: "8px 16px",
//   // background: selected ? "rgba(255,255,255,0.05)" : "transparent",
//   background: selected ? colors.selectedBg : "transparent",
//   // color: "#fff",
//   color: colors.text,
//   cursor: "pointer",
//   fontSize: "15px",
//   transition: "background-color 0.2s ease",
//   userSelect: "none",
// });

// const checkmarkStyle = {
//   marginRight: "8px",
//   // color: "#FFFFFF",
//   color: colors.text,
//   fontSize: "18px",
//   width: "20px",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   flexShrink: 0,
// };

// const containerStyle = {
//   // background: "#181818",
//   background: colors.background,
//   borderRadius: "8px",
//   width: "220px",
//   // boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
//   boxShadow: colors.boxShadow,
//   padding: "8px 0",
//   fontFamily: "inherit",
//   maxHeight: "700px",
//   overflowY: "auto",
//   scrollbarWidth: "none",
//   msOverflowStyle: "none",
//   zIndex: 1000,
//   position: "relative",
// };

const GridSetting = ({
  selectedGrid = "1/4",
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
  const [isDark, setIsDark] = useState(false);

  // Detect "dark" class on <html> or <body>
  useEffect(() => {
    const checkDarkMode = () =>
      setIsDark(
        document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark")
      );

    checkDarkMode();

    // Optional: Observe for changes if dark class toggles dynamically
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Define color palette for both themes
  const colors = {
    background: isDark ? "#181818" : "#ffffff",
    sectionLabel: isDark ? "#aaa" : "#555",
    text: isDark ? "#ffffff" : "#000000",
    selectedBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    boxShadow: isDark
      ? "0 2px 16px rgba(0,0,0,0.5)"
      : "0 2px 16px rgba(0,0,0,0.15)",
  };
  const sectionLabelStyle = {
  color: colors.sectionLabel,
  fontSize: "12px",
  margin: "16px 0 4px 0",
  paddingLeft: "16px",
};

const optionStyle = (selected) => ({
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  background: selected ? colors.selectedBg : "transparent",
  color: colors.text,
  cursor: "pointer",
  fontSize: "15px",
  transition: "background-color 0.2s ease",
  userSelect: "none",
});

const checkmarkStyle = {
  marginRight: "8px",
  color: colors.text,
  fontSize: "18px",
  width: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const containerStyle = {
  background: colors.background,
  borderRadius: "8px",
  width: "220px",
  boxShadow: colors.boxShadow,
  padding: "8px 0",
  fontFamily: "inherit",
  maxHeight: "700px",
  overflowY: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  zIndex: 1000,
  position: "relative",
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
