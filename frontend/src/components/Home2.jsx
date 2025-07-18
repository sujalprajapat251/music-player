import React, { useEffect, useRef, useState } from 'react';
import { useOffcanvas } from '../components/Layout/Layout'; // Adjust path as needed
import { HiMenu } from "react-icons/hi";
import { useDispatch, useSelector } from 'react-redux';
import { getAllSound } from '../Redux/Slice/sound.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import play from '../Images/play.svg';
import DeleteIcon from "../Images/deleteIcon.svg";
import pause from '../Images/pause.svg';
import folder from "../Images/folderIcon.svg";
import rename from "../Images/renameIcon.svg";
import RedDelete from "../Images/deleteRedIcon.svg"
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { getFolderByUserId, updateFolderName, deleteFolderById, createFolder } from '../Redux/Slice/folder.slice';
import close from '../Images/close.svg';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

const Home2 = () => {
    const { openOffcanvas } = useOffcanvas();

    const dispatch = useDispatch();
    const sounds = useSelector((state) => state.sound.allsounds).slice(0, 5)
    const folders = useSelector(state => state.folder.folders);
    const audioRefs = useRef([]);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Last updated');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);
    const [addfoldermodal, setAddFolderModal] = useState(false)
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editingFolderName, setEditingFolderName] = useState('');


    const [activeSearch, setActiveSearch] = useState(false);
    const userId = sessionStorage.getItem("userId");

    const sortOptions = [
        { value: 'Last updated', label: 'Last updated' },
        { value: 'Oldest updated', label: 'Oldest updated' },
        { value: 'Last created', label: 'Last created' },
        { value: 'Title', label: 'Title' }
    ];

    useEffect(() => {
        dispatch(getAllSound());
    }, [dispatch])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const handleSortSelect = (option) => {
        setSortBy(option.value);
        setIsSortDropdownOpen(false);
    };

    const toggleSortDropdown = () => {
        setIsSortDropdownOpen(!isSortDropdownOpen);
    };


    useEffect(() => {
        if (userId) {
            dispatch(getFolderByUserId(userId));
        }
    }, [dispatch]);

    const handleRenameClick = (folderId, currentName) => {
        setEditingFolderId(folderId);
        setEditingFolderName(currentName);
        setAddFolderModal(true);
        formik.setFieldValue('folderName', currentName);
    };


    const handleDeleteClick = async (folderId) => {
        await dispatch(deleteFolderById(folderId))
    }

    const validationSchema = Yup.object({
        folderName: Yup.string().required('Folder name is required'),
    });

    const formik = useFormik({
        initialValues: {
            folderName: '',
        },
        validationSchema,
        onSubmit: (values, { resetForm }) => {
            if (editingFolderId) {
                dispatch(updateFolderName({
                    folderId: editingFolderId,
                    folderName: values.folderName.trim()
                })).then(() => {
                    dispatch(getFolderByUserId(userId));
                    setAddFolderModal(false);
                    setEditingFolderId(null);
                    resetForm();
                });
            } else {
                dispatch(createFolder({ userId, folderName: values.folderName }));
                dispatch(getFolderByUserId(userId));
                setAddFolderModal(false);
                resetForm();
            }
        },
    });


    return (
        <>
            <div className="p-10 bg-[#141414]">
                <div className="flex gap-3 text-white top-0 left-0 bg-[#141414] pt-3 py-4">
                    {/* Mobile Menu Button - Only visible on mobile */}
                    <div className="md:hidden mb-4">
                        <button
                            onClick={openOffcanvas}
                            className="flex items-center justify-center w-10 h-10 bg-[#2b2b2b] rounded-lg border border-[#FFFFFF1A] hover:bg-[#3b3b3b] transition-colors"
                        >
                            <HiMenu className="text-white text-xl" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="">
                        <h1 className="text-2xl font-bold ">My Projects</h1>
                    </div>
                </div>

                <div className='max-h-[80vh] overflow-auto d_customscrollbar'>
                    <div className="flex mt-5 gap-10 ">
                        <div >
                            <p className="text-white text-[24px] font-[600]">Start a new project</p>
                            <p className="text-white text-[16px]">Create a music or podcast project.</p>
                            <div className='flex bg-black mt-4 h-[200px] w-[250px] d_customborder items-center justify-center'>
                                <button className='border border-dashed border-white flex flex-col items-center justify-center group p-2 rounded-xl hover:bg-gray-900' >
                                    <p className="text-white text-[24px]">+</p>
                                    <p className="text-white text-[14px]">
                                        New Project
                                    </p>
                                </button>
                            </div>

                        </div>
                        <div>
                            <div className='flex justify-between'>
                                <div>
                                    <p className="text-white text-[24px] font-[600]">Explore demo projects</p>
                                    <p className="text-white text-[16px]">Play around with professionally-made songs.</p>
                                </div>
                                <div className='my-auto'>
                                    <Link to='/layout/demo-project'>
                                        <button className='py-2 px-6 border rounded-3xl border-[#FFFFFF1A] hover:bg-gray-600'>
                                            <p className='text-white'>Show all</p>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6 mt-5">
                                    {sounds.map((sound, index) => (
                                        <div key={sound._id || index} className="bg-[#14141480] rounded-[4px] overflow-hidden d_customborder">
                                            <div className='w-full h-[135px]'>
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
                        </div>
                    </div>


                    <div className='mt-14 flex justify-between pb-5 border-b border-[#FFFFFF1A]'>
                        <div className='my-auto'>
                            <button className='py-2 px-6 border rounded-3xl border-[#FFFFFF1A] hover:bg-gray-600 cursor-pointer' onClick={() => setAddFolderModal(true)}>
                                <p className='text-white'>+ Add Folder</p>
                            </button>
                        </div>
                        <div className="flex">
                            {activeSearch === true ?
                                <div className='bg-[#FFFFFF0F]'>
                                    <div className="flex gap-5 py-2 px-5 justify-center">
                                        <FiSearch className="text-white text-[24px]" />
                                        <input type="text" className='outline-none border-0 bg-transparent text-white' placeholder="Search..." />
                                        <IoClose size={24} className="text-white ms-auto cursor-pointer" onClick={() => setActiveSearch(false)} />
                                    </div>
                                </div>
                                :
                                <>
                                    <div className='flex relative pe-2' ref={sortDropdownRef}>
                                        <button
                                            onClick={toggleSortDropdown}
                                            className='flex items-center gap-3 text-white cursor-pointer hover:text-gray-300 transition-colors'
                                        >
                                            <span>Sort by : {sortBy}</span>
                                            <IoIosArrowDown
                                                className={`text-white transition-transform  duration-300 ${isSortDropdownOpen ? 'rotate-180' : 'rotate-0'
                                                    }`}
                                            />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isSortDropdownOpen && (
                                            <div className="absolute top-full right-0 mt-2 bg-[#1F1F1F] rounded-lg shadow-lg z-10 min-w-[200px]">
                                                {sortOptions.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        onClick={() => handleSortSelect(option)}
                                                        className="flex items-center px-4 py-3 hover:bg-[#3b3b3b] cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${sortBy === option.value
                                                                ? 'border-white'
                                                                : 'border-[#FFFFFF40]'
                                                                }`}>
                                                                {sortBy === option.value && (
                                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                                )}
                                                            </div>
                                                            <span className="text-white text-sm">{option.label}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className='my-auto px-3 cursor-pointer' onClick={() => setActiveSearch(true)}>
                                        <FiSearch className="text-white text-[24px]" />
                                    </div>
                                </>
                            }
                            <div className='my-auto px-3' >
                                <Menu as="div" className="relative inline-block text-left ">
                                    <div>
                                        <MenuButton className="outline-none" >
                                            <BsThreeDotsVertical className='text-white ' />
                                        </MenuButton>
                                    </div>
                                    <MenuItems
                                        transition
                                        className="absolute right-0 md:mt-3 2xl:mt-3  z-30 w-40 2xl:w-60 origin-top-right  bg-[#1f1f1f] shadow-lg outline-none rounded-md"
                                    >
                                        <div className="">
                                            <MenuItem >
                                                <p className="block md:px-5 lg:px-6 md:py-1  2xl:px-7 xl:py-2  3xl:px-9 3xl:py-3   hover:bg-gray-800 cursor-pointer" >
                                                    <div className="flex">
                                                        <img src={DeleteIcon} alt="" />
                                                        <p className="text-white md:ps-2 lg:ps-3 xl:ps-4 3xl:ps-4 font-semibold text-[14px] xl:text-[16px]">Recently Deleted</p>
                                                    </div>
                                                </p>
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </Menu>

                            </div>
                        </div>
                    </div>

                    {folders?.map((ele, index) => (
                        <div key={ele._id} className="flex pt-5 ps-5 pe-2">
                            <img src={folder} alt="" className='w-[30px] h-[30px]' />
                            <p className="text-white ps-5 my-auto">{ele?.folderName}</p>
                            <div className='ms-auto'>
                                <Menu as="div" className="relative inline-block text-left ">
                                    <div>
                                        <MenuButton className="outline-none" >
                                            <BsThreeDotsVertical className='text-white text-[20px]' />
                                        </MenuButton>
                                    </div>
                                    <MenuItems
                                        transition
                                        className="absolute right-0 md:mt-3 2xl:mt-3  z-30 w-40 2xl:w-44 origin-top-right  bg-[#1f1f1f] shadow-lg outline-none rounded-md"
                                    >
                                        <div className="">
                                            <MenuItem >
                                                <p className="block md:px-5 lg:px-6 md:py-1  2xl:px-7 xl:py-2  3xl:px-9 3xl:py-3   hover:bg-gray-800 cursor-pointer"
                                                    onClick={() => handleRenameClick(ele._id, ele.folderName)}
                                                >
                                                    <div className="flex">
                                                        <img src={rename} alt="" />
                                                        <p className="text-white md:ps-2 lg:ps-3 xl:ps-4 3xl:ps-4 font-semibold text-[14px] xl:text-[16px]">Rename</p>
                                                    </div>
                                                </p>
                                            </MenuItem>
                                            <MenuItem >
                                                <p className="block md:px-5 lg:px-6 md:py-1  2xl:px-7 xl:py-2  3xl:px-9 3xl:py-3   hover:bg-gray-800 cursor-pointer"
                                                    onClick={() => handleDeleteClick(ele._id)}
                                                >
                                                    <div className="flex">
                                                        <img src={RedDelete} alt="" />
                                                        <p className="text-[#FF0000] md:ps-2 lg:ps-3 xl:ps-4 3xl:ps-4 font-semibold text-[14px] xl:text-[16px]">Delete</p>
                                                    </div>
                                                </p>
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </Menu>
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
                            <form onSubmit={formik.handleSubmit} className="md:px-[10px] px-[20px]">
                                <div className="md:py-[20px] py-[10px] md:px-[10px] bg-[#1F1F1F] border-b-[0.5px] border-b-[#FFFFFF1A]">
                                    <div className="flex justify-between items-center">
                                        <div className="sm:text-xl text-lg font-[600] text-[#fff]"> {editingFolderId ? "Rename Folder" : "New Folder"}</div>
                                        <img src={close} alt="" onClick={() => { setAddFolderModal(false); formik.resetForm(); setEditingFolderId(null) }} className="cursor-pointer" />
                                    </div>
                                </div>
                                <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                    <div className=''>
                                        <div className='text-sm text-[#FFFFFF] font-[400] mb-[10px]'>Folder Name</div>
                                        <input
                                            type="text"
                                            name="folderName"
                                            placeholder='Folder Name'
                                            className='text-[#FFFFFF99] rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]'
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.folderName}
                                        />
                                        {formik.touched.folderName && formik.errors.folderName ? (
                                            <div className="text-red-500 text-xs mt-1">{formik.errors.folderName}</div>
                                        ) : null}
                                    </div>
                                    <div className="text-center md:pt-[40px] pt-[20px]">
                                        <button
                                            type="button"
                                            className="d_btn d_cancelbtn sm:me-7 me-5"
                                            onClick={() => { setAddFolderModal(false); formik.resetForm(); setEditingFolderId(null) }} >Cancel</button>
                                        <button type="submit" className="d_btn d_createbtn"> {editingFolderId ? "Rename Folder" : "New Folder"}</button>
                                    </div>
                                </div>
                            </form>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>


        </>
    );
};

export default Home2;