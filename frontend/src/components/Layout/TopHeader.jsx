import React, { useState } from 'react';
import { PiArrowBendUpLeftBold, PiArrowBendUpRightBold } from "react-icons/pi";
import { GoSun } from "react-icons/go";
import savedicon from "../../Images/savedIcon.svg";
import { IoMoonOutline } from 'react-icons/io5';
import { HiDownload } from "react-icons/hi";
import subscription from "../../Images/subscriptionIcon.svg";
import { IoIosShareAlt } from "react-icons/io";
import { RxExit } from "react-icons/rx";

const TopHeader = () => {

    const [isDark, setIsDark] = useState(true);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };


    return (
        <>
            <div className="flex justify-between bg-[#141414] border-b border-[#FFFFFF1A] px-2 py-2 sm:px-3 sm:py-1 md:px-5 md:py-2 xl:px-7">
                <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-5 xl:gap-7 items-center">
                    <p className="text-white text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px]">LOGO</p>
                    <p className="text-white text-[10px] md:text-[12px] lg:text-[14px]">File</p>
                    <p className="text-white text-[10px] md:text-[12px] lg:text-[14px]">Edit</p>
                    <p className="text-white text-[10px] md:text-[12px] lg:text-[14px]">Setting</p>
                    <PiArrowBendUpLeftBold className="text-[#5a5a5a] md:text-[16px] lg:text-[20px] xl:text-[26px] hidden md600:block" />
                    <PiArrowBendUpRightBold className="text-[#5a5a5a] md:text-[16px] lg:text-[20px] xl:text-[26px] hidden md600:block" />
                </div>


                <div className="flex gap-2 md:gap-3 lg:gap-5 xl:gap-7 items-center">
                    <div className="flex gap-2 items-center">
                        <img src={savedicon} alt=""  className='h-[16px] md:h-full'/>
                        <p className="text-[#357935] text-[12px] hidden md600:block">Saved!</p>
                    </div>
                    <p className='text-white text-[12px] md:text-[14px]'>Untitled_song</p>
                </div>


                <div className="flex gap-2 md:gap-3 lg:gap-5 xl:gap-7">
                    <button
                        onClick={toggleTheme}
                        className="relative w-[60px] h-[30px] rounded-full p-1 transition-colors duration-300 outline-none focus:outline-none d_customborder hidden md:block"
                    >
                        {/* Background slider */}
                        <div
                            className={`absolute top-0 left-0 w-[26px] h-[28px] bg-[#1F1F1F] rounded-full transition-transform duration-300 ${isDark ? 'translate-x-8' : 'translate-x-0'
                                }`}
                        />

                        {/* Sun icon */}
                        <div
                            className={`absolute top-0 left-0 w-[26px] h-[28px] flex items-center justify-center transition-opacity duration-300 ${isDark ? 'opacity-50' : 'opacity-100'
                                }`}
                        >
                            <GoSun className={`${isDark ? 'text-[#FFFFFF99]' : "text-[#FFFFFF]"} text-[16px]`} />

                        </div>

                        {/* Moon icon */}
                        <div
                            className={`absolute top-0 right-0 w-[26px] h-[28px] flex items-center justify-center transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-50'
                                }`}
                        >
                            <IoMoonOutline className={`${isDark ? 'text-[#FFFFFF]' : "text-[#FFFFFF99]"} text-[16px]`} />
                        </div>
                    </button>
                    <div className="flex xl:gap-2 md:p-1 lg:px-2 xl:px-3 lg:py-1 rounded-full d_customborder">
                        <HiDownload className="text-white xl:text-[18px]" />
                        <p className="text-white text-[12px] hidden xl:block"> Export</p>
                    </div>

                    <div className="flex xl:gap-2 bg-white justify-center  items-center md:p-1 lg:px-2 xl:px-3 lg:py-1 rounded-full ">
                        <img src={subscription} alt="" className='h-[18px] w-[18px]' />
                        <p className="text-black text-[12px]  font-semibold hidden xl:block">Upgrade Now</p>
                    </div>

                    <div className="flex md:gap-2  md:px-2 xl:px-3 md:py-1 rounded-full d_customborder bg-[#1F1F1F]">
                        <IoIosShareAlt className="text-white xl:text-[18px]" />
                        <p className="text-white text-[12px] hidden md:block">Share</p>
                    </div>

                    <div className="text-center hidden xl:block">
                        <RxExit className='text-[#FFFFFF99] xl:text-[14px]'/>
                        <p className="text-white text-[10px]">Exit</p>
                    </div>
                </div>
            </div>
        </>
    )
}


export default TopHeader