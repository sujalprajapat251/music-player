
import React, { useEffect, useRef, useState } from 'react'
import { IoSearch } from 'react-icons/io5'

import { getAllCategory } from '../Redux/Slice/category.slice';
import { useDispatch, useSelector } from 'react-redux';
import { addEffect, setShowEffectsLibrary, toggleEffectsOffcanvas, setShowEffectsTwo, setActiveTabs } from '../Redux/Slice/effects.slice';

import { FaPlus } from "react-icons/fa6";
import subscription from "../Images/subscription.svg";
import { MdOutlinePause } from "react-icons/md";
import { FaPlay } from "react-icons/fa6";
import Bitcrushar from "../Images/Bitcrushar.svg";
import ClassicDist1 from "../Images/ClassicDist.svg";
import ClassicDist from "./ClassicDist";
import Clipper1 from "../Images/Clipper.svg";
import Clipper from './Clipper';
import Crusher1 from "../Images/Crusher.svg";
import Crusher from "./Crusher";
import Fuzz1 from "../Images/Fuzz.svg";
import Fuzz from "./Fuzz";
import JuicyDistrotion1 from "../Images/Juicy Distrotion.svg";
import JuicyDistrotion from './JuicyDistrotion';
import Overdrive1 from "../Images/Overdrive.svg";
import Overdrive from './Overdrive';
import AutoPan1 from "../Images/Auto Pan.svg";
import AutoPan from './AutoPan';
import AutoWah1 from "../Images/Auto-Wah.svg";
import AutoWah from './AutoWah';
import Chorus1 from "../Images/Chorus.svg";
import Chorus from './Chorus';
import Flanger1 from "../Images/Flanger.svg";
import Flanger from './Flanger';
import InstantSidechain from "../Images/Instant Sidechain.svg";
import Phaser1 from "../Images/Phaser.svg";
import Phaser from './Phaser';
import PitchShifter from "../Images/PitchShifter.svg";
import Rotary1 from "../Images/Rotary.svg";
import Rotary from './Rotary';
import RotaryPro from "../Images/Rotary Pro.svg";
import StereoChorus1 from "../Images/Stereo Chorus.svg";
import StereoChorus from './StereoChorus';
import TapeWobble1 from "../Images/Tape Wobble.svg";
import TapeWobble from './TapeWobble';
import Pianodemo from './Piano';
import Effects2 from './Effects2';
import audioEffectsPlayer from '../components/AudioEffectsPlayer'
import { showEffectsTwo } from '../Redux/Slice/effects.slice';
import { setTrackType } from '../Redux/Slice/studio.slice';

const effects = [
    { id: 1, name: "Bitcrushar", subscription: true, image: Bitcrushar, color: "#8F7CFD", category: "Distortion" },
    { id: 2, name: "Classic Dist", subscription: false, image: ClassicDist1, color: "#8F7CFD", component: ClassicDist, category: "Distortion" },
    { id: 3, name: "Clipper", subscription: true, image: Clipper1, color: "#8F7CFD", component: Clipper, category: "Distortion" },
    { id: 4, name: "Crusher", subscription: true, image: Crusher1, color: "#8F7CFD", component: Crusher, category: "Distortion" },
    { id: 5, name: "Fuzz", subscription: false, image: Fuzz1, color: "#8F7CFD", component: Fuzz, category: "Distortion" },
    { id: 6, name: "Juicy Distrotion", subscription: true, image: JuicyDistrotion1, color: "#8F7CFD", component: JuicyDistrotion, category: "Distortion" },
    { id: 7, name: "Overdrive", subscription: false, image: Overdrive1, color: "#8F7CFD", component: Overdrive, category: "Distortion" },
    { id: 8, name: "Auto Pan", subscription: false, image: AutoPan1, color: "#409C9F", component: AutoPan, category: "Modulation" },
    { id: 9, name: "Auto-Wah", subscription: false, image: AutoWah1, color: "#409C9F", component: AutoWah, category: "Modulation" },
    { id: 10, name: "Chorus", subscription: false, image: Chorus1, color: "#409C9F", component: Chorus, category: "Modulation" },
    { id: 11, name: "Flanger", subscription: false, image: Flanger1, color: "#409C9F", component: Flanger, category: "Modulation" },
    { id: 12, name: "Instant Sidechain", subscription: true, image: InstantSidechain, color: "#409C9F", category: "Compression" },
    { id: 13, name: "Phaser", subscription: false, image: Phaser1, color: "#409C9F", component: Phaser, category: "Modulation" },
    { id: 14, name: "Pitch Shifter", subscription: true, image: PitchShifter, color: "#409C9F", category: "Pitch" },
    { id: 15, name: "Rotary", subscription: false, image: Rotary1, color: "#409C9F", component: Rotary, category: "Modulation" },
    { id: 16, name: "Rotary Pro", subscription: true, image: RotaryPro, color: "#409C9F", category: "Modulation" },
    { id: 17, name: "Stereo Chorus", subscription: false, image: StereoChorus1, color: "#409C9F", component: StereoChorus, category: "Modulation" },
    { id: 18, name: "Tape Wobble", subscription: true, image: TapeWobble1, color: "#409C9F", component: TapeWobble, category: "Modulation" },
];

