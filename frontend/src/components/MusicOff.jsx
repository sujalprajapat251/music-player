
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

const  MusicOff = ({ showOffcanvas, setShowOffcanvas }) => {

    const dispatch = useDispatch();
    const [showAll, setShowAll] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const audioRefs = useRef([]);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const category = useSelector((state) => state.category?.category || []);
    const sound = useSelector((state) => state.sound?.allsounds || [])
    const userWishList = useSelector((state) => state.user?.userWishList || null);

    const tracks = useSelector((state) => state.studio?.tracks || []);
    const selectedTrackId = useSelector((state) => state.studio?.selectedTrackId || null);

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
                    soundData: soundItem
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
                    soundData: soundItem
                };

                const newTrackId = Date.now() + Math.random();
                const newTrack = {
                    id: newTrackId,
                    name: soundItem.soundname || 'New Track',
                    volume: 80,
                    audioClips: [newClip]
                };

                dispatch(addTrack(newTrack));
                dispatch(setCurrentTrackId(newTrackId));
            }
        } catch (_) {
            // noop
        }
    };

    return (
        <>
            {showOffcanvas && (
                <>

                    {/* Offcanvas */}
                    <div className="absolute top-0 bg-primary-light dark:bg-primary-dark right-0 h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)]  z-50 shadow-lg transition-transform duration-300 transform translate-x-0 overflow-auto w-[70%] md600:w-[30%]  2xl:w-[25%] 3xl:w-[23%]">

                        {/* Place your offcanvas content here */}
                        <div className=" text-secondary-light dark:text-secondary-dark bg-primary-light dark:bg-primary-dark">
                            <div className=' border-l border-[1px] border-[#1414141A] dark:border-[#FFFFFF1A] bg-transparent'>
                                <div className='px-[6px] md600:px-[8px] lg:px-[12px] 3xl:px-[16px]'>
                                    <div className=' py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px] border-b border-[#1414141A] dark:border-[#FFFFFF1A]'>
                                        <h5 className='text-secondary-light dark:text-secondary-dark text-[14px] md600:text-[18px] lg:text-[20px] font-[600]'>Loops and one-shots</h5>
                                    </div>
                                    <div className="w-full max-w-md600 mx-auto py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px]">
                                        <div className="relative mb-1 md600:mb-2 lg:mb-3 3xl:mb-4">
                                            <div className="relative flex items-center">
                                                <IoSearch className="absolute left-2 lg:left-3 w-3 h-3 md600:w-4 md600:h-4 lg:h-5 lg:w-5 text-[#888888] dark:text-[#FFFFFF99]" />
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    className="w-full bg-primary-light dark:bg-primary-dark border-[1px] border-[#000] dark:border-[#fff] text-[10px] md600:text-[12px] lg:text-[14px] font-[400] text-secondary-light dark:text-secondary-dark placeholder-gray-400 rounded-[4px] pl-6 pr-3  md600:pl-8 md600:pr-3 py-1 lg:pl-10 lg:pr-4 lg:py-2 outline-none  focus:outline-none transition-all duration-200"
                                                    value={searchTerm}
                                                    onChange={handleSearchChange}
                                                />
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap gap-1 md600:gap-2 3xl:gap-3'>
                                            {category.map((categoryItem, index) => {
                                                const isSelected = selectedCategory === categoryItem.name;
                                                return (
                                                    <div
                                                        key={index}
                                                        className={` bg-[#E5E5E5] dark:bg-[#262529]  w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-secondary-light dark:text-secondary-dark text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#b8b8b8] dark:hover:bg-gray-600 ${isSelected ? 'border border-[#1414141A] dark:border-[#FFFFFF1A]' : ''}`}
                                                        onClick={() => handleCategoryClick(categoryItem.name)}
                                                    >
                                                        {categoryItem?.name}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className='py-[2px] md600:py-[4px] lg:py-[8px] xl:py-[10px] 3xl:py-[14px]'>
                                        <div className="flex justify-between items-center mb-1 md600:mb-2 xl:mb-3 3xl:mb-4">
                                            <h6 className={showAll === true ? `hidden` : `text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px] xl:text-[16px] 3xl:text-[18px] font-[600]`}>Top Sound packs</h6>
                                            <p className={showAll === true ? `hidden` : `text-[8px] lg:text-[10px] xl:text-[12px] 3xl:text-[14px] dark:text-[#FFFFFF99] text-[#888888] cursor-pointer`} onClick={() => setShowAll(true)} >Show all</p>
                                            <p className={showAll === false ? `hidden` : `text-secondary-light dark:text-secondary-dark flex gap-1 lg:gap-2 text-[8px] md600:text-[10px] 1875remlg:text-[12px] xl:text-[14px] 3xl:text-[16px] items-center cursor-pointer`} onClick={() => setShowAll(false)}>
                                                <FaAngleLeft className='text-secondary-light dark:text-secondary-dark' />
                                                Sound packs
                                            </p>
                                        </div>
                                        {!showAll && (
                                            <div className="flex items-center gap-1 lg:gap-2 xl:gap-3">
                                                {filteredSounds.slice(0, 3).map((soundItem, index) => {
                                                    return (
                                                        <div key={index} className="w-1/2 lg:w-1/3 border-[1px] border-[#1414141A] dark:border-[#FFFFFF1A] rounded-[4px] bg-primary-light dark:bg-primary-dark">
                                                            <div className='w-full h-[80px] relative'>
                                                                <img src={`${IMAGE_URL}uploads/image/${soundItem?.image}`} alt="Album" className="w-full h-[80px] xl:h-full object-cover" />
                                                                <button onClick={() => handlePlayPause(index)} className='absolute top-[50%] left-[50%] w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] bg-primary-light dark:bg-primary-dark rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                                    {/* <img src={playingIndex === index ? pause : play} alt="" /> */}
                                                                    {playingIndex === index ? <Pause className="text-secondary-light dark:text-secondary-dark" /> : <Play className="text-secondary-light dark:text-secondary-dark" />}
                                                                </button>
                                                                <audio
                                                                    ref={el => audioRefs.current[index] = el}
                                                                    src={`${IMAGE_URL}uploads/soundfile/${soundItem?.soundfile}`}
                                                                    onEnded={() => handleEnded(index)}
                                                                />
                                                            </div>
                                                            <div className="p-[4px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                                <h3 className="text-secondary-light dark:text-secondary-dark font-[500] text-[8px] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">{soundItem?.soundname}</h3>
                                                                <p className="text-[#9c9c9c] dark:text-[#FFFFFF99] font-[400] text-[8px] lg:text-[10px]">{soundItem?.category[0]?.name}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        {showAll && (
                                            <div className="flex items-center flex-wrap pt-2  md600:pt-3 lg:pt-3">
                                                {filteredSounds.map((soundItem, index) => {
                                                    return (
                                                        <div key={index} className="w-1/2 lg:w-1/3 px-[5px] mb-3">
                                                            <div className='border-[1px] border-[#1414141A] dark:border-[#FFFFFF1A] rounded-[4px] bg-primary-light dark:bg-primary-dark'>
                                                                <div className='w-full h-[80px] relative'>
                                                                    <img src={`${IMAGE_URL}uploads/image/${soundItem?.image}`} alt="Album" className="w-full h-[80px] xl:h-full object-cover" />
                                                                    <button onClick={() => handlePlayPause(index)} className='absolute top-[50%] left-[50%] w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] bg-primary-light dark:bg-primary-dark rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                                        {/* <img src={playingIndex === index ? pause : play} alt="" /> */}
                                                                        {playingIndex === index ? <Pause className="text-secondary-light dark:text-secondary-dark" /> : <Play className="text-secondary-light dark:text-secondary-dark" />}
                                                                    </button>
                                                                    <audio
                                                                        ref={el => audioRefs.current[index] = el}
                                                                        src={`${IMAGE_URL}uploads/soundfile/${soundItem?.soundfile}`}
                                                                        onEnded={() => handleEnded(index)}
                                                                    />
                                                                </div>
                                                                <div className="p-[4px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                                    <h3 className="text-secondary-light dark:text-secondary-dark font-[500] text-[8px] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">{soundItem?.soundname}</h3>
                                                                    <p className="text-[#9c9c9c] dark:text-[#FFFFFF99] font-[400] text-[8px] lg:text-[10px]">{soundItem?.category[0]?.name}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {!showAll && (
                                        <div className=' pt-[8px] md600:pt-[10px] lg:pt-[12px] xl:pt-[14px] 3xl:pt-[18px]'>
                                            <div className="flex justify-between items-center mb-1 lg:mb-2 3xl:mb-3">
                                                <div className='flex items-center'>
                                                    <h6 className='text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[12px] lg:text-[14px] xl:text-[16px] 3xl:text-[18px] font-[600] md600:me-2'>AnyScale</h6>
                                                    <Scale className='w-4 h-4 lg:w-full lg:h-full text-secondary-light dark:text-secondary-dark' />
                                                </div>
                                                {userWishList?.wishlist?.length > 0 && (
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="rememberMe"
                                                            className="w-3 h-3 md600:w-4 md600:h-4 3xl:w-5 3xl:h-5 text-red-500 bg-transparent border-[1px] border-[#000] dark:border-[#fff] rounded-[2px] j_checkBox"
                                                            checked={showFavoritesOnly}
                                                            onChange={() => setShowFavoritesOnly(prev => !prev)}
                                                        />
                                                        <span className=" ml-1 md600:ml-2 text-[8px] md600:text-[10px] xl:text-[12px] 3xl:text-[14px] text-secondary-light dark:text-secondary-dark font-[400]">
                                                            Favorites
                                                        </span>
                                                    </label>
                                                )}

                                            </div>
                                            {filteredSounds.map((soundItem, index) => {
                                                const isWishlisted = isInWishlist(soundItem._id);
                                                return (
                                                    <div key={index} className="flex justify-between items-center bg-[#E5E5E5] dark:bg-[#262529] p-[3px] md600:p-[4px] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] w-full mb-1 md600:mb-2 cursor-pointer hover:bg-[#b8b8b8] dark:hover:bg-gray-600"
                                                        draggable={true}
                                                        onDragStart={(e) => handleDragStart(e, soundItem)}
                                                        onDragEnd={handleDragEnd}>
                                                        <div className="flex items-center">
                                                            <div className='w-[20px] h-[20px] lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative me-1 md600:me-2 3xl:me-3'>
                                                                <img src={`${IMAGE_URL}uploads/image/${soundItem?.image}`} alt="Album" className="w-[16px] h-[16px] lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                                <button onClick={() => handlePlayPause(index)} className='absolute top-[53%] left-[40%]  xl:top-[50%] xl:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                                    <img src={playingIndex === index ? pauseblack : playblack} alt="" />
                                                                </button>
                                                                <audio
                                                                    ref={el => audioRefs.current[index] = el}
                                                                    src={`${IMAGE_URL}uploads/soundfile/${soundItem?.soundfile}`}
                                                                    onEnded={() => handleEnded(index)}
                                                                />
                                                            </div>
                                                            <div className='text-secondary-light dark:text-secondary-dark text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>{soundItem?.soundname}</div>
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            {isWishlisted ? (
                                                                <FaHeart onClick={() => toggleWishlist(soundItem._id)} className={`text-red-500 text-[12px] xl:text-[14px] 3xl:text-[16px] me-1 md600:me-2 3xl:me-3`} />
                                                            ) : (
                                                                <FaRegHeart onClick={() => toggleWishlist(soundItem._id)} className={`text-secondary-light dark:text-secondary-dark text-[12px] xl:text-[14px] 3xl:text-[16px] me-1 md600:me-2 3xl:me-3`} />
                                                            )}
                                                            <FaPlus onClick={() => handleAddToTimeline(soundItem)} className='text-secondary-light dark:text-secondary-dark text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default MusicOff;
