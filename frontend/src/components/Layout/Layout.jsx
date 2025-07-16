import React from 'react'
import Sidebar from './Sidebar'
// import Home2 from '../Home2'
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <>
            <div className='flex bg-[#141414] w-full h-screen'>
                <div className="w-[22%] lg:w-[20%] xl:w-[17%] 2xl:w-[15%] border-r border-[#FFFFFF1A] md:block hidden">
                    <Sidebar />
                </div>
                <div className="w-[78%] lg:w-[80%] xl:w-[83%] 2xl:w-[85%]">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default Layout