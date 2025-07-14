import React from 'react'
import Sidebar from './Sidebar'
import Home2 from '../Home2'
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <>
            <div className='flex bg-[#141414] w-full h-screen'>
                <div className="w-[15%] border-r border-[#FFFFFF1A]">
                    <Sidebar />
                </div>
                <div className="w-[85%]">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default Layout