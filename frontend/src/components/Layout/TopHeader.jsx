import React, { useEffect, useState } from 'react';
import { PiArrowBendUpLeftBold, PiArrowBendUpRightBold } from "react-icons/pi";
import { GoSun } from "react-icons/go";
import savedicon from "../../Images/savedIcon.svg";
import { IoMoonOutline } from 'react-icons/io5';
import { HiDownload } from "react-icons/hi";
import subscription from "../../Images/subscriptionIcon.svg";
import { IoIosShareAlt } from "react-icons/io";
import { RxExit } from "react-icons/rx";
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton } from '@headlessui/react';
import { ReactComponent as NewFolderIcon } from '../../Images/New Folder.svg';
import { ReactComponent as OpenFolderIcon } from "../../Images/OpenFolder.svg";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { ReactComponent as Previous } from "../../Images/previousVersion.svg";
import { ReactComponent as Exports } from "../../Images/export.svg";
import { ReactComponent as Imports } from "../../Images/import.svg";
import { ReactComponent as Shareproject } from "../../Images/shareproject.svg";
import { ReactComponent as Gotoprofile } from "../../Images/gotoprofile.svg";
import { ReactComponent as Audiotrack } from "../../Images/audiotrack.svg";
import { ReactComponent as Mic } from "../../Images/micsvg.svg";
import { ReactComponent as Undo } from "../../Images/undoIcon.svg";
import { ReactComponent as Redo } from "../../Images/redoicon.svg";
import { ReactComponent as Copy } from "../../Images/copyIcon.svg";
import { ReactComponent as Paste } from "../../Images/pasteIcon.svg";
import { ReactComponent as Delete } from "../../Images/deleteIcon.svg";
import { ReactComponent as Region } from "../../Images/createRegionIcon.svg";
import { ReactComponent as Effect } from "../../Images/EfectIcon.svg";
import { ReactComponent as Midisetting } from "../../Images/MidiSettings.svg";
import { ReactComponent as Tuner } from "../../Images/tuner.svg";
import { ReactComponent as Keyboard } from "../../Images/keyboard.svg";
import { ReactComponent as Lowlatancy } from "../../Images/lae latency.svg";
import { ReactComponent as Soundquality } from "../../Images/soundquality.svg";
import { ReactComponent as Tick } from "../../Images/Tick.svg";
import { ReactComponent as Songsections } from "../../Images/sondsections.svg";
import { ReactComponent as Language } from "../../Images/language.svg";
import { ReactComponent as Theme } from "../../Images/themes.svg";
import { useTheme } from '../../Utils/ThemeContext';
import {ReactComponent as Close} from '../../Images/closeicon.svg';
import midi from '../../Images/midi.svg';

