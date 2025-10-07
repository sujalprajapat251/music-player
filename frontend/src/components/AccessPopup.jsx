import React from "react";
import micAccessChrome from "../Images/mic_access_chrome.png";

const AccessPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      {/* Popup Box */}
      <div className="bg-primary-light dark:bg-[#272727] rounded-lg shadow-lg p-6 w-full max-w-md">
        {/* Title */}
        <h1 className="text-secondary-light dark:text-secondary-dark text-2xl md:text-3xl font-bold mb-4">
          Microphone Access
        </h1>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-6">
          Allow Example to access your microphone by clicking the icon in the address bar or
          editing your site settings.
        </p>

        {/* Image */}
        <div className="flex justify-center mb-6">
          <img
            src={micAccessChrome}
            alt="Microphone access popup"
            className="w-full max-w-sm rounded-md"
          />
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={() => { onClose && onClose(); }}
            className="bg-[#141414] dark:bg-[#ffffff] text-white dark:text-[#141414] font-medium py-2 px-10 rounded-md transition text-right"
          >
            OK
          </button>
        </div>
      </div>
    </div>

  );
};

export default AccessPopup;