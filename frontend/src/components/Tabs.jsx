import React, { useState } from "react";

// Reusable Tabs component
export default function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <div className="w-full flex justify-center">
        <div className="flex bg-[#232323] rounded-full p-1 w-full max-w-4xl justify-center gap-12">
          {tabs.map((tab, idx) => (
            <button key={tab.label} className={` font-medium transition-colors duration-200 focus:outline-none text-xl ${ activeTab === idx ? " text-[#9b7ae7] border-b-[#9b7ae7] border-b-[1px]" : "bg-transparent text-white" }`} onClick={() => setActiveTab(idx)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-5">
        <div className="w-full p-6">
          {tabs[activeTab].content}
        </div>
      </div>
    </>
  );
} 