// import React from 'react'
// import Sidebar from './Sidebar'
// // import Home2 from '../Home2'
// import { Outlet } from 'react-router-dom';

// const Layout = () => {
//     return (
//         <>
//             <div className='flex bg-[#141414] w-full h-screen'>
//                 <div className="w-[22%] lg:w-[20%] xl:w-[17%] 2xl:w-[15%] border-r border-[#FFFFFF1A] hidden md:block">
//                     <Sidebar />
//                 </div>
//                 <div className="w-[100%] md:w-[78%] lg:w-[80%] xl:w-[83%] 2xl:w-[85%]">
//                     <Outlet />
//                 </div>
//             </div>
//         </>
//     )
// }

// export default Layout


import React, { useState, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import OffcanvasSidebar from './OffcanvasSidebar';
import { Outlet } from 'react-router-dom';

// Create context for offcanvas state
const OffcanvasContext = createContext();

// Custom hook to use offcanvas context
export const useOffcanvas = () => {
    const context = useContext(OffcanvasContext);
    if (!context) {
        throw new Error('useOffcanvas must be used within OffcanvasProvider');
    }
    return context;
};

const Layout = () => {
    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("Projects");

    const openOffcanvas = () => setIsOffcanvasOpen(true);
    const closeOffcanvas = () => setIsOffcanvasOpen(false);

    return (
        <OffcanvasContext.Provider value={{
            isOffcanvasOpen,
            openOffcanvas,
            closeOffcanvas,
            activeItem,
            setActiveItem
        }}>
            <div className='flex bg-[#141414] w-full h-screen relative'>
                {/* Desktop Sidebar */}
                <div className="w-[22%] lg:w-[20%] xl:w-[17%] 2xl:w-[15%] border-r border-[#FFFFFF1A] hidden md:block">
                    <Sidebar />
                </div>

                {/* Mobile Offcanvas Sidebar */}
                <OffcanvasSidebar
                    isOpen={isOffcanvasOpen}
                    onClose={closeOffcanvas}
                    activeItem={activeItem}
                    setActiveItem={setActiveItem}
                />

                {/* Main Content */}
                <div className="w-[100%] md:w-[78%] lg:w-[80%] xl:w-[83%] 2xl:w-[85%]">
                    <Outlet />
                </div>
            </div>
        </OffcanvasContext.Provider>
    );
};

export default Layout;