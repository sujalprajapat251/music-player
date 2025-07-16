import React, { useEffect, useRef, useState } from 'react';
import { useOffcanvas } from '../components/Layout/Layout'; // Adjust path as needed
import { HiMenu } from "react-icons/hi";
import { useDispatch, useSelector } from 'react-redux';
import { getAllSound } from '../Redux/Slice/sound.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import play from '../Images/play.svg';
import pause from '../Images/pause.svg';
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from 'react-icons/bs';

const Home2 = () => {
    const { openOffcanvas } = useOffcanvas();

    const dispatch = useDispatch();
    const sounds = useSelector((state) => state.sound.allsounds).slice(0, 5)
    const audioRefs = useRef([]);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Last updated');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);

    const [activeSearch, setActiveSearch] = useState(false);

    const sortOptions = [
        { value: 'Last updated', label: 'Last updated' },
        { value: 'Oldest updated', label: 'Oldest updated' },
        { value: 'Last created', label: 'Last created' },
        { value: 'Title', label: 'Title' }
    ];

    useEffect(() => {
        dispatch(getAllSound());
    }, [dispatch])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handlePlayPause = (index) => {
        if (playingIndex === index) {
            audioRefs.current[index].pause();
            setPlayingIndex(null);
        } else {
            audioRefs.current.forEach((audio, i) => {
                if (audio && i !== index) audio.pause();
            });
            if (audioRefs.current[index]) {
                audioRefs.current[index].play();
                setPlayingIndex(index);
            }
        }
    };

    const handleEnded = (index) => {
        if (playingIndex === index) {
            setPlayingIndex(null);
        }
    };

    const handleSortSelect = (option) => {
        setSortBy(option.value);
        setIsSortDropdownOpen(false);
    };

    const toggleSortDropdown = () => {
        setIsSortDropdownOpen(!isSortDropdownOpen);
    };

    return (
        <>
            <div className="p-10">
                <div className="flex gap-3 text-white">
                    {/* Mobile Menu Button - Only visible on mobile */}
                    <div className="md:hidden mb-4">
                        <button
                            onClick={openOffcanvas}
                            className="flex items-center justify-center w-10 h-10 bg-[#2b2b2b] rounded-lg border border-[#FFFFFF1A] hover:bg-[#3b3b3b] transition-colors"
                        >
                            <HiMenu className="text-white text-xl" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="">
                        <h1 className="text-2xl font-bold ">My Projects</h1>
                    </div>
                </div>

                <div className="flex mt-5 gap-10">
                    <div>
                        <p className="text-white text-[24px] font-[600]">Start a new project</p>
                        <p className="text-white text-[16px]">Create a music or podcast project.</p>
                        <div className='flex bg-black mt-4 h-[200px] w-[250px] d_customborder items-center justify-center'>
                            <button className='border border-dashed border-white flex flex-col items-center justify-center group p-2 rounded-xl hover:bg-gray-900' >
                                <p className="text-white text-[24px]">+</p>
                                <p className="text-white text-[14px]">
                                    New Project
                                </p>
                            </button>
                        </div>

                    </div>
                    <div>
                        <div className='flex justify-between'>
                            <div>
                                <p className="text-white text-[24px] font-[600]">Explore demo projects</p>
                                <p className="text-white text-[16px]">Play around with professionally-made songs.</p>
                            </div>
                            <div className='my-auto'>
                                <button className='py-2 px-6 border rounded-3xl border-[#FFFFFF1A] hover:bg-gray-600'>
                                    <p className='text-white'>Show all</p>
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6 mt-5">
                                {sounds.map((sound, index) => (
                                    <div key={sound._id || index} className="bg-[#14141480] rounded-[4px] overflow-hidden d_customborder">
                                        <div className='w-full h-[135px]'>
                                            <img src={`${IMAGE_URL}uploads/image/${sound?.image}`} alt="Album" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="py-[8px] px-[12px]">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-[#fff] font-[500] text-[16px] mb-[2px]">{sound?.soundname}</h3>
                                                    <p className="text-[#FFFFFF99] font-[400] text-[14px]">{sound?.soundtype}</p>
                                                </div>
                                                <button
                                                    onClick={() => handlePlayPause(index)}
                                                    className="bg-[#141414] text-black rounded-full w-[28px] h-[28px] flex justify-center items-center border-[0.5px] border-[#FFFFFF1A]"
                                                >
                                                    <img src={playingIndex === index ? pause : play} alt="" />
                                                </button>
                                                <audio
                                                    ref={el => audioRefs.current[index] = el}
                                                    src={`${IMAGE_URL}uploads/soundfile/${sound?.soundfile}`}
                                                    onEnded={() => handleEnded(index)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-14 flex justify-between pb-5 border-b border-[#FFFFFF1A]'>
                    <div className='my-auto'>
                        <button className='py-2 px-6 border rounded-3xl border-[#FFFFFF1A] hover:bg-gray-600 '>
                            <p className='text-white'>+ Add Folder</p>
                        </button>
                    </div>
                    <div className="flex">
                        {activeSearch === true ?
                            <p onClick={() =>setActiveSearch(false)}>search</p> :
                            <>
                                <div className='flex relative pe-2' ref={sortDropdownRef}>
                                    <button
                                        onClick={toggleSortDropdown}
                                        className='flex items-center gap-2 text-white cursor-pointer hover:text-gray-300 transition-colors'
                                    >
                                        <span>Sort by : {sortBy}</span>
                                        <IoIosArrowDown
                                            className={`text-white transition-transform duration-300 ${isSortDropdownOpen ? 'rotate-180' : 'rotate-0'
                                                }`}
                                        />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isSortDropdownOpen && (
                                        <div className="absolute top-full right-0 mt-2 bg-[#1F1F1F] rounded-lg shadow-lg z-10 min-w-[200px]">
                                            {sortOptions.map((option) => (
                                                <div
                                                    key={option.value}
                                                    onClick={() => handleSortSelect(option)}
                                                    className="flex items-center px-4 py-3 hover:bg-[#3b3b3b] cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${sortBy === option.value
                                                            ? 'border-white'
                                                            : 'border-[#FFFFFF40]'
                                                            }`}>
                                                            {sortBy === option.value && (
                                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                            )}
                                                        </div>
                                                        <span className="text-white text-sm">{option.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className='my-auto px-3' onClick={() => setActiveSearch(true)}>
                                    <FiSearch className="text-white text-[24px]" />
                                </div>
                            </>
                        }
                        <div className='my-auto px-3' >
                            <BsThreeDotsVertical className="text-white text-[24px]" />
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
};

export default Home2;