import React from 'react';
import TopHeader from './Layout/TopHeader';
import { Outlet } from 'react-router-dom';
import BottomToolbar from './Layout/BottomToolbar';

const Sidebar2 = () => {
    return (

        <>
            <TopHeader />

            <div className="flex h-[calc(100vh-82px)] sm:h-[calc(100vh-66px)] md:h-[calc(100vh-96px)]">
                <div className="border-r border-[#1414141A] dark:border-[#FFFFFF1A] w-[20%] sm:w-[23%] md:w-[22%] lg:w-[20%] xl:w-[17%] 2xl:w-[15%] bg-primary-light dark:bg-primary-dark">
                    <div className=" mt-12 sm:mt-16 md:mt-20">
                        <p className="flex gap-2 py-4 text-secondary-light dark:text-secondary-dark bg-[#1414141A] dark:bg-[#FFFFFF1A] justify-center text-center items-center">
                           + Add <span className='hidden md:block'>New Track</span> 
                        </p>
                    </div>
                </div>

                <div className="w-[80%] sm:w-[77%] md:w-[78%]  lg:w-[80%] xl:w-[83%] 2xl:w-[85%] bg-primary-light dark:bg-primary-dark   ">
                    <Outlet />
                </div>
            </div>

            <BottomToolbar />
        </>
    )
}

export default Sidebar2