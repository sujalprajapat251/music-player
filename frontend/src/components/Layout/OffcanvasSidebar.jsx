import React from 'react';
import profileimg from "../../Images/ProfileImg.svg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import profile from "../../Images/Profile.svg";
import subscription from "../../Images/subscriptionIcon.svg";
import Logout from "../../Images/Logout.svg";
import project from "../../Images/projectsIcon.svg";
import Demo from "../../Images/DemoIcon.svg";
import { IoClose } from "react-icons/io5";

const OffcanvasSidebar = ({ isOpen, onClose, activeItem, setActiveItem }) => {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {isOpen && (
                <button
                    onClick={onClose}
                    className="fixed top-1 left-[230px] z-[60] w-10 h-10  flex items-center justify-center shadow-lg md:hidden"
                >
                    <IoClose size={20} className="text-white" />
                </button>
            )}

            {/* Offcanvas Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-[230px] bg-[#141414] border-r border-[#FFFFFF1A] z-50 transform transition-transform duration-300 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>



                {/* Three Dots Menu */}
                <div className="flex justify-between bg-[#FFFFFF1A] py-2 px-4">
                    <div className="flex">
                        <div className="V_profile_img">
                            <img src={profileimg} alt="profile img" className='w-[30px] h-[30px]' />
                        </div>
                        <div className="V_profile_name text-white ps-3 my-auto text-[14px]">
                            Johan Patel
                        </div>
                    </div>
                    <div className='my-auto'>
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <MenuButton className="outline-none">
                                    <BsThreeDotsVertical className='text-white' />
                                </MenuButton>
                            </div>
                            <MenuItems
                                transition
                                className="absolute left-0 mt-3 z-30 w-40 origin-top-right bg-[#1f1f1f] shadow-lg outline-none rounded-md"
                            >
                                <div className="">
                                    <MenuItem>
                                        <p className="block px-5 py-2 hover:bg-gray-800 cursor-pointer">
                                            <div className="flex">
                                                <img src={profile} alt="" />
                                                <p className="text-white ps-3 font-semibold text-[14px]">Profile</p>
                                            </div>
                                        </p>
                                    </MenuItem>
                                    <MenuItem>
                                        <p className="block px-5 py-2 hover:bg-gray-800 cursor-pointer">
                                            <div className="flex">
                                                <img src={subscription} alt="" />
                                                <p className="text-white ps-3 font-semibold text-[14px]">Subscription</p>
                                            </div>
                                        </p>
                                    </MenuItem>
                                    <MenuItem>
                                        <p className="block px-5 py-2 hover:bg-gray-800 cursor-pointer">
                                            <div className="flex">
                                                <img src={Logout} alt="" />
                                                <p className="text-[#FF0000] ps-3 font-semibold text-[14px]">Logout</p>
                                            </div>
                                        </p>
                                    </MenuItem>
                                </div>
                            </MenuItems>
                        </Menu>
                    </div>
                </div>

                {/* Upgrade Now Section */}
                <div className="flex bg-white justify-center mt-4 mb-6 mx-4 rounded-3xl p-2">
                    <img src={subscription} alt="" />
                    <p className="text-black ps-3 text-[14px] font-semibold">Upgrade Now</p>
                </div>

                {/* Navigation Items */}
                <div
                    className={`flex border-l-4 px-4 py-3 cursor-pointer ${activeItem === "Projects" ? "border-[#fff] bg-[#2b2b2b]" : "border-[#1f1f1f]"
                        }`}
                    onClick={() => setActiveItem("Projects")}
                >
                    <img src={project} alt="" />
                    <p className="text-white ps-3 font-semibold text-[14px]">Projects</p>
                </div>

                <div
                    className={`flex border-l-4 px-4 py-3 cursor-pointer ${activeItem === "Demo Projects" ? "border-[#fff] bg-[#2b2b2b]" : "border-[#1f1f1f]"
                        }`}
                    onClick={() => setActiveItem("Demo Projects")}
                >
                    <img src={Demo} alt="" />
                    <p className="text-white ps-3 text-[14px] font-semibold">Demo Projects</p>
                </div>
            </div>
        </>
    );
};

export default OffcanvasSidebar;