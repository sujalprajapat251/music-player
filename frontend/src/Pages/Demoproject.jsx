import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAllSound } from '../Redux/Slice/sound.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import { useOffcanvas } from '../components/Layout/Layout';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import play from '../Images/play.svg';
import pause from '../Images/pause.svg';
import close from '../Images/close.svg';
import { HiMenu } from "react-icons/hi";
import ThemeToggle from '../components/ThemeToggle';

const Demoproject = () => {

    const { openOffcanvas } = useOffcanvas();

    const dispatch = useDispatch();
    const sounds = useSelector((state) => state.sound.allsounds)
    const audioRefs = useRef([]);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [addfoldermodal, setAddFolderModal] = useState(false)
    const [renamemodal, setRenameModal] = useState(false);
    const [deletepromodal, setDeleteProModal] = useState(false);
    const [restorepromodal, setRestoreProModal] = useState(false);
    const [permanentlypromodal, setPermanentlyProModal] = useState(false);
    const [restoreallpromodal, setRestoreAllProModal] = useState(false);
    const [permanentlyallpromodal, setPermanentlyAllProModal] = useState(false);

    useEffect(() => {
        dispatch(getAllSound());
    }, [dispatch])

    const handlePlayPause = (index) => {
        if (playingIndex === index) {
            audioRefs.current[index].pause();
            setPlayingIndex(null);
        } else {
            audioRefs.current.forEach((audio, i) => {
                if (audio && i !== index) audio.pause();
            });
            if (audioRefs.current[index]) {
                audioRefs.current[index].play();
                setPlayingIndex(index);
            }
        }
    };

    const handleEnded = (index) => {
        if (playingIndex === index) {
            setPlayingIndex(null);
        }
    };

    return (
        <>
            <div className=" bg-[#141414] p-8">
                <div className='sticky top-0 left-0 bg-[#141414]'>
                    <div className="flex gap-3 text-white items-center">
                        <div className="md:hidden mb-4">
                            <button
                                onClick={openOffcanvas}
                                className="flex items-center justify-center w-10 h-10 bg-[#2b2b2b] rounded-lg border border-[#FFFFFF1A] hover:bg-[#3b3b3b] transition-colors"
                            >
                                <HiMenu className="text-white text-xl" />
                            </button>
                        </div>
                        <h2 className='text-[30px] font-[600] text-[#fff] md:mb-[30px] mb-[15px]'>Demo projects</h2>
                    </div>
                    <h4 className='text-[24px] font-[600] text-[#fff] mb-[10px]'>Explore demo projects</h4>
                    <p className='text-sm font-[400] text-[#fff] mb-[20px]'>Explore curated demo projects showcasing our latest soundpacks.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 3xl:grid-cols-7 gap-6 max-h-[70vh] overflow-auto d_customscrollbar">
                    {sounds.map((sound, index) => (
                        <div key={sound._id || index} className="bg-[#14141480] rounded-[4px] overflow-hidden d_customborder">
                            <div className='w-full h-[160px]'>
                                <img src={`${IMAGE_URL}uploads/image/${sound?.image}`} alt="Album" className="w-full h-full object-cover" />
                            </div>
                            <div className="py-[8px] px-[12px]">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-[#fff] font-[500] text-[16px] mb-[2px]">{sound?.soundname}</h3>
                                        <p className="text-[#FFFFFF99] font-[400] text-[14px]">{sound?.soundtype}</p>
                                    </div>
                                    <button
                                        onClick={() => handlePlayPause(index)}
                                        className="bg-[#141414] text-black rounded-full w-[28px] h-[28px] flex justify-center items-center border-[0.5px] border-[#FFFFFF1A]"
                                    >
                                        <img src={playingIndex === index ? pause : play} alt="" />
                                    </button>
                                    <audio
                                        ref={el => audioRefs.current[index] = el}
                                        src={`${IMAGE_URL}uploads/soundfile/${sound?.soundfile}`}
                                        onEnded={() => handleEnded(index)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {sounds.map((sound, index) => (
                        <div key={sound._id || index} className="bg-[#14141480] rounded-[4px] overflow-hidden d_customborder">
                            <div className='w-full h-[160px]'>
                                <img src={`${IMAGE_URL}uploads/image/${sound?.image}`} alt="Album" className="w-full h-full object-cover" />
                            </div>
                            <div className="py-[8px] px-[12px]">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-[#fff] font-[500] text-[16px] mb-[2px]">{sound?.soundname}</h3>
                                        <p className="text-[#FFFFFF99] font-[400] text-[14px]">{sound?.soundtype}</p>
                                    </div>
                                    <button
                                        onClick={() => handlePlayPause(index)}
                                        className="bg-[#141414] text-black rounded-full w-[28px] h-[28px] flex justify-center items-center border-[0.5px] border-[#FFFFFF1A]"
                                    >
                                        <img src={playingIndex === index ? pause : play} alt="" />
                                    </button>
                                    <audio
                                        ref={el => audioRefs.current[index] = el}
                                        src={`${IMAGE_URL}uploads/soundfile/${sound?.soundfile}`}
                                        onEnded={() => handleEnded(index)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* New Folder Modal */}
            <Dialog open={addfoldermodal} onClose={setAddFolderModal} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:px-[10px] px-[20px]">
                                <div className="md:py-[20px] py-[10px] md:px-[10px] bg-[#1F1F1F] border-b-[0.5px] border-b-[#FFFFFF1A]">
                                    <div className="flex justify-between items-center">
                                        <div className="sm:text-xl text-lg font-[600] text-[#fff]">New Folder</div>
                                        <img src={close} alt="" onClick={() => setAddFolderModal(false)} className="cursor-pointer" />
                                    </div>
                                </div>
                                <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                    <div className=''>
                                        <div className='text-sm text-[#FFFFFF] font-[400] mb-[10px]'>Folder Name</div>
                                        <input type="text" placeholder='Folder Name' className='text-[#FFFFFF99] rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]' />
                                    </div>
                                    <div className="text-center md:pt-[40px] pt-[20px]">
                                        <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => setAddFolderModal(false)}>Cancel </button>
                                        <button className="d_btn d_createbtn">Create</button>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Rename Modal */}
            <Dialog open={renamemodal} onClose={setRenameModal} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:px-[10px] px-[20px]">
                                <div className="md:py-[20px] py-[10px] md:px-[10px] bg-[#1F1F1F] border-b-[0.5px] border-b-[#FFFFFF1A]">
                                    <div className="flex justify-between items-center">
                                        <div className="sm:text-xl text-lg font-[600] text-[#fff]">Rename</div>
                                        <img src={close} alt="" onClick={() => setRenameModal(false)} className="cursor-pointer" />
                                    </div>
                                </div>
                                <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                    <div className=''>
                                        <div className='text-sm text-[#FFFFFF] font-[400] mb-[10px]'>Name</div>
                                        <input type="text" placeholder='Untitled_Song' className='text-[#FFFFFF99] rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]' />
                                    </div>
                                    <div className="text-center md:pt-[40px] pt-[20px]">
                                        <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => setRenameModal(false)}>Cancel </button>
                                        <button className="d_btn d_createbtn">Rename</button>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Delete Project Modal */}
            <Dialog open={deletepromodal} onClose={setDeleteProModal} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-[#1F1F1F]">
                                <div className="flex justify-end items-center">
                                    <img src={close} alt="" onClick={() => setDeleteProModal(false)} className="cursor-pointer" />
                                </div>
                            </div>
                            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                <div className='text-center'>
                                    <div className='text-base text-[#FFFFFF] font-[600] mb-[20px]'>Delete "Untitled Song"</div>
                                    <p className='text-[#FFFFFF99] text-sm font-[400] w-[260px] m-auto'>The project can be restored from "Recently deleted" for 30 days.</p>
                                </div>
                                <div className="text-center md:pt-[40px] pt-[20px]">
                                    <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => setDeleteProModal(false)}>Cancel </button>
                                    <button className="d_btn d_deletebtn">Delete Project</button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Restore Project Modal */}
            <Dialog open={restorepromodal} onClose={setRestoreProModal} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-[#1F1F1F]">
                                <div className="flex justify-end items-center">
                                    <img src={close} alt="" onClick={() => setRestoreProModal(false)} className="cursor-pointer" />
                                </div>
                            </div>
                            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                <div className='text-center'>
                                    <div className='text-base text-[#FFFFFF] font-[600] mb-[20px]'>Restore "Untitled Song"</div>
                                    <p className='text-[#FFFFFF99] text-sm font-[400] w-[260px] m-auto'>Restored projects will be moved back to the default project list. </p>
                                </div>
                                <div className="text-center md:pt-[40px] pt-[20px]">
                                    <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => setRestoreProModal(false)}>Cancel </button>
                                    <button className="d_btn d_createbtn">Restore Project</button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Permanently Delete Project Modal */}
            <Dialog open={permanentlypromodal} onClose={setPermanentlyProModal} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-[#1F1F1F]">
                                <div className="flex justify-end items-center">
                                    <img src={close} alt="" onClick={() => setPermanentlyProModal(false)} className="cursor-pointer" />
                                </div>
                            </div>
                            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                <div className='text-center'>
                                    <div className='text-base text-[#FFFFFF] font-[600] mb-[20px]'>Permanently delete "Untitled Song"</div>
                                    <p className='text-[#FFFFFF99] text-sm font-[400] w-[260px] m-auto'>Are you sure you want to permanently delete this project? This action cannot be undone.</p>
                                </div>
                                <div className="text-center md:pt-[40px] pt-[20px]">
                                    <button className="d_btn d_cancelbtn sm:me-7 me-5 d_permanently" onClick={() => setPermanentlyProModal(false)}>Cancel </button>
                                    <button className="d_btn d_deletebtn d_permanently">Permanently delete</button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Restore All Projects Modal */}
            <Dialog open={restoreallpromodal} onClose={setRestoreAllProModal} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-[#1F1F1F]">
                                <div className="flex justify-end items-center">
                                    <img src={close} alt="" onClick={() => setRestoreAllProModal(false)} className="cursor-pointer" />
                                </div>
                            </div>
                            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                <div className='text-center'>
                                    <div className='text-base text-[#FFFFFF] font-[600] mb-[20px]'>Restore all projects</div>
                                    <p className='text-[#FFFFFF99] text-sm font-[400] md:w-[320px] w-[260px] m-auto'>Are you sure you want to restore all projects? Restored projects will be moved back to the default project list.</p>
                                </div>
                                <div className="text-center md:pt-[40px] pt-[20px]">
                                    <button className="d_btn d_cancelbtn sm:me-7 me-5 d_permanently" onClick={() => setRestoreAllProModal(false)}>Cancel</button>
                                    <button className="d_btn d_createbtn d_permanently">Restore all projects</button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Permanently Delete All Project Modal */}
            <Dialog open={permanentlyallpromodal} onClose={setPermanentlyAllProModal} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-[#1F1F1F]">
                                <div className="flex justify-end items-center">
                                    <img src={close} alt="" onClick={() => setPermanentlyAllProModal(false)} className="cursor-pointer" />
                                </div>
                            </div>
                            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                <div className='text-center'>
                                    <div className='text-base text-[#FFFFFF] font-[600] mb-[20px]'>Permanently delete all projects</div>
                                    <p className='text-[#FFFFFF99] text-sm font-[400] w-[260px] m-auto'>Are you sure you want to permanently delete all projects? This action cannot be undone.</p>
                                </div>
                                <div className="text-center md:pt-[40px] pt-[20px]">
                                    <button className="d_btn d_cancelbtn sm:me-7 me-5 d_permanentlyall" onClick={() => setPermanentlyAllProModal(false)}>Cancel </button>
                                    <button className="d_btn d_deletebtn d_permanentlyall">Permanently all delete</button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

        </>
    )
}

export default Demoproject;