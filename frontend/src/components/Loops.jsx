import React from 'react'
import { IoSearch } from 'react-icons/io5'
import profile from '../Images/Profile.svg'
import play from '../Images/play.svg';
import pause from '../Images/pause.svg';
import scale from '../Images/scale.svg';
import playblack from '../Images/playblack.svg';
import { FaPlus, FaRegHeart } from "react-icons/fa";


const Loops = () => {
    return (
        <>

            <div className='flex justify-end'>
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
            </div>

        </>
    )
}

export default Loops
