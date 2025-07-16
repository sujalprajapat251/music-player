import React, { useState } from "react";

const AccordionItem = ({ question, answer, isOpen, onClick }) => (
  <div className="mb-2 bg-[#1F1F1F] rounded-md">
    <button
      className="w-full flex justify-between items-center py-3 px-4 text-left text-white focus:outline-none"
      onClick={onClick}
    >
      <span>{question}</span>
      <span className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
        {/* Chevron Down SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
    {isOpen && (
      <div className="px-4 pb-4 text-[#FFFFFF99] text-sm bg-[#1F1F1F] rounded-b">
        {answer}
      </div>
    )}
  </div>
);

const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full">
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
