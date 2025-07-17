import React from 'react';
import { RxZoomIn, RxZoomOut } from "react-icons/rx";
import { HiOutlineSpeakerWave } from "react-icons/hi2";

const BottomToolbar = () => {



    return (
        <>
            <div className="flex justify-between bg-[#141414] border-t border-[#FFFFFF1A] px-2 py-2 sm:px-3 sm:py-1 md:px-5 md:py-2 xl:px-7">
                <div className='flex gap-7 items-center'>
                    <HiOutlineSpeakerWave className='text-white text-[24px]' />
                </div>

                <div className='flex gap-7 items-center'>
                    <RxZoomIn className='text-[#FFFFFF99] text-[24px]' />
                    <RxZoomOut className='text-[#FFFFFF99] text-[24px]' />
                </div>
            </div>
        </>
    )
}

export default BottomToolbar


