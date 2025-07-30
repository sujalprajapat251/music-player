
import React, { useEffect, useRef, useState } from 'react'
import { IoSearch } from 'react-icons/io5'
// import profile from '../Images/Profile.svg'
// import { ReactComponent as Play } from '../Images/play.svg';
// import { ReactComponent as Pause } from '../Images/pause.svg';
// import { ReactComponent as Scale } from '../Images/scale.svg';
import playblack from '../Images/playblack.svg';
import pauseblack from '../Images/pauseblack.svg';
// import { FaPlus, FaRegHeart } from "react-icons/fa";
// import { FaAngleLeft } from "react-icons/fa6";
// import { FaHeart } from "react-icons/fa";
import { getAllCategory } from '../Redux/Slice/category.slice';
import { useDispatch, useSelector } from 'react-redux';
// import { getAllSound } from '../Redux/Slice/sound.slice';
// import { IMAGE_URL } from '../Utils/baseUrl';
// import { addToWishList, removeFromWishList, getUserWishList } from '../Redux/Slice/user.slice';
import { FaPlus } from "react-icons/fa6";
import subscription from "../Images/subscription.svg";
import { MdOutlinePause } from "react-icons/md";
import { FaPlay } from "react-icons/fa6";
import Bitcrushar from "../Images/Bitcrushar.svg";
import ClassicDist from "../Images/ClassicDist.svg";
import Clipper from "../Images/Clipper.svg";
import Crusher from "../Images/Crusher.svg";
import Fuzz from "../Images/Fuzz.svg";
import JuicyDistrotion from "../Images/Juicy Distrotion.svg";
import Overdrive from "../Images/Overdrive.svg";
import AutoPan from "../Images/Auto Pan.svg";
import AutoWah from "../Images/Auto-Wah.svg";
import Chorus from "../Images/Chorus.svg";
import Flanger from "../Images/Flanger.svg";
import InstantSidechain from "../Images/Instant Sidechain.svg";

const effects = [
    { id: 1, name: "Bitcrushar", subscription: true, image: Bitcrushar, color: "#8F7CFD" },
    { id: 2, name: "Classic Dist", subscription: false, image: ClassicDist, color: "#8F7CFD" },
    { id: 3, name: "Clipper", subscription: true, image: Clipper, color: "#8F7CFD" },
    { id: 4, name: "Crusher", subscription: true, image: Crusher, color: "#8F7CFD" },
    { id: 5, name: "Fuzz", subscription: false, image: Fuzz, color: "#8F7CFD" },
    { id: 6, name: "Juicy Distrotion", subscription: true, image: JuicyDistrotion, color: "#8F7CFD" },
    { id: 7, name: "Overdrive", subscription: false, image: Overdrive, color: "#8F7CFD" },
    { id: 8, name: "Auto Pan", subscription: false, image: AutoPan, color: "#409C9F" },
    { id: 9, name: "Auto-Wah", subscription: false, image: AutoWah, color: "#409C9F" },
    { id: 10, name: "Chorus", subscription: false, image: Chorus, color: "#409C9F" },
    { id: 11, name: "Flanger", subscription: false, image: Flanger, color: "#409C9F" },
    { id: 12, name: "Instant Sidechain", subscription: true, image: InstantSidechain, color: "#409C9F" },
    { id: 13, name: "Crusher", subscription: true, image: Crusher, color: "#409C9F" },
    { id: 14, name: "Crusher", subscription: false, image: Crusher, color: "#409C9F" },
    { id: 15, name: "Crusher", subscription: true, image: Crusher, color: "#409C9F" },
    { id: 16, name: "Crusher", subscription: false, image: Crusher, color: "#409C9F" },
    { id: 17, name: "Crusher", subscription: true, image: Crusher, color: "#409C9F" },
    { id: 18, name: "Crusher", subscription: false, image: Crusher, color: "#409C9F" },
];