const TopHeader = () => {

    const [isActiveMenu, setIsActiveMenu] = useState("");
    const [isLowLatency, setIsLowLatency] = useState(false);
    const [isLowLatency1, setIsLowLatency1] = useState  (false);
    const [isLowLatency2, setIsLowLatency2] = useState(false);
    const [lowlatencyomodal, setLowLatencyModel] = useState(false); 
    const [midikeyboardmodal, setMidiKeyboardModel] = useState(false);

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
        { id: 'Português', label: 'Português' },
        { id: 'Português(Brasil)', label: 'Português(Brasil)' },
        { id: 'Русский язык', label: 'Русский язык' },
        { id: 'Svenska', label: 'Svenska' },
        { id: 'low', label: 'Low' },
        { id: 'Türkçe', label: 'Türkçe' }
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


    const { isDark, setIsDark } = useTheme();
    const [selectedtheme, setSelectedtheme] = useState('Dark Theme');


    // Define sound quality options
    const themesOptions = [
        { id: 'Dark Theme', label: 'Dark Theme' },
        { id: 'Light Theme', label: 'Light Theme' }
    ]

    const handlethemesSelect = (qualityId, qualityLabel) => {
        setSelectedtheme(qualityLabel);
        setIsDark(qualityLabel === 'Dark Theme');
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

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    useEffect(() => {
        setSelectedtheme(isDark ? 'Dark Theme' : 'Light Theme');
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => {
            const newIsDark = !prev;
            setSelectedtheme(newIsDark ? 'Dark Theme' : 'Light Theme');
            return newIsDark;
        });
    };

    const [showSubmenu, setShowSubmenu] = useState({
        import: false,
        navigator: false
    });

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
                    <p className="text-secondary-light dark:text-secondary-dark text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px]">LOGO</p>
                    <Menu as="div" className="relative inline-block text-left">
                        <div >
                            <MenuButton className="outline-none" >
                                <p className='text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] lg:text-[14px]'> File </p>
                            </MenuButton>
                        </div>

                        <Menu.Items
                            className="absolute left-[-20px] sm:left-0 z-10 mt-2 lg:mt-3 w-36 md600:w-48 lg:w-60   origin-top-right bg-primary-light dark:bg-primary-dark shadow-lg outline-none"
                        >
                            <div className="">
                                {/* First item: Print */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md600:py-2 flex md600:gap-3  outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <NewFolderIcon className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>New...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md:py-2 flex md600:gap-3  outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <OpenFolderIcon className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Open...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <div
                                    className="relative "
                                    onMouseEnter={() => handleSubmenuToggle('openrecentfolder', true)}
                                    onMouseLeave={() => handleSubmenuToggle('openrecentfolder', false)}
                                >
                                    <div className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                        <OpenFolderIcon className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Open Recent</span>
                                        <MdOutlineKeyboardArrowRight className="text-secondary-light dark:text-secondary-dark text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.openrecentfolder && (
                                        <div className="absolute left-full top-0 z-50 w-36 md600:w-40 lg:mt-0 bg-primary-light dark:bg-primary-dark shadow-lg outline-none text-nowrap">
                                            <p className="block px-2 py-1   md600:px-3 lg:px-4 md:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529] text-[10px] md600:text-[12px] lg:text-[14px]" onClick={handleNestedOptionClick}>
                                                Page navigator
                                            </p>
                                            <p className="block px-2 py-1 md600:px-3  lg:px-4 md:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529] text-[10px] md600:text-[12px] lg:text-[14px]" onClick={handleNestedOptionClick}>
                                                Bookmark
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pt-1 pb-2 gap-2 md600:px-4 lg:px-6 md600:pt-2 md600:pb-3 lg:pb-4 flex md600:gap-3 outline-none border-b border-[#1414141A] dark:border-[#FFFFFF1A] hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <Previous className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Previous versions</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pb-2 pt-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <span className='ps-5 md600:ps-7 lg:ps-8 text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Save as...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 md600:px-4 lg:px-6 md600:py-2 flex gap-2 md600:gap-3 outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <Exports className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /> <span className=' text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Export</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                {/* Changed: Import submenu with individual tracking */}
                                <div
                                    className="relative"
                                    onMouseEnter={() => handleSubmenuToggle('import', true)}
                                    onMouseLeave={() => handleSubmenuToggle('import', false)}
                                >
                                    <div className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                        <Imports className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Import</span>
                                        <MdOutlineKeyboardArrowRight className="text-secondary-light dark:text-secondary-dark text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.import && (
                                        <div className="absolute left-full top-0 z-50 w-36  md600:w-48 lg:w-56 lg:mt-0 bg-primary-light dark:bg-primary-dark shadow-lg outline-none">
                                            <p className=" flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]" onClick={handleNestedOptionClick}>
                                                <Audiotrack className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Import to Audio track</span>
                                            </p>
                                            <p className="flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]" onClick={handleNestedOptionClick}>
                                                <Mic className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Import to Audio track</span>
                                            </p>
                                            <p className="flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]" onClick={handleNestedOptionClick}>
                                                <Audiotrack className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Open in sampler</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 md600:px-4 lg:px-6 md:py-2 flex gap-2 md600:gap-3 border-b border-[#1414141A] dark:border-[#FFFFFF1A]  outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <Shareproject className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Share Project</span>
                                        </p>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pt-2 pb-2 md600:px-4 lg:px-6 md600:pt-3 lg:pt-4 md600:pb-2 flex gap-2 md600:gap-3 border-[#FFFFFF1A]  outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <Gotoprofile className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Go to profile</span>
                                        </p>
                                    )}
                                </Menu.Item>

                            </div>
                        </Menu.Items>
                    </Menu >

                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <MenuButton className="outline-none" >
                                <p className='text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] lg:text-[14px]'> Edit </p>
                            </MenuButton>
                        </div>

                        <Menu.Items
                            className="absolute left-0 z-10 mt-2 lg:mt-3 w-36 md600:w-48 lg:w-60   origin-top-right bg-primary-light dark:bg-primary-dark shadow-lg outline-none"
                        >
                            <div className="">
                                {/* First item: Print */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                            <Undo className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Undo</span>
                                            <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] ms-auto">Ctrl+Z</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2 pb-3 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer  hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                            <Redo className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Redo</span>
                                            <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] ms-auto">Shift+Ctrl+Z</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`mt-1 px-3 pb-2 pt-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 border-t border-[#1414141A] dark:border-[#FFFFFF1A] outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <span className='ps-5 md600:ps-7 lg:ps-8 text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Cut</span>
                                            <p className=" text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] ms-auto">Ctrl+X</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                            <Copy className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Copy</span>
                                            <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] ms-auto">Ctrl+C</p>
                                        </p>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                            <Paste className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Paste</span>
                                            <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] ms-auto">Ctrl+V</p>
                                        </p>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2 mb-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                            <Delete className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Delete</span>
                                            <p className="text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] ms-auto">Backspace</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 border-t border-[#1414141A] dark:border-[#FFFFFF1A] cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                            <Effect className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Effects</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className="flex gap-2  md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                            <Region className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Create region</span>
                                        </p>
                                    )}
                                </Menu.Item>

                            </div>
                        </Menu.Items>
                    </Menu >

                    <Menu as="div" className="relative inline-block text-left">
                        <div >
                            <MenuButton className="outline-none" >
                                <p className='text-secondary-light dark:text-secondary-dark text-[10px] md:text-[12px] lg:text-[14px]'> Setting </p>
                            </MenuButton>
                        </div>

                        <Menu.Items
                            className="absolute left-[-60px] sm:left-0 z-10 mt-2 lg:mt-3 w-40 sm:w-44 md600:w-48 lg:w-60   origin-top-right bg-primary-light dark:bg-primary-dark shadow-lg outline-none"
                        >
                            <div className="">
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md600:py-2 flex md600:gap-3  outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`} onClick={() => setMidiKeyboardModel(true)}>
                                            <Midisetting className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>MIDI Settings...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md:py-2 flex md600:gap-3  outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <Tuner className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />  <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Tuner</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <div
                                    className="relative "
                                    onMouseEnter={() => handleSubmenuToggle('keyboard', true)}
                                    onMouseLeave={() => handleSubmenuToggle('keyboard', false)}
                                >
                                    <div className="px-3 pt-2 pb-2 gap-2 md600:px-4 lg:px-6 md600:pt-2 md600:pb-3 lg:pb-4 items-center flex md600:gap-3 outline-none border-b border-[#FFFFFF1A] hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                        <Keyboard className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Keyboard</span>
                                        <MdOutlineKeyboardArrowRight className="text-secondary-light dark:text-secondary-dark text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.keyboard && (
                                        <div className="absolute flex left-full px-2 py-2 gap-2  md600:px-3 lg:px-4 md:py-2 top-0 z-50 w-32 md600:w-48 lg:w-56 lg:mt-0 bg-primary-light dark:bg-primary-dark hover:bg-[#E5E5E5] dark:hover:bg-[#262529] shadow-lg outline-none text-nowrap">
                                            <p className="block  text-secondary-light dark:text-secondary-dark cursor-pointer  text-[10px] md600:text-[12px] lg:text-[14px]" onClick={handleNestedOptionClick}>
                                                Musical Typing
                                            </p>
                                            <div className='ms-auto '>
                                                <label
                                                    className="inline-flex cursor-pointer"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isLowLatency2}
                                                        onChange={() => setIsLowLatency2(prev => !prev)}
                                                    />
                                                    <div className="relative w-8 md600:w-9 h-4 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-[#353535] peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-[#357935] peer-checked:bg-[#357935] dark:peer-checked:bg-[#357935]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pb-2 pt-2 gap-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <Lowlatancy className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Low latency... </span>
                                            <div className='ms-auto '>
                                                <label
                                                    className="inline-flex cursor-pointer"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isLowLatency}
                                                        onChange={() => {
                                                            if (!isLowLatency) {
                                                                // Only show modal when enabling low latency
                                                                setLowLatencyModel(true);
                                                            } else {
                                                                // Directly disable when unchecking
                                                                setIsLowLatency(false);
                                                            }
                                                        }}
                                                    />
                                                    <div className="relative w-9 h-4 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-[#353535] peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-[#357935] peer-checked:bg-[#357935] dark:peer-checked:bg-[#357935]"></div>
                                                </label>
                                            </div>
                                        </p>
                                    )}
                                </Menu.Item>

                                <div
                                    className="relative"
                                    onMouseEnter={() => handleSubmenuToggle('soundquality', true)}
                                    onMouseLeave={() => handleSubmenuToggle('soundquality', false)}
                                >
                                    <div className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                        <Soundquality className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                        <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Sound quality</span>
                                        <MdOutlineKeyboardArrowRight className="text-secondary-light dark:text-secondary-dark text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.soundquality && (
                                        <div className="absolute left-full top-0 z-50 w-28 md600:w-48 lg:w-56 lg:mt-0 bg-primary-light dark:bg-primary-dark shadow-lg outline-none">
                                            {soundQualityOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 text-white cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]"
                                                    onClick={() => handleSoundQualitySelect(option.id, option.label)}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected option */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedSoundQuality === option.label && (
                                                                <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>
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
                                        <p className={`px-3 py-1 mt-2 md600:px-4 lg:px-6 md:py-3 lg:py-4 flex gap-2 md600:gap-3 border-t border-b border-[#FFFFFF1A]  outline-none hover:bg-[#E5E5E5] dark:hover:bg-[#262529]`}>
                                            <Songsections className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' /><span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Song Sections</span>
                                            <div className='ms-auto '>
                                                <label
                                                    className="inline-flex cursor-pointer"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isLowLatency1}
                                                        onChange={() => setIsLowLatency1(prev => !prev)}
                                                    />
                                                    <div className="relative w-9 h-4 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-[#353535] peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-[#357935] peer-checked:bg-[#357935] dark:peer-checked:bg-[#357935]"></div>
                                                </label>
                                            </div>
                                        </p>
                                    )}
                                </Menu.Item>

                                <div
                                    className="relative"
                                    onMouseEnter={() => handleSubmenuToggle('language', true)}
                                    onMouseLeave={() => handleSubmenuToggle('language', false)}
                                >
                                    <div className="flex gap-2 mt-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                        <Language className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                        <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Language</span>
                                        <MdOutlineKeyboardArrowRight className="text-secondary-light dark:text-secondary-dark text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.language && (
                                        <div className="absolute left-full top-0 z-50 w-32 md600:w-48 lg:w-56 lg:mt-0 bg-primary-light dark:bg-primary-dark  shadow-lg outline-none ">
                                            {languageOptions.map((lang) => (
                                                <div
                                                    key={lang.id}
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-1 text-white cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]"
                                                    onClick={() => handleLanguage(lang.id, lang.label)}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected lang */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedLanguage === lang.label && (
                                                                <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>
                                                                {lang.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div
                                    className="relative"
                                    onMouseEnter={() => handleSubmenuToggle('theme', true)}
                                    onMouseLeave={() => handleSubmenuToggle('theme', false)}
                                >
                                    <div className="flex gap-2 md600:gap-3 mt-2 w-full items-center px-3 py-2 md600:px-4 lg:px-6 md600:py-3 cursor-pointer border-t  border-[#FFFFFF1A] hover:bg-[#E5E5E5] dark:hover:bg-[#262529]">
                                        <Theme className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                        <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>Themes</span>
                                        <MdOutlineKeyboardArrowRight className="text-secondary-light dark:text-secondary-dark text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" />
                                    </div>

                                    {showSubmenu.theme && (
                                        <div className="absolute left-full top-0 z-50 w-28 md600:w-48 lg:w-56 lg:mt-0 bg-primary-light dark:bg-primary-dark shadow-lg outline-none " >
                                            {themesOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 text-secondary-light dark:text-secondary-dark cursor-pointer hover:bg-[#E5E5E5] dark:hover:bg-[#262529]"
                                                    onClick={() => handlethemesSelect(option.id, option.label)}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3 ">
                                                        {/* Show tick only for selected option */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedtheme === option.label && (
                                                                <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 text-secondary-light dark:text-secondary-dark' />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px]'>
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
            </div>

            {/* MIDI Keyboard Modal */}
            <Dialog open={midikeyboardmodal} onClose={setMidiKeyboardModel} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-primary-light dark:bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:px-[10px] px-[20px]">
                                <div className="md:py-[20px] py-[10px] md:px-[10px] bg-primary-light dark:bg-[#1F1F1F] border-b-[0.5px] border-[#1414141A] dark:border-[#FFFFFF1A]">
                                    <div className="flex justify-between items-center">
                                        <div className="sm:text-xl text-lg font-[600] text-secondary-light dark:text-secondary-dark">MIDI Keyboard</div>
                                        <Close onClick={() => setMidiKeyboardModel(false)} className="cursor-pointer text-secondary-light dark:text-secondary-dark" />
                                    </div>
                                </div>
                                <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                    <div className="flex mb-5">
                                        <img src={midi} alt="" className='me-4 ' />
                                        <div className=''>
                                            <div className='text-sm text-secondary-light dark:text-secondary-dark font-[400] mb-[10px]'>Your device</div>
                                            <input type="text" placeholder='Folder Name' className='text-secondary-light dark:text-secondary-dark rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]' />
                                        </div>
                                    </div>
                                    <div className="md:w-[270px] [240px] bg-[#FF00001A] p-[12px] m-auto">
                                        <div className='text-sm font-[500] text-[#FF0000] mb-3'>No device found</div>
                                        <p className='text-secondary-light dark:text-secondary-dark text-sm font-[400]'>Check your keyboard connection and try pressing a key.</p>
                                    </div>
                                    <div className="text-center md:pt-[40px] pt-[20px]">
                                        <button className="d_btn d_createbtn">Ok</button>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Low Latency Mode Modal */}
            <Dialog open={lowlatencyomodal} onClose={setLowLatencyModel} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-primary-light dark:bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-primary-light dark:bg-[#1F1F1F]">
                                <div className="flex justify-end items-center">
                                    <Close onClick={() => setLowLatencyModel(false)} className="cursor-pointer text-secondary-light dark:text-secondary-dark" />
                                </div>
                            </div>
                            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                <div className='text-center'>
                                    <div className='text-base text-secondary-light dark:text-secondary-dark font-[600] mb-[20px]'>Enable Low Latency Mode</div>
                                    <p className='text-[#2D2D2D] dark:text-[#FFFFFF99] text-sm font-[400] md:w-[370px] w-[280px] m-auto'>Some audio effects will be disabled to reduce latency. We need to refresh the page to apply these changes. </p>
                                </div>
                                <div className="text-center md:pt-[40px] pt-[20px]">
                                    <button className="d_btn d_cancelbtn sm:me-7 me-5 d_permanentlyall" onClick={() => {
                                        setIsLowLatency(false);
                                        setLowLatencyModel(false);
                                    }}>Cancel </button>
                                    <button className="d_btn d_createbtn d_permanentlyall" onClick={() => {
                                        setIsLowLatency(true);
                                        setLowLatencyModel(false);
                                    }}>Apply and refresh</button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>


        </>
    )
}


export default TopHeader