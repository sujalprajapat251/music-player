import React from "react";
import micAccessChrome from "../Images/mic_access_chrome.png";

const AccessPopup = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
  {/* Popup Box */}
  <div className="bg-primary-light dark:bg-primary-dark rounded-lg shadow-lg p-6 w-full max-w-md">
    {/* Title */}
    <h1 className="text-secondary-light dark:text-secondary-dark text-2xl md:text-3xl font-bold mb-4">
      Microphone Access
    </h1>

    {/* Description */}
    <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-6">
      Allow <span className="font-semibold">[Web Name]</span> to access your
      microphone by clicking the icon in the address bar or editing your site
      settings.
    </p>

    {/* Image */}
    <div className="flex justify-center mb-6">
      <img
        src={micAccessChrome}
        alt="Microphone access popup"
        className="w-full max-w-sm rounded-md"
      />
    </div>

    {/* Footer Text */}
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Still having problems?{" "}
      <a
        href="#"
        className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline"
      >
        Follow our detailed microphone access instructions
      </a>
    </p>

    <hr className="h-px my-4 bg-gray-300 dark:bg-gray-700 border-0" />

    {/* Button */}
    <div className="flex justify-end">
      <button
        onClick={() => { onClose && onClose(); }}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-10 rounded-full transition text-right"
      >
        OK
      </button>
    </div>
  </div>
</div>

    );
};

export default AccessPopup;