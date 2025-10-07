import React, { useState } from "react";
import { motion } from "framer-motion";

// Reusable Tabs component
export default function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  const [tabWidths, setTabWidths] = useState([]);
  const tabRefs = React.useRef([]);

  React.useEffect(() => {
    const measure = () => {
      const widths = tabRefs.current.map(ref => ref?.offsetWidth || 0);
      setTabWidths(widths);
    };

    // measure initially and on resize to keep the active highlight aligned
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
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
        <div className="relative flex rounded-full mx-auto justify-center gap-5 bg-gray-200 dark:bg-white p-1 sm:p-1 md:p-2">
          <motion.div
            // Use inset positioning so the highlight scales properly across breakpoints
            className="absolute top-2 inset-y-1 bottom-2 left-2 rounded-full bg-[#141414] shadow-md sm:inset-y-1 sm:left-1 md:inset-y-1 md:left-2"
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
              className={`relative flex items-center space-x-2 px-6 sm:px-4 md:px-12 py-2 rounded-full text-[12px] md:text-[16px] font-medium transition-colors duration-300 z-10
              ${
                activeTab === idx
                  ? "text-white"
                  : "text-black hover:text-gray-700"
              }`}
            >
              {tab.icon && <span className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <div className="w-full py-4">{tabs[activeTab].content}</div>
      </div>
    </>
  );
}