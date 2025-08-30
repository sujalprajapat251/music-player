import React from "react";
import timeIcon1 from '../Images/timeIcon1.svg'
import timeIcon2 from '../Images/timeIcon2.svg'
import timeIcon3 from '../Images/timeIcon3.svg'
import timeIcon4 from '../Images/timeIcon4.svg'
import timeIcon5 from '../Images/timeIcon5.svg'
import timeIcon6 from '../Images/timeIcon5.svg'

const actions = [
  { label: "Browse loops", icon: timeIcon1 },
  { label: "Patterns Beatmaker", icon: timeIcon2},
  { label: "Play the synth", icon: timeIcon3 },
  { label: "Add new track", icon: timeIcon4 },
  { label: "Import file", icon: timeIcon5 },
  { label: "Invite Friend", icon: timeIcon6}
];

const row1 = actions.slice(0, 3);
const row2 = actions.slice(3);

const TimelineActionBoxes = ({ onAction }) => (
  <div style={{ display: "flex", flexDirection: "column", justifyContent:"center", alignItems:"center", minHeight: "800px", width:"calc(100vw - 300px)", gap: "15px"}}>
    <div style={{ display: "flex", gap: "15px" }}>
      {row1.map((action) => (
        <div key={action.label} onClick={() => onAction && onAction(action.label)}
          style={{ width: "130px", height: "120px", background: "#232323", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 12px #0004", transition: "background 0.2s",}}
          onMouseOver={e => e.currentTarget.style.background = "#333"}
          onMouseOut={e => e.currentTarget.style.background = "#232323"}
        >
          <img style={{width:"40px", height:"40px"}} src={action.icon} alt={action.label} className="mb-2" />
          <p style={{fontSize:"14px", textAlign:"center"}}>{action.label}</p>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: "15px", }}>
      {row2.map((action) => (
        <div key={action.label} onClick={() => onAction && onAction(action.label)}
          style={{ width: "130px", height: "120px", background: "#232323", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 12px #0004", transition: "background 0.2s",}}
          onMouseOver={e => e.currentTarget.style.background = "#333"}
          onMouseOut={e => e.currentTarget.style.background = "#232323"}
        >
          <img style={{width:"30px", height:"30px"}} src={action.icon} alt={action.label} className="mb-2" />
          <p style={{fontSize:"14px", textAlign:"center"}}>{action.label}</p>
        </div>
      ))}
    </div>
  </div>
);

export default TimelineActionBoxes;