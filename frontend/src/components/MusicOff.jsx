import React, { useEffect, useRef, useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import profile from '../Images/Profile.svg'
import { ReactComponent as Play } from '../Images/play.svg';
import { ReactComponent as Pause } from '../Images/pause.svg';
import { ReactComponent as Scale } from '../Images/scale.svg';
import playblack from '../Images/playblack.svg';
import pauseblack from '../Images/pauseblack.svg';
import { FaPlus, FaRegHeart } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { getAllCategory } from '../Redux/Slice/category.slice';
import { useDispatch, useSelector } from 'react-redux';
import { getAllSound } from '../Redux/Slice/sound.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import { addToWishList, removeFromWishList, getUserWishList } from '../Redux/Slice/user.slice';
import { addTrack, addAudioClipToTrack, setCurrentTrackId } from '../Redux/Slice/studio.slice';
import { createPortal } from "react-dom";
import PricingModel from './PricingModel';

const  MusicOff = ({ showOffcanvas, setShowOffcanvas }) => {

    const dispatch = useDispatch();
    const [showAll, setShowAll] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const audioRefs = useRef([]);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, soundItem: null });
    const [pricingModalOpen, setPricingModalOpen] = useState(false);

    const category = useSelector((state) => state.category?.category || []);
    const sound = useSelector((state) => state.sound?.allsounds || [])
    const userWishList = useSelector((state) => state.user?.userWishList || null);

    const tracks = useSelector((state) => state.studio?.tracks || []);
    const selectedTrackId = useSelector((state) => state.studio?.selectedTrackId || null);

    const openTrackType = useSelector((state) => state.studio?.newtrackType);

    useEffect(() => {
        dispatch(getAllCategory());
        dispatch(getAllSound());
        dispatch(getUserWishList());
    }, [dispatch])

    // Check if a sound item is in the wishlist
    const isInWishlist = (soundId) => {
        if (!userWishList || !userWishList?.wishlist || !Array.isArray(userWishList.wishlist)) return false;
        return userWishList.wishlist.some(item => item._id === soundId);
    };


    const filteredSounds = sound?.filter(soundItem => {
        const matchesCategory = !selectedCategory ||
            soundItem.category?.some(cat => cat.name === selectedCategory);

        const matchesSearch = !searchTerm ||
            soundItem.soundname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            soundItem.category?.some(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFavorites = !showFavoritesOnly || isInWishlist(soundItem._id);

        return matchesCategory && matchesSearch && matchesFavorites;
    });

    const handleCategoryClick = (categoryName) => {
        if (selectedCategory === categoryName) {
            setSelectedCategory(null);
            setSearchTerm('');
        } else {
            setSelectedCategory(categoryName);
            setSearchTerm(categoryName);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (selectedCategory && !e.target.value.toLowerCase().includes(selectedCategory.toLowerCase())) {
            setSelectedCategory(null);
        }
    };


    const handleEnded = (index) => {
        if (playingIndex === index) {
            setPlayingIndex(null);
        }
    };

    const toggleWishlist = (soundId) => {
        if (isInWishlist(soundId)) {
            dispatch(removeFromWishList(soundId));
        } else {
            dispatch(addToWishList(soundId));
        }
    };

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

    const handleDragStart = (e, soundItem) => {
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', JSON.stringify(soundItem));
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleAddToTimeline = async (soundItem) => {
        try {
            const url = `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`;
            let audioDurationSec = 0;

            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                audioDurationSec = audioBuffer.duration;
            } catch (_) {
                audioDurationSec = 5; // fallback
            }

            if (selectedTrackId) {
                const track = tracks.find(t => t.id == selectedTrackId);
                const lastClip = (track?.audioClips || [])[track?.audioClips?.length - 1];
                const newStartTime = lastClip ? (lastClip.startTime || 0) + (lastClip.duration || 0) : 0;

                const newClip = {
                    id: Date.now() + Math.random(),
                    name: soundItem.soundname || 'New Clip',
                    url,
                    color: track?.color || '#FFB6C1',
                    startTime: newStartTime,
                    duration: audioDurationSec,
                    trimStart: 0,
                    trimEnd: audioDurationSec,
                    soundData: soundItem,
                };

                dispatch(addAudioClipToTrack({ trackId: selectedTrackId, audioClip: newClip }));
            } else {
                const newClip = {
                    id: Date.now() + Math.random(),
                    name: soundItem.soundname || 'New Clip',
                    url,
                    color: '#FFB6C1',
                    startTime: 0,
                    duration: audioDurationSec,
                    trimStart: 0,
                    trimEnd: audioDurationSec,
                    soundData: soundItem,
                };

                const newTrackId = Date.now() + Math.random();
                const newTrack = {
                    id: newTrackId,
                    name: soundItem.soundname || 'New Track',
                    volume: 80,
                    audioClips: [newClip],
                    type:'audio'
                };

                dispatch(addTrack(newTrack));
                dispatch(setCurrentTrackId(newTrackId));
            }
        } catch (_) {
            // noop
        }
    };

    const handleContextMenuClick = (e, soundItem) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the bounding rect of the clicked element to position menu to the left
        const rect = e.currentTarget.getBoundingClientRect();
        const menuWidth = 150; // Approximate width of the context menu
        
        setContextMenu({
            show: true,
            x: rect.left - menuWidth - 5, // Position to the left of the icon
            y: rect.top,
            soundItem: soundItem
        });
    };

    const handleContextMenuClose = () => {
        setContextMenu({ show: false, x: 0, y: 0, soundItem: null });
    };

    const handleAddNewTrack = () => {
        if (contextMenu.soundItem) {
            handleAddToTimeline(contextMenu.soundItem);
        }
        handleContextMenuClose();
    };

    const handleOpenInSampler = () => {
        setPricingModalOpen(true);
        handleContextMenuClose();
    };

    return (
        <>
            {showOffcanvas && (
                <>
                    {openTrackType === "Keys" ? (
                        createPortal(
                        // 👉 Piano section open hoy → overlay ma upar show
                        <div className="absolute inset-0 z-[999] bg-primary-light dark:bg-primary-dark overflow-auto">
                            {renderLoopsPanel()}
                        </div>,
                        document.body
                        )
                    ) : (
                        // 👉 Otherwise sidebar panel
                        <div className="absolute top-0 right-0 h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)]  
                            z-[999] shadow-lg transition-transform duration-300 transform translate-x-0 
                            overflow-auto w-full sm:w-[100%] md600:w-[51%] lg:w-[38%] xl:w-[28%] 2xl:w-[25%] 3xl:w-[23%] 
                            bg-primary-light dark:bg-primary-dark">
                            {renderLoopsPanel()}
                        </div>
                    )}
                </>
            )}
            
            {/* Context Menu */}
            {contextMenu.show && (
                createPortal(
                    <div 
                        className="fixed z-[1000] bg-[#2A2A2A] dark:bg-[#1A1A1A] border border-[#404040] dark:border-[#333333] rounded-[4px] shadow-lg"
                        style={{
                            left: contextMenu.x,
                            top: contextMenu.y,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="py-1">
                            <button
                                onClick={handleAddNewTrack}
                                className="w-full px-4 py-2 text-left text-white hover:bg-[#404040] dark:hover:bg-[#333333] text-sm font-medium"
                            >
                                Add new track
                            </button>
                            <div className="border-t border-[#404040] dark:border-[#333333]"></div>
                            <button
                                onClick={handleOpenInSampler}
                                className="w-full px-4 py-2 text-left text-white hover:bg-[#404040] dark:hover:bg-[#333333] text-sm font-medium"
                            >
                                Open in sampler
                            </button>
                        </div>
                    </div>,
                    document.body
                )
            )}
            
            {/* Backdrop to close context menu */}
            {contextMenu.show && (
                createPortal(
                    <div 
                        className="fixed inset-0 z-[999]"
                        onClick={handleContextMenuClose}
                    />,
                    document.body
                )
            )}
            
            {/* Pricing Modal */}
            <PricingModel 
                pricingModalOpen={pricingModalOpen} 
                setPricingModalOpen={setPricingModalOpen} 
            />
        </>
    )

    function renderLoopsPanel() {
        return (
            <div className="text-secondary-light dark:text-secondary-dark bg-primary-light dark:bg-primary-dark">
                <div className='border-l border-[1px] border-[#1414141A] dark:border-[#FFFFFF1A] bg-transparent'>
                    <div className='px-[6px] sm:px-[14px] md600:px-[14px] lg:px-[14px] xl:px-[12px] 3xl:px-[16px]'>
                        {/* Header Section */}
                        <div className='py-[10px] sm:py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[16px] border-b border-[#1414141A] dark:border-[#FFFFFF1A] flex items-center justify-between'>
                            <h5 className='text-secondary-light dark:text-secondary-dark text-[14px] sm:text-[16px] md600:text-[18px] lg:text-[20px] font-[600]'>
                                Loops and one-shots
                            </h5>
                            <button
                                className="ml-2 text-[18px] sm:text-[20px] md600:text-[22px] lg:text-[24px] 3xl:text-[24px] text-secondary-light dark:text-secondary-dark hover:text-gray-200 dark:hover:text-gray-300 transition-colors duration-200"
                                onClick={() => setShowOffcanvas(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Search and Categories Section */}
                        <div className="w-full max-w-md600 mx-auto py-[10px] sm:py-[12px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px]">
                            {/* Search Bar */}
                            <div className="relative mb-1 sm:mb-4 md600:mb-4 lg:mb-4 xl:mb-4 3xl:mb-4">
                                <div className="relative flex items-center">
                                    <IoSearch className="absolute left-2 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 text-[#888888] dark:text-[#FFFFFF99]" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full bg-primary-light dark:bg-primary-dark border border-[#000] dark:border-[#fff] 
                                        text-xs sm:text-sm text-secondary-light dark:text-secondary-dark 
                                        placeholder-gray-400 rounded pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2
                                        outline-none focus:outline-none transition-all duration-200"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>

                            {/* Categories Grid */}
                            <div className='flex flex-wrap gap-1 sm:gap-2 md600:gap-2 3xl:gap-3'>
                                {category.map((categoryItem, index) => {
                                    const isSelected = selectedCategory === categoryItem.name;
                                    return (
                                        <div
                                            key={index}
                                            className={`bg-[#E5E5E5] dark:bg-[#262529] 
                                            w-[67px] sm:w-[72px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[60px] 
                                            rounded-[2px] text-secondary-light dark:text-secondary-dark 
                                            text-[10px] sm:text-[12px] lg:text-[12px] 3xl:text-[12px] sm:py-[4px] lg:py-[4px] xl:py-[4px] 3xl:py-[5px] text-center cursor-pointer 
                                            hover:bg-[#b8b8b8] dark:hover:bg-gray-600 
                                            ${isSelected ? 'border border-[#1414141A] dark:border-[#FFFFFF1A]' : ''}`}
                                            onClick={() => handleCategoryClick(categoryItem.name)}
                                        >
                                            {categoryItem?.name}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Sound Packs Section */}
                        <div className='py-[2px] sm:py-[8px] md600:py-[6px] lg:py-[6px] xl:py-[10px] 3xl:py-[14px]'>
                            {/* Section Header */}
                            <div className="flex justify-between items-center mb-1 sm:mb-4 md600:mb-4 lg:mb-4 2xl:mb-4 3xl:mb-4">
                                {!showAll ? (
                                    <>
                                        <h6 className='text-secondary-light dark:text-secondary-dark text-[10px] sm:text-[14px] md600:text-[14px] lg:text-[14px] xl:text-[16px] 3xl:text-[18px] font-[600]'>
                                            Top Sound packs
                                        </h6>
                                        <p className='text-[8px] sm:text-[12px] lg:text-[12px] xl:text-[14px] 3xl:text-[14px] dark:text-[#FFFFFF99] text-[#888888] cursor-pointer' 
                                            onClick={() => setShowAll(true)}>
                                            Show all
                                        </p>
                                    </>
                                ) : (
                                    <p className='text-secondary-light dark:text-secondary-dark flex gap-1 sm:gap-2 md:gap-2
                                        lg:gap-2 text-[8px] sm:text-[12px] md600:text-[12px] 1875remlg:text-[14px] xl:text-[14px] 3xl:text-[16px] items-center cursor-pointer' 
                                        onClick={() => setShowAll(false)}>
                                        <FaAngleLeft className='text-secondary-light dark:text-secondary-dark' />
                                        Sound packs
                                    </p>
                                )}
                            </div>

                            {/* Sound Pack Cards - Top 3 */}
                            {!showAll && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-3 lg:gap-3 2xl:gap-3">
                                    {filteredSounds.slice(0, 3).map((soundItem, index) => (
                                        <div key={index} className="border-[1px] border-[#1414141A] dark:border-[#FFFFFF1A] 
                                            rounded bg-primary-light dark:bg-primary-dark rounded-[4px]">
                                            <div className='w-full h-20 sm:h-24 relative'>
                                                <img 
                                                    src={`${IMAGE_URL}uploads/image/${soundItem?.image}`} 
                                                    alt="Album" 
                                                    className="w-full h-full object-cover rounded-t" 
                                                />
                                                <button 
                                                    onClick={() => handlePlayPause(index)} 
                                                    className='absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 
                                                    bg-primary-light dark:bg-primary-dark rounded-full 
                                                    -translate-x-1/2 -translate-y-1/2 flex justify-center items-center 
                                                    shadow-lg'>
                                                    {playingIndex === index ? 
                                                        <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-light dark:text-secondary-dark" /> : 
                                                        <Play className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-light dark:text-secondary-dark" />
                                                    }
                                                </button>
                                                <audio
                                                    ref={el => audioRefs.current[index] = el}
                                                    src={`${IMAGE_URL}uploads/soundfile/${soundItem?.soundfile}`}
                                                    onEnded={() => handleEnded(index)}
                                                />
                                            </div>
                                            <div className="p-[4px] sm:p-[6px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                <h3 className="text-secondary-light dark:text-secondary-dark font-[500] 
                                                    text-[8px] sm:text-[12px] md:text-[12px] lg:text-[12px] 3xl:text-[12px] truncate">
                                                    {soundItem?.soundname}
                                                </h3>
                                                <p className="text-[#9c9c9c] dark:text-[#FFFFFF99] font-[400] 
                                                    text-[8px] sm:text-[10px] md:text-[10px] lg:text-[10px] 3xl:text-[12px] truncate">
                                                    {soundItem?.category[0]?.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Sound Pack Cards - Show All */}
                            {showAll && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-3 lg:gap-3 2xl:gap-3">
                                    {filteredSounds.map((soundItem, index) => (
                                        <div key={index} className='border-[1px] border-[#1414141A] dark:border-[#FFFFFF1A] 
                                            rounded bg-primary-light dark:bg-primary-dark rounded-[4px]'>
                                            <div className='w-full h-20 sm:h-24 relative'>
                                                <img 
                                                    src={`${IMAGE_URL}uploads/image/${soundItem?.image}`} 
                                                    alt="Album" 
                                                    className="w-full h-full object-cover rounded-t" 
                                                />
                                                <button 
                                                    onClick={() => handlePlayPause(index)} 
                                                    className='absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 
                                                    bg-primary-light dark:bg-primary-dark rounded-full 
                                                    -translate-x-1/2 -translate-y-1/2 flex justify-center items-center 
                                                    shadow-lg'>
                                                    {playingIndex === index ? 
                                                        <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-light dark:text-secondary-dark" /> : 
                                                        <Play className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-light dark:text-secondary-dark" />
                                                    }
                                                </button>
                                                <audio
                                                    ref={el => audioRefs.current[index] = el}
                                                    src={`${IMAGE_URL}uploads/soundfile/${soundItem?.soundfile}`}
                                                    onEnded={() => handleEnded(index)}
                                                />
                                            </div>
                                            <div className="p-[4px] sm:p-[6px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                <h3 className="text-secondary-light dark:text-secondary-dark font-[500] 
                                                    text-[8px] sm:text-[12px] md:text-[12px] lg:text-[12px] 3xl:text-[12px] truncate">
                                                    {soundItem?.soundname}
                                                </h3>
                                                <p className="text-[#9c9c9c] dark:text-[#FFFFFF99] font-[400]
                                                    text-[8px] sm:text-[10px] md:text-[10px] lg:text-[10px] 3xl:text-[12px] truncate">
                                                    {soundItem?.category[0]?.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* AnyScale Section */}
                        {!showAll && (
                            <div className='pt-[10px] sm:pt-[14px] md600:pt-[14px] lg:pt-[14px] xl:pt-[14px] 3xl:pt-[16px]'>
                                {/* AnyScale Header */}
                                <div className="flex justify-between items-center mb-1 sm:mb-3 md:mb-3 lg:mb-3 3xl:mb-3">
                                    <div className='flex items-center gap-1 sm:gap-2'>
                                        <h6 className='text-secondary-light dark:text-secondary-dark 
                                            text-[10px] sm:text-[14px] md600:text-[14px] lg:text-[14px] xl:text-[16px] 3xl:text-[18px] font-[600] md600:me-2 font-[600]'>
                                            AnyScale
                                        </h6>
                                        <Scale className='w-3 h-3 sm:w-4 sm:h-4 lg:w-full lg:h-full text-secondary-light dark:text-secondary-dark' />
                                    </div>
                                    {userWishList?.wishlist?.length > 0 && (
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 bg-transparent 
                                                border-[1px] border-[#000] dark:border-[#fff] rounded-[2px] j_checkBox"
                                                checked={showFavoritesOnly}
                                                onChange={() => setShowFavoritesOnly(prev => !prev)}
                                            />
                                            <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs 
                                                text-secondary-light dark:text-secondary-dark">
                                                Favorites
                                            </span>
                                        </label>
                                    )}
                                </div>

                                {/* Sound List Items */}
                                <div className="space-y-1 sm:space-y-2">
                                    {filteredSounds.map((soundItem, index) => {
                                        const isWishlisted = isInWishlist(soundItem._id);
                                        return (
                                            <div 
                                                key={index} 
                                                className="flex justify-between items-center 
                                                bg-[#E5E5E5] dark:bg-[#262529] 
                                                p-2 sm:p-3 rounded
                                                cursor-pointer hover:bg-[#b8b8b8] dark:hover:bg-gray-600"
                                                draggable={true}
                                                onDragStart={(e) => handleDragStart(e, soundItem)}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                    <div className='w-7 h-7 sm:w-8 sm:h-8 rounded relative flex-shrink-0'>
                                                        <img 
                                                            src={`${IMAGE_URL}uploads/image/${soundItem?.image}`} 
                                                            alt="Album" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        <button 
                                                            onClick={() => handlePlayPause(index)} 
                                                            className='absolute top-1/2 left-1/2 w-5 h-5 sm:w-6 sm:h-6
                                                            bg-[#FFFFFF33] rounded-full -translate-x-1/2 -translate-y-1/2 
                                                            flex justify-center items-center'>
                                                            <img 
                                                                src={playingIndex === index ? pauseblack : playblack} 
                                                                alt="" 
                                                                className="w-2 h-2 sm:w-3 sm:h-3"
                                                            />
                                                        </button>
                                                        <audio
                                                            ref={el => audioRefs.current[index] = el}
                                                            src={`${IMAGE_URL}uploads/soundfile/${soundItem?.soundfile}`}
                                                            onEnded={() => handleEnded(index)}
                                                        />
                                                    </div>
                                                    <div className='text-secondary-light dark:text-secondary-dark 
                                                        text-[10px] sm:text-[12px] md:text-[12px] lg:text-[12px] xl:text-[12px] 3xl:text-[14px] font-[500]'>
                                                        {soundItem?.soundname}
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
                                                    {isWishlisted ? (
                                                        <FaHeart 
                                                            onClick={() => toggleWishlist(soundItem._id)} 
                                                            className='text-red-500 text-xs sm:text-sm cursor-pointer' 
                                                        />
                                                    ) : (
                                                        <FaRegHeart 
                                                            onClick={() => toggleWishlist(soundItem._id)} 
                                                            className='text-secondary-light dark:text-secondary-dark 
                                                            text-xs sm:text-sm cursor-pointer' 
                                                        />
                                                    )}
                                                    <FaPlus 
                                                        onClick={() => handleAddToTimeline(soundItem)} 
                                                        className='text-secondary-light dark:text-secondary-dark 
                                                        text-xs sm:text-sm cursor-pointer' 
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default MusicOff;