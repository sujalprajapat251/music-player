import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useOffcanvas } from '../components/Layout/Layout'; // Adjust path as needed
import { HiMenu } from "react-icons/hi";
import { useDispatch, useSelector } from 'react-redux';
import { getAllSound } from '../Redux/Slice/sound.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import { Play, Pause, MoreHorizontal } from 'lucide-react';
import play from '../Images/playwhite.svg';
import {ReactComponent as DeleteIcon} from "../Images/deleteIcon.svg";
import pause from '../Images/pausewhite.svg';
import folder from "../Images/folderIcon.svg";
import rename from "../Images/renameIcon.svg";
import RedDelete from "../Images/deleteRedIcon.svg"
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { getFolderByUserId, updateFolderName, deleteFolderById, createFolder } from '../Redux/Slice/folder.slice';
import close from '../Images/close.svg';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import NewProjectModel from './NewProjectModel';
import { deleteMusic, getAllMusic } from '../Redux/Slice/music.slice';

const AdaptiveMenu = ({ button, children, placement = 'bottom-end', widthClass = 'w-40 2xl:w-44' }) => {
    const {
        refs,
        floatingStyles,
        update,
    } = useFloating({
        placement,
        middleware: [offset(4), flip(), shift()],
    });

    useEffect(() => {
        if (refs.reference.current && refs.floating.current) {
            return autoUpdate(refs.reference.current, refs.floating.current, update);
        }
    }, [refs.reference, refs.floating, update]);

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <MenuButton ref={refs.setReference} className="outline-none">
                    {button}
                </MenuButton>
            </div>
            <MenuItems
                ref={refs.setFloating}
                style={floatingStyles}
                className={`z-30 ${widthClass} origin-top-right bg-[#1f1f1f] shadow-lg outline-none rounded-md`}
            >
                {children}
            </MenuItems>
        </Menu>
    );
};

