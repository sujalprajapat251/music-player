import React from 'react';
import editname from '../Images/editname.svg';
import deleteIcon from '../Images/delete.svg';
import copyIcon from '../Images/copy.svg';
import loopIcon from '../Images/loop.svg';
import plusIcon from '../Images/duplicate.svg';
import resizeIcon from '../Images/left-size.svg';

const SectionContextMenu = ({ isOpen, position, onClose, onAction }) => {
  if (!isOpen) return null;

  const handleItemClick = (action) => {
    if (onAction) {
      onAction(action);
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-[999]"
        onClick={handleClose}
      />

      {/* Menu Container */}
      <div
        className="absolute bg-[#1F1F1F] rounded-[4px] py-2 min-w-[200px] shadow-lg z-[1000] text-sm text-white"
        style={{
          top: position?.y || 0,
          left: position?.x || 0,
        }}
      >
        {/* Rename */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('rename')}
        >
          <img src={editname} className="w-4 h-4 flex items-center justify-center text-white" />
          <span className="flex-1">Rename</span>
        </div>

        {/* Delete */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('delete')}
        >
          <img src={deleteIcon} className="w-4 h-4 flex items-center justify-center text-white" />
          <span className="flex-1">Delete</span>
        </div>

        {/* Resize */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('resize')}
        >
          <img src={resizeIcon} className="w-4 h-4 flex items-center justify-center text-white" />
          <span className="flex-1">Resize</span>
        </div>

        {/* Copy */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('copy')}
        >
          <img src={copyIcon} className="w-4 h-4 flex items-center justify-center text-white" />
          <span className="flex-1">Copy</span>
        </div>

        {/* Loop */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('loop')}
        >
          <img src={loopIcon} className="w-4 h-4 flex items-center justify-center text-white" />
          <span className="flex-1">Loop</span>
        </div>

        {/* Create section after */}
        <div
          className="flex items-center px-4 py-2 cursor-pointer transition-colors duration-200 gap-3 hover:bg-gray-600"
          onClick={() => handleItemClick('createSectionAfter')}
        >
          <img src={plusIcon} className="w-4 h-4 flex items-center justify-center text-white" />
          <span className="flex-1">Create section after</span>
        </div>
      </div>
    </>
  );
};

export default SectionContextMenu;
