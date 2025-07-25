import React, { useState } from 'react';

const gridSizes = [
  'Automatic grid size',
  '1/1',
  '1/2',
  '1/2 dotted',
  '1/4',
  '1/8',
  '1/16',
  '1/32',
  '1/8 triplet',
  '1/16 triplet',
];

const timeSignatures = [
  '3/4',
  '4/4',
  '5/4',
  '6/4',
  '7/4',
  '6/8',
  '12/8',
];

const rulers = ['Beats', 'Time'];

const sectionLabelStyle = {
  color: '#aaa',
  fontSize: '12px',
  margin: '16px 0 4px 0',
  paddingLeft: '16px',
};

const optionStyle = (selected) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  background: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '15px',
});

const checkmarkStyle = {
  marginRight: '8px',
  color: '#fff',
  fontSize: '16px',
  width: '20px',
  display: 'inline-block',
};

const containerStyle = {
  background: '#181818',
  borderRadius: '8px',
  width: '220px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
  padding: '8px 0',
  fontFamily: 'inherit',
};

const GridSetting = () => {
  const [selectedGrid, setSelectedGrid] = useState('Automatic grid size');
  const [selectedTime, setSelectedTime] = useState('4/4');
  const [selectedRuler, setSelectedRuler] = useState('Beats');

  return (
    <div style={containerStyle}>
      <div style={sectionLabelStyle}>Grid size:</div>
      {gridSizes.map((size) => (
        <div
          key={size}
          style={optionStyle(selectedGrid === size)}
          onClick={() => setSelectedGrid(size)}
        >
          <span style={checkmarkStyle}>{selectedGrid === size ? '✓' : ''}</span>
          {size}
        </div>
      ))}
      <div style={{...sectionLabelStyle, marginTop: '20px'}}>Time signature:</div>
      {timeSignatures.map((sig) => (
        <div
          key={sig}
          style={optionStyle(selectedTime === sig)}
          onClick={() => setSelectedTime(sig)}
        >
          <span style={checkmarkStyle}>{selectedTime === sig ? '✓' : ''}</span>
          {sig}
        </div>
      ))}
      <div style={{...sectionLabelStyle, marginTop: '20px'}}>Ruler:</div>
      {rulers.map((ruler) => (
        <div
          key={ruler}
          style={optionStyle(selectedRuler === ruler)}
          onClick={() => setSelectedRuler(ruler)}
        >
          <span style={checkmarkStyle}>{selectedRuler === ruler ? '✓' : ''}</span>
          {ruler}
        </div>
      ))}
    </div>
  );
};

export default GridSetting;