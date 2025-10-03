import React, { useState } from "react";
import { motion } from "framer-motion";

// Reusable Tabs component
export default function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  const [tabWidths, setTabWidths] = useState([]);
  const tabRefs = React.useRef([]);

  React.useEffect(() => {
    const widths = tabRefs.current.map(ref => ref?.offsetWidth || 0);
    setTabWidths(widths);
  }, [tabs]);

  const getLeftPosition = () => {
    let position = 0;
    for (let i = 0; i < activeTab; i++) {
      position += (tabWidths[i] || 0) + 20; // 20 is the gap (gap-5 = 1.25rem = 20px)
    }
    return position;
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="relative flex rounded-full mx-auto justify-center gap-5 bg-gray-200 dark:bg-white p-2">
          <motion.div
            className="absolute top-2 bottom-2 left-2 rounded-full bg-[#8b5cf6] shadow-md"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            animate={{
              x: getLeftPosition(),
              width: tabWidths[activeTab] || 0,
            }}
          />
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              ref={el => tabRefs.current[idx] = el}
              onClick={() => setActiveTab(idx)}
              className={`relative flex items-center space-x-2 px-8 sm:px-10 md:px-12 py-2 rounded-full text-[12px] md:text-[16px] font-medium transition-colors duration-300 z-10
              ${
                activeTab === idx
                  ? "text-white"
                  : "text-black hover:text-gray-700"
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