const Loops = () => {

    const dispatch = useDispatch();

    const [showOffcanvas, setShowOffcanvas] = useState(true);
    const [pauseButton, setPauseButton] = useState(true)
    const [playingEffectId, setPlayingEffectId] = useState(null);
    // const [showAll, setShowAll] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    // const audioRefs = useRef([]);
    // const [playingIndex, setPlayingIndex] = useState(null);

    const category = useSelector((state) => state.category?.category || []);
    // const sound = useSelector((state) => state.sound?.allsounds || [])
    // const userWishList = useSelector((state) => state.user?.userWishList || null);


    useEffect(() => {
        dispatch(getAllCategory());
        // dispatch(getAllSound());
        // dispatch(getUserWishList());
    }, [dispatch])

    // // Check if a sound item is in the wishlist
    // const isInWishlist = (soundId) => {
    //     if (!userWishList || !userWishList?.wishlist || !Array.isArray(userWishList.wishlist)) return false;
    //     return userWishList.wishlist.some(item => item._id === soundId);
    // };


    // const filteredSounds = sound?.filter(soundItem => {
    //     const matchesCategory = !selectedCategory ||
    //         soundItem.category?.some(cat => cat.name === selectedCategory);

    //     const matchesSearch = !searchTerm ||
    //         soundItem.soundname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         soundItem.category?.some(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

    //     const matchesFavorites = !showFavoritesOnly || isInWishlist(soundItem._id);

    //     return matchesCategory && matchesSearch && matchesFavorites;
    // });

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

    const handleEffectPlayPause = (effectId) => {
        if (playingEffectId === effectId) {
            setPlayingEffectId(null);
        } else {
            setPlayingEffectId(effectId);
        }
    };


    // const toggleWishlist = (soundId) => {
    //     if (isInWishlist(soundId)) {
    //         dispatch(removeFromWishList(soundId));
    //     } else {
    //         dispatch(addToWishList(soundId));
    //     }
    // };

    // const handlePlayPause = (index) => {
    //     if (playingIndex === index) {
    //         audioRefs.current[index].pause();
    //         setPlayingIndex(null);
    //     } else {
    //         audioRefs.current.forEach((audio, i) => {
    //             if (audio && i !== index) audio.pause();
    //         });
    //         if (audioRefs.current[index]) {
    //             audioRefs.current[index].play();
    //             setPlayingIndex(index);
    //         }
    //     }
    // };

    // const handleEnded = (index) => {
    //     if (playingIndex === index) {
    //         setPlayingIndex(null);
    //     }
    // };


    return (
        <>
            <button className='p-2 bg-white text-black' onClick={() => setShowOffcanvas(prev => !prev)}>
                on/off
            </button>

            {showOffcanvas && (
                <>

                    {/* Offcanvas */}
                    <div className="absolute top-0 bg-primary-light dark:bg-primary-dark right-0 max-h-[calc(100vh-82px)] sm:max-h-[calc(100vh-66px)] md:max-h-[calc(100vh-96px)]  z-50 shadow-lg transition-transform duration-300 transform translate-x-0 overflow-auto w-[70%] md600:w-[30%]  2xl:w-[25%] 3xl:w-[23%]">

                        {/* Place your offcanvas content here */}
                        <div className=" text-secondary-light dark:text-secondary-dark bg-primary-light dark:bg-primary-dark">
                            <div className=' border-l border-[1px] border-[#1414141A] dark:border-[#FFFFFF1A] bg-transparent'>
                                <div className='px-[6px] md600:px-[8px] lg:px-[12px] 3xl:px-[16px]'>
                                    <div className=' py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px] border-b border-[#1414141A] dark:border-[#FFFFFF1A]'>
                                        <h5 className='text-secondary-light dark:text-secondary-dark text-[14px] md600:text-[18px] lg:text-[20px] font-[600]'>Effects</h5>
                                    </div>


                                    <div className="w-full max-w-md600 mx-auto py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px] hidden">
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

                                    <div className="bg-[#1F1F1F] w-full py-7 my-3 ">
                                        <p className="text-white text-[16px] text-center">Add a track to apply effects</p>
                                        <div className="flex gap-3 bg-white rounded-md 3xl:w-[53%] 4xl:w-[45%] mx-auto justify-center items-center px-5 py-3 mt-4">
                                            <FaPlus className='text-[#141414] text-[14px]' />
                                            <p className="text-[#141414] text-[16px]">Add New Track</p>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <div className="grid grid-cols-3 gap-3">
                                            {effects.map((effect) => (
                                                <div key={effect.id} className=''>
                                                    {effect?.subscription === true ?

                                                        <div className="flex gap-2 justify-center py-2 items-center text-white" style={{ backgroundColor: effect?.color || '#8F7CFD' }}>
                                                            <img src={subscription} alt="" className='w-5 h-5' />
                                                            {effect?.name === "Juicy Distrotion" ? (
                                                                <p className="text-white text-[11px]">{effect.name}</p>
                                                            ) : effect?.name === "Instant Sidechain" ? (
                                                                <p className="text-white text-[10px]">{effect.name}</p>
                                                            ) : (
                                                                <p className="text-white text-[14px]">{effect.name}</p>
                                                            )}
                                                        </div>
                                                        :
                                                        <div className=" flex gap-3 justify-center py-2 items-center text-white" style={{ backgroundColor: effect?.color || '#8F7CFD' }}>
                                                            <p className="text-white text-[14px]">{effect.name}</p>
                                                        </div>
                                                    }
                                                    <img src={effect.image} alt={effect.name} className="w-full" />
                                                    <button
                                                        onClick={() => handleEffectPlayPause(effect.id)}
                                                        className='flex justify-center p-2 my-2 mx-auto bg-[#FFFFFF1A] rounded-full items-center'
                                                    >
                                                        {playingEffectId === effect.id ?
                                                            <MdOutlinePause className='text-white text-[12px]' /> :
                                                            <FaPlay className='text-white text-[12px]' />
                                                        }
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Loops