const Effects = ({ showOffcanvas, setShowOffcanvas }) => {

    const dispatch = useDispatch();

    const [pauseButton, setPauseButton] = useState(true)
    const [playingEffectId, setPlayingEffectId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const category = useSelector((state) => state.category?.category || []);
    const [dispatchedOnce, setDispatchedOnce] = useState(false);

    const { activeEffects, showEffectsLibrary, effectsLibrary, showEffectsOffcanvas, showEffectsTwo, showEffectsTwoState } = useSelector((state) => state.effects);
    // console.log("hhhh", showEffectsTwoState);

    // Normalize strings for robust matching
    const normalize = (s) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '').trim();

    // Build category chips from the effects list to ensure they match
    const effectCategories = Array.from(new Set(effects.map(e => e.category).filter(Boolean))).sort();
    // console.log("hhhh", showEffectsTwoState);

    useEffect(() => {
        dispatch(getAllCategory());
    }, [dispatch])

    useEffect(() => {
        return () => {
            audioEffectsPlayer.stopEffect();
        };
    }, []);

    const handleCategoryClick = (categoryName) => {
        if (selectedCategory === categoryName) {
            setSelectedCategory(null);
            setSearchTerm('');
        } else {
            setSelectedCategory(categoryName);
            setSearchTerm('');
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value && selectedCategory) {
            setSelectedCategory(null);
        }
    };

    const handleEffectPlayPause = async (effectId) => {
        const effect = effects.find(e => e.id === effectId);
        if (!effect) return;
        try {
            if (playingEffectId === effectId && isPlaying) {
                audioEffectsPlayer.stopEffect();
                setPlayingEffectId(null);
                setIsPlaying(false);
            } else {
                if (isPlaying) {
                    audioEffectsPlayer.stopEffect();
                }
                await audioEffectsPlayer.playEffect(effect.name);
                setPlayingEffectId(effectId);
                setIsPlaying(true);

                setTimeout(() => {
                    if (playingEffectId === effectId) {
                        audioEffectsPlayer.stopEffect();
                        setPlayingEffectId(null);
                        setIsPlaying(false);
                    }
                }, 4000);
            }
        } catch (error) {
            console.error('Error playing effect:', error);
            setPlayingEffectId(null);
            setIsPlaying(false);
        }
    };

    const handleAddEffect = (effect) => {
        if (activeEffects?.length < effectsLibrary?.length) {
            dispatch(addEffect(effect));
        }
    };

    const handleDragStart = (e, effect) => {
        setIsDragging(true);
        e.dataTransfer.setData('application/json', JSON.stringify(effect));
        e.dataTransfer.effectAllowed = 'copy';
        e.target.style.opacity = '0.5';
        e.target.style.transform = 'scale(0.95)';
        e.dataTransfer.setDragImage(e.target, 0, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        e.target.style.transform = 'scale(1)';
        setTimeout(() => {
            setIsDragging(false);
        }, 100);
    };

    const filteredEffects = effects.filter(effect => {

        if (selectedCategory) {
            const categoryMatches = normalize(effect.category) === normalize(selectedCategory);
            if (!categoryMatches) return false;
        }
        if (searchTerm.trim()) {
            const s = searchTerm.toLowerCase();
            const searchMatches = effect.name.toLowerCase().includes(s) || (effect.category || '').toLowerCase().includes(s);
            if (!searchMatches) return false;
        }
        return true;
    });

    const clearFilters = () => {
        setSelectedCategory(null);
        setSearchTerm('');
    };

    return (
    <>
    <div>
        <div className={`transition-all duration-300 flex ${showOffcanvas ? 'w-[75%]' : 'w-full'} self-start`}>{showEffectsTwo ? <Effects2 /> : ""}</div>  
        {showOffcanvas && (
        <>
         <div className="absolute top-0 z-[999] bg-primary-light dark:bg-primary-dark right-0 h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)] shadow-lg transition-transform duration-300 ease-in-in transform translate-x-0 overflow-auto w-[70%] md600:w-[30%] 2xl:w-[25%] 3xl:w-[23%]">
            <div className=" text-secondary-light dark:text-secondary-dark bg-primary-light dark:bg-primary-dark">
                <div className=' border-l border-[1px] border-[#1414141A] dark:border-[#FFFFFF1A] bg-transparent'>
                    <div className='px-[6px] md600:px-[8px] lg:px-[12px] 3xl:px-[16px]'>
                        <div className=' py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px] border-b border-[#1414141A] dark:border-[#FFFFFF1A]'>
                            <h5 className='text-secondary-light dark:text-secondary-dark text-[14px] md600:text-[18px] lg:text-[20px] font-[600]'>Effects</h5>
                        </div>
                        <div className="w-full max-w-md600 mx-auto py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px] ">
                            <div className="relative mb-1 md600:mb-2 lg:mb-3 3xl:mb-4">
                                <div className="relative flex items-center">
                                    <IoSearch className="absolute left-2 lg:left-3 w-3 h-3 md600:w-4 md600:h-4 lg:h-5 lg:w-5 text-[#888888] dark:text-[#FFFFFF99]" />
                                    <input type="text" placeholder="Search effects..." className="w-full bg-primary-light dark:bg-primary-dark border-[1px] border-[#000] dark:border-[#fff] text-[10px] md600:text-[12px] lg:text-[14px] font-[ text-secondary-light dark:text-secondary-dark placeholder-gray-400 rounded-[4px] pl-6 pr-3  md600:pl-8 md600:pr-3 py-1 lg:pl-10 lg:pr-4 lg:py-2 outline- focus:outline-none transition-all duration-200" value={searchTerm} onChange={handleSearchChange}/>
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-1 md600:gap-2 3xl:gap-3'>
                                {/* All category */}
                                <div
                                    className={`bg-[#E5E5E5] dark:bg-[#262529] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-secondary-light dark:text-secondary-dark text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#b8b8b8] dark:hover:bg-gray-600 transition-colors duration-200`}
                                    onClick={() => handleCategoryClick(null)}
                                >
                                    All
                                </div>
                                {effectCategories.map((cat, index) => {
                                    const isSelected = normalize(selectedCategory) === normalize(cat);
                                    return (
                                        <div key={index} className={`bg-[#E5E5E5] dark:bg-[#262529] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-secondary-light dark:text-secondary-dark text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#b8b8b8] dark:hover:bg-gray-600 transition-colors duration-200 ${isSelected ? 'border-2 border-blue-500 bg-blue-100 dark:bg-blue-900' : ''}`} onClick={() => handleCategoryClick(cat)}>{cat}</div>
                                    )
                                })}
                            </div>
                            {(selectedCategory || searchTerm) && (
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-[10px] md600:text-[12px] text-gray-600 dark:text-gray-400">
                                        {selectedCategory && `Category: ${selectedCategory}`}
                                        {selectedCategory && searchTerm && " | "}
                                        {searchTerm && `Search: "${searchTerm}"`}
                                        {` (${filteredEffects.length} effects)`}
                                    </p>
                                    <button onClick={clearFilters} className="text-[10px] md600:text-[12px] text-blue-500 hover:text-blue-700 underline">Clear</button>
                                </div>
                            )}
                        </div>

                        {/* Active Effects Summary */}

                        <div className="bg-[#1F1F1F] w-full py-2 md600:py-3 md:my-4 lg:py-5 lg:my-3 3xl:py-7 hidden">
                            <p className="text-white text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px] text-center">Add a track to apply effects</p>
                            <div className="flex gap-1 md:gap-2 lg:gap-3 bg-white rounded-md w-[50%] sm:w-[45%]  md600:w-[74%] md:w-[65%] lg:w-[60%] xl:w-[55%] 3xl:w-[53%] 4xl:w-[45%] mx-auto justify-center items-center px-1 py-1 mt-2 md600:px-2 md600:py-2 md600:mt-3 lg:px-3 lg:py-2 xl:px-4 xl:mt-3 3xl:px-5 3xl:py-3 3xl:mt-4">
                                <FaPlus className='text-[#141414] text-[11px] sm:text-[13px] md600:text-[12px] lg:text-[14px]' />
                                <p className="text-[#141414] text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]">Add New Track</p>
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-3 md600:mt-4 md:mt-3 lg:mt-4 3xl:mt-5">
                            {filteredEffects.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400 text-[12px] md600:text-[14px]">No effects found matching your criteria</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md600:grid-cols-1 md600:gap-3 md:grid-cols-2 md:gap-2 lg:grid-cols-3 lg:gap-2">
                                    {filteredEffects.map((effect) => (
                                        <div key={effect.id} className='cursor-pointer active:cursor-grabbing transition-all duration-200' draggable onDragStart={(e) => handleDragStart(e, effect)} onDragEnd={handleDragEnd}>
                                            {effect?.subscription === true ?
                                                <div className="flex py-1 gap-1 md600:gap-2  md:gap-3 lg:gap-2 justify-center md600:py-2 items-center text-white" style={{ backgroundColor: effect?.color || '#8F7CFD' }}>
                                                    <img src={subscription} alt="" className='w-5 h-5 sm:w-3 sm:h-3 md600:w-4 md600:h-4 md:w-4 md:h-4 3xl:w-5 3xl:h-5' />
                                                    {effect?.name === "Juicy Distrotion" ? (
                                                        <p className="text-white text-[16px] sm:text-[14px] md600:text-[12px] md:text-[10px] lg:text-[8px] xl:text-[12px] 2xl:text-[11px] 4xl:text-[11px]">{effect.name}</p>
                                                    ) : effect?.name === "Instant Sidechain" ? (
                                                        <p className="text-white text-[16px] sm:text-[13px] md600:text-[12px]  md:text-[9px] lg:text-[7px] xl:text-[11px] 2xl:text-[10px] 3xl:text-[10px]">{effect.name}</p>
                                                    ) : effect?.name === "Tape Wobble" ? (
                                                        <p className="text-white text-[16px] sm:text-[14px] md600:text-[12px] md:text-[11px] lg:text-[10px] xl:text-[12px]">{effect.name}</p>
                                                    ) : (
                                                        <p className="text-white text-[16px] sm:text-[14px] md600:text-[14px] md:text-[12px] lg:text-[11px] xl:text-[13px] 2xl:text-[12px] 4xl:text-[14px]">{effect.name}</p>
                                                    )}
                                                </div>
                                                :
                                                <div className=" flex gap-1 md600:gap-2 md:gap-3 justify-center py-1 md:py-2 items-center text-white" style={{ backgroundColor: effect?.color || '#8F7CFD' }}>
                                                    <p className="text-white text-[16px] sm:text-[14px] md600:text-[19px] md:text-[12px] lg:text-[11px] xl:text-[13px] 2xl:text-[12px] 3xl:text-[13px] 4xl:text-[14px]">{effect.name}</p>
                                                </div>
                                            }
                                            <img
                                                onClick={(e) => {
                                                    if (!isDragging && e.target.style.opacity !== '0.5') {
                                                        handleAddEffect(effect);
                                                        e.target.style.transform = 'scale(0.95)';
                                                        setTimeout(() => {
                                                            e.target.style.transform = 'scale(1)';
                                                        }, 150);
                                                        if (!dispatchedOnce) {
                                                            dispatch(setActiveTabs("Effects"));
                                                            setDispatchedOnce(true);
                                                        }
                                                    }
                                                }} src={effect.image} alt={effect.name} className="w-full transition-transform duration-150"
                                            />
                                            <div className="flex gap-1 justify-center my-2">
                                                <button onClick={() => handleEffectPlayPause(effect.id)}
                                                    className={`flex justify-center p-2 rounded-full items-center transition-all duration-200 ${playingEffectId === effect.id && isPlaying ? 'bg-[#FFFFFF1A] hover:bg-[#FFFFFF33]' : 'bg-[#FFFFFF1A] hover:bg-[#FFFFFF33]'
                                                        }`}
                                                    draggable={false} disabled={isPlaying && playingEffectId !== effect.id} title={`${playingEffectId === effect.id && isPlaying ? 'Stop' : 'Play'} ${effect.name} demo`}>
                                                    {playingEffectId === effect.id && isPlaying ? <MdOutlinePause className='text-white text-[12px] lg:text-[10px] xl:text-[12px]' /> : <FaPlay className='text-white text-[12px] lg:text-[10px] xl:text-[12px]' />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
        )}

    </div>
    </>
    )
}

export default Effects