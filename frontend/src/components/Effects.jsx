
import React, { useEffect, useRef, useState } from 'react'
import { IoSearch } from 'react-icons/io5'

// import playblack from '../Images/playblack.svg';
// import pauseblack from '../Images/pauseblack.svg';

import { getAllCategory } from '../Redux/Slice/category.slice';
import { useDispatch, useSelector } from 'react-redux';
import { addEffect, setShowEffectsLibrary, toggleEffectsOffcanvas } from '../Redux/Slice/effects.slice';

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
import audioEffectsPlayer from  '../components/AudioEffectsPlayer'

const effects = [
    { id: 1, name: "Bitcrushar", subscription: true, image: Bitcrushar, color: "#8F7CFD" },
    { id: 2, name: "Classic Dist", subscription: false, image: ClassicDist1, color: "#8F7CFD", component: ClassicDist },
    { id: 3, name: "Clipper", subscription: true, image: Clipper1, color: "#8F7CFD", component: Clipper },
    { id: 4, name: "Crusher", subscription: true, image: Crusher1, color: "#8F7CFD", component: Crusher },
    { id: 5, name: "Fuzz", subscription: false, image: Fuzz1, color: "#8F7CFD", component: Fuzz },
    { id: 6, name: "Juicy Distrotion", subscription: true, image: JuicyDistrotion1, color: "#8F7CFD", component: JuicyDistrotion },
    { id: 7, name: "Overdrive", subscription: false, image: Overdrive1, color: "#8F7CFD", component: Overdrive },
    { id: 8, name: "Auto Pan", subscription: false, image: AutoPan1, color: "#409C9F", component: AutoPan },
    { id: 9, name: "Auto-Wah", subscription: false, image: AutoWah1, color: "#409C9F", component: AutoWah },
    { id: 10, name: "Chorus", subscription: false, image: Chorus1, color: "#409C9F", component : Chorus },
    { id: 11, name: "Flanger", subscription: false, image: Flanger1, color: "#409C9F", component: Flanger },
    { id: 12, name: "Instant Sidechain", subscription: true, image: InstantSidechain, color: "#409C9F" },
    { id: 13, name: "Phaser", subscription: false, image: Phaser1, color: "#409C9F", component: Phaser },
    { id: 14, name: "Pitch Shifter", subscription: true, image: PitchShifter, color: "#409C9F" },
    { id: 15, name: "Rotary", subscription: false, image: Rotary1, color: "#409C9F", component : Rotary },
    { id: 16, name: "Rotary Pro", subscription: true, image: RotaryPro, color: "#409C9F" },
    { id: 17, name: "Stereo Chorus", subscription: false, image: StereoChorus1, color: "#409C9F", component: StereoChorus },
    { id: 18, name: "Tape Wobble", subscription: true, image: TapeWobble1, color: "#409C9F", component: TapeWobble },
];

