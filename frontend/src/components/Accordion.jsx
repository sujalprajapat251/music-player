import React, { useState } from "react";

const AccordionItem = ({ question, answer, isOpen, onClick }) => (
  <div className="mb-2 bg-[#1F1F1F] rounded-md overflow-hidden">
    <button
      className="w-full flex justify-between items-center py-3 px-4 text-left text-white focus:outline-none hover:bg-[#2A2A2A] transition-colors duration-300"
      onClick={onClick}
    >
      <span className="font-medium">{question}</span>
      <span className={`ml-2 transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-180' : ''}`}>
        {/* Chevron Down SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
    <div 
      className={`transition-all duration-700 ease-in-out overflow-hidden ${
        isOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0'
      }`}
    >
      <div className="px-4 pb-4 pt-4 text-[#FFFFFF99] text-sm bg-[#1F1F1F] rounded-b transform transition-transform duration-700 ease-in-out">
        {answer}
      </div>
    </div>
  </div>
);

const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (idx) => {
    // Add a small delay for smoother animation
    if (openIndex === idx) {
      setOpenIndex(null);
    } else {
      setTimeout(() => {
        setOpenIndex(idx);
      }, 100);
    }
  };

  return (
    <div className="w-full space-y-3">
      {items.map((item, idx) => (
        <AccordionItem
          key={idx}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === idx}
          onClick={() => handleClick(idx)}
        />
      ))}
    </div>
  );
};

export default Accordion;
