import React from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Tabs from './Tabs';
import newProjectIcon from '../Images/new-project.svg';
import mm1 from '../Images/np-1.png';
import mm2 from '../Images/np-2.png';
import mm3 from '../Images/np-3.png';
import { useDispatch } from 'react-redux';
import { resetStudio } from '../Redux/Slice/studio.slice';
import { ReactComponent as Close } from '../Images/closeicon.svg';
import { useNavigate } from 'react-router-dom';

const NewProject = ({ open, setOpen, showClose = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCreateNew = () => {
    try {
      dispatch(resetStudio());
      // navigate('/sidebar/timeline');
    } finally {
      setOpen(false);
    }
  };
  return (
    <Dialog open={open} onClose={() => {}} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel className="relative bg-white dark:bg-[#232323] rounded-lg shadow-xl w-full max-w-lg mx-auto p-0">
            <div className="w-full px-8 pt-6 pb-6">
              {showClose && (
              <div className="flex justify-end mb-3">
                <Close onClick={() => setOpen(false)} className="cursor-pointer text-gray-500 dark:text-[#bdbdbd]" />
              </div>
              )}
              <Tabs
                tabs={[
                  {
                    label: 'New Project',
                    content: (
                      <div className="flex flex-col items-center w-1/2">
                        <div className="bg-gray-100 dark:bg-[#322d3c] rounded-t-lg w-full flex flex-col items-center justify-center py-14 sm:py-5 md:py-14 cursor-pointer" onClick={handleCreateNew}>
                          <img src={newProjectIcon} alt="Music Note" className="w-12 h-12 mb-2" />
                        </div>
                        <button className="w-full bg-[#9b7ae7] text-white py-4 sm:py-2 md:py-4 rounded-b-lg font-medium text-lg transition-colors hover:bg-[#8a6ad6] dark:hover:bg-[#8a6ad6]" onClick={handleCreateNew}>Music</button>
                      </div>
                    ),
                  },
                  {
                    label: 'Demos',
                    content: (
                      <div className="items-center justify-center text-gray-800 dark:text-white opacity-60">
                        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-4 md:gap-6"> 
                          <div className="flex flex-col items-center">
                            <img src={mm1} alt="Hyperpop" className="w-full h-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Hyperpop</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <img src={mm2} alt="Soul" className="w-full h-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Soul</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <img src={mm3} alt="Pop" className="w-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Pop</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <img src={mm1} alt="Hyperpop" className="w-full h-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Hyperpop</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <img src={mm2} alt="Soul" className="w-full h-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Soul</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <img src={mm3} alt="Pop" className="w-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Pop</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <img src={mm1} alt="Hyperpop" className="w-full h-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Hyperpop</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <img src={mm2} alt="Soul" className="w-full h-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Soul</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <img src={mm3} alt="Pop" className="w-full object-cover rounded-t-md" />
                            <div className="border border-gray-200 dark:border-gray-600 w-full text-center py-2 sm:py-1 md:py-2 text-gray-800 dark:text-white text-[16px] font-medium">Pop</div>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default NewProject