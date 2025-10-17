import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Play, Pause, X } from 'lucide-react';
import { IMAGE_URL } from '../Utils/baseUrl';
import { getAllMusic, getDeletedMusic, renameMusic, moveToFolderMusic, deleteMusic, addCoverImage, removeCoverImage } from '../Redux/Slice/music.slice';
import { getFolderByUserId } from '../Redux/Slice/folder.slice';
import close from '../Images/close.svg';
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { IoClose, IoFolderOutline, IoImageOutline } from "react-icons/io5";
import { FaAngleRight, FaArrowDownLong, FaChevronLeft } from "react-icons/fa6";
import notFound from '../Images/no-folder-img.png';
import rename from "../Images/renameIcon.svg";
import { MdDeleteOutline } from 'react-icons/md';

const generateRandomColor = (seed) => {
  const colors = [
      '#AA005B', 
      '#611364', 
      '#F59B23', 
      '#E33751', 
      '#14833B', 
      '#1A8CDE', 
      '#FA6033', 
      '#2D46B9',
  ];
  
  // Use seed to get consistent color for same item
  const index = Math.abs(seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
  }, 0)) % colors.length;
  
  return colors[index];
};

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
                className={`z-50 ${widthClass} origin-top-right bg-[#1f1f1f] shadow-lg outline-none rounded-md ring-1 ring-black ring-opacity-5`}
            >
                {children}
            </MenuItems>
        </Menu>
    );
};

const FolderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allMusic = useSelector((s) => s.music.allmusic);
  const folders = useSelector((s) => s.folder.folders);
  const userId = sessionStorage.getItem('userId');

  const [playingMusicId, setPlayingMusicId] = useState(null);
  const [musicDurations, setMusicDurations] = useState({});
  const [musicCurrentTimes, setMusicCurrentTimes] = useState({});
  const [musicProgress, setMusicProgress] = useState({});
  const [musicAudioLoaded, setMusicAudioLoaded] = useState({});

  const [editingMusicId, setEditingMusicId] = useState(null);
  const [editingMusicName, setEditingMusicName] = useState('');

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveMusicId, setMoveMusicId] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedMusicId, setSelectedMusicId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Sort state (mirror Home2 behavior)
  const [sortBy, setSortBy] = useState('Last updated');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const sortOptions = [
    { value: 'Last updated', label: 'Last updated' },
    { value: 'Oldest updated', label: 'Oldest updated' },
    { value: 'Last created', label: 'Last created' },
    { value: 'Title', label: 'Title' },
  ];

  // Search state
  const [searchText, setSearchText] = useState('');
  const [activeSearch, setActiveSearch] = useState(false);

  const musicAudioRefs = useRef([]);
  const canvasRefs = useRef([]);
  const animationRefs = useRef([]);
  const audioContextRefs = useRef([]);
  const analyserRefs = useRef([]);
  const dataArrayRefs = useRef([]);

  useEffect(() => {
    dispatch(getAllMusic());
    dispatch(getDeletedMusic());
    if (userId) dispatch(getFolderByUserId(userId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userId, id]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getItemFolderId = (m) =>
    m?.folderId || (typeof m?.folder === 'string' ? m.folder : m?.folder?._id) || null;

  const deletedMusic = useSelector((state) => state.music.deletedmusic);
  
  const items = useMemo(() => {
    const allMusicData = [...(deletedMusic || []), ...(allMusic || [])];
    return allMusicData
      .filter(m => getItemFolderId(m) === id)
      .sort((a, b) => {
        // If one is deleted and other is not, deleted item comes first
        if (a.isDeleted && !b.isDeleted) return -1;
        if (!a.isDeleted && b.isDeleted) return 1;
        return 0;
      });
  }, [allMusic, deletedMusic, id]);

  // Sorted items according to sortBy
  const sortedItems = useMemo(() => {
    const filtered = items.filter(m => {
      if (!searchText.trim()) return true;
      return (m?.name || '').toLowerCase().includes(searchText.toLowerCase());
    });
    const list = [...filtered];
    list.sort((a, b) => {
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
    return list;
  }, [items, sortBy, searchText]);

  const handleSortSelect = (option) => {
    setSortBy(option.value);
    setIsSortDropdownOpen(false);
  };

  const getCoverUrl = (m) => {
    const candidate = m?.coverImage || m?.cover || m?.image || m?.thumbnail;
    if (!candidate) return null;
    return candidate.startsWith('http') ? candidate : `${IMAGE_URL}${candidate}`;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const initializeAudioContext = useCallback(async (musicId) => {
    const index = items.findIndex(m => m._id === musicId);
    if (index === -1) return;
    if (!audioContextRefs.current[index] && musicAudioRefs.current[index]) {
      try {
        audioContextRefs.current[index] = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRefs.current[index].createMediaElementSource(musicAudioRefs.current[index]);
        analyserRefs.current[index] = audioContextRefs.current[index].createAnalyser();

        analyserRefs.current[index].fftSize = 256;
        const bufferLength = analyserRefs.current[index].frequencyBinCount;
        dataArrayRefs.current[index] = new Uint8Array(bufferLength);

        source.connect(analyserRefs.current[index]);
        analyserRefs.current[index].connect(audioContextRefs.current[index].destination);
      } catch {
        // no-op
      }
    }
  }, [items]);

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
    const progressPoint = progress * barCount;

    // Static waveform pattern (same as Home2)
    for (let i = 0; i < barCount; i++) {
      const seed = i * 0.1;
      const barHeight = Math.max(
        3,
        (Math.sin(seed) * 0.5 + 0.5 + Math.sin(seed * 3) * 0.3) * height * 0.7
      );
      const x = i * (barWidth + barSpacing);
      const y = (height - barHeight) / 2;

      ctx.fillStyle = i < progressPoint ? '#3B82F6' : '#D1D5DB';
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [musicProgress]);

  const handlePlayPauseMusic = async (musicId, filteredIndex) => {
    if (filteredIndex === -1 || !musicAudioRefs.current[filteredIndex]) return;
    const audioRef = musicAudioRefs.current[filteredIndex];
    const isPlaying = playingMusicId === musicId;

    if (audioContextRefs.current[filteredIndex]?.state === 'suspended') {
      await audioContextRefs.current[filteredIndex].resume();
    }

    if (isPlaying) {
      audioRef.pause();
      setPlayingMusicId(null);
    } else {
      musicAudioRefs.current.forEach((ref, idx) => {
        if (idx !== filteredIndex && ref) {
          ref.pause();
        }
      });
      try {
        await initializeAudioContext(musicId);
        await audioRef.play();
        setPlayingMusicId(musicId);
      } catch {
        try {
          await audioRef.play();
          setPlayingMusicId(musicId);
        } catch {}
      }
    }
  };

  const handleTimeUpdate = (musicId, filteredIndex) => {
    if (filteredIndex === -1 || !musicAudioRefs.current[filteredIndex]) return;
    const audioRef = musicAudioRefs.current[filteredIndex];
    const current = audioRef.currentTime;
    const total = audioRef.duration;
    setMusicCurrentTimes(prev => ({ ...prev, [musicId]: formatTime(current) }));
    setMusicProgress(prev => ({ ...prev, [musicId]: total > 0 ? current / total : 0 }));
  };

  const handleLoadedMetadata = (musicId, filteredIndex) => {
    if (filteredIndex === -1 || !musicAudioRefs.current[filteredIndex]) return;
    const audioRef = musicAudioRefs.current[filteredIndex];
    setMusicDurations(prev => ({ ...prev, [musicId]: formatTime(audioRef.duration) }));
    setMusicAudioLoaded(prev => ({ ...prev, [musicId]: true }));
  };

  const handleCanvasClick = (e, musicId, filteredIndex) => {
    if (filteredIndex === -1 || !musicAudioRefs.current[filteredIndex] || !musicAudioLoaded[musicId]) return;
    const audioRef = musicAudioRefs.current[filteredIndex];
    const canvas = canvasRefs.current[filteredIndex];
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickProgress = clickX / canvas.width;
    const newTime = clickProgress * audioRef.duration;
    audioRef.currentTime = newTime;
    setMusicProgress(prev => ({ ...prev, [musicId]: clickProgress }));
  };

  useEffect(() => {
    sortedItems.forEach((m, index) => {
      const audio = musicAudioRefs.current[index];
      if (audio) {
        const musicId = m._id;
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

        return () => {
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('timeupdate', handleTimeUpdateEvent);
          audio.removeEventListener('loadedmetadata', handleLoadedMetadataEvent);
        };
      }
    });
  }, [sortedItems]);

  useEffect(() => {
    sortedItems.forEach((m, index) => {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        const musicId = m._id;
        const resizeCanvas = () => {
          const container = canvas.parentElement;
          canvas.width = container.offsetWidth;
          canvas.height = 48;
          drawWaveform(musicId, index);
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => {
          window.removeEventListener('resize', resizeCanvas);
          if (animationRefs.current[index]) cancelAnimationFrame(animationRefs.current[index]);
        };
      }
    });
  }, [sortedItems, drawWaveform]);

  useEffect(() => {
    sortedItems.forEach((m, index) => drawWaveform(m._id, index));
  }, [sortedItems, drawWaveform, musicProgress]);


  const handleInlineRenameSave = async (musicId) => {
    if (editingMusicName.trim()) {
      try {
        await dispatch(renameMusic({ musicId, musicName: editingMusicName.trim() }));
        await dispatch(getAllMusic());
      } finally {
        setEditingMusicId(null);
        setEditingMusicName('');
      }
    }
  };
  const handleInlineRenameCancel = () => {
    setEditingMusicId(null);
    setEditingMusicName('');
  };
  const handleInlineRenameKeyPress = (e, musicId) => {
    if (e.key === 'Enter') handleInlineRenameSave(musicId);
    else if (e.key === 'Escape') handleInlineRenameCancel();
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

  const handleDeleteMusic = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteMusic(deleteId));
      await dispatch(getAllMusic());
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const sanitizeFileName = (name) =>
    (name || 'track').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 200);

  const handleExport = async (music) => {
    try {
        const audioUrl = music?.url
            ? (music.url.startsWith('http') ? music.url : `${IMAGE_URL}${music.url}`)
            : null;
        if (!audioUrl) return;

        const res = await fetch(audioUrl, { mode: 'cors' });
        if (!res.ok) throw new Error('Failed to download audio');
        const blob = await res.blob();

        const fileName = `${sanitizeFileName(music?.name)}.mp3`;

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

  // Cover image functions
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    setSelectedFile(file);
    setImage(URL.createObjectURL(file));
  };
  
  const handleCloseCoverModal = () => {
    setOpen(false);
    setImage(null);
    setSelectedMusicId(null);
    setUploading(false);
    
    // Reset file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Remove selected image (and clear the file input)
  const handleRemoveSelectedImage = () => {
    setImage(null);
    setSelectedFile(null);
    const input = document.getElementById('file-upload');
    if (input) input.value = '';
  };

  // Remove existing cover image from server
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

  // Fallback: when modal opens, preload the current cover if no preview is set yet
  useEffect(() => {
    if (open && selectedMusicId && !image) {
      const m = allMusic.find(x => x._id === selectedMusicId);
      const url = m ? getCoverUrl(m) : null;
      if (url) setImage(url);
    }
  }, [open, selectedMusicId, allMusic, image]);

  const audioUrl = (m) => (m.url ? (m.url.startsWith('http') ? m.url : `${IMAGE_URL}${m.url}`) : null);

  const folderName = useMemo(() => (folders?.find(f => f._id === id)?.folderName || 'Folder'), [folders, id]);

  return (
    <>
      <div className="p-3 lg:p-5 xl:p-6 2xl:p-8 3xl:p-10 bg-[#141414]">
        <div className="flex items-center py-3 cursor-pointer" onClick={() => navigate('/project')}>
          <FaChevronLeft className='w-4 h-4 text-[#FFFFFF99]' />
          <span className="text-[15px] font-bold ps-2 text-[#FFFFFF99]">Projects</span>
        </div>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3 cursor-pointer">
            <h1 className="text-[16px] md:text-[18px] lg:text-[20px] 2xl:text-[24px] 3xl:text-[30px] font-bold">{folderName}</h1>
          </div>
          <div className='flex items-center gap-3'>
            {activeSearch ? (
              <div className='bg-[#FFFFFF0F] rounded-md'>
                <div className='flex gap-2 py-1 px-2 items-center'>
                  <FiSearch className='text-white text-[16px]' />
                  <input
                    type='text'
                    className='outline-none w-40 md:w-56 text-sm border-0 bg-transparent text-white'
                    placeholder='Search...'
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <IoClose className='text-white cursor-pointer text-[18px]' onClick={() => { setActiveSearch(false); setSearchText(''); }} />
                </div>
              </div>
            ) : (
              <>
                <div className='relative' ref={sortDropdownRef}>
                  <button onClick={() => setIsSortDropdownOpen(v => !v)} className='flex items-center gap-2 text-white hover:text-gray-300'>
                    <span className='text-xs md:text-sm'>Sort by : {sortBy}</span>
                    <IoIosArrowDown className={`transition-transform duration-300 ${isSortDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>
                  {isSortDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-[#1F1F1F] rounded-lg shadow-lg z-10 min-w-[180px]">
                      {sortOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleSortSelect(option)}
                          className="flex items-center py-2 px-3 hover:bg-[#3b3b3b] cursor-pointer"
                        >
                          <div className={`w-3 h-3 border-2 rounded-full mr-3 flex items-center justify-center ${sortBy === option.value ? 'border-white' : 'border-[#FFFFFF40]'}`}>
                            {sortBy === option.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <span className="text-white text-sm">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className='cursor-pointer' onClick={() => setActiveSearch(true)}>
                  <FiSearch className='text-white text-[18px]' />
                </div>
              </>
            )}
          </div>
        </div>

        <div className='max-h-[80vh] min-h-[400px] overflow-auto d_customscrollbar'>
        {folders && folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="relative">
              <img src={notFound} alt="No folders" className='object-contain w-24 h-24' />
            </div>
            <div className="text-center mt-3">
              <h3 className="text-lg font-medium text-gray-300 mb-1">Your folder is Empty</h3>
            </div>
          </div>
        ) : (
        <div className="mt-4 space-y-3 relative">
          {sortedItems.length > 0 ? sortedItems.map((ele, index) => {
            const isPlaying = playingMusicId === ele._id;
            const duration = musicDurations[ele._id] || '0:00';
            const audioLoaded = musicAudioLoaded[ele._id] || false;
            const isEditing = editingMusicId === ele._id;
            const url = audioUrl(ele);
            const coverUrl = getCoverUrl(ele);

            return (
              <div className="w-full mx-auto" key={ele._id}>
                <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm">
                  {url ? (
                    <audio
                      ref={el => musicAudioRefs.current[index] = el}
                      src={url}
                      preload="auto"
                      crossOrigin="anonymous"
                      onLoadedMetadata={() => handleLoadedMetadata(ele._id, index)}
                      onCanPlay={() =>
                        setMusicAudioLoaded(prev => ({ ...prev, [ele._id]: true }))
                      }
                      onTimeUpdate={() => handleTimeUpdate(ele._id, index)}
                      onEnded={() => {
                        setPlayingMusicId(null);
                        setMusicProgress(prev => ({ ...prev, [ele._id]: 0 }));
                        setMusicCurrentTimes(prev => ({ ...prev, [ele._id]: '0:00' }));
                      }}
                      onPlay={() => setPlayingMusicId(ele._id)}
                      onPause={() => setPlayingMusicId(null)}
                      onError={(e) => {
                        console.error('Audio failed to load:', url, e);
                      }}
                  />
                  ) : (
                    <div className="text-red-500 text-xs p-2">No audio file available</div>
                  )}

                  <div className='w-12 h-12 bg-white rounded-sm overflow-hidden flex items-center justify-center'>
                    {coverUrl ? (
                      <img src={coverUrl} alt={ele?.name || 'cover'} className="w-full h-full object-cover" />
                    ) : (
                      <div 
                        className="w-full h-full"
                        style={{ backgroundColor: generateRandomColor(ele?._id || ele?.name || 'default') }}
                        ></div>
                    )}
                  </div>

                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-md">
                    <button
                        onClick={() => handlePlayPauseMusic(ele._id, index)}
                        className="text-white"
                        disabled={!url}
                      >
                        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
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
                          <button onClick={() => handleInlineRenameSave(ele._id)} className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors">
                            Save
                          </button>
                          <button onClick={handleInlineRenameCancel} className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors">
                            Cancel
                          </button>
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
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-mono">{duration}</div>
                    </div>

                    <AdaptiveMenu
                      key={ele._id}
                      placement="right-start"
                      widthClass="w-56"
                      button={<BsThreeDotsVertical size={20} className="cursor-pointer transition-colors" />}
                    >
                      <div className="py-1">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => { setEditingMusicId(ele._id); setEditingMusicName(ele.name || ''); }}
                              className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}
                            >
                              <img src={rename} alt="rename icon" className='w-3 h-3 md600:w-4 md600:h-4 2xl:w-5 2xl:h-5' />
                              Rename
                            </button>
                          )}
                        </MenuItem>

                        <MenuItem>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMusicId(ele._id);
                                // Preload existing cover into the selector preview
                                setImage(coverUrl || null);
                                setOpen(true);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}
                            >
                              <IoImageOutline size={20} /> 
                              Change cover
                            </button>
                          )}
                        </MenuItem>

                        <MenuItem>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => { setMoveMusicId(ele._id); setMoveModalOpen(true); }}
                              className={`flex items-center justify-between px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}
                            >
                              <span className="flex items-center gap-2"><IoFolderOutline size={18} /> Move to folder</span>
                              <span><FaAngleRight size={18} /></span>
                            </button>
                          )}
                        </MenuItem>

                        <MenuItem>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => handleExport(ele)}
                              className={`flex items-center justify-between px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}
                            >
                              <span className="flex items-center gap-2"><FaArrowDownLong size={18} /> Export (MP3)</span>
                              <span><FaAngleRight size={18} /></span>
                            </button>
                          )}
                        </MenuItem>

                        <hr className="my-1 border-gray-200" />

                        <MenuItem>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => { setSelectedProjectName(ele?.name || ''); setDeleteId(ele._id); setDeleteModalOpen(true); }}
                              className={`flex items-center gap-2 px-4 py-2 w-full text-sm ${active ? "bg-red-100 text-red-600" : "text-red-600"}`}
                            >
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
          }) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="relative">
                <img src={notFound} alt="No music" className='object-contain w-24 h-24' />
              </div>
              <div className="text-center mt-3">
                <h3 className="text-lg font-medium text-gray-300 mb-1">Your folder is Empty</h3>
              </div>
            </div>
          )}
        </div>
        )}
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
              <label htmlFor="file-upload" className={`border-2 border-dashed border-gray-300 rounded-md w-52 h-52 flex flex-col items-center justify-center text-center cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : '' }`}>
                {image ? (
                  <img src={image} alt="preview" className="w-full h-full object-cover rounded-md"/>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6M3 7l9 6 9-6"/>
                    </svg>
                    <p className="text-white text-sm mt-2">Select an image, or drag it here</p>
                    <span className="mt-2 inline-block px-3 py-1 text-sm border rounded-md">Select</span>
                  </>
                )}
              </label>
              <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading}/>
              
              {/* Remove buttons */}
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

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onClose={setDeleteModalOpen} className="relative z-10">
        <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
              <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-[#1F1F1F]">
                <div className="flex justify-end items-center">
                  <img src={close} alt="" onClick={() => setDeleteModalOpen(false)} className="cursor-pointer" />
                </div>
              </div>
              <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                <div className='text-center'>
                  <div className='text-base text-[#FFFFFF] font-[600] mb-[20px]'>Delete "{selectedProjectName || 'Untitled Song'}"</div>
                  <p className='text-[#FFFFFF99] text-sm font-[400] w-[260px] m-auto'>The project can be restored from "Recently deleted" for 30 days.</p>
                </div>
                <div className="text-center md:pt-[24px] pt-[16px]">
                  <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
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
                        <input
                          type="radio"
                          name="moveFolder"
                          value={f._id}
                          checked={selectedFolderId === f._id}
                          onChange={() => setSelectedFolderId(f._id)}
                        />
                        <span className="text-white">{f.folderName}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-[#FFFFFF99] text-sm">No folders. Create one first.</div>
                  )}
                </div>
                <div className="text-center md:pt-[24px] pt-[16px]">
                  <button
                    type="button"
                    className="d_btn d_cancelbtn sm:me-7 me-5"
                    onClick={() => { setMoveModalOpen(false); setMoveMusicId(null); setSelectedFolderId(null); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="d_btn d_createbtn"
                    disabled={!selectedFolderId}
                    onClick={handleConfirmMove}
                  >
                    Move
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default FolderView;