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
import gotoprofile from "../../Images/gotoprofile.svg";
import audiotrack from "../../Images/audiotrack.svg";
import mic from "../../Images/micsvg.svg";
import undo from "../../Images/undoIcon.svg";
import Redo from "../../Images/redoicon.svg";
import copy from "../../Images/copyIcon.svg";
import paste from "../../Images/pasteIcon.svg";
import Delete from "../../Images/deleteIcon.svg";
import region from "../../Images/createRegionIcon.svg";
import effect from "../../Images/EfectIcon.svg";
import midisetting from "../../Images/MidiSettings.svg";
import Tuner from "../../Images/tuner.svg";
import keyboard from "../../Images/keyboard.svg";
import lowlatancy from "../../Images/lae latency.svg";
import soundquality from "../../Images/soundquality.svg";
import tick from "../../Images/Tick.svg";
import songsections from "../../Images/sondsections.svg";
import language from "../../Images/language.svg";

const TopHeader = () => {

    const [isDark, setIsDark] = useState(true);
    const [isActiveMenu, setIsActiveMenu] = useState("");

    // Add state for selected sound quality
    const [selectedSoundQuality, setSelectedSoundQuality] = useState('High');


    // Define sound quality options
    const soundQualityOptions = [
        { id: 'high', label: 'High' },
        { id: 'medium', label: 'Medium' },
        { id: 'low', label: 'Low' },
        { id: 'extralow', label: 'Extra Low' }
    ];

    const handleSoundQualitySelect = (qualityId, qualityLabel) => {
        setSelectedSoundQuality(qualityLabel);
        // Close all submenus
        setShowSubmenu(prev => ({
            ...prev,
            soundquality: false
        }));
        // Reset active menu to close the main menu
        setIsActiveMenu("");
        // Use setTimeout to ensure the click event is processed first
        setTimeout(() => {
            // Programmatically trigger ESC key to close Headless UI menu
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
        }, 10);
    };

    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const languageOptions = [
        { id: 'Deutsch', label: 'Deutsch' },
        { id: 'English', label: 'English' },
        { id: 'Español', label: 'Español' },
        { id: 'Español (Latin America)', label: 'Español (Latin America)' },
        { id: 'Français', label: 'Français' },
        { id: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
        { id: 'Italiano', label: 'Italiano' },
        { id: 'Nederlands', label: 'Nederlands' },
        { id: 'Norsk', label: 'Norsk' },
        { id: 'Polski', label: 'Polski' },
        { id: 'low', label: 'Low' },
        { id: 'extralow', label: 'Extra Low' },
        { id: 'high', label: 'High' },
        { id: 'medium', label: 'Medium' },
        { id: 'low', label: 'Low' },
        { id: 'extralow', label: 'Extra Low' }
    ];

    const handleLanguage = (languageId, LanguageName) => {
        setSelectedLanguage(LanguageName);
        // Close all submenus
        setShowSubmenu(prev => ({
            ...prev,
            soundquality: false
        }));
        // Reset active menu to close the main menu
        setIsActiveMenu("");
        // Use setTimeout to ensure the click event is processed first
        setTimeout(() => {
            // Programmatically trigger ESC key to close Headless UI menu
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
        }, 10);
    };


    const [showSubmenu, setShowSubmenu] = useState({
        import: false,
        navigator: false
    });


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

    // New function to handle submenu visibility
    const handleSubmenuToggle = (submenuName, isVisible) => {
        setShowSubmenu(prev => ({
            ...prev,
            [submenuName]: isVisible
        }));
    };

    // Function to close all menus when nested option is selected
    const handleNestedOptionClick = (event) => {
        event.stopPropagation();
        // Close all submenus
        setShowSubmenu({
            import: false,
            navigator: false
        });
        // Reset active menu to close the main menu
        setIsActiveMenu("");
        // Use setTimeout to ensure the click event is processed first
        setTimeout(() => {
            // Programmatically trigger ESC key to close Headless UI menu
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
        }, 10);
    };


    return (
        <>
            <div className="flex justify-between bg-primary-light dark:bg-primary-dark border-b border-[#1414141A] dark:border-[#FFFFFF1A] px-2 py-2 sm:px-3 sm:py-1 md:px-5 md:py-2 xl:px-7">
                <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-5 xl:gap-7 items-center">
                    <p className="text-white text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px]">LOGO</p>
                    <Menu as="div" className="relative inline-block text-left ">
                        <div >
                            <MenuButton className="outline-none" >
                                <p className='text-white text-[10px] md:text-[12px] lg:text-[14px]'> File </p>
                            </MenuButton>
                        </div>

                        <Menu.Items
                            className="absolute left-0 z-10 mt-2 lg:mt-3 w-36 md600:w-48 lg:w-60   origin-top-right bg-[#1F1F1F] shadow-lg outline-none"
                        >
                            <div className="">
                                {/* First item: Print */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md600:py-2 flex md600:gap-3  outline-none hover:bg-[#585858]`}>
                                            <img src={newfolder} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>New...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md:py-2 flex md600:gap-3  outline-none hover:bg-[#585858]`}>
                                            <img src={openfolder} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Open...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <div
                                    className="relative "
                                    onMouseEnter={() => handleSubmenuToggle('openrecentfolder', true)}
                                    onMouseLeave={() => handleSubmenuToggle('openrecentfolder', false)}
                                >
                                    <div className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#585858]">
                                        <img src={openfolder} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Open Recent</span>
                                        <MdOutlineKeyboardArrowRight className="text-white text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.openrecentfolder && (
                                        <div className="absolute left-full top-0 z-50 w-40 lg:mt-0 bg-[#3f3d3d] shadow-lg outline-none text-nowrap">
                                            <p className="block px-2 py-1   md600:px-3 lg:px-4 md:py-2 text-white cursor-pointer hover:bg-[#585858] text-[10px] md600:text-[12px] lg:text-[14px]" onClick={handleNestedOptionClick}>
                                                Page navigator
                                            </p>
                                            <p className="block px-2 py-1 md600:px-3  lg:px-4 md:py-2 text-white cursor-pointer hover:bg-[#585858] text-[10px] md600:text-[12px] lg:text-[14px]" onClick={handleNestedOptionClick}>
                                                Bookmark
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pt-1 pb-2 gap-2 md600:px-4 lg:px-6 md600:pt-2 md600:pb-3 lg:pb-4 flex md600:gap-3 outline-none border-b border-[#FFFFFF1A] hover:bg-[#585858]`}>
                                            <img src={previous} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Previous versions</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pb-2 pt-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 outline-none hover:bg-[#585858]`}>
                                            <span className='ps-5 md600:ps-7 lg:ps-8 text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Save as...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 md600:px-4 lg:px-6 md600:py-2 flex gap-2 md600:gap-3 outline-none hover:bg-[#585858]`}>
                                            <img src={exports} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /> <span className=' text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Export</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                {/* Changed: Import submenu with individual tracking */}
                                <div
                                    className="relative"
                                    onMouseEnter={() => handleSubmenuToggle('import', true)}
                                    onMouseLeave={() => handleSubmenuToggle('import', false)}
                                >
                                    <div className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer hover:bg-[#585858]">
                                        <img src={imports} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Import</span>
                                        <MdOutlineKeyboardArrowRight className="text-white text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.import && (
                                        <div className="absolute left-full top-0 z-50 w-36  md600:w-48 lg:w-56 lg:mt-0 bg-[#3f3d3d] shadow-lg outline-none">
                                            <p className=" flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 text-white cursor-pointer hover:bg-[#585858]" onClick={handleNestedOptionClick}>
                                                <img src={audiotrack} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Import to Audio track</span>
                                            </p>
                                            <p className="flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 text-white cursor-pointer hover:bg-[#585858]" onClick={handleNestedOptionClick}>
                                                <img src={mic} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Import to Audio track</span>
                                            </p>
                                            <p className="flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 text-white cursor-pointer hover:bg-[#585858]" onClick={handleNestedOptionClick}>
                                                <img src={audiotrack} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Open in sampler</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 md600:px-4 lg:px-6 md:py-2 flex gap-2 md600:gap-3 border-b border-[#FFFFFF1A]  outline-none hover:bg-[#585858]`}>
                                            <img src={shareproject} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Share Project</span>
                                        </p>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pt-2 pb-2 md600:px-4 lg:px-6 md600:pt-3 lg:pt-4 md600:pb-2 flex gap-2 md600:gap-3 border-[#FFFFFF1A]  outline-none hover:bg-[#585858]`}>
                                            <img src={gotoprofile} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Go to profile</span>
                                        </p>
                                    )}
                                </Menu.Item>

                            </div>
                        </Menu.Items>
                    </Menu >

                    {/* <p className="text-white text-[10px] md:text-[12px] lg:text-[14px]">File</p> */}
                    {/* < p className="text-white text-[10px] md:text-[12px] lg:text-[14px]" > Edit</p > */}
                    <Menu as="div" className="relative inline-block text-left ">
                        <div>
                            <MenuButton className="outline-none" >
                                <p className='text-white text-[10px] md:text-[12px] lg:text-[14px]'> Edit </p>
                            </MenuButton>
                        </div>

                        <Menu.Items
                            className="absolute left-0 z-10 mt-2 lg:mt-3 w-36 md600:w-48 lg:w-60   origin-top-right bg-[#1F1F1F] shadow-lg outline-none"
                        >
                            <div className="">
                                {/* First item: Print */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#585858]">
                                            <img src={undo} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Undo</span>
                                            <p className="text-white text-[10px] md:text-[12px] text-[#cfcfcf99] ms-auto">Ctrl+Z</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2 pb-3 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer  hover:bg-[#585858]">
                                            <img src={Redo} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Redo</span>
                                            <p className="text-white text-[10px] md:text-[12px] text-[#cfcfcf99] ms-auto">Shift+Ctrl+Z</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`mt-1 px-3 pb-2 pt-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 border-t border-[#FFFFFF1A] outline-none hover:bg-[#585858]`}>
                                            <span className='ps-5 md600:ps-7 lg:ps-8 text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Cut</span>
                                            <p className=" text-white text-[10px] md:text-[12px] text-[#cfcfcf99] ms-auto">Ctrl+X</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#585858]">
                                            <img src={copy} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Copy</span>
                                            <p className="text-white text-[10px] md:text-[12px] text-[#cfcfcf99] ms-auto">Ctrl+C</p>
                                        </p>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#585858]">
                                            <img src={paste} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Paste</span>
                                            <p className="text-white text-[10px] md:text-[12px] text-[#cfcfcf99] ms-auto">Ctrl+V</p>
                                        </p>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2 mb-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#585858]">
                                            <img src={Delete} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Delete</span>
                                            <p className="text-white text-[10px] md:text-[12px] text-[#cfcfcf99] ms-auto">Backspace</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 border-t border-[#FFFFFF1A] cursor-pointer hover:bg-[#585858]">
                                            <img src={effect} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Effects</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#585858]">
                                            <img src={region} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Create region</span>
                                        </p>
                                    )}
                                </Menu.Item>

                            </div>
                        </Menu.Items>
                    </Menu >


                    {/* <p className="text-white text-[10px] md:text-[12px] lg:text-[14px]">Setting</p> */}
                    <Menu as="div" className="relative inline-block text-left ">
                        <div >
                            <MenuButton className="outline-none" >
                                <p className='text-white text-[10px] md:text-[12px] lg:text-[14px]'> Setting </p>
                            </MenuButton>
                        </div>

                        <Menu.Items
                            className="absolute left-0 z-10 mt-2 lg:mt-3 w-36 md600:w-48 lg:w-60   origin-top-right bg-[#1F1F1F] shadow-lg outline-none"
                        >
                            <div className="">
                                {/* First item: Print */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md600:py-2 flex md600:gap-3  outline-none hover:bg-[#585858]`}>
                                            <img src={midisetting} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>MIDI Settings...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md:py-2 flex md600:gap-3  outline-none hover:bg-[#585858]`}>
                                            <img src={Tuner} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Tuner</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <div
                                    className="relative "
                                    onMouseEnter={() => handleSubmenuToggle('keyboard', true)}
                                    onMouseLeave={() => handleSubmenuToggle('keyboard', false)}
                                >
                                    <div className="px-3 pt-1 pb-2 gap-2 md600:px-4 lg:px-6 md600:pt-2 md600:pb-3 lg:pb-4 flex md600:gap-3 outline-none border-b border-[#FFFFFF1A] hover:bg-[#585858]">
                                        <img src={keyboard} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Keyboard</span>
                                        <MdOutlineKeyboardArrowRight className="text-white text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.keyboard && (
                                        <div className="absolute left-full flex justify-between top-0 z-50 w-40 lg:mt-0 bg-[#3f3d3d] shadow-lg outline-none text-nowrap">
                                            <p className="block px-2 py-1   md600:px-3 lg:px-4 md:py-2 text-white cursor-pointer hover:bg-[#585858] text-[10px] md600:text-[12px] lg:text-[14px]" onClick={handleNestedOptionClick}>
                                                Musical Typing
                                            </p>

                                        </div>
                                    )}
                                </div>
                                {/* <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pt-1 pb-2 gap-2 md600:px-4 lg:px-6 md600:pt-2 md600:pb-3 lg:pb-4 flex md600:gap-3 outline-none border-b border-[#FFFFFF1A] hover:bg-[#585858]`}>
                                            <img src={previous} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />  <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Previous versions</span>
                                        </p>
                                    )}
                                </Menu.Item> */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pb-2 pt-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 outline-none hover:bg-[#585858]`}>
                                            <img src={lowlatancy} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Low latency mode</span>
                                            <div className='ms-auto'>
                                                dfg
                                            </div>
                                        </p>
                                    )}
                                </Menu.Item>
                                {/* <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 md600:px-4 lg:px-6 md600:py-2 flex gap-2 md600:gap-3 outline-none hover:bg-[#585858]`}>
                                            <img src={exports} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /> <span className=' text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Export</span>
                                        </p>
                                    )}
                                </Menu.Item> */}
                                {/* Changed: Import submenu with individual tracking */}
                                <div
                                    className="relative"
                                    onMouseEnter={() => handleSubmenuToggle('soundquality', true)}
                                    onMouseLeave={() => handleSubmenuToggle('soundquality', false)}
                                >
                                    <div className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer hover:bg-[#585858]">
                                        <img src={soundquality} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />
                                        <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Sound quality</span>
                                        <MdOutlineKeyboardArrowRight className="text-white text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.soundquality && (
                                        <div className="absolute left-full top-0 z-50 w-36 md600:w-48 lg:w-56 lg:mt-0 bg-[#3f3d3d] shadow-lg outline-none">
                                            {soundQualityOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 text-white cursor-pointer hover:bg-[#585858]"
                                                    onClick={() => handleSoundQualitySelect(option.id, option.label)}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected option */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedSoundQuality === option.label && (
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
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 mt-2 md600:px-4 lg:px-6 md:py-3 lg:py-4 flex gap-2 md600:gap-3 border-t border-b border-[#FFFFFF1A]  outline-none hover:bg-[#585858]`}>
                                            <img src={songsections} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Song Sections</span>
                                            <div className='ms-auto'>
                                                dfg
                                            </div>
                                        </p>
                                    )}
                                </Menu.Item>

                                <div
                                    className="relative"
                                    onMouseEnter={() => handleSubmenuToggle('language', true)}
                                    onMouseLeave={() => handleSubmenuToggle('language', false)}
                                >
                                    <div className="flex gap-2 mt-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer hover:bg-[#585858]">
                                        <img src={language} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />
                                        <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Language</span>
                                        <MdOutlineKeyboardArrowRight className="text-white text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.language && (
                                        <div className="absolute left-full top-0 z-50 w-36 md600:w-48 lg:w-56 lg:mt-0 bg-[#3f3d3d] shadow-lg outline-none">
                                            {languageOptions.map((lang) => (
                                                <div
                                                    key={lang.id}
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-1 text-white cursor-pointer hover:bg-[#585858]"
                                                    onClick={() => handleLanguage(lang.id, lang.label)}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected lang */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedLanguage === lang.label && (
                                                                <img src={tick} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>
                                                                {lang.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 mt-2 md600:px-4 lg:px-6 md:py-3 lg:py-4 flex gap-2 md600:gap-3 border-t border-[#FFFFFF1A]  outline-none hover:bg-[#585858]`}>
                                            <img src={songsections} alt="" className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' /><span className='text-white text-[10px] md600:text-[12px] lg:text-[14px]'>Song Sections</span>
                                            <div className='ms-auto'>
                                                dfg
                                            </div>
                                        </p>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Menu >



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
                        <RxExit className='text-secondary-light dark:text-secondary-dark xl:text-[14px]' />
                        <p className="text-secondary-light dark:text-secondary-dark text-[10px]">Exit</p>
                    </div>
                </div>
            </div >
        </>
    )
}


export default TopHeader