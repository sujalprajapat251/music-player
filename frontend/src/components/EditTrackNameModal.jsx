import React, { useState } from "react";

const EditTrackNameModal = ({ isOpen, onClose, onSave }) => {
  const [regionName, setRegionName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#1E1E1E] rounded-lg w-[400px] shadow-lg">

        <div className="p-6">
          <h2 className="text-white text-lg font-semibold mb-4">
            Edit region name
          </h2>

          <input
            type="text"
            placeholder=""
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
            className="w-full bg-transparent border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-[14px] rounded-full border border-gray-500 text-white hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(regionName);
              onClose();
            }}
            className="px-8 py-2 text-[14px] rounded-full bg-purple-500 text-black font-semibold hover:bg-purple-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTrackNameModal;