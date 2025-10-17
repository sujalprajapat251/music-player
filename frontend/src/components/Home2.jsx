import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOffcanvas } from '../components/Layout/Layout';
import { HiMenu } from "react-icons/hi";
import { useDispatch, useSelector } from 'react-redux';
import { getAllSound } from '../Redux/Slice/sound.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import { Play, Pause, X } from 'lucide-react';
import play from '../Images/playwhite.svg';
import { ReactComponent as DeleteIcon } from "../Images/deleteIcon.svg";
import pause from '../Images/pausewhite.svg';
import folder from "../Images/folderIcon.svg";
import rename from "../Images/renameIcon.svg";
import RedDelete from "../Images/deleteRedIcon.svg"
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoClose, IoImageOutline, IoFolderOutline } from 'react-icons/io5';
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { getFolderByUserId, updateFolderName, deleteFolderById, createFolder } from '../Redux/Slice/folder.slice';
import close from '../Images/close.svg';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import NewProjectModel from './NewProjectModel';
import { deleteMusic, getAllMusic, moveToFolderMusic, renameMusic, addCoverImage, removeCoverImage, createMusic, setCurrentMusic } from '../Redux/Slice/music.slice';
import { FaAngleRight } from "react-icons/fa";
import { FaArrowDownLong } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import notFound from '../Images/notFound.png'
import { resetStudio, resetTrack } from '../Redux/Slice/studio.slice';

// Function to generate random colors
const generateRandomColor = (seed) => {
    const colors = [
        '#AA005B', '#611364', '#F59B23', '#E33751',
        '#14833B', '#1A8CDE', '#FA6033', '#2D46B9',
    ];

    const index = Math.abs(seed.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0)) % colors.length;

    return colors[index];
};

