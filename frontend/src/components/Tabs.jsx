import React, { useState } from "react";

// Reusable Tabs component
export default function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <div className="w-full flex justify-center">
        <div className="flex rounded-full mx-auto justify-center gap-5 bg-[#8b5cf6]">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center space-x-2 px-12 sm:px-5 md:px-12 py-2 rounded-full font-medium transition-all duration-300
              ${
                activeTab === idx
                  ? "bg-white text-black shadow-md"
                  : "text-white hover:text-black"
              }`}
            >
              {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-5">
        <div className="w-full p-6">{tabs[activeTab].content}</div>
      </div>
    </>
  );
}