const Loops = () => {

    const dispatch = useDispatch();

    const [pauseButton, setPauseButton] = useState(true)
    const [playingEffectId, setPlayingEffectId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const category = useSelector((state) => state.category?.category || []);

    const { activeEffects, showEffectsLibrary, effectsLibrary, showEffectsOffcanvas } = useSelector((state) => state.effects);
    console.log( activeEffects, showEffectsLibrary, effectsLibrary, showEffectsOffcanvas );    

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
            setSearchTerm(categoryName);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (selectedCategory && !e.target.value.toLowerCase().includes(selectedCategory.toLowerCase())) {
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

    const handleOpenEffectsLibrary = () => {
        dispatch(setShowEffectsLibrary(true));
    };

    // Filter effects based on searchTerm and selectedCategory
    const filteredEffects = effects.filter(effect => {
        let matchesCategory = true;
        if (selectedCategory) {
            matchesCategory = effect.name.toLowerCase().includes(selectedCategory.toLowerCase());
        }
        let matchesSearch = true;
        if (searchTerm) {
            matchesSearch = effect.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return matchesCategory && matchesSearch;
    });

    return (
    <>
    <button className='p-2 bg-white text-black' onClick={() => dispatch(toggleEffectsOffcanvas())}>on/off</button>
    {showEffectsOffcanvas && (
    <>
    <div className="absolute top-0 bg-primary-light dark:bg-primary-dark right-0 max-h-[calc(100vh-82px)] sm:max-h-[calc(100vh-66px)] md:max-h-[calc(100vh-96px)]  z-50 shadow-lg transition-transform duration-300 transform translate-x-0 overflow-auto w-[70%] md600:w-[30%]  2xl:w-[25%] 3xl:w-[23%]">
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
                                <input type="text" placeholder="Search..." className="w-full bg-primary-light dark:bg-primary-dark border-[1px] border-[#000] dark:border-[#fff] text-[10px] md600:text-[12px] lg:text-[14px] font-[ text-secondary-light dark:text-secondary-dark placeholder-gray-400 rounded-[4px] pl-6 pr-3  md600:pl-8 md600:pr-3 py-1 lg:pl-10 lg:pr-4 lg:py-2 outline- focus:outline-none transition-all duration-200" value={searchTerm} onChange={handleSearchChange}/>
                            </div>
                        </div>
                        <div className='flex flex-wrap gap-1 md600:gap-2 3xl:gap-3'>
                            {category.map((categoryItem, index) => {
                                const isSelected = selectedCategory === categoryItem.name;
                                return (
                                    <div key={index} className={` bg-[#E5E5E5] dark:bg-[#262529]  w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-secondary-light dark:text-secondary-dark text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#b8b8b8] dark:hover:bg-gray-600 ${isSelected ? 'border border-[#1414141A] dark:border-[#FFFFFF1A]' : ''}`} onClick={() => handleCategoryClick(categoryItem.name)}>
                                        {categoryItem?.name}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    {/* Active Effects Summary
                    {activeEffects.length > 0 && (
                        <div className="bg-[#1F1F1F] w-full py-2 md600:py-3 md:my-4 lg:py-5 lg:my-3 3xl:py-7">
                            <p className="text-white text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px] text-center mb-2">Active Effects ({activeEffects.length}/4)</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                                {activeEffects.map((effect, index) => (
                                    <div key={effect.instanceId} className="bg-[#353535] px-2 py-1 rounded text-white text-[8px] sm:text-[10px] md600:text-[12px]">
                                        {effect.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )} */}
                    
                    <div className="bg-[#1F1F1F] w-full py-2 md600:py-3 md:my-4 lg:py-5 lg:my-3 3xl:py-7 hidden">
                        <p className="text-white text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px] text-center">Add a track to apply effects</p>
                        <div className="flex gap-1 md:gap-2 lg:gap-3 bg-white rounded-md w-[50%] sm:w-[45%]  md600:w-[74%] md:w-[65%] lg:w-[60%] xl:w-[55%] 3xl:w-[53%] 4xl:w-[45%] mx-auto justify-center items-center px-1 py-1 mt-2 md600:px-2 md600:py-2 md600:mt-3 lg:px-3 lg:py-2 xl:px-4 xl:mt-3 3xl:px-5 3xl:py-3 3xl:mt-4">
                            <FaPlus className='text-[#141414] text-[11px] sm:text-[13px] md600:text-[12px] lg:text-[14px]' />
                            <p className="text-[#141414] text-[8px] sm:text-[10px] md600:text-[12px] md:text-[14px] lg:text-[16px]">Add New Track</p>
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3 md600:mt-4 md:mt-3 lg:mt-4 3xl:mt-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md600:grid-cols-1 md600:gap-3 md:grid-cols-2 md:gap-2 lg:grid-cols-3 lg:gap-2">
                            {filteredEffects.map((effect) => (
                                <div 
                                    key={effect.id} 
                                    className='cursor-pointer active:cursor-grabbing transition-all duration-200'
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, effect)}
                                    onDragEnd={handleDragEnd}
                                >
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
                                            // Prevent click if we're currently dragging or just finished dragging
                                            if (!isDragging && e.target.style.opacity !== '0.5') {
                                                handleAddEffect(effect);
                                                // Add visual feedback for click
                                                e.target.style.transform = 'scale(0.95)';
                                                setTimeout(() => {
                                                    e.target.style.transform = 'scale(1)';
                                                }, 150);
                                            }
                                        }} src={effect.image}alt={effect.name}className="w-full transition-transform duration-150" 
                                    />
                                    <div className="flex gap-1 justify-center my-2">
                                        <button onClick={() => handleEffectPlayPause(effect.id)} 
                                            className={`flex justify-center p-2 rounded-full items-center transition-all duration-200 ${
                                                playingEffectId === effect.id && isPlaying ? 'bg-[#FFFFFF1A] hover:bg-[#FFFFFF33]' : 'bg-[#FFFFFF1A] hover:bg-[#FFFFFF33]'
                                            }`}
                                            draggable={false} disabled={isPlaying && playingEffectId !== effect.id} title={`${playingEffectId === effect.id && isPlaying ? 'Stop' : 'Play'} ${effect.name} demo`}>
                                            {playingEffectId === effect.id && isPlaying ? <MdOutlinePause className='text-white text-[12px] lg:text-[10px] xl:text-[12px]' /> : <FaPlay className='text-white text-[12px] lg:text-[10px] xl:text-[12px]' />}
                                        </button>
                                    </div>
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
    <Effects2 />
    </>
    )
}

export default Loops
