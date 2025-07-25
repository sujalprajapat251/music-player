import React, { useEffect, useRef, useState } from 'react';
import { RxZoomIn, RxZoomOut } from "react-icons/rx";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import media1 from "../../Images/media1Icon.svg";
import media2 from "../../Images/media2Icon.svg";
import media3 from "../../Images/media3Icon.svg";
import media4 from "../../Images/media4Icon.svg";
import Strange from "../../Images/StrangeIcon.svg";
import darkStrange from "../../Images/darkStrangeIcon.svg";
import { IoIosArrowDown } from 'react-icons/io';
import { useTheme } from '../../Utils/ThemeContext';
import clears from "../../Images/clearIcons.svg";
import tempobutton from "../../Images/Tempobutton.svg";
import tick from "../../Images/Tick.svg";

const BottomToolbar = () => {
    const [volume, setVolume] = useState(50);
    const [volume1, setVolume1] = useState(50);
    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen1, setIsOpen1] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [selectedMode, setSelectedMode] = useState("");
    const [selectedKey, setSelectedKey] = useState("");
    const keyDropdownRef = useRef(null);
    const tempoDropdownRef = useRef(null);
    const menuDropdownRef = useRef(null);
    const [appliedSelection, setAppliedSelection] = useState(null);
    const [tempo, setTempo] = useState(120);
    const [appliedTempo, setAppliedTempo] = useState(0);
    const [selectedMenuitems, setSelectedMenuitems] = useState('Click');
    const [selectedCountIn, setSelectedCountIn] = useState('2 bars');


    useEffect(() => {
        const handleClickOutside1 = (event) => {
            if (tempoDropdownRef.current && !tempoDropdownRef.current.contains(event.target)) {
                setIsOpen1(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside1);
        return () => document.removeEventListener('mousedown', handleClickOutside1);
    }, []);

    const handleIncrement = () => {
        setTempo(prev => Math.min(prev + 1, 200)); // Max 200 BPM
    };

    const handleDecrement = () => {
        setTempo(prev => Math.max(prev - 1, 60)); // Min 60 BPM
    };



    const handleApply2 = () => {
        setAppliedTempo(tempo);
        setIsOpen1(false);
    };

    const handleTempoInputChange = (e) => {
        const value = parseInt(e.target.value) || 60;
        setTempo(Math.min(Math.max(value, 60), 200));
    };


    const keys = ["C", "D", "E", "F", "G", "A", "B"];
    const sharpKeys = ["Dᵇ", "Eᵇ"];
    const sharpKeys2 = ["F#", "Aᵇ", "Bᵇ"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (keyDropdownRef.current && !keyDropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeySelect = (key) => {
        setSelectedKey(key);
    };

    const handleApply = () => {
        if (selectedKey) {
            setAppliedSelection({
                key: selectedKey
                // mode: selectedMode
            });
            setIsOpen(false); // Close the dropdown after applying
        }
    };

    const handleClear = () => {
        setSelectedKey(null);
        setSelectedMode(""); // or whatever your default is
        setAppliedSelection(null); // Clear the applied selection too
    };


    const menu = [
        { id: 'Click', label: 'Click' },
        { id: 'Tick', label: 'Tick' },
        { id: 'Hihat', label: 'Hihat' },
        { id: 'Clave', label: 'Clave' }
    ];

    
    const menu1 = [
        { id: '2 bars', label: '2 bars' },
        { id: '1 bar', label: '1 bar' },
        { id: 'Off', label: 'Off' }
    ];

    useEffect(() => {
        const handleClickOutside2 = (event) => {
            if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
                setIsOpen2(false); // or whatever state controls your menu dropdown
            }
        };
        document.addEventListener('mousedown', handleClickOutside2);
        return () => document.removeEventListener('mousedown', handleClickOutside2);
    }, []);

    const handleMenuItemSelect = (qualityId, qualityLabel) => {
        setSelectedMenuitems(qualityLabel);
        setIsOpen2(false)
    };
    const handleCountInSelect = (qualityId, qualityLabel) => {
        setSelectedCountIn(qualityLabel);
        setIsOpen2(false)
    };

    const { isDark } = useTheme();

    return (
        <>
            <div className="flex justify-center md600:justify-between bg-primary-light dark:bg-primary-dark border-t border-[#1414141A] dark:border-[#FFFFFF1A] px-2 py-2 sm:px-3 sm:py-1 md:px-5 md:py-2 xl:px-7">
                <div className='flex gap-2 sm:gap-3 md:gap-3 lg:gap-5 2xl:gap-7 items-center'>
                    <HiOutlineSpeakerWave className='text-secondary-light dark:text-secondary-dark text-[16px] md:text-[20px] lg:text-[24px]' />
                    <div className=" md:w-32 lg:w-40 2xl:w-48  pb-1 hidden md:block">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                            className="w-full h-1 lg:h-2 bg-[#2B2B2B]  rounded-lg appearance-none cursor-pointer slider outline-none focus:outline-none"
                            style={{
                                background: isDark
                                    ? `linear-gradient(to right, #ffffff 0%, #ffffff ${volume}%, #2B2B2B ${volume}%, #2B2B2B 100%)`
                                    : `linear-gradient(to right, #141414 0%, #141414 ${volume}%, #1414141A ${volume}%, #1414141A 100%)`
                            }}
                        />
                    </div>
                    <p className="text-secondary-light dark:text-secondary-dark sm:text-[10px] md:text-[16px] lg:text-[18px] self-center hidden sm:block">00:00.0</p>
                    <div className="flex gap-1 sm:gap-2 items-center rounded-2xl bg-[#1414141A] dark:bg-[#1F1F1F] py-[1px] px-2 md:py-[4px] md:px-2 lg:py-[6px] lg:px-3">
                        <p className="rounded-full p-[3px] sm:p-[3px] lg:p-2 bg-[#FF6767]"></p>
                        <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px]">Rec</p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 lg:gap-3">
                        <div className="items-center rounded-full bg-[#1414141A] dark:bg-[#1F1F1F] p-1 lg:p-2">
                            <img src={media1} alt="" className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[16px] lg:h-[16px]" />
                        </div>
                        <div className="items-center rounded-full bg-[#1414141A] dark:bg-[#1F1F1F] p-1 lg:p-2">
                            <img src={media2} alt="" className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[16px] lg:h-[16px]" />
                        </div>
                        <div className="items-center rounded-full bg-[#1414141A] dark:bg-[#1F1F1F] p-1 lg:p-2">
                            <img src={media3} alt="" className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[16px] lg:h-[16px]" />
                        </div>
                        <div className="items-center rounded-full bg-[#1414141A] dark:bg-[#1F1F1F] p-1 lg:p-2">
                            <img src={media4} alt="" className="w-[10px] h-[10px] md:w-[12px] md:h-[12px] lg:w-[16px] lg:h-[16px]" />
                        </div>
                    </div>
                    {/* <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">Key <span className='text-secondary-light dark:text-secondary-dark'>-</span></p> */}
                    <div className="flex items-center justify-center ">
                        <div className="relative" ref={keyDropdownRef}>
                            {/* Trigger Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="cursor-pointer outline-none focus:outline-none"
                            >
                                <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">
                                    Key <span className="text-secondary-light dark:text-secondary-dark">
                                        {appliedSelection ? `${appliedSelection.key}` : '-'}
                                    </span>
                                </p>
                            </button>

                            {/* Dropdown */}
                            {isOpen && (
                                <div className="absolute -top-[150px] left-[-180px] w-76 p-3 md600:-top-[200px] md600:left-[-140px] md600:w-76 md600:p-4 lg:-top-[250px] lg:left-[-170px] lg:w-120 bg-[#1F1F1F] rounded-lg shadow-lg  lg:p-5 z-50">
                                    {/* Mode Selection */}
                                    <div className="flex gap-1 mb-2  md600:gap-2 md600:mb-3 lg:gap-3 lg:mb-4">
                                        <button
                                            onClick={() => setSelectedMode("Major")}
                                            className={`px-3 text-[8px] md600:px-4 py-1 md600:text-[10px] lg:px-5 rounded-full lg:text-[12px] border border-[#FFFFFF1A] transition-colors ${selectedMode === "Major"
                                                ? "bg-white text-black"
                                                : "bg-[#1F1F1F] text-gray-300 hover:bg-gray-600"
                                                }`}
                                        >
                                            Major
                                        </button>
                                        <button
                                            onClick={() => setSelectedMode("Minor")}
                                            className={`px-3 text-[8px] md600:px-4 py-1 md600:text-[10px] lg:px-5 rounded-full lg:text-[12px] border border-[#FFFFFF1A] transition-colors ${selectedMode === "Minor"
                                                ? "bg-white text-black"
                                                : "bg-[#1F1F1F] text-gray-300 hover:bg-gray-600"
                                                }`}
                                        >
                                            Minor
                                        </button>
                                    </div>

                                    {/* Sharp Keys Row */}
                                    <div className="flex mx-auto px-5 mb-1 md600:px-6 md600:mb-2 lg:px-8 lg:mb-3 justify-between">
                                        <div className='flex gap-1 md600:gap-2'>
                                            {sharpKeys.map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() => handleKeySelect(key)}
                                                    className={`w-6 h-6 text-[10px] md600:w-8 md600:h-8 md600:text-[12px] lg:w-10 lg:h-10 rounded lg:text-[14px] border border-[#FFFFFF1A] transition-colors ${selectedKey === key
                                                        ? "bg-white text-black "
                                                        : "bg-[#1F1F1F] text-white hover:bg-gray-600"
                                                        }`}
                                                >
                                                    {key}
                                                </button>
                                            ))}
                                        </div>
                                        <div className='flex gap-1 md600:gap-2'>
                                            {sharpKeys2.map((key) => (
                                                <button
                                                    key={key}
                                                    onClick={() => handleKeySelect(key)}
                                                    className={`w-6 h-6 text-[10px] md600:w-8 md600:h-8 md600:text-[12px] lg:w-10 lg:h-10 rounded lg:text-[14px] border border-[#FFFFFF1A] transition-colors ${selectedKey === key
                                                        ? "bg-white text-black"
                                                        : "bg-[#1F1F1F] text-white hover:bg-gray-600"
                                                        }`}
                                                >
                                                    {key}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Natural Keys Row */}
                                    <div className="flex gap-1 mb-3 md600:gap-2 md600:mb-4 lg:mb-6 justify-center">
                                        {keys.map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => handleKeySelect(key)}
                                                className={`w-6 h-6 text-[10px] md600:w-8 md600:h-8 md600:text-[12px] lg:w-10 lg:h-10 rounded lg:text-[14px] border border-[#FFFFFF1A] transition-colors ${selectedKey === key
                                                    ? "bg-white text-black"
                                                    : "bg-[#1F1F1F] text-white hover:bg-gray-600"
                                                    }`}
                                            >
                                                {key}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={handleClear}
                                            className="flex items-center gap-1 md600:gap-2 lg:gap-3 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <img src={clears} alt="" className='w-3 h-3 md600:w-4 md600:h-4' />
                                            <p className="text-[10px] md600:text-[10px] lg:text-[12px]">Clear</p>
                                        </button>

                                        <button
                                            onClick={handleApply}
                                            className=" text-[10px] px-4 py-1 md600:text-[10px] lg:px-6  bg-white text-black lg:text-[12px] rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">Tempo <span className='text-secondary-light dark:text-secondary-dark'>120</span></p> */}
                    <div className="flex items-center justify-center">
                        <div className="relative" ref={tempoDropdownRef}>
                            {/* Trigger Button */}
                            <button
                                onClick={() => setIsOpen1(!isOpen1)}
                                className="cursor-pointer outline-none focus:outline-none"
                            >
                                <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">
                                    Tempo: <span className="text-secondary-light dark:text-secondary-dark">{appliedTempo}</span>
                                </p>
                            </button>

                            {/* Dropdown */}
                            {isOpen1 && (
                                <div className="absolute -top-[210px] left-[0px] md600:-top-[270px] md600:left-[25px] lg:-top-[320px] lg:left-[35px] transform -translate-x-1/2 w-40 md600:w-52 lg:w-64 bg-[#1F1F1F] rounded-2xl shadow-2xl p-3 md600:p-4 lg:p-6 z-50">
                                    {/* Title */}
                                    <h3 className="text-white text-center text-[10px] md600:text-[12px] lg:text-[14px] font-medium mb-2 md600:mb-3">
                                        Tempo (BPM)
                                    </h3>

                                    {/* Circular Metronome Button */}
                                    <div className="flex justify-center mb-2 md600:mb-3">
                                        <button
                                            onClick={handleIncrement}
                                        >
                                            {/* Metronome Icon */}
                                            <img src={tempobutton} alt="" className=' w-10 h-10 md600:w-14 md600:h-14 lg:w-16 lg:h-16' />
                                        </button>
                                    </div>

                                    {/* Instructions */}
                                    <p className="text-white text-center text-[10px] md600:text-[12px] mb-2 md600:mb-3 leading-relaxed">
                                        Click above or tap T <br />
                                        repeatedly to set tempo
                                    </p>

                                    {/* Tempo Controls */}
                                    <div className="flex items-center justify-center gap-2 md600:gap-3 lg:gap-4 mb-3 md600:mb-4 lg:mb-6 my-auto">
                                        {/* Decrement Button */}
                                        <button
                                            onClick={handleDecrement}
                                            className="w-4 h-4 md600:w-6 md600:h-6 lg:w-8 lg:h-8 text-[10px] md600:text-[12px] bg-[#1F1F1F]  flex items-center justify-center border border-[#FFFFFF1A] rounded-full text-white hover:bg-gray-500 transition-colors font-bold"
                                        >
                                            −
                                        </button>

                                        {/* Tempo Display/Input */}
                                        <div className="bg-transparent">
                                            <input
                                                type="text"
                                                value={tempo}
                                                onChange={handleTempoInputChange}
                                                min="60"
                                                max="200"
                                                className="bg-[#FFFFFF0F] text-white text-[10px] md600:text-[12px] lg:text-[14px] font-light text-center rounded-lg w-12 md600:w-16 py-1 md600:py-2 outline-none border-none"
                                            />
                                        </div>

                                        {/* Increment Button */}
                                        <button
                                            onClick={handleIncrement}
                                            className="w-4 h-4 md600:w-6 md600:h-6 lg:w-8 lg:h-8 text-[10px] md600:text-[12px] bg-[#1F1F1F] border border-[#FFFFFF1A] rounded-full flex items-center justify-center text-white hover:bg-gray-500 transition-colors font-bold"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Apply Button */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleApply2}
                                            className="px-4 py-1 md600:px-6 md600:py-2 lg:px-8 bg-white text-black text-[10px] md600:text-[12px] rounded-full hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="" onClick={() => { setIsIconDropdownOpen(!isIconDropdownOpen); setIsOpen2(!isOpen2) }}>
                        <div className="relative flex gap-2 md:gap-3" ref={menuDropdownRef}>
                            <div className="items-center rounded-full bg-primary-dark dark:bg-primary-light p-[2px] sm:p-1 md:p-2" >
                                <img src={isDark ? darkStrange : Strange} className="w-[9px] h-[9px] sm:w-[10px] sm:h-[10px] md:w-[12px] md:h-[14px] lg:w-[14px] lg:h-[16px]" />
                            </div>
                            <IoIosArrowDown className={`text-[#14141499] dark:text-[#FFFFFF99] transition-transform my-auto  duration-300 ${isIconDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                            />

                            {isOpen2 && (
                                <div className="absolute -top-[310px] left-[-40px] md600:-top-[380px] md600:left-[25px] lg:-top-[410px] lg:left-[35px] transform -translate-x-1/2 w-40 md600:w-44 lg:w-56 bg-[#1F1F1F] rounded-lg shadow-2xl p-1 z-50">
                                    <div>
                                        {menu.map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 text-white cursor-pointer hover:bg-[#585858]"
                                                onClick={() => handleMenuItemSelect(option.id, option.label)}
                                            >
                                                <div className="flex items-center gap-2 md600:gap-3">
                                                    {/* Show tick only for selected option */}
                                                    <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                        {selectedMenuitems === option.label && (
                                                            <img src={tick} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>
                                                            {option.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="py-3 px-4 border-t border-b border-[#FFFFFF1A] my-2">
                                        <p className='text-[10px] text-[#FFFFFF99]'>Volume</p>
                                        <div className=" md:w-32 lg:w-40 2xl:w-48  py-1 ">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={volume1}
                                                onChange={(e) => setVolume1(e.target.value)}
                                                className="w-full h-1 lg:h-2 bg-[#2B2B2B]  rounded-lg appearance-none cursor-pointer slider outline-none focus:outline-none"
                                                style={{
                                                    background: isDark
                                                        ? `linear-gradient(to right, #ffffff 0%, #ffffff ${volume1}%, #2B2B2B ${volume1}%, #2B2B2B 100%)`
                                                        : `linear-gradient(to right, #141414 0%, #141414 ${volume1}%, #1414141A ${volume1}%, #1414141A 100%)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className=''>
                                        <p className='text-[10px] text-[#FFFFFF99] py-3 px-4'>Count in</p>
                                        <div>
                                            {menu1.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 text-white cursor-pointer hover:bg-[#585858]"
                                                    onClick={() => handleCountInSelect(option.id, option.label)}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected option */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedCountIn === option.label && (
                                                                <img src={tick} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='flex sm:gap-2 md:gap-3 lg:gap-5 2xl:gap-7 items-center '>
                    <RxZoomIn className='text-[#14141499] dark:text-[#FFFFFF99] cursor-pointer  md:text-[20px] lg:text-[24px] hidden md600:block' />
                    <RxZoomOut className='text-[#14141499] dark:text-[#FFFFFF99] cursor-pointer  md:text-[20px] lg:text-[24px] hidden md600:block' />
                </div>


                <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 15px;
                    width: 15px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
                
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }
            `}</style>
            </div>
        </>
    )
}

export default BottomToolbar


