import React, { useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import profile from '../Images/Profile.svg'
import play from '../Images/play.svg';
import pause from '../Images/pause.svg';
import scale from '../Images/scale.svg';
import playblack from '../Images/playblack.svg';
import { FaPlus, FaRegHeart } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";

const Loops = () => {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [showAll, setShowAll] = useState(false);


    return (
        <>
            <button className='p-2 bg-white text-black' onClick={() => setShowOffcanvas(prev => !prev)}>
                on/off
            </button>

            {showOffcanvas && (
                <>

                    {/* Offcanvas */}
                    <div className="absolute top-0 bg-[#141414]  right-0 h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)] bg-[#222] z-50 shadow-lg transition-transform duration-300 transform translate-x-0 overflow-auto w-[70%] md600:w-[30%]  2xl:w-[25%] 3xl:w-[23%]">

                        {/* Place your offcanvas content here */}
                        <div className=" text-white bg-[#141414]">
                            <div className=' border-l border-[1px] border-[#FFFFFF1A] bg-transparent'>
                                <div className='px-[6px] md600:px-[8px] lg:px-[12px] 3xl:px-[16px]'>
                                    <div className=' py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px] border-b border-[#FFFFFF1A]'>
                                        <h5 className='text-white text-[14px] md600:text-[18px] lg:text-[20px] font-[600]'>Loops and one-shots</h5>
                                    </div>
                                    <div className="w-full max-w-md600 mx-auto py-[10px] md600:py-[12px] lg:py-[16px] 3xl:py-[20px]">
                                        <div className="relative mb-1 md600:mb-2 lg:mb-3 3xl:mb-4">
                                            <div className="relative flex items-center">
                                                <IoSearch className="absolute left-2 lg:left-3 w-3 h-3 md600:w-4 md600:h-4 lg:h-5 lg:w-5 text-[#FFFFFF99]" />
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    className="w-full bg-[#222222] text-[10px] md600:text-[12px] lg:text-[14px] font-[400] text-white placeholder-gray-400 rounded-[4px] pl-6 pr-3  md600:pl-8 md600:pr-3 py-1 lg:pl-10 lg:pr-4 lg:py-2 outline-none  focus:outline-none transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap gap-1 md600:gap-2 3xl:gap-3'>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Beats</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>One-shots</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>My Loops</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Hip Hop</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] w-[67px] md600:w-[64px] md:w-[65px] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white text-[10px] lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                        </div>
                                    </div>
                                    <div className='py-[2px] md600:py-[4px] lg:py-[8px] xl:py-[10px] 3xl:py-[14px]'>
                                        <div className="flex justify-between items-center mb-1 md600:mb-2 xl:mb-3 3xl:mb-4">
                                            <h6 className={showAll === true ? `hidden` : `text-white text-[10px] md600:text-[12px] lg:text-[14px] xl:text-[16px] 3xl:text-[18px] font-[600]`}>Top Sound packs</h6>
                                            <p className={showAll === true ? `hidden` : `text-[8px] lg:text-[10px] xl:text-[12px] 3xl:text-[14px] text-[#FFFFFF99] cursor-pointer`} onClick={() => setShowAll(true)} >Show all</p>
                                            <p className={showAll === false ? `hidden` : `text-white flex gap-1 lg:gap-2 text-[8px] md600:text-[10px] 1875remlg:text-[12px] xl:text-[14px] 3xl:text-[16px] items-center`} onClick={() => setShowAll(false)}>
                                                <FaAngleLeft className='text-white' />
                                                Sound packs
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 lg:gap-2 xl:gap-3">
                                            <div className="w-1/2 lg:w-1/3 d_customborder rounded-[4px]">
                                                <div className='w-full h-[80px] relative'>
                                                    <img src={profile} alt="Album" className="w-full h-[80px] xl:h-full object-cover" />
                                                    <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={play} alt="" />
                                                    </button>
                                                </div>
                                                <div className="p-[4px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                    <h3 className="text-[#fff] font-[500] text-[8px] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                    <p className="text-[#FFFFFF99] font-[400] text-[8px] lg:text-[10px]">Rave</p>
                                                </div>
                                            </div>
                                            <div className="w-1/2 lg:w-1/3 d_customborder rounded-[4px]">
                                                <div className='w-full h-[80px] relative'>
                                                    <img src={profile} alt="Album" className="w-full h-[80px] xl:h-full object-cover" />
                                                    <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={play} alt="" />
                                                    </button>
                                                </div>
                                                <div className="p-[4px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                    <h3 className="text-[#fff] font-[500] text-[8px] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                    <p className="text-[#FFFFFF99] font-[400] text-[8px] lg:text-[10px]">Rave</p>
                                                </div>
                                            </div>
                                            <div className="w-1/2 lg:w-1/3 d_customborder rounded-[4px] hidden lg:block">
                                                <div className='w-full h-[80px] relative'>
                                                    <img src={profile} alt="Album" className="w-full h-[80px] xl:h-full object-cover" />
                                                    <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={play} alt="" />
                                                    </button>
                                                </div>
                                                <div className="p-[4px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                    <h3 className="text-[#fff] font-[500] text-[8px] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                    <p className="text-[#FFFFFF99] font-[400] text-[8px] lg:text-[10px]">Rave</p>
                                                </div>
                                            </div>
                                        </div>
                                        {showAll &&
                                            <div className="flex items-center pt-2  md600:pt-3 lg:pt-5 gap-3">
                                                <div className="w-1/2 lg:w-1/3 d_customborder rounded-[4px]">
                                                    <div className='w-full h-[80px] relative'>
                                                        <img src={profile} alt="Album" className="w-full h-[80px] xl:h-full object-cover" />
                                                        <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                            <img src={play} alt="" />
                                                        </button>
                                                    </div>
                                                    <div className="p-[4px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                        <h3 className="text-[#fff] font-[500] text-[8px] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                        <p className="text-[#FFFFFF99] font-[400] text-[8px] lg:text-[10px]">Rave</p>
                                                    </div>
                                                </div>
                                                <div className="w-1/2 lg:w-1/3 d_customborder rounded-[4px]">
                                                    <div className='w-full h-[80px] relative'>
                                                        <img src={profile} alt="Album" className="w-full h-[80px] xl:h-full object-cover" />
                                                        <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                            <img src={play} alt="" />
                                                        </button>
                                                    </div>
                                                    <div className="p-[4px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                        <h3 className="text-[#fff] font-[500] text-[8px] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                        <p className="text-[#FFFFFF99] font-[400] text-[8px] lg:text-[10px]">Rave</p>
                                                    </div>
                                                </div>
                                                <div className="w-1/2 lg:w-1/3 d_customborder rounded-[4px] hidden lg:block">
                                                    <div className='w-full h-[80px] relative'>
                                                        <img src={profile} alt="Album" className="w-full h-[80px] xl:h-full object-cover" />
                                                        <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                            <img src={play} alt="" />
                                                        </button>
                                                    </div>
                                                    <div className="p-[4px] md600:p-[6px] lg:p-[8px] 3xl:p-[10px]">
                                                        <h3 className="text-[#fff] font-[500] text-[8px] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                        <p className="text-[#FFFFFF99] font-[400] text-[8px] lg:text-[10px]">Rave</p>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div className=' pt-[8px] md600:pt-[10px] lg:pt-[12px] xl:pt-[14px] 3xl:pt-[18px]'>
                                        <div className="flex justify-between items-center mb-1 lg:mb-2 3xl:mb-3">
                                            <div className='flex items-center'>
                                                <h6 className='text-white text-[10px] md600:text-[12px] lg:text-[14px] xl:text-[16px] 3xl:text-[18px] font-[600] md600:me-2'>AnyScale</h6>
                                                <img src={scale} alt="" className='w-4 h-4 lg:w-full lg:h-full' />
                                            </div>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="rememberMe"
                                                    className="w-3 h-3 md600:w-4 md600:h-4 3xl:w-5 3xl:h-5 text-red-500 bg-transparent border-white/20 rounded-[2px] j_checkBox"
                                                />
                                                <span className=" ml-1 md600:ml-2 text-[8px] md600:text-[10px] xl:text-[12px] 3xl:text-[14px] text-white font-[400]">
                                                    Favorites
                                                </span>
                                            </label>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#1F1F1F] p-[3px] md600:p-[4px] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] w-full mb-1 md600:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='w-[20px] h-[20px] lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative me-1 md600:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="w-[16px] h-[16px] lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute top-[53%] left-[40%]  xl:top-[50%] xl:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px] me-1 md600:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#1F1F1F] p-[3px] md600:p-[4px] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] w-full mb-1 md600:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='w-[20px] h-[20px] lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative me-1 md600:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="w-[16px] h-[16px] lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute top-[53%] left-[40%]  xl:top-[50%] xl:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px] me-1 md600:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#1F1F1F] p-[3px] md600:p-[4px] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] w-full mb-1 md600:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='w-[20px] h-[20px] lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative me-1 md600:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="w-[16px] h-[16px] lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute top-[53%] left-[40%] xl:top-[50%] xl:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px] me-1 md600:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#1F1F1F] p-[3px] md600:p-[4px] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] w-full mb-1 md600:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='w-[20px] h-[20px] lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative me-1 md600:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="w-[16px] h-[16px] lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute top-[53%] left-[40%]  xl:top-[50%] xl:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px] me-1 md600:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#1F1F1F] p-[3px] md600:p-[4px] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] w-full mb-1 md600:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='w-[20px] h-[20px] lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative me-1 md600:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="w-[16px] h-[16px] lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute top-[53%] left-[40%]  xl:top-[50%] xl:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaHeart className='text-[#DD3C3C] text-[12px] xl:text-[14px] 3xl:text-[16px] me-1 md600:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
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
