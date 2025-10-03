import React, { useEffect, useRef, useState } from "react";
import timeIcon1 from '../Images/timeIcon1.svg'
import timeIcon2 from '../Images/timeIcon2.svg'
import timeIcon3 from '../Images/timeIcon3.svg'
import timeIcon4 from '../Images/timeIcon4.svg'
import timeIcon5 from '../Images/timeIcon5.svg'
import timeIcon6 from '../Images/timeIcon5.svg'
import { useTheme } from "../Utils/ThemeContext";
import { useI18n } from "../Utils/i18n";
import { LuAudioLines } from "react-icons/lu";
import { IoMicOutline } from "react-icons/io5";

const getActionCardColors = (isDark) => ({
  cardBg: isDark ? "#232323" : "#dfdfdf",
  cardHover: isDark ? "#333333" : "#e0e0e0",
  text: isDark ? "#ffffff" : "#141414",
  shadow: isDark ? "0 2px 12px #0004" : "0 2px 12px #0002",
});



const TimelineActionBoxes = ({ onAction }) => {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const colors = getActionCardColors(isDark);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Create actions array with translated labels
  const actions = [
    { label: t('browseLoops'), icon: timeIcon1 },
    { label: t('patternsBeatmaker'), icon: timeIcon2},
    { label: t('playTheSynth'), icon: timeIcon3 },
    { label: t('addNewTrack'), icon: timeIcon4 },
    { label: t('importFile'), icon: timeIcon5 },
    // { label: "Invite Friend", icon: timeIcon6}
  ];

  const row1 = actions.slice(0, 3);
  const row2 = actions.slice(3);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionClick = (action, e) => {
    // Use original English labels for functionality, but display translated labels
    const originalLabels = {
      [t('browseLoops')]: "Browse loops",
      [t('patternsBeatmaker')]: "Patterns Beatmaker", 
      [t('playTheSynth')]: "Play the synth",
      [t('addNewTrack')]: "Add new track",
      [t('importFile')]: "Import file"
    };
    
    const originalLabel = originalLabels[action.label] || action.label;
    
    if (originalLabel === "Import file") {
      setMenuOpen(!menuOpen);
    } else {
      onAction && onAction(originalLabel);
    }
  };

  const handleMenuClick = (menuAction) => {
    setMenuOpen(false);
    onAction && onAction(menuAction);
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .timeline-container {
            justify-content: flex-start !important;
            }
          }
          @media (max-width: 425px) {
            .timeline-container {
              width: 100vw !important;
              padding: 5px !important;
              gap: 0px !important;
              min-height: auto !important;
              align-items: flex-start !important;
            }
            .timeline-row {
              gap: 8px !important;
              flex-wrap: wrap !important;
              justify-content: center !important;
            }
            .action-card {
              width: 100px !important;
              height: 90px !important;
              font-size: 16px !important;
              margin-bottom: 10px !important;
            }
            .action-image {
              width: 28px !important;
              height: 28px !important;
              margin-bottom: 6px !important;
            }
            .action-image-small {
              width: 24px !important;
              height: 24px !important;
              margin-bottom: 6px !important;
            }
            .action-text {
              font-size: 12px !important;
              line-height: 1.2 !important;
            }
            .dropdown-menu {
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
              width: 90vw !important;
              max-width: 280px !important;
            }
            .dropdown-item {
              padding: 12px 16px !important;
              font-size: 14px !important;
            }
            .timeline-row{
              display: block !important;
            }
          }
        `}
      </style>
      <div
        className="timeline-container"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "800px",
          width: "calc(100vw - 300px)",
          gap: "15px",
          padding: "10px",
        }}
      >
      {/* Row 1 */}
      <div className="timeline-row" style={{ display: "flex", gap: "15px" }}>
        {row1.map((action) => (
          <div
            key={action.label}
            onClick={(e) => handleActionClick(action, e)}
            className="action-card"
            style={{
              width: "110px",
              height: "110px",
              background: colors.cardBg,
              borderRadius: "6px",
              gap: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: colors.text,
              fontSize: "18px",
              fontWeight: 600,
              cursor: "pointer",
              // boxShadow: colors.shadow,
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = colors.cardHover)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = colors.cardBg)
            }
          >
            <img
              className="action-image"
              style={{ 
                width: "30px", 
                height: "30px",
                filter: isDark ? "none" : "invert(0.7)"
              }}
              src={action.icon}
              alt={action.label}
            />
            <p className="action-text" style={{ fontSize: "14px", textAlign: "center" }}>
              {action.label}
            </p>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="timeline-row" style={{ display: "flex", gap: "15px", position: "relative" }}>
        {row2.map((action) => (
          <div
            key={action.label}
            onClick={(e) => handleActionClick(action, e)}
            className="action-card"
            style={{
              width: "110px",
              height: "110px",
              background: colors.cardBg,
              borderRadius: "6px",
              gap: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: colors.text,
              fontSize: "18px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: colors.shadow,
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = colors.cardHover)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = colors.cardBg)
            }
          >
            <img
              className="action-image-small"
              style={{ 
                width: "30px", 
                height: "30px",
                filter: isDark ? "none" : "invert(0.7)"
              }}
              src={action.icon}
              alt={action.label}
            />
            <p className="action-text" style={{ fontSize: "14px", textAlign: "center" }}>
              {action.label}
            </p>
          </div>
        ))}

        {/* Dropdown menu */}
        {menuOpen && (
          <div 
            ref={menuRef} 
            className="dropdown-menu"
            style={{ 
              position: "absolute", 
              top: "100px", 
              left: "200px", 
              background: colors.cardBg, 
              borderRadius: "6px", 
              padding: "8px 0", 
              boxShadow: colors.shadow, 
              minWidth: "260px", 
              zIndex: 1000, 
            }}
          >
            <div
              className="dropdown-item"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", cursor: "pointer", color: colors.text }}
              onClick={() => handleMenuClick("Import to Audio track")}
            >
              <LuAudioLines style={{ filter: isDark ? "none" : "invert(1)" }} />
              <span>{t('importToAudioTrack')}</span>
            </div>
            <div
              className="dropdown-item"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", cursor: "pointer", color: colors.text }}
              onClick={() => handleMenuClick("Import to Voice & Mic track")}
            >
              <IoMicOutline style={{ filter: isDark ? "none" : "invert(1)" }} />
              <span>{t('importToVoiceMicTrack')}</span>
            </div>
            <div
              className="dropdown-item"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", cursor: "pointer", color: colors.text }}
              onClick={() => handleMenuClick("Open in sampler")}
            >
              <LuAudioLines style={{ filter: isDark ? "none" : "invert(1)" }} />
              <span>{t('openInSampler')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default TimelineActionBoxes;