import React, { useState } from "react";
import { motion } from "framer-motion";

// Reusable Tabs component
export default function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <div className="w-full flex justify-center">
        <div className="relative flex rounded-full mx-auto justify-center gap-5 bg-gray-200 dark:bg-white p-1.5">
          <motion.div
            layout
            className="absolute top-1 bottom-1 rounded-full bg-[#8b5cf6] shadow-md"
            transition={{
              duration: 0.4,         // slightly slower for smoothness
              ease: [0.25, 0.1, 0.25, 1], // ease-in-out cubic bezier
            }}
            animate={{
              x: `${activeTab * 100}%`,
            }}
              
          />
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`relative flex items-center space-x-2 px-10 sm:px-10 md:px-12 py-2 rounded-full font-medium transition-all duration-300
              ${
                activeTab === idx
                  ? "bg-[#8b5cf6] text-white shadow-md"
                  : "text-black hover:text-black"
              }`}
            >
              {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-5">
        <div className="w-full py-6">{tabs[activeTab].content}</div>
      </div>
    </>
  );
}
