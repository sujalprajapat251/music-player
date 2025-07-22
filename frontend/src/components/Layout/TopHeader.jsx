import React, { useEffect, useState } from 'react';
import { PiArrowBendUpLeftBold, PiArrowBendUpRightBold } from "react-icons/pi";
import { GoSun } from "react-icons/go";
import savedicon from "../../Images/savedIcon.svg";
import { IoMoonOutline } from 'react-icons/io5';
import { HiDownload } from "react-icons/hi";
import subscription from "../../Images/subscriptionIcon.svg";
import { IoIosShareAlt } from "react-icons/io";
import { RxExit } from "react-icons/rx";
import { Menu, MenuButton } from '@headlessui/react';
import newfolder from '../../Images/New Folder.svg';
import openfolder from "../../Images/OpenFolder.svg";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import previous from "../../Images/previousVersion.svg";
import exports from "../../Images/export.svg";
import imports from "../../Images/import.svg";
import shareproject from "../../Images/shareproject.svg";

const TopHeader = () => {

    const [isDark, setIsDark] = useState(true);
    const [isActiveMenu, setIsActiveMenu] = useState("");
    const [showSubmenu, setShowSubmenu] = useState(false);


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
                    <p className="text-white text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px]">LOGO</p>
                    <Menu as="div" className="relative inline-block text-left ">
                        <div onClick={() => setIsActiveMenu("button")}>
                            <MenuButton className="outline-none" >
                                <p className='text-white text-[10px] md:text-[12px] lg:text-[14px]'> File </p>
                            </MenuButton>
                        </div>

                        <Menu.Items
                            className="absolute left-0 z-10 mt-3 w-52   origin-top-right bg-[#1F1F1F] shadow-lg outline-none"
                        >
                            <div className="">

                                {/* First item: Print */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-6 py-2 flex gap-3  outline-none`}>
                                            <img src={newfolder} alt="" className='w-5 h-5' />  <span className='text-white text-[14px]'>New...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-6 py-2 flex gap-3  outline-none`}>
                                            <img src={openfolder} alt="" className='w-5 h-5' />  <span className='text-white text-[14px]'>Open...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-6 py-2 flex gap-3 outline-none items-center`}>
                                            <img src={openfolder} alt="" className='w-5 h-5' />  <span className='text-white text-[14px]'>Open Recent</span>
                                            <MdOutlineKeyboardArrowRight className="text-white text-[20px] ms-auto" />
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-6 pt-2 pb-4 flex gap-3 outline-none border-b border-[#FFFFFF1A]`}>
                                            <img src={previous} alt="" className='w-5 h-5' />  <span className='text-white text-[14px]'>Previous versions</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-6 py-2 flex gap-3 outline-none`}>
                                            <span className='ps-8 text-white text-[14px]'>Save as...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-6 py-2 flex gap-3 outline-none`}>
                                            <img src={exports} alt="" className='w-5 h-5' /> <span className=' text-white text-[14px]'>Export</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <div
                                    className="relative"
                                    onMouseEnter={() => setShowSubmenu(true)}
                                    onMouseLeave={() => setShowSubmenu(false)}
                                >
                                    <div className="flex gap-3 w-full items-center  px-6 py-2 cursor-pointer">
                                        <img src={imports} alt="" className='w-5 h-5' /><span className='text-white text-[14px]'>Import</span>
                                        <MdOutlineKeyboardArrowRight className="text-white text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu && (
                                        <div className="absolute left-full top-0 z-50 w-40 mt-0 bg-white shadow-lg outline-none">
                                            <p className="block px-3 py-2 text-black hover:bg-gray-100 cursor-pointer">
                                                Page navigator
                                            </p>
                                            <p className="block px-3 py-2 text-black hover:bg-gray-100 cursor-pointer">
                                                Bookmark navigator
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={` px-6 py-2 flex gap-3  outline-none ${active ? 'bg-gray-100' : ''}`}>
                                            <img src={shareproject} alt="" className='w-5 h-5' />  <span className='text-white text-[14px]'>Share Project</span>
                                        </p>
                                    )}
                                </Menu.Item>

                                <div
                                    className="relative"
                                    onMouseEnter={() => setShowSubmenu(true)}
                                    onMouseLeave={() => setShowSubmenu(false)}
                                >
                                    <div className="flex w-full items-center border-b-2 border-gray-100 px-4 py-3 hover:bg-gray-100 cursor-pointer">
                                        <span className='text-white ps-3'>Navigator</span>
                                        <svg
                                            className="w-2.5 h-2.5 ml-2 rtl:rotate-180 ms-auto text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                    </div>

                                    {showSubmenu && (
                                        <div className="absolute left-full top-0 z-50 w-40 mt-0 bg-white shadow-lg outline-none">
                                            <p className="block px-3 py-2 text-black hover:bg-gray-100 cursor-pointer">
                                                Page navigator
                                            </p>
                                            <p className="block px-3 py-2 text-black hover:bg-gray-100 cursor-pointer">
                                                Bookmark navigator
                                            </p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </Menu.Items>
                    </Menu >

                    {/* <p className="text-white text-[10px] md:text-[12px] lg:text-[14px]">File</p> */}
                    < p className="text-white text-[10px] md:text-[12px] lg:text-[14px]" > Edit</p >
                    <p className="text-white text-[10px] md:text-[12px] lg:text-[14px]">Setting</p>
                    <PiArrowBendUpLeftBold className="text-[#5a5a5a] md:text-[16px] lg:text-[20px] xl:text-[26px] hidden md600:block" />
                    <PiArrowBendUpRightBold className="text-[#5a5a5a] md:text-[16px] lg:text-[20px] xl:text-[26px] hidden md600:block" />
                </div >


                <div className="flex gap-2 md:gap-3 lg:gap-5 xl:gap-7 items-center">
                    <div className="flex gap-2 items-center">
                        <img src={savedicon} alt="" className='h-[16px] md:h-full' />
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
            </div >
        </>
    )
}


export default TopHeader