const AdaptiveMenu = ({ button, children, placement = 'bottom-end', widthClass = 'w-40 2xl:w-44' }) => {
    const { refs, floatingStyles, update } = useFloating({
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
    // console.log("openOffcanvas", openOffcanvas);
    // Selectors with stable references
    const sounds = useSelector((state) => state.sound.allsounds, (a, b) => a === b)?.slice(0, 5) || [];
    const folders = useSelector(state => state.folder.folders, (a, b) => a === b) || [];
    const allMusic = useSelector((state) => state.music.allmusic, (a, b) => a === b) || [];

    // Refs
    const audioRefs = useRef([]);
    const sortDropdownRef = useRef(null);
    const musicAudioRefs = useRef([]);
    const canvasRefs = useRef([]);
    const animationRefs = useRef([]);
    const audioContextRefs = useRef([]);
    const analyserRefs = useRef([]);
    const dataArrayRefs = useRef([]);

    // State
    const [playingIndex, setPlayingIndex] = useState(null);
    const [sortBy, setSortBy] = useState('Last updated');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [addfoldermodal, setAddFolderModal] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [editingFolderName, setEditingFolderName] = useState('');
    const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [activeSearch, setActiveSearch] = useState(false);
    const [deletepromodal, setDeleteProModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [moveMusicId, setMoveMusicId] = useState(null);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [playingMusicId, setPlayingMusicId] = useState(null);
    const [musicDurations, setMusicDurations] = useState({});
    const [musicCurrentTimes, setMusicCurrentTimes] = useState({});
    const [musicProgress, setMusicProgress] = useState({});
    const [musicAudioLoaded, setMusicAudioLoaded] = useState({});
    const [activeFolderId, setActiveFolderId] = useState(null);
    const [activeFolderName, setActiveFolderName] = useState('');
    const [editingMusicId, setEditingMusicId] = useState(null);
    const [editingMusicName, setEditingMusicName] = useState('');
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedMusicId, setSelectedMusicId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const userId = sessionStorage.getItem("userId");

    // Stable memoized functions
    const getItemFolderId = useCallback((m) => {
        return m?.folderId || (typeof m?.folder === 'string' ? m.folder : m?.folder?._id) || null;
    }, []);

    const getCoverUrl = useCallback((m) => {
        const candidate = m?.coverImage || m?.cover || m?.image || m?.thumbnail;
        if (!candidate) return null;
        return candidate.startsWith('http') ? candidate : `${IMAGE_URL}${candidate}`;
    }, []);

    const formatTime = useCallback((time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // Sort options
    const sortOptions = [
        { value: 'Last updated', label: 'Last updated' },
        { value: 'Oldest updated', label: 'Oldest updated' },
        { value: 'Last created', label: 'Last created' },
        { value: 'Title', label: 'Title' }
    ];

    // CRITICAL FIX: Memoize sorted data with stable dependencies
    const sortedAndFilteredFolders = useMemo(() => {
        if (!folders || folders.length === 0) return [];

        let filtered = folders.filter((folder) =>
            folder.folderName.toLowerCase().includes(searchText.toLowerCase())
        );

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'Last updated':
                    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
                case 'Oldest updated':
                    return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
                case 'Last created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'Title':
                    return a.folderName.toLowerCase().localeCompare(b.folderName.toLowerCase());
                default:
                    return 0;
            }
        });
        return sorted;
    }, [folders, searchText, sortBy]);

    const sortedAndFilteredMusic = useMemo(() => {
        if (!allMusic || allMusic.length === 0) return [];

        let filtered = allMusic
            .filter(ele => !ele.isDeleted)
            .filter(ele => {
                if (!activeFolderId) return !getItemFolderId(ele);
                const fid = getItemFolderId(ele);
                return fid === activeFolderId;
            })
            .filter(ele => {
                if (!searchText.trim()) return true;
                return ele?.name?.toLowerCase().includes(searchText.toLowerCase());
            });

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'Last updated':
                    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
                case 'Oldest updated':
                    return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
                case 'Last created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'Title':
                    return (a?.name || '').toLowerCase().localeCompare((b?.name || '').toLowerCase());
                default:
                    return 0;
            }
        });

        return sorted;
    }, [allMusic, activeFolderId, searchText, sortBy, getItemFolderId]);

    // CRITICAL FIX: Stable waveform drawing function
    const drawWaveform = useCallback((musicId, filteredIndex) => {
        const canvas = canvasRefs.current[filteredIndex];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const barCount = 150;
        const barWidth = 2;
        const barSpacing = (width - barCount * barWidth) / (barCount - 1);

        const progress = musicProgress[musicId] || 0;

        for (let i = 0; i < barCount; i++) {
            const seed = i * 0.1;
            const barHeight = Math.max(3, (Math.sin(seed) * 0.5 + 0.5 + Math.sin(seed * 3) * 0.3) * height * 0.7);

            const x = i * (barWidth + barSpacing);
            const y = (height - barHeight) / 2;

            const progressPoint = progress * barCount;
            const color = i < progressPoint ? '#3B82F6' : '#D1D5DB';

            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth, barHeight);
        }
    }, [musicProgress]);

    // Event handlers
    const handlePlayPause = useCallback((index) => {
        if (playingIndex === index) {
            audioRefs.current[index]?.pause();
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
    }, [playingIndex]);

    const handlePlayPauseMusic = useCallback(async (musicId, filteredIndex) => {
        if (filteredIndex === -1 || !musicAudioRefs.current[filteredIndex]) return;

        const audioRef = musicAudioRefs.current[filteredIndex];
        const isPlaying = playingMusicId === musicId;

        if (isPlaying) {
            audioRef.pause();
            setPlayingMusicId(null);
        } else {
            musicAudioRefs.current.forEach((ref, i) => {
                if (i !== filteredIndex && ref) ref.pause();
            });

            try {
                await audioRef.play();
                setPlayingMusicId(musicId);
            } catch (error) {
                console.error('Error playing audio:', error);
            }
        }
    }, [playingMusicId]);

    const handleTimeUpdate = useCallback((musicId, filteredIndex) => {
        if (filteredIndex === -1 || !musicAudioRefs.current[filteredIndex]) return;

        const audioRef = musicAudioRefs.current[filteredIndex];
        const current = audioRef.currentTime;
        const total = audioRef.duration;

        setMusicCurrentTimes(prev => ({
            ...prev,
            [musicId]: formatTime(current)
        }));

        setMusicProgress(prev => ({
            ...prev,
            [musicId]: total > 0 ? current / total : 0
        }));
    }, [formatTime]);

    const handleLoadedMetadata = useCallback((musicId, filteredIndex) => {
        if (filteredIndex === -1 || !musicAudioRefs.current[filteredIndex]) return;

        const audioRef = musicAudioRefs.current[filteredIndex];

        setMusicDurations(prev => ({
            ...prev,
            [musicId]: formatTime(audioRef.duration)
        }));
        setMusicAudioLoaded(prev => ({
            ...prev,
            [musicId]: true
        }));
    }, [formatTime]);

    const handleCanvasClick = useCallback((e, musicId, filteredIndex) => {
        const music = sortedAndFilteredMusic[filteredIndex];
        const audioUrl = music.url ? (music.url.startsWith('http') ? music.url : `${IMAGE_URL}${music.url}`) : null;
        if (!audioUrl) return;

        const audioRef = musicAudioRefs.current[filteredIndex];
        const canvas = canvasRefs.current[filteredIndex];
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickProgress = clickX / canvas.width;

        const newTime = clickProgress * audioRef.duration;
        audioRef.currentTime = newTime;
        setMusicProgress(prev => ({
            ...prev,
            [musicId]: clickProgress
        }));
    }, [sortedAndFilteredMusic]);

    // CRITICAL FIX: Initialize data only once on mount
    useEffect(() => {
        let mounted = true;

        const initData = async () => {
            if (userId && mounted) {
                await dispatch(getFolderByUserId(userId));
            }
            if (mounted) {
                await dispatch(getAllSound());
                await dispatch(getAllMusic());
            }
        };

        initData();

        return () => {
            mounted = false;
        };
    }, [dispatch, userId]);

    // CRITICAL FIX: Setup audio event listeners only when sorted music changes length
    useEffect(() => {
        const cleanupFunctions = [];

        sortedAndFilteredMusic.forEach((music, index) => {
            const audio = musicAudioRefs.current[index];
            if (!audio) return;

            const musicId = music._id;

            const handlePlay = () => setPlayingMusicId(musicId);
            const handlePause = () => setPlayingMusicId(null);
            const handleEnded = () => {
                setPlayingMusicId(null);
                setMusicProgress(prev => ({ ...prev, [musicId]: 0 }));
                setMusicCurrentTimes(prev => ({ ...prev, [musicId]: '0:00' }));
            };
            const handleTimeUpdateEvent = () => handleTimeUpdate(musicId, index);
            const handleLoadedMetadataEvent = () => handleLoadedMetadata(musicId, index);

            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            audio.addEventListener('ended', handleEnded);
            audio.addEventListener('timeupdate', handleTimeUpdateEvent);
            audio.addEventListener('loadedmetadata', handleLoadedMetadataEvent);

            cleanupFunctions.push(() => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
                audio.removeEventListener('ended', handleEnded);
                audio.removeEventListener('timeupdate', handleTimeUpdateEvent);
                audio.removeEventListener('loadedmetadata', handleLoadedMetadataEvent);
            });
        });

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }, [sortedAndFilteredMusic.length, handleTimeUpdate, handleLoadedMetadata]);

    // CRITICAL FIX: Canvas resize handler with debounce
    useEffect(() => {
        let timeoutId;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                sortedAndFilteredMusic.forEach((music, index) => {
                    const canvas = canvasRefs.current[index];
                    if (!canvas) return;

                    const container = canvas.parentElement;
                    if (!container) return;
                    canvas.width = container.offsetWidth;
                    canvas.height = 48;
                    drawWaveform(music._id, index);
                });
            }, 100);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            animationRefs.current.forEach(id => {
                if (id) cancelAnimationFrame(id);
            });
        };
    }, [sortedAndFilteredMusic.length, drawWaveform]);

    // CRITICAL FIX: Redraw waveforms with proper debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            sortedAndFilteredMusic.forEach((music, index) => {
                drawWaveform(music._id, index);
            });
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [musicProgress, sortedAndFilteredMusic.length, drawWaveform]);

    // Click outside handler for sort dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cover image modal effect
    useEffect(() => {
        if (open && selectedMusicId && !image) {
            const m = allMusic.find(x => x._id === selectedMusicId);
            const url = m ? getCoverUrl(m) : null;
            if (url) setImage(url);
        }
    }, [open, selectedMusicId, allMusic, image, getCoverUrl]);

    // Other handlers
    const handleCreateNewProject = async () => {
        // try {
        //     const uniqueName = 'Untitled Song';
        //     const created = await dispatch(createMusic({
        //         name: uniqueName,
        //         musicdata: {},
        //         userId: userId
        //     })).unwrap();
        //     console.log("created", created);
        //     const id = created?._id || created?.id;
        //     if (id) {
        //         dispatch(setCurrentMusic(created));
        //         navigate('/sidebar/timeline', { state: { projectId: id, isNewProject: true } });
        //     } else {
        //         navigate('/sidebar/timeline', { state: { isNewProject: true } });
        //     }
        // } catch (e) {
        // navigate('/sidebar/timeline', { state: { isNewProject: true } });
        // }
        dispatch(resetStudio());
        navigate('/sidebar/timeline', { state: { isNewProject: true } });
    };

    const handleDeleteMusic = async () => {
        if (!deleteId) return;
        try {
            await dispatch(deleteMusic(deleteId)).unwrap();
            await dispatch(getAllMusic());
        } catch (error) {
            console.log("error", error);
        } finally {
            setDeleteProModal(false);
            setDeleteId(null);
        }
    };

    const handleInlineRenameSave = async (musicId) => {
        if (editingMusicName.trim()) {
            try {
                await dispatch(renameMusic({
                    musicId,
                    musicName: editingMusicName.trim()
                }));
                await dispatch(getAllMusic());
            } finally {
                setEditingMusicId(null);
                setEditingMusicName('');
            }
        }
    };

    const handleConfirmMove = async () => {
        if (!moveMusicId || !selectedFolderId) return;
        try {
            await dispatch(moveToFolderMusic({ musicId: moveMusicId, folderId: selectedFolderId }));
            await dispatch(getAllMusic());
        } finally {
            setMoveModalOpen(false);
            setMoveMusicId(null);
            setSelectedFolderId(null);
        }
    };

    const handleExport = async (music) => {
        try {
            const audioUrl = music?.url
                ? (music.url.startsWith('http') ? music.url : `${IMAGE_URL}${music.url}`)
                : null;
            if (!audioUrl) return;

            const res = await fetch(audioUrl, { mode: 'cors' });
            if (!res.ok) throw new Error('Failed to download audio');
            const blob = await res.blob();

            const fileName = `${(music?.name || 'track').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 200)}.mp3`;

            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (e) {
            console.error('Export failed:', e);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) return;
        setSelectedFile(file);
        setImage(URL.createObjectURL(file));
    };

    const handleSaveCoverImage = async () => {
        if (!selectedMusicId || !selectedFile) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('musicId', selectedMusicId);
            formData.append('coverImage', selectedFile);

            await dispatch(addCoverImage(formData));
            await dispatch(getAllMusic());

            setImage(null);
            setSelectedFile(null);
            setSelectedMusicId(null);
            setOpen(false);

            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error uploading cover image:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleCloseCoverModal = () => {
        setOpen(false);
        setImage(null);
        setSelectedFile(null);
        setSelectedMusicId(null);
        setUploading(false);

        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleRemoveSelectedImage = () => {
        setImage(null);
        setSelectedFile(null);
        const input = document.getElementById('file-upload');
        if (input) input.value = '';
    };

    const handleRemoveCoverImage = async () => {
        if (!selectedMusicId) return;
        setUploading(true);
        try {
            await dispatch(removeCoverImage(selectedMusicId));
            await dispatch(getAllMusic());
            setImage(null);
            setSelectedFile(null);
            const input = document.getElementById('file-upload');
            if (input) input.value = '';
        } finally {
            setUploading(false);
        }
    };

    // Formik configuration
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

    const handleRenameClick = (folderId, currentName) => {
        setEditingFolderId(folderId);
        setEditingFolderName(currentName);
        setAddFolderModal(true);
        formik.setFieldValue('folderName', currentName);
    };

    const handleDeleteClick = async (folderId) => {
        await dispatch(deleteFolderById(folderId));
    };

    const handleSortSelect = (option) => {
        setSortBy(option.value);
        setIsSortDropdownOpen(false);
    };

    const handleMusicRenameClick = (musicId, currentName) => {
        setEditingMusicId(musicId);
        setEditingMusicName(currentName);
    };

    const handleInlineRenameCancel = () => {
        setEditingMusicId(null);
        setEditingMusicName('');
    };

    const handleInlineRenameKeyPress = (e, musicId) => {
        if (e.key === 'Enter') {
            handleInlineRenameSave(musicId);
        } else if (e.key === 'Escape') {
            handleInlineRenameCancel();
        }
    };

    return (
        <>
            <div className="p-3 lg:p-5 xl:p-6 2xl:p-8 3xl:p-10 bg-[#141414]">
                <div className="flex gap-3 text-white top-0 left-0 bg-[#141414] xl:pt-2 xl:py-2 2xl:pt-3 2xl:py-4">
                    <div className="md:hidden mb-4">
                        <button onClick={openOffcanvas} className="flex items-center justify-center w-10 h-10 bg-[#2b2b2b] rounded-lg border border-[#FFFFFF1A] hover:bg-[#3b3b3b] transition-colors">
                            <HiMenu className="text-white text-xl" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-[16px] md:text-[18px] lg:text-[20px] 2xl:text-[24px] 3xl:text-[30px] font-bold pt-2 md:pt-0">My Projects</h1>
                    </div>
                </div>

                <div className='max-h-[80vh] min-h-[760px] overflow-auto d_customscrollbar'>
                    <div className="flex flex-col md:flex-row mt-2 md:mt-2 lg:mt-3 xl:mt-4 3xl:mt-5 gap-3 md600:gap-5 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
                        <div>
                            <p className="text-white text-[14px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] 3xl:text-[24px] font-[600]">Start a new project</p>
                            <p className="text-white text-[12px] lg:text-[14px] 2xl:text-[14px] 3xl:text-[15px] lg:text-nowrap">Create a music or podcast project.</p>
                            <div className='flex bg-black mt-3 md:mt-2 lg:mt-3 3xl:mt-4 h-[150px] md:w-[150px] lg:h-[180px] lg:w-[220px] 2xl:h-[180px] 2xl:w-[200px] 3xl:h-[200px] 3xl:w-[250px] d_customborder items-center justify-center' onClick={handleCreateNewProject}>
                                <button className='border-2 border-dashed border-white flex flex-col items-center justify-center group p-3 xl:p-4 rounded-xl hover:bg-gray-900'>
                                    <p className="text-white text-[16px] lg:text-[20px] xl:text-[24px]">+</p>
                                    <p className="text-white text-[12px] xl:text-[14px] md:w-[60px] lg:w-full text-wrap lg:text-nowrap">New Project</p>
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className='flex justify-between'>
                                <div>
                                    <p className="text-white text-[16px] lg:text-[18px] 2xl:text-[20px] 3xl:text-[24px] font-[600]">Explore demo projects</p>
                                    <p className="text-white text-[12px] lg:text-[14px] 2xl:text-[14px] 3xl:text-[15px] text-wrap w-[200px] sm:text-nowrap md:text-wrap md:w-[200px] lg:w-full lg:text-nowrap">Play around with professionally-made songs.</p>
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
                                        <div key={sound._id || index} className="bg-[#14141480] rounded-[4px] overflow-hidden d_customborder" onClick={() => navigate('/sidebar/timeline', { state: { demoSound: { _id: sound?._id, soundname: sound?.soundname, image: sound?.image, soundfile: sound?.soundfile } } })}>
                                            <div className='w-full h-[105px] sm:h-[135px] md600:h-[105px] lg:h-[131px] xl:h-[125px] 2xl:h-[124px] 3xl:h-[135px]'>
                                                <img src={`${IMAGE_URL}uploads/image/${sound?.image}`} alt="Album" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="py-[4px] px-[4px] lg:py-[6px] lg:px-[8px] 2xl:px-[10px] 3xl:py-[8px] 3xl:px-[12px]">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="text-[#fff] font-[500] text-[12px] sm:text-[14px] md:text-[12px] 2xl:text-[14px] 3xl:text-[16px] mb-[2px]">{sound?.soundname}</h3>
                                                        <p className="text-[#FFFFFF99] font-[400] text-[10px] sm:text-[12px] md:text-[10px] xl:text-[14px]">{sound?.category[0]?.name}</p>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); handlePlayPause(index); }} className="bg-[#141414] text-black rounded-full w-[20px] h-[20px] sm:w-[28px] sm:h-[28px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px] flex justify-center items-center border-[0.5px] border-[#FFFFFF1A]">
                                                        <img src={playingIndex === index ? pause : play} alt="" className='w-2 h-2 sm:w-3 sm:h-3' />
                                                    </button>
                                                    <audio
                                                        ref={el => audioRefs.current[index] = el}
                                                        src={`${IMAGE_URL}uploads/soundfile/${sound?.soundfile}`}
                                                        onEnded={() => setPlayingIndex(null)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-4 md:mt-5 lg:mt-8 xl:mt-10 2xl:mt-12 3xl:mt-14 flex justify-between pb-2 md:pb-2 lg:pb-3 2xl:pb-4 3xl:pb-5 border-b border-[#FFFFFF1A]'>
                        <div className='my-auto'>
                            <button className='py-1 px-2 md600:py-2 md600:px-5 md:py-1 md:px-4 lg:py-2 lg:px-6 border rounded-3xl border-[#FFFFFF1A] hover:bg-gray-600 cursor-pointer' onClick={() => setAddFolderModal(true)}>
                                <p className='text-white text-[10px] sm:text-[12px] md600:text-[16px]'>+ Add Folder</p>
                            </button>
                        </div>
                        <div className="flex">
                            {activeSearch === true ? (
                                <div className='bg-[#FFFFFF0F]'>
                                    <div className="flex gap-1 sm:gap-2 md600:gap-4 md:gap-3 lg:gap-4 2xl:gap-5 py-1 px-2 sm:px-3 md600:py-2 md600:px-5 md:py-1 md:px-4 lg:py-2 lg:px-5 items-center justify-center">
                                        <FiSearch className="text-white text-[14px] sm:text-[18px] md:text-[20px] lg:text-[24px]" />
                                        <input type="text" className="outline-none w-32 sm:w-40 md:w-full text-[10px] sm:text-[12px] md600:text-[16px] md:text-[20px] border-0 bg-transparent text-white" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                        <IoClose className="text-white ms-auto cursor-pointer sm:text-[18px] md:text-[20px] lg:text-[24px]" onClick={() => { setActiveSearch(false); setSearchText(""); }} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className='flex relative pe-2' ref={sortDropdownRef}>
                                        <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className='flex items-center gap-2 md600:gap-3 text-white cursor-pointer hover:text-gray-300 transition-colors'>
                                            <span className='text-[10px] sm:text-[12px] md600:text-[14px]'>Sort by : {sortBy}</span>
                                            <IoIosArrowDown className={`text-white transition-transform duration-300 ${isSortDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                        </button>

                                        {isSortDropdownOpen && (
                                            <div className="absolute top-full right-0 md600:mt-2 bg-[#1F1F1F] rounded-lg shadow-lg z-10 min-w-[150px] md600:min-w-[200px]">
                                                {sortOptions.map((option) => (
                                                    <div key={option.value} onClick={() => handleSortSelect(option)} className="flex items-center py-1 px-2 sm:py-2 sm:px-3 md600:px-4 md600:py-3 md:px-3 md:py-2 2xl:px-4 2xl:py-3 hover:bg-[#3b3b3b] cursor-pointer transition-colors">
                                                        <div className="flex items-center">
                                                            <div className={`w-3 h-3 md600:w-4 md600:h-4 md:w-3 md:h-3 2xl:w-4 2xl:h-4 border-2 rounded-full mr-2 md600:mr-3 md:mr-2 2xl:mr-3 flex items-center justify-center ${sortBy === option.value ? 'border-white' : 'border-[#FFFFFF40]'}`}>
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
                                        <FiSearch className="text-white text-[14px] md:text-[17px] 2xl:text-[18px]" />
                                    </div>
                                </>
                            )}
                            <div className='my-auto px-2 md600:px-3 md:px-2 2xl:px-3'>
                                <AdaptiveMenu button={<BsThreeDotsVertical className='text-white text-[14px] md:text-[17px] 2xl:text-[18px]' />} widthClass="w-36 sm:w-48 xl:w-52 2xl:w-64">
                                    <div>
                                        <MenuItem>
                                            <p className="block px-3 sm:px-4 md600:px-5 lg:px-6 py-1 2xl:px-7 xl:py-2 3xl:px-9 3xl:py-3 hover:bg-gray-800 cursor-pointer" onClick={() => navigate('/recently-deleted')}>
                                                <div className="flex items-center">
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

                    {sortedAndFilteredFolders?.length > 0 && sortedAndFilteredFolders.map((ele) => (
                        <div key={ele._id} className="flex pt-2 md600:pt-3 lg:pt-3 ps-2 md600:ps-3 2xl:pt-4 2xl:ps-4 3xl:pt-5 3xl:ps-5 pe-2 md600:pe-3 md:pe-2 border-b border-[#FFFFFF1A] pb-2 cursor-pointer" onClick={() => navigate(`/project/folder/${ele._id}`)}>
                            <img src={folder} alt="" className='w-[16px] h-[16px] sm:w-[20px] sm:h-[20px] lg:w-[22px] lg:h-[22px] my-auto' />
                            <p className="text-white ps-2 md600:ps-3 lg:ps-4 my-auto text-[12px] sm:text-[14px] md:text-[15px]">{ele?.folderName}</p>
                            <div className='ms-auto' onClick={(e) => e.stopPropagation()}>
                                <AdaptiveMenu button={<BsThreeDotsVertical className='text-white text-[12px] sm:text-[14px] md600:text-[16px] lg:text-[18px] 3xl:text-[20px]' />} widthClass="w-40 2xl:w-25">
                                    <div>
                                        <MenuItem>
                                            <p className="block px-4 py-1 md600:px-5 lg:px-6 md600:py-1 2xl:px-7 lg:py-2 3xl:px-5 3xl:py-3 hover:bg-gray-800 cursor-pointer" onClick={() => handleRenameClick(ele._id, ele.folderName)}>
                                                <div className="flex items-center">
                                                    <img src={rename} alt="" className='w-3 h-3 md600:w-4 md600:h-4 2xl:w-6 2xl:h-6' />
                                                    <p className="text-white ps-2 md600:ps-3 xl:ps-4 3xl:ps-4 font-semibold text-[12px] md600:text-[14px] 2xl:text-[16px]">Rename</p>
                                                </div>
                                            </p>
                                        </MenuItem>
                                        <MenuItem>
                                            <p className="block px-4 py-1 md600:px-5 lg:px-6 md600:py-1 2xl:px-7 lg:py-2 3xl:px-5 3xl:py-3 hover:bg-gray-800 cursor-pointer" onClick={() => handleDeleteClick(ele._id)}>
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

                    {sortedAndFilteredFolders?.length === 0 && sortedAndFilteredMusic?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="relative">
                                <img src={notFound} alt="" className='w-24 h-24' />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-300 mb-2">
                                    {searchText ? `No results found for "${searchText}"` : "No folders found"}
                                </h3>
                                <p className="text-sm text-gray-500 mb-1">Sorry! We couldn't find that try looking for</p>
                                <p className="text-sm text-gray-500">something else</p>
                            </div>
                        </div>
                    )}

                    {sortedAndFilteredMusic.map((ele, index) => {
                        const isPlaying = playingMusicId === ele._id;
                        const duration = musicDurations[ele._id] || '0:00';
                        const isEditing = editingMusicId === ele._id;
                        const audioUrl = ele.url ? (ele.url.startsWith('http') ? ele.url : `${IMAGE_URL}${ele.url}`) : null;
                        const coverUrl = getCoverUrl(ele);

                        return (
                            <div className="w-full mx-auto" key={ele._id}>
                                <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm">
                                    <audio
                                        ref={el => musicAudioRefs.current[index] = el}
                                        src={audioUrl}
                                        preload="metadata"
                                        crossOrigin="anonymous"
                                    />
                                    <div className='w-12 h-12 bg-white rounded-sm overflow-hidden flex items-center justify-center'>
                                        {coverUrl ? (
                                            <img src={coverUrl} alt={ele?.name || 'cover'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div
                                                className="w-full h-full"
                                                style={{ backgroundColor: generateRandomColor(ele?._id || ele?.name || 'default') }}
                                            />
                                        )}
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-md">
                                            <button onClick={() => handlePlayPauseMusic(ele._id, index)} className="text-white">
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
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                                                    <input
                                                        type="text"
                                                        value={editingMusicName}
                                                        onChange={(e) => setEditingMusicName(e.target.value)}
                                                        onKeyDown={(e) => handleInlineRenameKeyPress(e, ele._id)}
                                                        onBlur={() => handleInlineRenameSave(ele._id)}
                                                        className="flex-1 bg-transparent text-white border border-purple-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleInlineRenameSave(ele._id)} className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors">Save</button>
                                                    <button onClick={handleInlineRenameCancel} className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors">Cancel</button>
                                                </div>
                                            ) : (
                                                <h3 className="text-sm font-medium truncate">{ele?.name}</h3>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <canvas
                                                ref={el => canvasRefs.current[index] = el}
                                                className="w-full h-12 cursor-pointer"
                                                onClick={(e) => handleCanvasClick(e, ele._id, index)}
                                                style={{ display: 'block' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="text-md font-mono">{duration}</div>
                                        <AdaptiveMenu
                                            key={ele._id}
                                            placement="right-start"
                                            widthClass="w-56"
                                            button={<BsThreeDotsVertical size={16} className="cursor-pointer transition-colors" />}
                                        >
                                            <div className="py-1">
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <button onClick={() => handleMusicRenameClick(ele._id, ele.name)} className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}>
                                                            <img src={rename} alt="rename icon" className='w-3 h-3 md600:w-4 md600:h-4 2xl:w-5 2xl:h-5' />
                                                            Rename
                                                        </button>
                                                    )}
                                                </MenuItem>
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <button type="button" onClick={() => { setSelectedMusicId(ele._id); setImage(coverUrl || null); setOpen(true); }} className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}>
                                                            <IoImageOutline size={20} />
                                                            Change cover
                                                        </button>
                                                    )}
                                                </MenuItem>
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <button type="button" onClick={() => { setMoveMusicId(ele._id); setMoveModalOpen(true); }} className={`flex items-center justify-between px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}>
                                                            <span className="flex items-center gap-2"><IoFolderOutline size={20} /> Move to folder</span>
                                                            <span><FaAngleRight size={20} /></span>
                                                        </button>
                                                    )}
                                                </MenuItem>
                                                <hr className="my-1 border-gray-200" />
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <button type="button" onClick={() => handleExport(ele)} className={`flex items-center justify-between px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}>
                                                            <span className="flex items-center gap-2"><FaArrowDownLong size={18} /> Export (MP3)</span>
                                                            <span><FaAngleRight size={20} /></span>
                                                        </button>
                                                    )}
                                                </MenuItem>
                                                <hr className="my-1 border-gray-200" />
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <button type="button" onClick={() => { setSelectedProjectName(ele?.name || ''); setDeleteId(ele?._id || ele?.id); setDeleteProModal(true); }} className={`flex items-center gap-2 px-4 py-2 text-sm w-full ${active ? "bg-gray-600 text-red-600" : "text-red-600"}`}>
                                                            <MdDeleteOutline size={20} /> Delete
                                                        </button>
                                                    )}
                                                </MenuItem>
                                            </div>
                                        </AdaptiveMenu>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Change Cover Model */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="bg-[#222222] rounded-xl shadow-lg w-[500px] max-w-[90%] relative">
                        {/* Close Button */}
                        <button className="absolute top-3 right-3 text-white hover:text-gray-300" onClick={handleCloseCoverModal} disabled={uploading}><X size={20} /></button>
                        {/* Title */}
                        <div className="px-6 pt-6 pb-4">
                            <h2 className="text-lg font-semibold text-white">Edit cover</h2>
                        </div>
                        {/* Image Upload Box */}
                        <div className="p-12 flex flex-col items-center">
                            <label htmlFor="file-upload" className={`border-2 border-dashed border-gray-300 rounded-md w-52 h-52 flex flex-col items-center justify-center text-center cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {image ? (
                                    <img src={image} alt="preview" className="w-full h-full object-cover rounded-md" />
                                ) : (
                                    <>
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7l9 6 9-6" />
                                        </svg>
                                        <p className="text-white text-sm mt-2">Select an image, or drag it here</p>
                                        <span className="mt-2 inline-block px-3 py-1 text-sm border rounded-md">Select</span>
                                    </>
                                )}
                            </label>
                            <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />

                            {/* NEW: Remove buttons */}
                            {image && !uploading && (
                                <>
                                    {selectedFile ? (
                                        <button type="button" onClick={handleRemoveSelectedImage} className="mt-4 px-4 py-1 rounded-full bg-[#E11D48] text-white text-sm">Remove</button>
                                    ) : (
                                        <button type="button" onClick={handleRemoveCoverImage} className="mt-4 px-4 py-1 rounded-full bg-[#E11D48] text-white text-sm">Remove</button>
                                    )}
                                </>
                            )}

                            {/* Upload progress indicator */}
                            {uploading && (
                                <div className="mt-4 flex items-center gap-2 text-white">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span className="text-sm">Uploading...</span>
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 flex justify-end gap-3 border-t">
                            <button onClick={() => { setOpen(false); setImage(null); setSelectedFile(null); setSelectedMusicId(null); }} className="px-4 py-2 rounded-full border text-white" disabled={uploading}>Cancel</button>
                            <button
                                onClick={async () => {
                                    if (!selectedMusicId || !selectedFile) return;
                                    setUploading(true);
                                    try {
                                        await dispatch(addCoverImage({ musicId: selectedMusicId, file: selectedFile }));
                                        await dispatch(getAllMusic());
                                        setOpen(false);
                                        setImage(null);
                                        setSelectedFile(null);
                                        setSelectedMusicId(null);
                                    } finally {
                                        setUploading(false);
                                    }
                                }}
                                className={`px-6 py-2 rounded-full text-white ${image && !uploading ? "bg-black hover:bg-gray-800" : "bg-gray-600 cursor-not-allowed"}`}
                                disabled={!image || uploading}
                            >
                                {uploading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Move to Folder Modal */}
            <Dialog open={moveModalOpen} onClose={setMoveModalOpen} className="relative z-10">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-[#1F1F1F] border-b-[0.5px] border-b-[#FFFFFF1A]">
                                <div className="flex justify-between items-center">
                                    <div className="sm:text-xl text-lg font-[600] text-[#fff]">Move to folder</div>
                                    <img src={close} alt="" onClick={() => setMoveModalOpen(false)} className="cursor-pointer" />
                                </div>
                            </div>
                            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                <div className="space-y-2 max-h-[300px] overflow-auto d_customscrollbar px-[4px]">
                                    {folders && folders.length > 0 ? (
                                        folders.map((f) => (
                                            <label key={f._id} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-[#2b2b2b] cursor-pointer">
                                                <input type="radio" name="moveFolder" value={f._id} checked={selectedFolderId === f._id} onChange={() => setSelectedFolderId(f._id)} />
                                                <span className="text-white">{f.folderName}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="text-[#FFFFFF99] text-sm">No folders. Create one first.</div>
                                    )}
                                </div>
                                <div className="text-center md:pt-[24px] pt-[16px]">
                                    <button type="button" className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => { setMoveModalOpen(false); setMoveMusicId(null); setSelectedFolderId(null); }}>Cancel</button>
                                    <button type="button" className="d_btn d_createbtn" disabled={!selectedFolderId} onClick={handleConfirmMove}>Move</button>
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
                                        <input type="text" name="folderName" placeholder='Folder Name' className='text-[#FFFFFF99] rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.folderName} />
                                        {formik.touched.folderName && formik.errors.folderName ? (
                                            <div className="text-red-500 text-xs mt-1">{formik.errors.folderName}</div>
                                        ) : null}
                                    </div>
                                    <div className="text-center md:pt-[40px] pt-[20px]">
                                        <button type="button" className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => { setAddFolderModal(false); formik.resetForm(); setEditingFolderId(null) }} >Cancel</button>
                                        <button type="submit" className="d_btn d_createbtn"> {editingFolderId ? "Rename Folder" : "Create"}</button>
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