import React, { useState } from 'react';
import { Search, Play, ChevronRight, Guitar, Drum, Keyboard, Disc2, Radio, Volume2 } from 'lucide-react';

const InstrumentPresets = () => {
  const [selectedCategory, setSelectedCategory] = useState('Pianos');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
  { name: 'My Preset Collection', icon: <Disc2 className="w-5 h-5" />, color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
  { name: 'Guitar', icon: <Guitar className="w-5 h-5" />, color: 'bg-gray-600' },
  { name: 'Bass & 808s', icon: <Volume2 className="w-5 h-5" />, color: 'bg-gray-600' },
  { name: 'Orchestral', icon: <Radio className="w-5 h-5" />, color: 'bg-gray-600' },
  { name: 'Keys', icon: <Keyboard className="w-5 h-5" />, color: 'bg-gray-600' },
  { name: 'Synths', icon: <Disc2 className="w-5 h-5" />, color: 'bg-gray-600' },
  { name: 'Drums & Machines', icon: <Drum className="w-5 h-5" />, color: 'bg-gray-600' }
  ];
  
  const instrumentCategories = [
    'Choir',
    'Organs', 
    'Other',
    'Pianos',
    'Pitched Percussion'
  ];

  const pianoPresets = [
    { name: 'Blue Carol', trial: false },
    { name: 'Clavinet', trial: true, trialType: 'Sound Starter trial' },
    { name: 'Clavinet Dirty Wah', trial: true, trialType: 'Sound Starter trial' },
    { name: 'Clavinet Phaser', trial: true, trialType: 'Sound Starter trial' },
    { name: 'Cut Sample Piano', trial: true, trialType: 'Music Production trial' },
    { name: 'Dark Upright Piano', trial: true, trialType: 'Sound Starter trial' },
    { name: 'Dusty Piano', trial: true, trialType: 'Sound Starter trial' },
    { name: 'Dusty Rhodes', trial: true, trialType: 'Sound Starter trial' },
    { name: 'Electric Grand', trial: true, trialType: 'Sound Starter trial' },
    { name: 'Electric Grand Dream', trial: true, trialType: 'Sound Starter trial' },
    { name: 'Grand Piano', trial: false },
    { name: "Grandma's Ocean Wave", trial: true, trialType: 'Sound Starter trial' }
  ];

  const filteredPresets = pianoPresets.filter(preset =>
    preset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
  <div className="bg-gray-900 text-white min-h-screen flex relative">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Instrument presets</h2>
        </div>
        {/* Categories */}
        <div className="p-2">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 px-3 py-2 mb-1 rounded-md cursor-pointer hover:bg-gray-700 transition-colors ${
                category.name === 'Keys' ? 'bg-gray-700' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                {category.icon}
              </div>
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Middle Panel - Instrument Categories */}
        <div className="w-64 bg-gray-850 border-r border-gray-700">
          <div className="p-4">
            {instrumentCategories.map((category, index) => (
              <div
                key={index}
                className={`px-3 py-2 mb-1 rounded-md cursor-pointer transition-colors ${
                  category === selectedCategory
                    ? 'bg-gray-700 text-white font-semibold border-l-4 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="text-sm">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Presets List */}
        <div className="flex-1 bg-gray-900">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div className="relative w-full max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-800 border border-gray-600 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Presets List */}
          <div className="p-2">
            {filteredPresets.map((preset, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-3 mb-1 rounded-md hover:bg-gray-800 cursor-pointer transition-colors group border-b border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {preset.name}
                    </div>
                    {preset.trial && (
                      <div className="text-gray-400 text-xs">
                        Start free {preset.trialType}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Close Button */}
      <button className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default InstrumentPresets;