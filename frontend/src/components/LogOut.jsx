import React from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import close from '../Images/close.svg';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../Redux/Slice/auth.slice';
import { useNavigate } from 'react-router-dom';

const LogOut = ({ logoutModalOpen, setLogoutModalOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      dispatch(logoutUser(userId));
    }
    setLogoutModalOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <Dialog open={logoutModalOpen} onClose={setLogoutModalOpen} className="relative z-10">
      <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-[#1F1F1F]">
              <div className="flex justify-end items-center">
                <img src={close} alt="close" onClick={() => setLogoutModalOpen(false)} className="cursor-pointer" />
              </div>
            </div>
            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
              <div className='text-center'>
                <div className='text-base text-[#FFFFFF] font-[600] mb-[20px]'>Logout</div>
                <p className='text-[#FFFFFF99] text-sm font-[400] w-[260px] m-auto'>Are you sure you want <br /> to log out?</p>
              </div>
              <div className="text-center md:pt-[40px] pt-[20px] flex justify-center gap-4">
                <button className="d_btn d_cancelbtn" onClick={() => setLogoutModalOpen(false)}>Cancel</button>
                <button className="d_btn bg-[#FFFFFF]" onClick={handleLogout}>Yes, Logout</button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default LogOut;