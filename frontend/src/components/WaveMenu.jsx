import React from 'react'

const WaveMenu = ({ isOpen, position, onClose, onAction }) => {
  if (!isOpen) return null;

  const menuStyle = {
    position: 'absolute',
    top: position?.y || 0,
    left: position?.x || 0,
    backgroundColor: '#2a2a2a',
    border: '1px solid #404040',
    borderRadius: '6px',
    padding: '8px 0',
    minWidth: '220px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    color: '#ffffff'
  };

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    gap: '12px'
  };

  const menuItemHoverStyle = {
    backgroundColor: '#404040'
  };

  const separatorStyle = {
    height: '1px',
    backgroundColor: '#404040',
    margin: '4px 0'
  };

  const iconStyle = {
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff'
  };

  const textStyle = {
    flex: 1
  };

  const shortcutStyle = {
    color: '#888888',
    fontSize: '12px'
  };

  const arrowStyle = {
    color: '#888888',
    fontSize: '12px'
  };

  const handleItemClick = (action) => {
    if (onAction) {
      onAction(action);
    }
    onClose();
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />
      <div style={menuStyle}>
        {/* Section 1: Basic Editing Operations */}
        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('cut')}
        >
          <div style={iconStyle}>✂️</div>
          <span style={textStyle}>Cut</span>
          <span style={shortcutStyle}>Ctrl+X</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('copy')}
        >
          <div style={iconStyle}>📄</div>
          <span style={textStyle}>Copy</span>
          <span style={shortcutStyle}>Ctrl+C</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('paste')}
        >
          <div style={iconStyle}>📋</div>
          <span style={textStyle}>Paste</span>
          <span style={shortcutStyle}>Ctrl+V</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('delete')}
        >
          <div style={iconStyle}>🗑️</div>
          <span style={textStyle}>Delete</span>
          <span style={shortcutStyle}>Backspace</span>
        </div>

        <div style={separatorStyle}></div>

        {/* Section 2: Region/Track Management */}
        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('editName')}
        >
          <div style={iconStyle}>✏️</div>
          <span style={textStyle}>Edit name</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('splitRegion')}
        >
          <div style={iconStyle}>➕</div>
          <span style={textStyle}>Split Region</span>
          <span style={shortcutStyle}>Ctrl+E</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('muteRegion')}
        >
          <div style={iconStyle}>🔇</div>
          <span style={textStyle}>Mute Region</span>
          <span style={shortcutStyle}>Ctrl+M</span>
        </div>

        <div style={separatorStyle}></div>

        {/* Section 3: Audio Processing and Transformation */}
        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('changePitch')}
        >
          <div style={iconStyle}>🎵</div>
          <span style={textStyle}>Change pitch</span>
          <span style={arrowStyle}>▶</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('vocalCleanup')}
        >
          <div style={iconStyle}>🎤</div>
          <span style={textStyle}>Vocal Cleanup</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('vocalTuner')}
        >
          <div style={iconStyle}>🎵</div>
          <span style={textStyle}>Vocal Tuner</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('voiceTransform')}
        >
          <div style={iconStyle}>🎤</div>
          <span style={textStyle}>Voice Transform</span>
          <span style={arrowStyle}>▶</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('reverse')}
        >
          <div style={iconStyle}>🔄</div>
          <span style={textStyle}>Reverse</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('effects')}
        >
          <div style={iconStyle}>🎛️</div>
          <span style={textStyle}>Effects</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('matchProjectKey')}
        >
          <div style={iconStyle}>🎹</div>
          <span style={textStyle}>Match Project Key</span>
        </div>

        <div style={separatorStyle}></div>

        {/* Section 4: Library and Sampler Integration */}
        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('addToLoopLibrary')}
        >
          <div style={iconStyle}>🎶</div>
          <span style={textStyle}>Add to loop Library..</span>
        </div>

        <div 
          style={menuItemStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          onClick={() => handleItemClick('openInSampler')}
        >
          <div style={iconStyle}>🎹</div>
          <span style={textStyle}>Open in sampler</span>
        </div>
      </div>
    </>
  )
}

export default WaveMenu