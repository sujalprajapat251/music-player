import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Play, Pause } from 'lucide-react';
import { IMAGE_URL } from '../Utils/baseUrl';
import { getAllMusic, renameMusic, moveToFolderMusic, deleteMusic } from '../Redux/Slice/music.slice';
import { getFolderByUserId } from '../Redux/Slice/folder.slice';
import close from '../Images/close.svg';

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

  const musicAudioRefs = useRef([]);
  const canvasRefs = useRef([]);
  const animationRefs = useRef([]);
  const audioContextRefs = useRef([]);
  const analyserRefs = useRef([]);
  const dataArrayRefs = useRef([]);

  useEffect(() => {
    dispatch(getAllMusic());
    if (userId) dispatch(getFolderByUserId(userId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, userId, id]);

  const getItemFolderId = (m) =>
    m?.folderId || (typeof m?.folder === 'string' ? m.folder : m?.folder?._id) || null;

  const items = useMemo(() => {
    return (allMusic || [])
      .filter(m => !m.isDeleted)
      .filter(m => getItemFolderId(m) === id);
  }, [allMusic, id]);

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

  const drawWaveform = useCallback((musicId) => {
    const index = items.findIndex(m => m._id === musicId);
    if (index === -1) return;
    const canvas = canvasRefs.current[index];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barCount = 150;
    const barWidth = 2;
    const barSpacing = (width - barCount * barWidth) / (barCount - 1);
    const startX = 0;

    const isPlaying = playingMusicId === musicId;
    const progress = musicProgress[musicId] || 0;

    if (analyserRefs.current[index] && dataArrayRefs.current[index] && isPlaying) {
      analyserRefs.current[index].getByteFrequencyData(dataArrayRefs.current[index]);
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArrayRefs.current[index].length);
        const barHeight = Math.max(3, (dataArrayRefs.current[index][dataIndex] / 255) * height * 0.8);
        const x = startX + i * (barWidth + barSpacing);
        const y = (height - barHeight) / 2;
        const progressPoint = progress * barCount;
        ctx.fillStyle = i < progressPoint ? '#3B82F6' : '#D1D5DB';
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    } else {
      for (let i = 0; i < barCount; i++) {
        const seed = i * 0.1;
        const barHeight = Math.max(3, (Math.sin(seed) * 0.5 + 0.5 + Math.sin(seed * 3) * 0.3) * height * 0.7);
        const x = startX + i * (barWidth + barSpacing);
        const y = (height - barHeight) / 2;
        const progressPoint = progress * barCount;
        ctx.fillStyle = i < progressPoint ? '#3B82F6' : '#D1D5DB';
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }
    if (isPlaying) {
      animationRefs.current[index] = requestAnimationFrame(() => drawWaveform(musicId));
    }
  }, [items, playingMusicId, musicProgress]);

  const handlePlayPauseMusic = async (musicId) => {
    const index = items.findIndex(m => m._id === musicId);
    if (index === -1 || !musicAudioRefs.current[index]) return;
    const audioRef = musicAudioRefs.current[index];
    const isPlaying = playingMusicId === musicId;

    if (audioContextRefs.current[index]?.state === 'suspended') {
      await audioContextRefs.current[index].resume();
    }

    if (isPlaying) {
      audioRef.pause();
      setPlayingMusicId(null);
    } else {
      items.forEach((m, idx) => {
        if (idx !== index && musicAudioRefs.current[idx]) {
          musicAudioRefs.current[idx].pause();
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

  const handleTimeUpdate = (musicId) => {
    const index = items.findIndex(m => m._id === musicId);
    if (index === -1 || !musicAudioRefs.current[index]) return;
    const audioRef = musicAudioRefs.current[index];
    const current = audioRef.currentTime;
    const total = audioRef.duration;
    setMusicCurrentTimes(prev => ({ ...prev, [musicId]: formatTime(current) }));
    setMusicProgress(prev => ({ ...prev, [musicId]: total > 0 ? current / total : 0 }));
  };

  const handleLoadedMetadata = (musicId) => {
    const index = items.findIndex(m => m._id === musicId);
    if (index === -1 || !musicAudioRefs.current[index]) return;
    const audioRef = musicAudioRefs.current[index];
    setMusicDurations(prev => ({ ...prev, [musicId]: formatTime(audioRef.duration) }));
    setMusicAudioLoaded(prev => ({ ...prev, [musicId]: true }));
  };

  const handleCanvasClick = (e, musicId) => {
    const index = items.findIndex(m => m._id === musicId);
    if (index === -1 || !musicAudioRefs.current[index] || !musicAudioLoaded[musicId]) return;
    const audioRef = musicAudioRefs.current[index];
    const canvas = canvasRefs.current[index];
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickProgress = clickX / canvas.width;
    const newTime = clickProgress * audioRef.duration;
    audioRef.currentTime = newTime;
    setMusicProgress(prev => ({ ...prev, [musicId]: clickProgress }));
  };

  useEffect(() => {
    items.forEach((m, index) => {
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
        const handleTimeUpdateEvent = () => handleTimeUpdate(musicId);
        const handleLoadedMetadataEvent = () => handleLoadedMetadata(musicId);

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
  }, [items]);

  useEffect(() => {
    items.forEach((m, index) => {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        const musicId = m._id;
        const resizeCanvas = () => {
          const container = canvas.parentElement;
          canvas.width = container.offsetWidth;
          canvas.height = 48;
          drawWaveform(musicId);
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => {
          window.removeEventListener('resize', resizeCanvas);
          if (animationRefs.current[index]) cancelAnimationFrame(animationRefs.current[index]);
        };
      }
    });
  }, [items, drawWaveform]);

  useEffect(() => {
    items.forEach((m) => drawWaveform(m._id));
  }, [items, drawWaveform, musicProgress]);

  const { refs, floatingStyles, update } = useFloating({
    placement: "bottom-end",
    middleware: [offset(4), flip(), shift()],
  });
  useEffect(() => {
    if (refs.reference.current && refs.floating.current) {
      return autoUpdate(refs.reference.current, refs.floating.current, update);
    }
  }, [refs.reference, refs.floating, update]);

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

  const audioUrl = (m) => (m.url ? (m.url.startsWith('http') ? m.url : `${IMAGE_URL}${m.url}`) : null);

  const folderName = useMemo(() => (folders?.find(f => f._id === id)?.folderName || 'Folder'), [folders, id]);

  return (
    <>
      <div className="p-3 lg:p-5 xl:p-6 2xl:p-8 3xl:p-10 bg-[#141414]">
        <div className="flex gap-3 text-white">
          <button className="py-1 px-3 border rounded-3xl border-[#FFFFFF1A] hover:bg-gray-600" onClick={() => navigate('/project')}>
            Back
          </button>
          <h1 className="text-[16px] md:text-[18px] lg:text-[20px] 2xl:text-[24px] 3xl:text-[30px] font-bold">{folderName}</h1>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((ele, index) => {
            const isPlaying = playingMusicId === ele._id;
            const duration = musicDurations[ele._id] || '0:00';
            const audioLoaded = musicAudioLoaded[ele._id] || false;
            const isEditing = editingMusicId === ele._id;
            const url = audioUrl(ele);

            return (
              <div className="w-full mx-auto" key={ele._id}>
                <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm">
                  {url ? (
                    <audio
                      ref={el => musicAudioRefs.current[index] = el}
                      src={url}
                      preload="metadata"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="text-red-500 text-xs p-2">No audio file available</div>
                  )}

                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-md">
                      <button
                        onClick={() => handlePlayPauseMusic(ele._id)}
                        className="text-white"
                        disabled={!audioLoaded || !url}
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
                        onClick={(e) => handleCanvasClick(e, ele._id)}
                        style={{ display: 'block' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-mono">{duration}</div>
                    </div>

                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <MenuButton ref={refs.setReference} className="outline-none">
                          <BsThreeDotsVertical size={20} className="cursor-pointer transition-colors" />
                        </MenuButton>
                      </div>

                      <MenuItems ref={refs.setFloating} style={floatingStyles} className="w-56 rounded-md bg-[#1f1f1f] shadow-lg ring-1 ring-black ring-opacity-5 outline-none z-30">
                        <div className="py-1">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => { setEditingMusicId(ele._id); setEditingMusicName(ele.name || ''); }}
                                className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${active ? "bg-gray-600 text-white" : "text-white"}`}
                              >
                                <span className="font-medium">A</span>
                                Rename
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
                                <span className="flex items-center gap-2">📁 Move to folder</span>
                                <span>›</span>
                              </button>
                            )}
                          </MenuItem>

                          <hr className="my-1 border-gray-200" />

                          <MenuItem>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={() => { setSelectedProjectName(ele?.name || ''); setDeleteId(ele._id); setDeleteModalOpen(true); }}
                                className={`flex items-center gap-2 px-4 py-2 text-sm ${active ? "bg-red-100 text-red-600" : "text-red-600"}`}
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
            );
          })}
        </div>
      </div>

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