const Home2 = () => {

    const { openOffcanvas } = useOffcanvas();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const sounds = useSelector((state) => state.sound.allsounds).slice(0, 5)
    const folders = useSelector(state => state.folder.folders);
    console.log('folder', folders);
    const audioRefs = useRef([]);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Last updated');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);
    const [addfoldermodal, setAddFolderModal] = useState(false)
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editingFolderName, setEditingFolderName] = useState('');
    const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    const [activeSearch, setActiveSearch] = useState(false);
    const userId = sessionStorage.getItem("userId");

    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [deletepromodal, setDeleteProModal] = useState(false);
    
    const [deleteId, setDeleteId] = useState(null);

    const allMusic = useSelector((state) => state.music.allmusic);
    console.log(allMusic);
    
    useEffect(() => {
        dispatch(getAllMusic());
    }, [])

    // Add these to your sortOptions array if needed
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

    // Add this sorting function after the existing state declarations
    const getSortedAndFilteredFolders = () => {
        if (!folders || folders.length === 0) return [];
        
        // First filter by search text
        let filtered = folders.filter((folder) =>
            folder.folderName.toLowerCase().includes(searchText.toLowerCase())
        );
        
        // Then sort based on selected option
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'Last updated':
                    // Sort by updatedAt in descending order (most recent first)
                    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
                
                case 'Oldest updated':
                    // Sort by updatedAt in ascending order (oldest first)
                    return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
                
                case 'Last created':
                    // Sort by createdAt in descending order (most recent first)
                    return new Date(b.createdAt) - new Date(a.createdAt);
                
                case 'Title':
                    // Sort alphabetically by folder name
                    return a.folderName.toLowerCase().localeCompare(b.folderName.toLowerCase());
                
                default:
                    return 0;
            }
        });
        
        return sorted;
    };
    
    // Replace the existing filteredFolders line with:
    const sortedAndFilteredFolders = getSortedAndFilteredFolders();











  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState('0:00');
  const [progress, setProgress] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Sample audio URL - you can replace this with your own audio file
  const audioUrl = 'aaa.mp3';

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const initializeAudioContext = useCallback(async () => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        console.warn('Web Audio API not supported, using fallback visualization');
      }
    }
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barCount = 150;
    const barWidth = 2;
    const barSpacing = (width - barCount * barWidth) / (barCount - 1);
    // const totalBarsWidth = barCount * (barWidth + barSpacing);
    const startX = 0;

    if (analyserRef.current && dataArrayRef.current && isPlaying) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
        const barHeight = Math.max(3, (dataArrayRef.current[dataIndex] / 255) * height * 0.8);
        
        const x = startX + i * (barWidth + barSpacing);
        const y = (height - barHeight) / 2;
        
        const progressPoint = progress * barCount;
        const color = i < progressPoint ? '#3B82F6' : '#D1D5DB';
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    } else {
      for (let i = 0; i < barCount; i++) {
        const seed = i * 0.1;
        const barHeight = Math.max(3, (Math.sin(seed) * 0.5 + 0.5 + Math.sin(seed * 3) * 0.3) * height * 0.7);
        
        const x = startX + i * (barWidth + barSpacing);
        const y = (height - barHeight) / 2;
        
        const progressPoint = progress * barCount;
        const color = i < progressPoint ? '#3B82F6' : '#D1D5DB';
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [isPlaying, progress]);


  const handlePlayPauseTwo = async () => {
    if (!audioRef.current) return;

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await initializeAudioContext();
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        try {
          await audioRef.current.play();
        } catch (fallbackError) {
          console.error('Fallback audio play failed:', fallbackError);
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      
      setCurrentTime(formatTime(current));
      setProgress(total > 0 ? current / total : 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.duration));
      setAudioLoaded(true);
    }
  };

  const handleCanvasClick = (e) => {
    if (!audioRef.current || !audioLoaded) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickProgress = clickX / canvas.width;
    
    const newTime = clickProgress * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(clickProgress);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('0:00');
      });
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('play', () => setIsPlaying(true));
        audio.removeEventListener('pause', () => setIsPlaying(false));
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resizeCanvas = () => {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = 48;
        drawWaveform();
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [drawWaveform]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform, progress]);

  const buttonRef = useRef(null);
  const {
    refs,
    floatingStyles,
    update,
  } = useFloating({
    placement: "bottom-end",
    middleware: [offset(4), flip(), shift()],
  });

  useEffect(() => {
    if (refs.reference.current && refs.floating.current) {
      return autoUpdate(refs.reference.current, refs.floating.current, update);
    }
  }, [refs.reference, refs.floating, update]);




  const handleDeleteMusic = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteMusic(deleteId));
      await dispatch(getAllMusic());
    } finally {
      setDeleteProModal(false);
      setDeleteId(null);
    }
  };

    return (
        <>
            <div className="p-3 lg:p-5 xl:p-6 2xl:p-8 3xl:p-10 bg-[#141414]">
                <div className="flex gap-3 text-white top-0 left-0 bg-[#141414] xl:pt-2 xl:py-2 2xl:pt-3 2xl:py-4 ">
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
                        <h1 className="text-[16px] md:text-[18px] lg:text-[20px] 2xl:text-[24px] 3xl:text-[30px] font-bold pt-2 md:pt-0">My Projects</h1>
                    </div>
                </div>

                <div className='max-h-[80vh] min-h-[760px] overflow-auto d_customscrollbar'>
                    <div className="flex flex-col md:flex-row mt-2 md:mt-2 lg:mt-3 xl:mt-4 3xl:mt-5 gap-3 md600:gap-5 md:gap-4 lg:gap-6  xl:gap-8 2xl:gap-10 ">
                        <div >
                            <p className="text-white text-[14px] md:text-[16px]  lg:text-[18px] 2xl:text-[20px] 3xl:text-[24px] font-[600]">Start a new project</p>
                            <p className="text-white text-[12px] lg:text-[14px] 2xl:text-[14px] 3xl:text-[15px] lg:text-nowrap">Create a music or podcast project.</p>
                            <div className='flex bg-black mt-3 md:mt-2 lg:mt-3 3xl:mt-4 h-[150px] md:w-[150px]  lg:h-[180px] lg:w-[220px] 2xl:h-[180px] 2xl:w-[200px] 3xl:h-[200px] 3xl:w-[250px] d_customborder items-center justify-center' onClick={() => navigate('/sidebar/timeline')} >
                                <button className='border border-dashed border-white flex flex-col items-center justify-center group p-2 md:p-1 xl:p-2 rounded-xl hover:bg-gray-900' >
                                    <p className="text-white text-[16px] lg:text-[20px] xl:text-[24px]">+</p>
                                    <p className="text-white text-[12px] xl:text-[14px] md:w-[60px] lg:w-full text-wrap lg:text-nowrap">
                                        New Project
                                    </p>
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className='flex justify-between'>
                                <div>
                                    <p className="text-white text-[16px]  lg:text-[18px] 2xl:text-[20px] 3xl:text-[24px] font-[600]">Explore demo projects</p>
                                    <p className="text-white text-[12px] lg:text-[14px] 2xl:text-[14px] 3xl:text-[15px] text-wrap w-[200px] sm:text-nowrap md:text-wrap md:w-[200px] lg:w-full  lg:text-nowrap">Play around with professionally-made songs.</p>
                                </div>
                                <div className='my-auto'>
                                    <Link to='/demo-project'>
                                        <button className='py-1 px-3 sm:px-4 xl:py-2 xl:px-6 border rounded-3xl border-[#FFFFFF1A] hover:bg-gray-600'>
                                            <p className='text-white'>Show all</p>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <div className="grid grid-cols-2 md600:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md600:gap-4 md:gap-3 lg:gap-4 3xl:gap-6 mt-3 md:mt-2 lg:mt-3 3xl:mt-5">
                                    {sounds.map((sound, index) => (
                                        <div key={sound._id || index} className="bg-[#14141480] rounded-[4px] overflow-hidden d_customborder">
                                            <div className='w-full h-[105px] sm:h-[135px] md600:h-[105px] lg:h-[131px] xl:h-[125px] 2xl:h-[124px] 3xl:h-[135px]'>
                                                <img src={`${IMAGE_URL}uploads/image/${sound?.image}`} alt="Album" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="py-[4px] px-[4px] lg:py-[6px] lg:px-[8px] 2xl:px-[10px] 3xl:py-[8px] 3xl:px-[12px]">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="text-[#fff] font-[500] text-[12px] sm:text-[14px] md:text-[12px] 2xl:text-[14px] 3xl:text-[16px] mb-[2px]">{sound?.soundname}</h3>
                                                        <p className="text-[#FFFFFF99] font-[400] text-[10px] sm:text-[12px] md:text-[10px] xl:text-[14px]">{sound?.category[0]?.name}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handlePlayPause(index)}
                                                        className="bg-[#141414] text-black rounded-full w-[20px] h-[20px] sm:w-[28px] sm:h-[28px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px] flex justify-center items-center border-[0.5px] border-[#FFFFFF1A]"
                                                    >
                                                        <img src={playingIndex === index ? pause : play} alt="" className='w-2 h-2 sm:w-3 sm:h-3' />
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

                    <div className='mt-4 md:mt-5 lg:mt-8 xl:mt-10 2xl:mt-12 3xl:mt-14 flex justify-between pb-2  md:pb-2 lg:pb-3  2xl:pb-4 3xl:pb-5 border-b border-[#FFFFFF1A]'>
                        <div className='my-auto'>
                            <button className='py-1 px-2 md600:py-2 md600:px-5 md:py-1 md:px-4 lg:py-2 lg:px-6 border rounded-3xl border-[#FFFFFF1A] hover:bg-gray-600 cursor-pointer' onClick={() => setAddFolderModal(true)}>
                                <p className='text-white text-[10px] sm:text-[12px] md600:text-[16px]'>+ Add Folder</p>
                            </button>
                        </div>
                        <div className="flex">
                            {activeSearch === true ?
                                <div className='bg-[#FFFFFF0F]'>
                                    <div className="flex gap-1 sm:gap-2 md600:gap-4 md:gap-3 lg:gap-4 2xl:gap-5 py-1 px-2  sm:px-3 md600:py-2 md600:px-5 md:py-1 md:px-4 lg:py-2 lg:px-5 items-center justify-center">
                                        <FiSearch className="text-white text-[14px] sm:text-[18px] md:text-[20px] lg:text-[24px]" />
                                        <input
                                            type="text"
                                            className="outline-none w-32 sm:w-40 md:w-full text-[10px] sm:text-[12px] md600:text-[16px] md:text-[20px] border-0 bg-transparent text-white"
                                            placeholder="Search..."
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                        />
                                        <IoClose className="text-white ms-auto cursor-pointer sm:text-[18px] md:text-[20px] lg:text-[24px]" onClick={() => { setActiveSearch(false); setSearchText(""); }} />
                                    </div>
                                </div>
                                :
                                <>
                                    <div className='flex relative pe-2' ref={sortDropdownRef}>
                                        <button
                                            onClick={toggleSortDropdown}
                                            className='flex items-center gap-2 md600:gap-3 text-white cursor-pointer hover:text-gray-300 transition-colors'
                                        >
                                            <span className='text-[10px] sm:text-[12px] md600:text-[16px]'>Sort by : {sortBy}</span>
                                            <IoIosArrowDown
                                                className={`text-white transition-transform  duration-300 ${isSortDropdownOpen ? 'rotate-180' : 'rotate-0'
                                                    }`}
                                            />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isSortDropdownOpen && (
                                            <div className="absolute top-full right-0 md600:mt-2 bg-[#1F1F1F] rounded-lg shadow-lg z-10 min-w-[150px] md600:min-w-[200px]">
                                                {sortOptions.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        onClick={() => handleSortSelect(option)}
                                                        className="flex items-center py-1 px-2 sm:py-2 sm:px-3 md600:px-4 md600:py-3 md:px-3 md:py-2 2xl:px-4 2xl:py-3 hover:bg-[#3b3b3b] cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className={`w-3 h-3 md600:w-4 md600:h-4 md:w-3 md:h-3 2xl:w-4 2xl:h-4 border-2 rounded-full mr-2 md600:mr-3 md:mr-2 2xl:mr-3 flex items-center justify-center ${sortBy === option.value
                                                                ? 'border-white'
                                                                : 'border-[#FFFFFF40]'
                                                                }`}>
                                                                {sortBy === option.value && (
                                                                    <div className="w-2 h-2 md:w-1 md:h-1 2xl:w-2 2xl:h-2 bg-white rounded-full"></div>
                                                                )}
                                                            </div>
                                                            <span className="text-white text-sm">{option.label}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className='my-auto sm:px-2 md600:px-3 md:px-2 2xl:px-3 cursor-pointer' onClick={() => setActiveSearch(true)}>
                                        <FiSearch className="text-white text-[14px] md600:text-[22px] md:text-[20px] 2xl:text-[24px]" />
                                    </div>
                                </>
                            }
                            <div className='my-auto px-2 md600:px-3 md:px-2 2xl:px-3' >
                                <AdaptiveMenu
                                    button={<BsThreeDotsVertical className='text-white text-[12px] sm:text-[14px]  xl:text-[18px] 3xl:text-[20px]' />}
                                    widthClass="w-36 sm:w-48 xl:w-52 2xl:w-64"
                                >
                                    <div className="">
                                        <MenuItem >
                                            <p className="block  px-3 sm:px-4 md600:px-5  lg:px-6 py-1  2xl:px-7 xl:py-2  3xl:px-9 3xl:py-3   hover:bg-gray-800 cursor-pointer" >
                                                <div className="flex items-center" >
                                                    <DeleteIcon className='w-3 h-3 sm:w-3 sm:h-3 lg:w-4 lg:h-4 2xl:w-6 2xl:h-6 text-white' />
                                                    <p className="text-white ps-2 lg:ps-3 xl:ps-4 3xl:ps-4 font-semibold text-[12px] sm:text-[14px] 2xl:text-[16px]">Recently Deleted</p>
                                                </div>
                                            </p>
                                        </MenuItem>
                                    </div>
                                </AdaptiveMenu>
                            </div>
                        </div>
                    </div>

                    {sortedAndFilteredFolders?.map((ele, index) => (
                        <div key={ele._id} className="flex pt-2  md600:pt-3  lg:pt-3 ps-2 md600:ps-3 2xl:pt-4 2xl:ps-4 3xl:pt-5 3xl:ps-5 pe-2 md600:pe-3 md:pe-2 border-b border-[#FFFFFF1A] pb-2">
                            <img src={folder} alt="" className='w-[16px] h-[16px] sm:w-[24px] sm:h-[24px] lg:w-[30px] lg:h-[30px] my-auto' />
                            <p className="text-white ps-2 md600:ps-3 lg:ps-4  my-auto text-[12px] sm:text-[14px] md:text-[16px] ">{ele?.folderName}</p>
                            <div className='ms-auto'>
                                <AdaptiveMenu
                                    button={<BsThreeDotsVertical className='text-white text-[12px] sm:text-[14px] md600:text-[16px] lg:text-[18px] 3xl:text-[20px]' />}
                                    widthClass="w-40 2xl:w-44"
                                >
                                    <div className="">
                                        <MenuItem >
                                            <p
                                                className="block px-4 py-1 md600:px-5 lg:px-6 md600:py-1  2xl:px-7 lg:py-2  3xl:px-9 3xl:py-3   hover:bg-gray-800 cursor-pointer"
                                                onClick={() => handleRenameClick(ele._id, ele.folderName)}
                                            >
                                                <div className="flex items-center" >
                                                    <img src={rename} alt="" className=' w-3 h-3 md600:w-4 md600:h-4 2xl:w-6 2xl:h-6' />
                                                    <p className="text-white ps-2  md600:ps-3 xl:ps-4 3xl:ps-4 font-semibold text-[12px] md600:text-[14px] 2xl:text-[16px]">Rename</p>
                                                </div>
                                            </p>
                                        </MenuItem>
                                        <MenuItem >
                                            <p
                                                className="block px-4 py-1 md600:px-5 lg:px-6 md600:py-1  2xl:px-7 lg:py-2  3xl:px-9 3xl:py-3   hover:bg-gray-800 cursor-pointer"
                                                onClick={() => handleDeleteClick(ele._id)}
                                            >
                                                <div className="flex items-center">
                                                    <img src={RedDelete} alt="" className='w-3 h-3 md600:w-4 md600:h-4 2xl:w-6 2xl:h-6' />
                                                    <p className="text-[#FF0000] ps-2 md600:ps-3 xl:ps-4 3xl:ps-4 font-semibold text-[12px] md600:text-[14px] 2xl:text-[16px]">Delete</p>
                                                </div>
                                            </p>
                                        </MenuItem>
                                    </div>
                                </AdaptiveMenu>
                            </div>
                        </div>
                    ))}

                    {allMusic.map((ele) => {
                        return(
                    <div className="w-full mx-auto">
                        <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm">
                            <audio ref={audioRef} src={ele.url} preload="metadata" crossOrigin="anonymous"/>
                            <div className='w-12 h-12 bg-white'></div>
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-md">
                                    <button onClick={handlePlayPauseTwo} className="text-white" disabled={!audioLoaded}>
                                    {isPlaying ? (
                                        <Pause size={20} fill="white" />
                                    ) : (
                                        <Play size={20} fill="white" className="ml-0.5" />
                                    )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium truncate">{ele?.name}</h3>
                                </div>
                                <div className="relative">
                                    <canvas ref={canvasRef} className="w-full h-12 cursor-pointer" onClick={handleCanvasClick} style={{ display: 'block' }}/>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                    {/* <span className="text-gray-500 font-mono">{currentTime}</span> */}
                                    <div className="flex items-center gap-2">
                                        <div className="text-lg font-mono">{duration}</div>
                                    </div>

                                    <Menu as="div" className="relative inline-block text-left">
                                        <div>
                                            <MenuButton
                                            ref={refs.setReference}
                                            className="outline-none"
                                            >
                                            <MoreHorizontal size={25} className="cursor-pointer transition-colors" />
                                            </MenuButton>
                                        </div>

                                        <MenuItems ref={refs.setFloating} style={floatingStyles} className="w-56 rounded-md bg-[#1f1f1f] shadow-lg ring-1 ring-black ring-opacity-5 outline-none z-30">
                                            <div className="py-1">
                                            <MenuItem>
                                                {({ active }) => (
                                                <a href="#" className={`flex items-center gap-2 px-4 py-2 text-sm ${ active ? "bg-gray-600 text-white" : "text-white" }`}>
                                                    <span className="font-medium">A</span>
                                                    Rename
                                                </a>
                                                )}
                                            </MenuItem>

                                            <MenuItem>
                                                {({ active }) => (
                                                <a href="#" className={`flex items-center gap-2 px-4 py-2 text-sm ${ active ? "bg-gray-600 text-white" : "text-white" }`}>
                                                    🖼️ Change cover
                                                </a>
                                                )}
                                            </MenuItem>

                                            <MenuItem>
                                                {({ active }) => (
                                                <a href="#" className={`flex items-center justify-between px-4 py-2 text-sm ${ active ? "bg-gray-600 text-white" : "text-white" }`}>
                                                    <span className="flex items-center gap-2">📁 Move to folder</span>
                                                    <span>›</span>
                                                </a>
                                                )}
                                            </MenuItem>

                                            <hr className="my-1 border-gray-200" />

                                            <MenuItem>
                                                {({ active }) => (
                                                <a href="#" className={`flex items-center justify-between px-4 py-2 text-sm ${ active ? "bg-gray-600 text-white" : "text-white" }`}>
                                                    <span className="flex items-center gap-2">⬇ Export</span>
                                                    <span>›</span>
                                                </a>
                                                )}
                                            </MenuItem>

                                            <hr className="my-1 border-gray-200" />

                                            <MenuItem>
                                                {({ active }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedProjectName(ele?.name || ''); setDeleteId(ele?._id || ele?.id); setDeleteProModal(true); }}
                                                    className={`flex items-center gap-2 px-4 py-2 text-sm ${ active ? "bg-red-100 text-red-600" : "text-red-600" }`}
                                                >
                                                    🗑️ Delete
                                                </button>
                                                )}
                                            </MenuItem>
                                            </div>
                                        </MenuItems>
                                    </Menu>
                            </div>
                        </div>
                    </div>
                        )
                    })}

                </div>
            </div>

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
                                    <div className='text-base text-[#FFFFFF] font-[600] mb-[20px]'>Delete "{selectedProjectName || 'Untitled Song'}"</div>
                                    <p className='text-[#FFFFFF99] text-sm font-[400] w-[260px] m-auto'>The project can be restored from "Recently deleted" for 30 days.</p>
                                </div>
                                <div className="text-center md:pt-[40px] pt-[20px]">
                                    <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => setDeleteProModal(false)}>Cancel </button>
                                    <button className="d_btn d_deletebtn" onClick={handleDeleteMusic}>Delete Project</button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

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

            <NewProjectModel open={newProjectModalOpen} setOpen={setNewProjectModalOpen} />

        </>
    );
};

export default Home2;