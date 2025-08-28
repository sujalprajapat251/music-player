import React from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Tabs from './Tabs';
import newProjectIcon from '../Images/new-project.svg';
import mm1 from '../Images/np-1.png';
import mm2 from '../Images/np-2.png';
import mm3 from '../Images/np-3.png';

const NewProject = ({ open, setOpen }) => {
  return (
    <Dialog open={open} onClose={() => {}} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel className="relative bg-[#232323] rounded-lg shadow-xl w-full max-w-md mx-auto p-0">
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full px-8 pt-8 pb-6">
              <Tabs
                tabs={[
                  {
                    label: 'New Project',
                    content: (
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-100 rounded-t-lg w-full flex flex-col items-center justify-center py-8 cursor-pointer" onClick={() => setOpen(false)}>
                          <img src={newProjectIcon} alt="Music Note" className="w-12 h-12 mb-2" />
                        </div>
                        <button className="w-full bg-blue-500 text-white py-3 rounded-b-lg font-medium text-lg hover:bg-blue-600 transition-colors" onClick={() => setOpen(false)}>Music</button>
                      </div>
                    ),
                  },
                  {
                    label: 'Demos',
                    content: (
                      <div className="items-center justify-center min-h-[120px] text-white opacity-60">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center w-[120px]">
                            <img src={mm1} alt="Hyperpop" className="w-full h-[90px] object-cover rounded-t-md" />
                            <div className="bg-black w-full rounded-b-md text-center py-2 text-[#FFFFFF] text-[16px] font-medium">Hyperpop</div>
                          </div>
                          <div className="flex flex-col items-center w-[120px]">
                            <img src={mm2} alt="Soul" className="w-full h-[90px] object-cover rounded-t-md" />
                            <div className="bg-black w-full rounded-b-md text-center py-2 text-[#FFFFFF] text-[16px] font-medium">Soul</div>
                          </div>
                          <div className="flex flex-col items-center w-[120px]">
                            <img src={mm3} alt="Pop" className="w-full h-[90px] object-cover rounded-t-md" />
                            <div className="bg-black w-full rounded-b-md text-center py-2 text-[#FFFFFF] text-[16px] font-medium">Pop</div>
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