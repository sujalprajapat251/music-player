import React, { useEffect, useState } from 'react';
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

const BottomToolbar = () => {
    const [volume, setVolume] = useState(50);
    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);


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
                    <p className="sm:text-[8px] lg:text-[12px] text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">Key <span className='text-secondary-light dark:text-secondary-dark'>-</span></p>
                    <p className="sm:text-[8px] lg:text-[12px text-[#14141499] dark:text-[#FFFFFF99] hidden sm:block">Tempo <span className='text-secondary-light dark:text-secondary-dark'>120</span></p>
                    <div className="flex gap-2 md:gap-3 ">
                        <div className="items-center rounded-full bg-primary-dark dark:bg-primary-light p-[2px] sm:p-1 md:p-2">
                            <img src={isDark ? darkStrange : Strange} className="w-[9px] h-[9px] sm:w-[10px] sm:h-[10px] md:w-[12px] md:h-[14px] lg:w-[14px] lg:h-[16px]" />
                        </div>
                        <IoIosArrowDown className={`text-[#14141499] dark:text-[#FFFFFF99] transition-transform my-auto  duration-300 ${isIconDropdownOpen ? 'rotate-180' : 'rotate-0'}`} onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                        />
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


