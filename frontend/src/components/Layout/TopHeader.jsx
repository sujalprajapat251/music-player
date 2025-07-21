import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
      document.documentElement.classList.add('dark');
    }, []);
    
    const toggleTheme = () => {
      setIsDark((prev) => {
        const newIsDark = !prev;
        if (newIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return newIsDark;
      });
    };


    return (
        <>
            <div className="flex justify-between bg-primary-light dark:bg-primary-dark border-b border-[#1414141A] dark:border-[#FFFFFF1A] px-2 py-2 sm:px-3 sm:py-1 md:px-5 md:py-2 xl:px-7">
                <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-5 xl:gap-7 items-center">
                    <p className="text-secondary-light dark:text-secondary-dark text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px]">LOGO</p>
                    <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] lg:text-[14px]">File</p>
                    <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] lg:text-[14px]">Edit</p>
                    <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] lg:text-[14px]">Setting</p>
                    <PiArrowBendUpLeftBold className="text-[#5a5a5a] md:text-[16px] lg:text-[20px] xl:text-[26px] hidden md600:block" />
                    <PiArrowBendUpRightBold className="text-[#5a5a5a] md:text-[16px] lg:text-[20px] xl:text-[26px] hidden md600:block" />
                </div>


                <div className="flex gap-2 md:gap-3 lg:gap-5 xl:gap-7 items-center">
                    <div className="flex gap-2 items-center">
                        <img src={savedicon} alt=""  className='h-[16px] md:h-full'/>
                        <p className="text-[#357935] text-[12px] hidden md600:block">Saved!</p>
                    </div>
                    <p className='text-secondary-light dark:text-secondary-dark text-[12px] md:text-[14px]'>Untitled_song</p>
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
                            className={`absolute top-0 left-0 w-[26px] h-[28px] flex items-center justify-center transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-50'
                                }`}
                        >
                            <GoSun className={`${isDark ? ' dark:text-secondary-dark' : "text-secondary-dark"} text-[16px]`} />

                        </div>

                        {/* Moon icon */}
                        <div
                            className={`absolute top-0 right-0 w-[26px] h-[28px] flex items-center justify-center transition-opacity duration-300 ${isDark ? 'opacity-50' : 'opacity-100'
                                }`}
                        >
                            <IoMoonOutline className={`${isDark ? 'dark:text-secondary-dark' : "text-secondary-light "} text-[16px]`} />
                        </div>
                    </button>
                    <div className="flex xl:gap-2 md:p-1 lg:px-2 xl:px-3 lg:py-1 rounded-full d_customborder">
                        <HiDownload className="text-secondary-light dark:text-secondary-dark xl:text-[18px]" />
                        <p className="text-secondary-light dark:text-secondary-dark text-[12px] hidden xl:block"> Export</p>
                    </div>

                    <div className="flex xl:gap-2 bg-primary-dark dark:bg-primary-light justify-center  items-center md:p-1 lg:px-2 xl:px-3 lg:py-1 rounded-full ">
                        <img src={subscription} alt="" className='h-[18px] w-[18px]' />
                        <p className="text-secondary-dark dark:text-secondary-light text-[12px]  font-semibold hidden xl:block">Upgrade Now</p>
                    </div>

                    <div className="flex md:gap-2 bg-primary-dark dark:bg-primary-light  md:px-2 xl:px-3 md:py-1 rounded-full d_customborder">
                        <IoIosShareAlt className="text-secondary-dark dark:text-secondary-light xl:text-[18px]" />
                        <p className="text-secondary-dark dark:text-secondary-light text-[12px] hidden md:block">Share</p>
                    </div>

                    <div className="text-center hidden xl:block">
                        <RxExit className='text-secondary-light dark:text-secondary-dark xl:text-[14px]'/>
                        <p className="text-secondary-light dark:text-secondary-dark text-[10px]">Exit</p>
                    </div>
                </div>
            </div>
        </>
    )
}


export default TopHeader