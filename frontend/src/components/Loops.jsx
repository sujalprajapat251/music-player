import React, { useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import profile from '../Images/Profile.svg'
import play from '../Images/play.svg';
import pause from '../Images/pause.svg';
import scale from '../Images/scale.svg';
import playblack from '../Images/playblack.svg';
import { FaPlus, FaRegHeart } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";

const Loops = () => {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [showAll, setShowAll] = useState(false);


    return (
        <>

            {/* <div className='flex justify-end'>
                <div className='w-[440px] border-[1px] border-[#FFFFFF1A]'>
                    <div className='px-[20px]'>
                        <div className='py-[20px] border-b border-[#FFFFFF1A]'>
                            <h5 className='text-white text-[20px] font-[600]'>Loops and one-shots</h5>
                        </div>
                        <div className="w-full max-w-md mx-auto py-[20px]">
                            <div className="relative mb-4">
                                <div className="relative flex items-center">
                                    <IoSearch className="absolute left-3 h-5 w-5 text-[#FFFFFF99]" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full bg-[#FFFFFF0F] text-sm font-[400] text-white placeholder-gray-400 border border-gray-700 rounded-[4px] pl-10 pr-4 py-2  focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-3'>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Beats</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>One-shots</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>My Loops</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Hip Hop</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                <div className='bg-[#1F1F1F] w-[70px] rounded-[2px] text-white text-xs py-[7px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                            </div>
                        </div>
                        <div className='py-[20px]'>
                            <div className="flex justify-between items-center mb-4">
                                <h6 className='text-white text-[18px] font-[600]'>Top Sound packs</h6>
                                <p className='text-sm text-[#FFFFFF99] cursor-pointer'>Show all</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1/3 d_customborder rounded-[4px]">
                                    <div className='w-full h-[80px] relative'>
                                        <img src={profile} alt="Album" className="w-full h-full object-cover" />
                                        <button className='absolute top-[50%] left-[50%] w-[24px] h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                            <img src={play} alt="" />
                                        </button>
                                    </div>
                                    <div className="p-[10px]">
                                        <h3 className="text-[#fff] font-[500] text-[12px] mb-[2px]">ENERGY</h3>
                                        <p className="text-[#FFFFFF99] font-[400] text-[10px]">Rave</p>
                                    </div>
                                </div>
                                <div className="w-1/3 d_customborder rounded-[4px]">
                                    <div className='w-full h-[80px] relative'>
                                        <img src={profile} alt="Album" className="w-full h-full object-cover" />
                                        <button className='absolute top-[50%] left-[50%] w-[24px] h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                            <img src={play} alt="" />
                                        </button>
                                    </div>
                                    <div className="p-[10px]">
                                        <h3 className="text-[#fff] font-[500] text-[12px] mb-[2px]">ENERGY</h3>
                                        <p className="text-[#FFFFFF99] font-[400] text-[10px]">Rave</p>
                                    </div>
                                </div>
                                <div className="w-1/3 d_customborder rounded-[4px]">
                                    <div className='w-full h-[80px] relative'>
                                        <img src={profile} alt="Album" className="w-full h-full object-cover" />
                                        <button className='absolute top-[50%] left-[50%] w-[24px] h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                            <img src={play} alt="" />
                                        </button>
                                    </div>
                                    <div className="p-[10px]">
                                        <h3 className="text-[#fff] font-[500] text-[12px] mb-[2px]">ENERGY</h3>
                                        <p className="text-[#FFFFFF99] font-[400] text-[10px]">Rave</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='py-[20px]'>
                            <div className="flex justify-between items-center mb-4">
                                <div className='flex items-center'>
                                    <h6 className='text-white text-[18px] font-[600] me-2'>AnyScale</h6>
                                    <img src={scale} alt="" />
                                </div>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        className="w-5 h-5 text-red-500 bg-transparent border-white/20 rounded-[2px] j_checkBox"
                                    />
                                    <span className="ml-2 text-sm md:text-xs text-white font-[400]">
                                        Favorites
                                    </span>
                                </label>
                            </div>
                            <div className="flex justify-between items-center bg-[#1F1F1F] p-[10px] w-full mb-2 cursor-pointer hover:bg-[#343336]">
                                <div className="flex items-center">
                                    <div className='w-[30px] h-[30px] rounded-[2px] relative me-3'>
                                        <img src={profile} alt="Album" className="w-full h-full object-cover" />
                                        <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                            <img src={playblack} alt="" />
                                        </button>
                                    </div>
                                    <div className='text-white text-sm font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                </div>
                                <div className='flex justify-between'>
                                    <FaRegHeart className='text-[#FFFFFF99] text-[16px] me-3' />
                                    <FaPlus className='text-[#FFFFFF99] text-[16px]' />
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-[#1F1F1F] p-[10px] w-full mb-2 cursor-pointer hover:bg-[#343336]">
                                <div className="flex items-center">
                                    <div className='w-[30px] h-[30px] rounded-[2px] relative me-3'>
                                        <img src={profile} alt="Album" className="w-full h-full object-cover" />
                                        <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                            <img src={playblack} alt="" />
                                        </button>
                                    </div>
                                    <div className='text-white text-sm font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                </div>
                                <div className='flex justify-between'>
                                    <FaRegHeart className='text-[#FFFFFF99] text-[16px] me-3' />
                                    <FaPlus className='text-[#FFFFFF99] text-[16px]' />
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-[#1F1F1F] p-[10px] w-full mb-2 cursor-pointer hover:bg-[#343336]">
                                <div className="flex items-center">
                                    <div className='w-[30px] h-[30px] rounded-[2px] relative me-3'>
                                        <img src={profile} alt="Album" className="w-full h-full object-cover" />
                                        <button className='absolute top-[50%] left-[50%] w-[20px] h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                            <img src={playblack} alt="" />
                                        </button>
                                    </div>
                                    <div className='text-white text-sm font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                </div>
                                <div className='flex justify-between'>
                                    <FaRegHeart className='text-[#FFFFFF99] text-[16px] me-3' />
                                    <FaPlus className='text-[#FFFFFF99] text-[16px]' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

            <button className='p-2 bg-white text-black' onClick={() => setShowOffcanvas(prev => !prev)}>
                on/off
            </button>

            {showOffcanvas && (
                <>

                    {/* Offcanvas */}
                    <div className="absolute top-0  right-0 h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)] bg-[#222] z-50 shadow-lg transition-transform duration-300 transform translate-x-0 overflow-auto  lg:w-[30%] 2xl:w-[25%] 3xl:w-[23%]">

                        {/* Place your offcanvas content here */}
                        <div className=" text-white bg-[#141414]">
                            <div className=' border-l border-[1px] border-[#FFFFFF1A] bg-transparent'>
                                <div className='lg:px-[12px] 3xl:px-[16px]'>
                                    <div className='lg:py-[16px] 3xl:py-[20px] border-b border-[#FFFFFF1A]'>
                                        <h5 className='text-white lg:text-[20px] font-[600]'>Loops and one-shots</h5>
                                    </div>
                                    <div className="w-full max-w-md mx-auto lg:py-[16px] 3xl:py-[20px]">
                                        <div className="relative lg:mb-3 3xl:mb-4">
                                            <div className="relative flex items-center">
                                                <IoSearch className="absolute lg:left-3 lg:h-5 lg:w-5 text-[#FFFFFF99]" />
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    className="w-full bg-[#222222] lg:text-[14px] font-[400] text-white placeholder-gray-400 rounded-[4px] lg:pl-10 lg:pr-4 lg:py-2 outline-none  focus:outline-none transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                        <div className='flex flex-wrap lg:gap-2 3xl:gap-3'>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Beats</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>One-shots</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>My Loops</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Hip Hop</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                            <div className='bg-[#1F1F1F] lg:w-[64px] xl:w-[83px] 2xl:w-[77px] 3xl:w-[70px] rounded-[2px] text-white lg:text-[12px] lg:py-[4px] xl:py-[5px] text-center cursor-pointer hover:bg-[#343336]'>Originals</div>
                                        </div>
                                    </div>
                                    <div className='lg:py-[8px] xl:py-[10px] 3xl:py-[14px]'>
                                        <div className="flex justify-between items-center lg:mb-2 xl:mb-3 3xl:mb-4">

                                            <h6 className={showAll === true ? `hidden` : `text-white lg:text-[14px] xl:text-[16px] 3xl:text-[18px] font-[600]`}>Top Sound packs</h6>

                                            <p className={showAll === true ? `hidden` : `lg:text-[10px] xl:text-[12px] 3xl:text-[14px] text-[#FFFFFF99] cursor-pointer`} onClick={() => setShowAll(true)} >Show all</p>

                                            <p className={showAll === false ? `hidden` : `text-white flex lg:gap-2  lg:text-[12px] xl:text-[14px] 3xl:text-[16px] items-center`} onClick={() => setShowAll(false)}>
                                                <FaAngleLeft className='text-white' />
                                                Sound packs
                                            </p>
                                        </div>
                                        <div className="flex items-center lg:gap-2 xl:gap-3">
                                            <div className="lg:w-1/3 d_customborder rounded-[4px]">
                                                <div className='lg:w-full lg:h-[80px] relative'>
                                                    <img src={profile} alt="Album" className="lg:w-full lg:h-[80px] xl:h-full object-cover" />
                                                    <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={play} alt="" />
                                                    </button>
                                                </div>
                                                <div className="lg:p-[8px] 3xl:p-[10px]">
                                                    <h3 className="text-[#fff] font-[500] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                    <p className="text-[#FFFFFF99] font-[400] lg:text-[10px]">Rave</p>
                                                </div>
                                            </div>
                                            <div className="lg:w-1/3 d_customborder rounded-[4px]">
                                                <div className='lg:w-full lg:h-[80px] relative'>
                                                    <img src={profile} alt="Album" className="lg:w-full lg:h-[80px] xl:h-full object-cover" />
                                                    <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={play} alt="" />
                                                    </button>
                                                </div>
                                                <div className="lg:p-[8px] 3xl:p-[10px]">
                                                    <h3 className="text-[#fff] font-[500] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                    <p className="text-[#FFFFFF99] font-[400] lg:text-[10px]">Rave</p>
                                                </div>
                                            </div>
                                            <div className="lg:w-1/3 d_customborder rounded-[4px]">
                                                <div className='lg:w-full lg:h-[80px] relative'>
                                                    <img src={profile} alt="Album" className="lg:w-full lg:h-[80px] xl:h-full object-cover" />
                                                    <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={play} alt="" />
                                                    </button>
                                                </div>
                                                <div className="lg:p-[8px] 3xl:p-[10px]">
                                                    <h3 className="text-[#fff] font-[500] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                    <p className="text-[#FFFFFF99] font-[400] lg:text-[10px]">Rave</p>
                                                </div>
                                            </div>
                                        </div>
                                        {showAll &&
                                            <div className="flex items-center 3pt-5 gap-3">
                                                <div className="lg:w-1/3 d_customborder rounded-[4px]">
                                                    <div className='lg:w-full lg:h-[80px] relative'>
                                                        <img src={profile} alt="Album" className="lg:w-full lg:h-[80px] xl:h-full object-cover" />
                                                        <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                            <img src={play} alt="" />
                                                        </button>
                                                    </div>
                                                    <div className="lg:p-[8px] 3xl:p-[10px]">
                                                        <h3 className="text-[#fff] font-[500] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                        <p className="text-[#FFFFFF99] font-[400] lg:text-[10px]">Rave</p>
                                                    </div>
                                                </div>
                                                <div className="lg:w-1/3 d_customborder rounded-[4px]">
                                                    <div className='lg:w-full lg:h-[80px] relative'>
                                                        <img src={profile} alt="Album" className="lg:w-full lg:h-[80px] xl:h-full object-cover" />
                                                        <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                            <img src={play} alt="" />
                                                        </button>
                                                    </div>
                                                    <div className="lg:p-[8px] 3xl:p-[10px]">
                                                        <h3 className="text-[#fff] font-[500] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                        <p className="text-[#FFFFFF99] font-[400] lg:text-[10px]">Rave</p>
                                                    </div>
                                                </div>
                                                <div className="lg:w-1/3 d_customborder rounded-[4px]">
                                                    <div className='lg:w-full lg:h-[80px] relative'>
                                                        <img src={profile} alt="Album" className="lg:w-full lg:h-[80px] xl:h-full object-cover" />
                                                        <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[24px] lg:h-[24px] bg-[#14141480] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                            <img src={play} alt="" />
                                                        </button>
                                                    </div>
                                                    <div className="lg:p-[8px] 3xl:p-[10px]">
                                                        <h3 className="text-[#fff] font-[500] lg:text-[10px] xl:text-[12px] lg:mb-[2px]">ENERGY</h3>
                                                        <p className="text-[#FFFFFF99] font-[400] lg:text-[10px]">Rave</p>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div className='lg:pt-[12px] xl:pt-[14px] 3xl:pt-[18px]'>
                                        <div className="flex justify-between items-center lg:mb-2 3xl:mb-3">
                                            <div className='flex items-center'>
                                                <h6 className='text-white lg:text-[14px] xl:text-[16px] 3xl:text-[18px] font-[600] lg:me-2'>AnyScale</h6>
                                                <img src={scale} alt="" />
                                            </div>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="rememberMe"
                                                    className="lg:w-4 lg:h-4 3xl:w-5 3xl:h-5 text-red-500 bg-transparent border-white/20 rounded-[2px] j_checkBox"
                                                />
                                                <span className="lg:ml-2 xl:text-[12px] 3xl:text-[14px] text-white font-[400]">
                                                    Favorites
                                                </span>
                                            </label>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#1F1F1F] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] lg:w-full lg:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative lg:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white lg:text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px] lg:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
                                        </div>
                                         <div className="flex justify-between items-center bg-[#1F1F1F] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] lg:w-full lg:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative lg:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white lg:text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px] lg:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
                                        </div>
                                         <div className="flex justify-between items-center bg-[#1F1F1F] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] lg:w-full lg:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative lg:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white lg:text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px] lg:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
                                        </div>
                                         <div className="flex justify-between items-center bg-[#1F1F1F] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] lg:w-full lg:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative lg:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white lg:text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px] lg:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px]' />
                                            </div>
                                        </div>
                                         <div className="flex justify-between items-center bg-[#1F1F1F] lg:p-[6px] xl:p-[8px] 3xl:p-[10px] lg:w-full lg:mb-2 cursor-pointer hover:bg-[#343336]">
                                            <div className="flex items-center">
                                                <div className='lg:w-[26px] lg:h-[26px] 3xl:w-[30px] 3xl:h-[30px] rounded-[2px] relative lg:me-2 3xl:me-3'>
                                                    <img src={profile} alt="Album" className="lg:w-[20px} lg:h-[20px] xl:w-[24px] xl:h-[24px] 3xl:w-full 3xl:h-full object-cover" />
                                                    <button className='absolute lg:top-[50%] lg:left-[50%] lg:w-[16px] lg:h-[16px] xl::w-[20px] xl:h-[20px] bg-[#FFFFFF33] rounded-full translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'>
                                                        <img src={playblack} alt="" />
                                                    </button>
                                                </div>
                                                <div className='text-white lg:text-[10px] xl:text-[12px] 3xl:text-[14px] font-[500]'>High Fashion - Hustle (Songstarter)</div>
                                            </div>
                                            <div className='flex justify-between'>
                                                <FaRegHeart className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px] lg:me-2 3xl:me-3' />
                                                <FaPlus className='text-[#FFFFFF99] lg:text-[12px] xl:text-[14px] 3xl:text-[16px]' />
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
