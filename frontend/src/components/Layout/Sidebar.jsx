import React, { useEffect, useState } from 'react';
import profileimg from "../../Images/ProfileImg.svg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import profile from "../../Images/Profile.svg";
import subscription from "../../Images/subscriptionIcon.svg";
import Logout from "../../Images/Logout.svg";
import project from "../../Images/projectsIcon.svg";
import Demo from "../../Images/DemoIcon.svg";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById } from '../../Redux/Slice/user.slice';

const Sidebar = () => {

  const dispatch = useDispatch();

  const [activeItem, setActiveItem] = useState("Projects"); // default selected

  const navigate = useNavigate();
  const curruser = useSelector((state) => state.user.currUser);

  useEffect(() => {
    dispatch(getUserById());
  }, [dispatch])

  return (
    <>
      <div className="flex items-center justify-between bg-[#FFFFFF1A] md:py-2 md:px-3 lg:py-3 lg:px-4 2xl:py-4 2xl:px-5 3xl:py-5 3xl:px-10" >
        <div className="flex items-center">
          <div className="V_profile_img ">
            <img src={profileimg} alt="profile img" className='w-[30px] h-[30px] lg:w-full' />
          </div>
          <div className="V_profile_name text-white md:ps-2 lg:ps-3 2xl:ps-3 3xl:ps-4 my-auto text-[14px] xl:text-[16px]">
            {curruser?.firstName} {curruser?.lastName}
          </div>
        </div>
        <div className='my-auto'>
          <Menu as="div" className="relative inline-block text-left ">
            <div>
              <MenuButton className="outline-none" >
                <BsThreeDotsVertical className='text-white ' />
              </MenuButton>
            </div>
            <MenuItems
              transition
              className="absolute left-0 md:mt-3 2xl:mt-3 3xl:mt-4 z-30 w-40 2xl:w-48 origin-top-right  bg-[#1f1f1f] shadow-lg outline-none rounded-md"
            >
              <div className="">
                <MenuItem >
                  <p className="block md:px-5 lg:px-6 md:py-1  2xl:px-7 xl:py-2  3xl:px-9 3xl:py-3   hover:bg-gray-800 cursor-pointer" >
                    <div className="flex">
                      <img src={profile} alt="" />
                      <p className="text-white md:ps-2 lg:ps-3 xl:ps-4 3xl:ps-4 font-semibold text-[14px] xl:text-[16px]">Profile</p>
                    </div>
                  </p>
                </MenuItem>
                <MenuItem >
                  <p className="block md:px-5 lg:px-6 md:py-1 2xl:px-7 xl:py-2  3xl:px-9 3xl:py-3  hover:bg-gray-800 cursor-pointer" >
                    <div className="flex">
                      <img src={subscription} alt="" />
                      <p className="text-white md:ps-2 lg:ps-3 xl:ps-3 3xl:ps-4 font-semibold text-[14px] xl:text-[16px]">Subscription</p>
                    </div>
                  </p>
                </MenuItem>
                <MenuItem >
                  <p className="block md:px-5 lg:px-6 md:py-1 2xl:px-7 xl:py-2  3xl:px-9 3xl:py-3   hover:bg-gray-800 cursor-pointer" >
                    <div className="flex">
                      <img src={Logout} alt="" />
                      <p className=" text-[#FF0000] md:ps-2 lg:ps-3 xl:ps-3 3xl:ps-4 font-semibold text-[14px] xl:text-[16px]">Logout</p>
                    </div>
                  </p>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>

      <div className="flex bg-white justify-center md:mt-3 md:mb-5 md:mx-4 lg:mt-4 lg:mb-6 lg:mx-5 xl:mt-5 xl:mb-7 xl:mx-7 3xl:mt-6  3xl:mb-9 3xl:mx-9 rounded-3xl md:p-1 lg:p-2">
        <img src={subscription} alt="" />
        <p className="text-black md:ps-2 lg:ps-3 3xl:ps-4 text-[14px] xl:text-[16px] font-semibold">Upgrade Now</p>
      </div>

      <div className={`flex border-l-4 md:px-4 md:py-2 lg:px-5 xl:py-3 xl:px-6 2xl:py-4 2xl:px-7 3xl:py-5 3xl:px-9 ${activeItem === "Projects" ? "border-[#fff] bg-[#2b2b2b]" : "border-[#1f1f1f]"}`}
        onClick={() => { setActiveItem("Projects"); navigate('project') }}
      >
        <img src={project} alt="" />
        <p className="text-white md:ps-2 lg:ps-3 3xl:ps-4 font-semibold text-[14px] xl:text-[16px]">Projects</p>
      </div>

      <div className={`flex border-l-4 md:px-4 md:py-2 lg:px-5 xl:py-3 xl:px-6  2xl:py-4 2xl:px-7 3xl:py-5 3xl:px-9 ${activeItem === "Demo Projects" ? "border-[#fff] bg-[#2b2b2b]" : "border-[#1f1f1f]"}`}
        onClick={() => { setActiveItem("Demo Projects"); navigate('demo-project') }}
      >
        <img src={Demo} alt="" />
        <p className="text-white md:ps-2 lg:ps-3 3xl:ps-4  text-[14px] xl:text-[16px] font-semibold">Demo Projects</p>
      </div>

    </>
  )
}

export default Sidebar