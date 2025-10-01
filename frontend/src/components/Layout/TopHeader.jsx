import React, { useEffect, useState } from 'react';
import { PiArrowBendUpLeftBold, PiArrowBendUpRightBold } from "react-icons/pi";
import { GoSun } from "react-icons/go";
import savedicon from "../../Images/savedIcon.svg";
import graySave from "../../Images/gray-save.png";
import greenSave from "../../Images/green-save.png";
import { IoMoonOutline } from 'react-icons/io5';
import { HiDownload } from "react-icons/hi";
import subscription from "../../Images/subscriptionIcon.svg";
import { IoIosShareAlt } from "react-icons/io";
import { RxExit } from "react-icons/rx";
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton } from '@headlessui/react';
import OpenProjectModal from '../OpenProjectModal';
import { ReactComponent as NewFolderIcon } from '../../Images/New Folder.svg';
import { ReactComponent as OpenFolderIcon } from "../../Images/OpenFolder.svg";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { ReactComponent as Previous } from "../../Images/previousVersion.svg";
import { ReactComponent as Exports } from "../../Images/export.svg";
import { ReactComponent as Imports } from "../../Images/import.svg";
import { ReactComponent as Shareproject } from "../../Images/shareproject.svg";
import { ReactComponent as Gotoprofile } from "../../Images/gotoprofile.svg";
import { ReactComponent as Audiotrack } from "../../Images/audiotrack.svg";
import { ReactComponent as Mic } from "../../Images/micsvg.svg";
import { ReactComponent as Undo } from "../../Images/undoIcon.svg";
import { ReactComponent as Redo } from "../../Images/redoicon.svg";
import { ReactComponent as Copy } from "../../Images/copyIcon.svg";
import { ReactComponent as Paste } from "../../Images/pasteIcon.svg";
import { ReactComponent as Delete } from "../../Images/deleteIcon.svg";
import { ReactComponent as Region } from "../../Images/createRegionIcon.svg";
import { ReactComponent as Effect } from "../../Images/EfectIcon.svg";
import { ReactComponent as Midisetting } from "../../Images/MidiSettings.svg";
import { ReactComponent as Tuner } from "../../Images/tuner.svg";
import { ReactComponent as Keyboard } from "../../Images/keyboard.svg";
import { ReactComponent as Lowlatancy } from "../../Images/lae latency.svg";
import { ReactComponent as Soundquality } from "../../Images/soundquality.svg";
import { ReactComponent as Tick } from "../../Images/Tick.svg";
import { ReactComponent as Songsections } from "../../Images/sondsections.svg";
import { ReactComponent as Language } from "../../Images/language.svg";
import { ReactComponent as Theme } from "../../Images/themes.svg";
import { useTheme } from '../../Utils/ThemeContext';
import { ReactComponent as Close } from '../../Images/closeicon.svg';
import midi from '../../Images/midi.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setIsSongSection, setMusicalTypingEnabled } from '../../Redux/Slice/ui.slice';
import { setSoundQuality } from '../../Redux/Slice/audioSettings.slice';
import audioQualityManager from '../../Utils/audioQualityManager';
import ExportPopup from '../ExportProjectModel';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { createMusic, updateMusic, getAllMusic } from '../../Redux/Slice/music.slice';
import axiosInstance from '../../Utils/axiosInstance';
import { selectStudioState } from '../../Redux/rootReducer';
import WavEncoder from 'wav-encoder';
import NewProject from '../NewProjectModel';
import ShareModal from '../Sharemodal';
import PricingModel from '../PricingModel';
import { setCurrentMusic } from '../../Redux/Slice/music.slice';
import AccessPopup from '../AccessPopup';
import { addAudioClipToTrack, createTrackWithDefaults, updateAudioClip, setTrackType } from '../../Redux/Slice/studio.slice';
import TunerPopup from '../TunerPopup';
import { CloudCog } from 'lucide-react';

const getTopHeaderColors = (isDark) => ({
  // Background colors
  background: isDark ? '#141414' : '#ffffff',
  backgroundHover: isDark ? '#262529' : '#f5f5f5',
  backgroundActive: isDark ? '#1a1a1a' : '#e8e8e8',
  
  // Border colors
  border: isDark ? '#FFFFFF1A' : '#1414141A',
  borderHover: isDark ? '#FFFFFF4D' : '#1414144D',
  borderStrong: isDark ? '#a6a3ac' : '#d0d0d0',
  
  // Text colors
  textPrimary: isDark ? '#ffffff' : '#141414',
  textSecondary: isDark ? '#ffffff' : '#141414',
  textMuted: isDark ? '#ffffff99' : '#14141499',
  textAccent: isDark ? '#357935' : '#2d5a2d',
  
  // Icon colors
  iconPrimary: isDark ? '#ffffff' : '#141414',
  iconSecondary: isDark ? '#ffffff' : '#141414',
  iconMuted: isDark ? '#ffffff99' : '#14141499',
  
  // Button colors
  buttonPrimary: isDark ? '#ffffff' : '#141414',
  buttonSecondary: isDark ? '#141414' : '#ffffff',
  buttonHover: isDark ? '#f0f0f0' : '#2a2a2a',
  buttonDisabled: isDark ? '#2a2a2a' : '#e0e0e0',
  
  // Menu colors
  menuBackground: isDark ? '#404040' : '#ffffff',
  menuItemHover: isDark ? '#262529' : '#f5f5f5',
  menuBorder: isDark ? '#FFFFFF1A' : '#1414141A',
  
  // Theme toggle colors
  toggleBackground: isDark ? '#1F1F1F' : '#f0f0f0',
  toggleSlider: isDark ? '#a6a3ac' : '#5c5c5c',
  toggleIcon: isDark ? '#ffffff' : '#141414',
  toggleBorder: isDark ? '#a6a3ac' : '#d0d0d0',
  
  // Status colors
  success: '#357935',
  error: '#FF0000',
  warning: '#FFA500',
  
  // Special colors
  accent: isDark ? '#AD00FF' : '#8B00CC',
  accentHover: isDark ? '#CC00FF' : '#9900DD',
  
  // Upgrade button colors
  upgradeBackground: isDark ? '#141414' : '#ffffff',
  upgradeText: isDark ? '#ffffff' : '#141414',
  
  // Share button colors
  shareBackground: isDark ? '#141414' : '#ffffff',
  shareText: isDark ? '#ffffff' : '#141414',
});

const TopHeader = () => {
    const dispatch = useDispatch();
    const isSongSection = useSelector((state) => state.ui.isSongSection);
    const currentSoundQuality = useSelector((state) => state.audioSettings?.soundQuality || 'High');

    // Get theme colors
    const { isDark } = useTheme();
    console.log("isDark", isDark);
    const colors = getTopHeaderColors(isDark);
    
    // Get current track ID and tracks from Redux
    const currentTrackId = useSelector((state) => selectStudioState(state)?.currentTrackId);
    const tracks = useSelector((state) => selectStudioState(state)?.tracks || []);

    // Undo/Redo functionality
    const { undo: originalUndo, redo: originalRedo, canUndo, canRedo, historyLength, futureLength } = useUndoRedo();

    // Enhanced undo/redo with toast notifications
    const handleUndo = () => {
        if (canUndo) {
            originalUndo();
            setToastMessage('Undo');
            setShowUndoRedoToast(true);
            setTimeout(() => setShowUndoRedoToast(false), 2000);
        }
    };

    const handleRedo = () => {
        if (canRedo) {
            originalRedo();
            setToastMessage('Redo');
            setShowUndoRedoToast(true);
            setTimeout(() => setShowUndoRedoToast(false), 2000);
        }
    };

    const [isActiveMenu, setIsActiveMenu] = useState("");
    const [isLowLatency, setIsLowLatency] = useState(false);
    const [isLowLatency2, setIsLowLatency2] = useState(true);
    const [lowlatencyomodal, setLowLatencyModel] = useState(false);
    const [midikeyboardmodal, setMidiKeyboardModel] = useState(false);
    const [exportProjectModal, setExportProjectModal] = useState(false);
    const [openProjectModal, setOpenProjectModal] = useState(false);
    const [newProjectOpen, setNewProjectOpen] = useState(false);
    const [showUndoRedoToast, setShowUndoRedoToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [pricingModalOpen, setPricingModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [showAccessPopup, setShowAccessPopup] = useState(false);
    const [showTunerPopup, setShowTunerPopup] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Function to check for live instruments connected to the setup
    const checkForLiveInstruments = async () => {
        try {
            // Get available audio input devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputs = devices.filter(device => device.kind === 'audioinput');

            // Check if there are audio input devices available
            // This includes built-in microphones, external microphones, audio interfaces, etc.
            if (audioInputs.length === 0) {
                return false;
            }

            // Check for external audio devices (not just built-in microphone)
            // External devices typically have more descriptive labels
            const hasExternalDevices = audioInputs.some(device => 
                device.label && 
                device.label.toLowerCase().includes('external') ||
                device.label.toLowerCase().includes('usb') ||
                device.label.toLowerCase().includes('audio interface') ||
                device.label.toLowerCase().includes('mixer') ||
                device.label.toLowerCase().includes('interface')
            );

            // If we have external devices or multiple input sources, consider it as live instruments
            return hasExternalDevices || audioInputs.length > 1;
        } catch (error) {
            console.error('Error checking for live instruments:', error);
            return false;
        }
    };

    // Open AccessPopup if microphone permission is not granted, otherwise open TunerPopup
    const handleTunerClick = async () => {
        if (getTrackType !== 'Voice & Mic') return;
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
                if (permissionStatus.state === 'granted') {
                    // Check for live instruments before opening TunerPopup
                    const hasLiveInstruments = await checkForLiveInstruments();
                    if (hasLiveInstruments) {
                        setShowTunerPopup(true);
                    } else {
                        setShowAccessPopup(true);
                    }
                } else {
                    setShowAccessPopup(true);
                }
                return;
            }
        } catch (error) {
            // Fall through to showing access popup below
        }
        setShowAccessPopup(true);
    };

    // Add state for song name editing
    const [songName, setSongName] = useState('Untitled_song');
    const [isEditingSongName, setIsEditingSongName] = useState(false);

    const currentMusic = useSelector((state) => state.music?.currentMusic);
    const allMusic = useSelector((state) => state?.music?.allmusic || []);
    const getTrackType = useSelector((state) => selectStudioState(state).newtrackType);
    console.log(".... > ", allMusic);
    
    const navigate = useNavigate();
    useEffect(() => {
        if ( allMusic.length === 0) {

            dispatch(getAllMusic());
        }
    }, [dispatch]);

    useEffect(() => {
        setSongName(currentMusic?.name || 'Untitled_song');
    }, [currentMusic]);

    // Initialize low latency mode from localStorage
    useEffect(() => {
        const savedLowLatencyMode = localStorage.getItem('lowLatencyMode');
        if (savedLowLatencyMode === 'true') {
            setIsLowLatency(true);
        }
    }, []);

    // Low latency info banner state (shown once after refresh)
    const [showLowLatencyInfo, setShowLowLatencyInfo] = useState(false);

    useEffect(() => {
        const pendingInfo = localStorage.getItem('lowLatencyInfoPending');
        if (pendingInfo === 'true') {
            setShowLowLatencyInfo(true);
            // Clear pending flag so it only shows once
            localStorage.removeItem('lowLatencyInfoPending');
        }
    }, []);

    // Add state for selected sound quality
    const [selectedSoundQuality, setSelectedSoundQuality] = useState('High');

    // Define sound quality options
    const soundQualityOptions = [
        { id: 'high', label: 'High' },
        { id: 'medium', label: 'Medium' },
        { id: 'low', label: 'Low' },
        { id: 'extralow', label: 'Extra Low' }
    ];

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore shortcuts while typing into inputs/textareas/contenteditable
            const target = e.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    if (canUndo) handleUndo();
                } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    if (canRedo) handleRedo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, canUndo, canRedo]);
    // Update the sound quality handler
    const handleSoundQualitySelect = async (qualityId, qualityLabel) => {
        setSelectedSoundQuality(qualityLabel);

        try {
            // Use audio quality manager to change quality
            await audioQualityManager.changeQuality(qualityLabel);

            // Update Redux state
            dispatch(setSoundQuality(qualityLabel));

            console.log(`Audio quality changed to ${qualityLabel}`);
        } catch (error) {
            console.error('Failed to change audio quality:', error);
            // Revert the UI state if audio context recreation failed
            setSelectedSoundQuality(currentSoundQuality);
        }

        // Close all submenus
        setShowSubmenu(prev => ({
            ...prev,
            soundquality: false
        }));
        // Reset active menu to close the main menu
        setIsActiveMenu("");
        // Use setTimeout to ensure the click event is processed first
        setTimeout(() => {
            // Programmatically trigger ESC key to close Headless UI menu
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
        }, 10);
    };

    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const languageOptions = [
        { id: 'Deutsch', label: 'Deutsch' },
        { id: 'English', label: 'English' },
        { id: 'Español', label: 'Español' },
        { id: 'Español (Latin America)', label: 'Español (Latin America)' },
        { id: 'Français', label: 'Français' },
        { id: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
        { id: 'Italiano', label: 'Italiano' },
        { id: 'Nederlands', label: 'Nederlands' },
        { id: 'Norsk', label: 'Norsk' },
        { id: 'Polski', label: 'Polski' },
        { id: 'Português', label: 'Português' },
        { id: 'Português(Brasil)', label: 'Português(Brasil)' },
        { id: 'Русский язык', label: 'Русский язык' },
        { id: 'Svenska', label: 'Svenska' },
        { id: 'low', label: 'Low' },
        { id: 'Türkçe', label: 'Türkçe' }
    ];

    const handleLanguage = (languageId, LanguageName) => {
        setSelectedLanguage(LanguageName);
        // Close all submenus
        setShowSubmenu(prev => ({
            ...prev,
            soundquality: false
        }));
        // Reset active menu to close the main menu
        setIsActiveMenu("");
        // Use setTimeout to ensure the click event is processed first
        setTimeout(() => {
            // Programmatically trigger ESC key to close Headless UI menu
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
        }, 10);
    };

    const { setIsDark } = useTheme();
    const [selectedtheme, setSelectedtheme] = useState('Dark Theme');

    // Define sound quality options
    const themesOptions = [
        { id: 'Dark Theme', label: 'Dark Theme' },
        { id: 'Light Theme', label: 'Light Theme' }
    ]

    const handlethemesSelect = (qualityId, qualityLabel) => {
        setSelectedtheme(qualityLabel);
        setIsDark(qualityLabel === 'Dark Theme');
        // Close all submenus
        setShowSubmenu(prev => ({
            ...prev,
            soundquality: false
        }));
        // Reset active menu to close the main menu
        setIsActiveMenu("");
        // Use setTimeout to ensure the click event is processed first
        setTimeout(() => {
            // Programmatically trigger ESC key to close Headless UI menu
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
        }, 10);
    };

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    useEffect(() => {
        setSelectedtheme(isDark ? 'Dark Theme' : 'Light Theme');
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => {
            const newIsDark = !prev;
            setSelectedtheme(newIsDark ? 'Dark Theme' : 'Light Theme');
            return newIsDark;
        });
    };

    const [showSubmenu, setShowSubmenu] = useState({
        import: false,
        navigator: false,
        effects: false
    });

    // New function to handle submenu visibility
    const handleSubmenuToggle = (submenuName, isVisible) => {
        setShowSubmenu(prev => ({
            ...prev,
            [submenuName]: isVisible
        }));
    };

    // Function to close all menus when nested option is selected
    const handleNestedOptionClick = (event) => {
        if (event) {
        event.stopPropagation();
        }
        // Close all submenus
        setShowSubmenu({
            import: false,
            navigator: false,
            effects: false,
            openrecentfolder: false,
            keyboard: false,
            soundquality: false,
            language: false,
            theme: false
        });
        // Reset active menu to close the main menu
        setIsActiveMenu("");
        // Use setTimeout to ensure the click event is processed first
        setTimeout(() => {
            // Programmatically trigger ESC key to close Headless UI menu
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
        }, 10);
    };

    const handleOpenProject = (project) => {
        if (!project?._id) return; 
        dispatch(setCurrentMusic(project));
        setIsActiveMenu("");
        setShowSubmenu(prev => ({ ...prev, openrecentfolder: false }));
        setTimeout(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true
            }));
        }, 10);
        navigate(`/sidebar/timeline/${project._id}`);
    }
    
    const handleExportModal = () => {
        setExportProjectModal(true);
    }

    // Generate a MongoDB-like ObjectId (24-hex chars)
    const generateObjectId = () => {
        const timestamp = Math.floor(Date.now() / 1000).toString(16);
        return (timestamp + 'xxxxxxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16))).toLowerCase();
    }

    // Navigate to a fresh timeline with a newly generated id
    const handleNewProject = () => {
        const newId = generateObjectId();
        setIsActiveMenu("");
        setShowSubmenu({
            import: false,
            navigator: false,
            effects: false,
            openrecentfolder: false,
            keyboard: false,
            soundquality: false,
            language: false,
            theme: false
        });
        setTimeout(() => {
            try {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
            } catch (_) {}
        }, 10);
        navigate(`/sidebar/timeline/${newId}`);
    }

    const bpm = useSelector((state) => selectStudioState(state)?.bpm || 120);

    // Handle song name editing
    const handleSongNameClick = () => {
        setIsEditingSongName(true);
    };

    const handleSongNameChange = (e) => {
        setSongName(e.target.value);
    };

    const handleSongNameSave = () => {
        const normalized = (songName).trim();
        setSongName(normalized === '' ? 'Untitled_song' : normalized);
        setIsEditingSongName(false);
    };

    const handleSongNameKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSongNameSave();
        } else if (e.key === 'Escape') {
            setIsEditingSongName(false);
            setSongName('Untitled_song');
        }
    };

    // Render piano notes, then upload to backend and return persistent URL and duration
    const renderPianoNotesToWav = async (notes = []) => {
        try {
            if (!Array.isArray(notes) || notes.length === 0) return null;
            const endTimes = notes.map(n => (n.startTime || 0) + (n.duration || 0.5));
            const renderDuration = Math.max(1, Math.max(...endTimes) + 0.25);
            const sampleRate = 44100;
            const channels = 2; // Stereo like live playback
            const frameCount = Math.ceil(renderDuration * sampleRate);
            const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            const offline = new OfflineCtx(channels, frameCount, sampleRate);

            // Load the same soundfont as live playback
            const Soundfont = await import('soundfont-player');
            const piano = await Soundfont.default.instrument(offline, 'acoustic_grand_piano');

            const master = offline.createGain();
            master.gain.setValueAtTime(0.8, 0);
            master.connect(offline.destination);

            // Play each note using the soundfont
            const playPromises = notes.map(async (n) => {
                const start = Math.max(0, Number(n.startTime) || 0);
                const dur = Math.max(0.05, Number(n.duration) || 0.5);
                const midiNumber = Number(n.midiNumber);
                
                if (!Number.isFinite(midiNumber)) return;
                
                try {
                    // Use the same play method as live playback
                    const audioNode = piano.play(midiNumber, offline.currentTime + start, { 
                        duration: dur,
                        gain: 0.8
                    });
                    
                    if (audioNode && audioNode.connect) {
                        audioNode.connect(master);
                    }
                } catch (error) {
                    console.warn('Failed to play note in render:', error);
                }
            });

            await Promise.all(playPromises);

            const buffer = await offline.startRendering();
            const channelData = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
            const wavData = await WavEncoder.encode({ sampleRate: buffer.sampleRate, channelData });
            const blob = new Blob([wavData], { type: 'audio/wav' });

            // Upload rendered blob to backend to get a persistent URL
            const form = new FormData();
            form.append('audio', blob, `piano-render-${Date.now()}.wav`);
            const uploadRes = await axiosInstance.post('/upload-audio', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = uploadRes?.data?.url;
            return { url, duration: buffer.duration };
        } catch (e) {
            console.error('Render piano notes failed:', e);
            return null;
        }
    };

    const drumRecordedData = useSelector((state) => selectStudioState(state).drumRecordedData);

    const handleSaved = async () => {
        setSaveStatus('saving');
        try {
        const user = sessionStorage.getItem("userId");
    
        // Build new tracks with a blob URL clip rendered from each track's pianoNotes/drumData (if present)
        const serializedTracks = await Promise.all((tracks || [])?.map(async (t) => {
            const track = { ...t };
            
            // Handle piano notes
            const pianoNotes = Array.isArray(t.pianoNotes) ? t.pianoNotes : [];
            if (pianoNotes.length > 0) {
                const render = await renderPianoNotesToWav(pianoNotes);
                if (render && render.url) {
                    const existing = Array.isArray(track.audioClips) ? track.audioClips : [];
                    const clip = {
                        id: Date.now() + Math.random(),
                        name: 'Piano Render',
                        url: render.url,
                        duration: render.duration,
                        trimStart: 0,
                        trimEnd: render.duration,
                        startTime: 0,
                        color: track.color || '#FFFFFF'
                    };
                    track.audioClips = [...existing, clip];
                }
            }
            
            let drumNotes = [];
            if (track.type === 'drum' || track.type === 'drums' || track.type === 'Drums & Machines') {
                drumNotes = Array.isArray(t.drumNotes) ? t.drumNotes : [];
                
                if (drumNotes.length === 0) {
                    if (Array.isArray(t.pianoNotes) && t.pianoNotes.length > 0) {
                        drumNotes = [...t.pianoNotes];
                        track.pianoNotes = [];
                    }
                }
                
                const reduxDrumHits = Array.isArray(drumRecordedData)
                    ? drumRecordedData.filter(hit => (hit.trackId ?? null) === (track.id ?? null))
                    : [];
                drumNotes = [...drumNotes, ...reduxDrumHits];
                track.drumNotes = drumNotes;
            }

            try {
                const existingClips = Array.isArray(track.audioClips) ? track.audioClips : [];
                if (existingClips.length > 0) {
                    const normalizedClips = await Promise.all(existingClips.map(async (clip) => {
                        const clipUrl = clip?.url;
                        const isEphemeral = typeof clipUrl === 'string' && (clipUrl.startsWith('blob:') || clipUrl.startsWith('data:'));
                        if (!isEphemeral) return clip;
                        try {
                            const res = await fetch(clipUrl);
                            const audioBlob = await res.blob();
                            const form = new FormData();
                            const filename = `clip-${track.id ?? 'track'}-${Date.now()}.wav`;
                            form.append('audio', audioBlob, filename);
                            const uploadRes = await axiosInstance.post('/upload-audio', form, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            const httpUrl = uploadRes?.data?.url || clipUrl;
                            return { ...clip, url: httpUrl };
                        } catch (_) {
                            return clip;
                        }
                    }));
                    track.audioClips = normalizedClips;
                }
            } catch (_) {}
            return track;
        }));

        // Render one mixdown WAV from all clips across all tracks, upload and return URL
        const renderProjectMixdown = async (allTracks) => {
            try {
                const clips = [];
                allTracks.forEach(t => {
                    (t.audioClips || []).forEach(c => {
                        if (c && c.url) {
                            const trimStart = Number(c.trimStart || 0);
                            const trimEnd = Number((c.trimEnd != null ? c.trimEnd : c.duration) || c.duration || 0);
                            const visible = Math.max(0, trimEnd - trimStart);
                            clips.push({
                                url: c.url,
                                startTime: Number(c.startTime || 0),
                                offset: trimStart,
                                duration: visible,
                                playbackRate: Number(c.playbackRate || 1)
                            });
                        }
                    });
                });
                if (clips.length === 0) return null;

                const sampleRate = 44100;
                const channels = 2;
                const totalDuration = Math.max(
                    1,
                    ...clips.map(cl => (cl.startTime || 0) + (cl.duration || 0))
                ) + 0.1;
                const frameCount = Math.ceil(totalDuration * sampleRate);
                const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
                const offline = new OfflineCtx(channels, frameCount, sampleRate);

                const master = offline.createGain();
                master.gain.setValueAtTime(1.0, 0);
                master.connect(offline.destination);

                const decodedBuffers = await Promise.all(clips.map(async (cl) => {
                    try {
                        const res = await fetch(cl.url);
                        const buf = await res.arrayBuffer();
                        const audioBuf = await offline.decodeAudioData(buf);
                        return { ...cl, audioBuf };
                    } catch (_) {
                        return null;
                    }
                }));

                decodedBuffers.filter(Boolean).forEach(({ audioBuf, startTime, offset, duration, playbackRate }) => {
                    const src = offline.createBufferSource();
                    src.buffer = audioBuf;
                    if (Number.isFinite(playbackRate) && playbackRate > 0) {
                        try { src.playbackRate.setValueAtTime(playbackRate, 0); } catch (_) {}
                    }
                    src.connect(master);
                    const safeOffset = Math.max(0, Math.min(offset || 0, audioBuf.duration));
                    const safeDur = Math.max(0, Math.min(duration || (audioBuf.duration - safeOffset), audioBuf.duration - safeOffset));
                    const when = Math.max(0, startTime || 0);
                    try { src.start(when, safeOffset, safeDur); } catch (_) {}
                });

                const mixed = await offline.startRendering();
                const channelData = Array.from({ length: mixed.numberOfChannels }, (_, i) => mixed.getChannelData(i));
                const wavData = await WavEncoder.encode({ sampleRate: mixed.sampleRate, channelData });
                const blob = new Blob([wavData], { type: 'audio/wav' });

                // Upload mixdown to backend
                const form = new FormData();
                form.append('audio', blob, `mixdown-${Date.now()}.wav`);
                const uploadRes = await axiosInstance.post('/upload-audio', form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const url = uploadRes?.data?.url;
                return { url, duration: mixed.duration };
            } catch (e) {
                console.error('Mixdown render failed:', e);
                return null;
            }
        };

        const mixdown = await renderProjectMixdown(serializedTracks);
       
        // Check if we have an existing music project to update
        if (currentMusic && currentMusic._id) {
            // Update existing music
            const result = await dispatch(updateMusic({
                id: currentMusic._id,
                data: {
                    name: songName,
                    musicdata: serializedTracks,
                    userId: user,
                    url: mixdown.url,
                    drumRecordedData: Array.isArray(drumRecordedData) ? drumRecordedData : []
                }
            }));
            if (result.payload) {
                dispatch(setCurrentMusic(result.payload));
            }
        } else {
            // Create new music
            const result = await dispatch(createMusic({
                name: songName,
                musicdata: serializedTracks,
                userId: user,
                url: mixdown.url,
                drumRecordedData: Array.isArray(drumRecordedData) ? drumRecordedData : []
            }));
            if (result.payload) {
                dispatch(setCurrentMusic(result.payload));
            }
        }
            setSaveStatus('saved');
        } catch (e) {
            setSaveStatus('error');
        }
    }

    // Add state for file input
    const [fileInputRef, setFileInputRef] = useState(null);
    const [voiceMicFileInputRef, setVoiceMicFileInputRef] = useState(null);

    // Add import audio handler
    const handleImportAudio = () => {
        if (fileInputRef) {
            fileInputRef.click();
        }
    };

    // Add import to Voice & Mic handler
    const handleImportToVoiceMic = () => {
        if (voiceMicFileInputRef) {
            voiceMicFileInputRef.click();
        }
    };

    // Add file change handler for regular audio import
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if file is audio
        if (!file.type.startsWith('audio/')) {
            alert('Please select an audio file');
            return;
        }

        try {
            // Create object URL for the file
            const url = URL.createObjectURL(file);

            // Get audio duration
            let duration = null;
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                duration = audioBuffer.duration;
            } catch (err) {
                console.error('Error getting audio duration:', err);
                duration = 0;
            }

            // If no current track, create a new audio track
            let targetTrackId = currentTrackId;
            if (!targetTrackId || !tracks.find(t => t.id === targetTrackId)) {
                const newTrackId = Date.now();
                dispatch(createTrackWithDefaults({
                    id: newTrackId,
                    name: 'Audio Track',
                    type: 'audio',
                    color: '#FFB6C1'
                }));
                targetTrackId = newTrackId;
            }

            // Create audio clip data
            const audioClip = {
                id: Date.now() + Math.random(),
                url: url,
                name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
                duration: duration,
                trimStart: 0,
                trimEnd: duration,
                startTime: 0,
                color: '#FFB6C1',
                type: 'audio',
                fromImport: true
            };

            // Add the audio clip to the track
            dispatch(addAudioClipToTrack({
                trackId: targetTrackId,
                audioClip: audioClip
            }));

            // Upload to backend for persistent storage
            try {
                const formData = new FormData();
                formData.append('audio', file, file.name);
                const uploadRes = await axiosInstance.post('/upload-audio', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (uploadRes?.data?.url) {
                    // Update the clip with the persistent URL
                    dispatch(updateAudioClip({
                        trackId: targetTrackId,
                        clipId: audioClip.id,
                        updates: { url: uploadRes.data.url }
                    }));
                }
            } catch (uploadError) {
                console.error('Failed to upload audio file:', uploadError);
                // Keep the blob URL if upload fails
            }

            // Reset file input
            e.target.value = '';
            
        } catch (error) {
            console.error('Error importing audio file:', error);
            alert('Failed to import audio file. Please try again.');
        }
    };

    // Add file change handler for Voice & Mic import
    const handleVoiceMicFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if file is audio
        if (!file.type.startsWith('audio/')) {
            alert('Please select an audio file');
            return;
        }

        try {
            // Create object URL for the file
            const url = URL.createObjectURL(file);

            // Get audio duration
            let duration = null;
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                duration = audioBuffer.duration;
            } catch (err) {
                console.error('Error getting audio duration:', err);
                duration = 0;
            }

            // Create a new Voice & Mic track
            const newTrackId = Date.now();
            dispatch(createTrackWithDefaults({
                id: newTrackId,
                name: 'Voice & Mic Track',
                type: 'Voice & Mic',
                color: '#FF6B6B' // Different color for Voice & Mic tracks
            }));

            // Create audio clip data
            const audioClip = {
                id: Date.now() + Math.random(),
                url: url,
                name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
                duration: duration,
                trimStart: 0,
                trimEnd: duration,
                startTime: 0,
                color: '#FF6B6B',
                type: 'voice_mic',
                fromImport: true
            };

            // Add the audio clip to the Voice & Mic track
            dispatch(addAudioClipToTrack({
                trackId: newTrackId,
                audioClip: audioClip
            }));

            // Set the track type to Voice & Mic to show the Voice & Mic interface
            dispatch(setTrackType('Voice & Mic'));

            // Upload to backend for persistent storage
            try {
                const formData = new FormData();
                formData.append('audio', file, file.name);
                const uploadRes = await axiosInstance.post('/upload-audio', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (uploadRes?.data?.url) {
                    // Update the clip with the persistent URL
                    dispatch(updateAudioClip({
                        trackId: newTrackId,
                        clipId: audioClip.id,
                        updates: { url: uploadRes.data.url }
                    }));
                }
            } catch (uploadError) {
                console.error('Failed to upload audio file:', uploadError);
                // Keep the blob URL if upload fails
            }

            // Reset file input
            e.target.value = '';
            
        } catch (error) {
            console.error('Error importing audio file to Voice & Mic track:', error);
            alert('Failed to import audio file. Please try again.');
        }
    };

    // Handle low latency mode application
    const handleApplyLowLatencyMode = async () => {
        try {
            // Save low latency mode preference to localStorage
            localStorage.setItem('lowLatencyMode', 'true');
            // Mark that we should show the info banner after refresh
            localStorage.setItem('lowLatencyInfoPending', 'true');
            
            // Dispatch action to update Redux state
            // Note: You may need to create a Redux action for this if it doesn't exist
            // dispatch(setLowLatencyMode(true));
            
            // Close the modal
            setLowLatencyModel(false);
            setIsLowLatency(true);
            
            // Show a brief message before refresh
            const message = document.createElement('div');
            message.textContent = 'Applying low latency mode...';
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 10000;
                font-family: Arial, sans-serif;
            `;
            document.body.appendChild(message);
            
            // Refresh the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to apply low latency mode:', error);
            alert('Failed to apply low latency mode. Please try again.');
        }
    };

    return (
        <>
            <ExportPopup open={exportProjectModal} onClose={() => setExportProjectModal(false)} />
            <NewProject open={newProjectOpen} setOpen={setNewProjectOpen} />
            {/* OpenProjectModal integration */}
            <OpenProjectModal open={openProjectModal} onClose={() => setOpenProjectModal(false)} />
            <div className="flex justify-between items-center border-b px-2 py-2 sm:px-3 sm:py-1 md:px-5 md:py-2 xl:px-7"style={{ backgroundColor: colors.background, borderColor: colors.border}}>
                {/* Mobile Menu Button - Only visible on screens < 768px */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 rounded-md transition-colors"
                    style={{ 
                        color: colors.iconSecondary,
                        backgroundColor: 'transparent'
                    }}
                    aria-label="Open menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-5 xl:gap-7 items-center hidden md:flex">
                    <p className="text-[12px] sm:text-[14px] md:text-[14px] lg:text-[16px] xl:text-[18px]"style={{ color: colors.textSecondary }}>LOGO</p>
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <MenuButton className="outline-none" >
                                <p className='text-[10px] sm:text-[12px] md:text-[12px] lg:text-[14px]'style={{ color: colors.textSecondary }}> File </p>
                            </MenuButton>
                        </div>

                        <Menu.Items className="absolute left-[-20px] sm:left-0 z-[99] mt-2 lg:mt-3 w-36 md600:w-48 lg:w-60 origin-top-right shadow-lg outline-none rounded-b-md" style={{ backgroundColor: colors.menuBackground }}>
                            <div className="">
                                {/* First item: Print */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md600:py-2 flex md600:gap-3 outline-none transition-colors`}style={{ backgroundColor: active ? colors.menuItemHover : 'transparent',color: colors.textSecondary }}onClick={handleNewProject}>
                                            <NewFolderIcon className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }}/>  
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>New...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md:py-2 flex md600:gap-3 outline-none transition-colors`} style={{ backgroundColor: active ? colors.menuItemHover : 'transparent',color: colors.textSecondary }} onClick={() => setOpenProjectModal(true)}>
                                            <OpenFolderIcon className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }}/>  
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Open...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <div className="relative " onMouseEnter={() => handleSubmenuToggle('openrecentfolder', true)} onMouseLeave={() => handleSubmenuToggle('openrecentfolder', false)}>
                                    <div 
                                        className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer transition-colors"
                                        style={{ backgroundColor: 'transparent',color: colors.textSecondary}}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <OpenFolderIcon 
                                            className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                            style={{ color: colors.iconSecondary }}
                                        />
                                        <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Open Recent</span>
                                        <MdOutlineKeyboardArrowRight 
                                            className="text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" 
                                            style={{ color: colors.iconSecondary }}
                                        />
                                    </div>

                                    {showSubmenu.openrecentfolder && (
                                        <div 
                                            className="absolute left-full top-0 z-50 w-36 md600:w-40 lg:mt-0 shadow-lg outline-none text-nowrap rounded-md"
                                            style={{ backgroundColor: colors.menuBackground }}
                                        >
                                            {(allMusic || []).slice(0, 8).map((m) => (
                                                <p
                                                    key={m?._id}
                                                    className="block px-2 py-1 md600:px-3 lg:px-4 md:py-2 cursor-pointer transition-colors text-[10px] md600:text-[12px] lg:text-[14px]"
                                                    style={{ color: colors.textSecondary }}
                                                    onClick={(e) => { e.stopPropagation(); handleOpenProject(m); }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                    title={m?.name || 'Untitled'}
                                                >
                                                    {m?.name || 'Untitled'}
                                                </p>
                                            ))}
                                            {(!allMusic || allMusic.length === 0) && (
                                                <p
                                                    className="block px-2 py-1 md600:px-3 lg:px-4 md:py-2 text-[10px] md600:text-[12px] lg:text-[14px] opacity-70"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    No recent projects
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pt-1 pb-2 gap-2 md600:px-4 lg:px-6 md600:pt-2 md600:pb-3 lg:pb-4 flex md600:gap-3 outline-none transition-colors`}style={{ backgroundColor: active ? colors.menuItemHover : 'transparent',color: colors.textSecondary,borderBottom: `1px solid ${colors.menuBorder}`}} onClick={() => setPricingModalOpen(true)}>
                                            <Previous className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }}/>  
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Previous versions</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 pb-2 pt-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 outline-none transition-colors`} style={{ backgroundColor: active ? colors.menuItemHover : 'transparent',color: colors.textSecondary }}>
                                            <span className='ps-5 md600:ps-7 lg:ps-8 text-[10px] md600:text-[12px] lg:text-[14px]'>Save as...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p className={`px-3 py-1 md600:px-4 lg:px-6 md600:py-2 flex gap-2 md600:gap-3 outline-none transition-colors`} style={{ backgroundColor: active ? colors.menuItemHover : 'transparent',color: colors.textSecondary }} onClick={handleExportModal} >
                                            <Exports className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }}/> 
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Export</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                {/* Changed: Import submenu with individual tracking */}
                                <div className="relative" onMouseEnter={() => handleSubmenuToggle('import', true)} onMouseLeave={() => handleSubmenuToggle('import', false)}>
                                    <div 
                                        className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer transition-colors"
                                        style={{ 
                                            backgroundColor: 'transparent',
                                            color: colors.textSecondary
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <Imports 
                                            className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                            style={{ color: colors.iconSecondary }}
                                        />
                                        <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Import</span>
                                        <MdOutlineKeyboardArrowRight 
                                            className="text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" 
                                            style={{ color: colors.iconSecondary }}
                                        />
                                    </div>

                                    {showSubmenu.import && (
                                        <div 
                                            className="absolute left-full top-0 z-50 w-36 md600:w-48 lg:w-56 lg:mt-0 shadow-lg outline-none rounded-md"
                                            style={{ backgroundColor: colors.menuBackground }}
                                        >
                                            <p 
                                                className="flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 cursor-pointer transition-colors" 
                                                style={{ color: colors.textSecondary }}
                                                onClick={() => {
                                                    handleImportAudio();
                                                    handleNestedOptionClick();
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                <Audiotrack 
                                                    className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                                    style={{ color: colors.iconSecondary }}
                                                />  
                                                <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Import to Audio track</span>
                                            </p>
                                            <p 
                                                className="flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 cursor-pointer transition-colors" 
                                                style={{ color: colors.textSecondary }}
                                                onClick={() => {
                                                    handleImportToVoiceMic();
                                                    handleNestedOptionClick();
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                <Mic 
                                                    className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                                    style={{ color: colors.iconSecondary }}
                                                />  
                                                <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Import to Voice & Mic track</span>
                                            </p>
                                            <p 
                                                className="flex gap-2 md600:gap-3 px-3 py-1 lg:px-4 md600:py-2 cursor-pointer transition-colors" 
                                                style={{ color: colors.textSecondary }}
                                                onClick={handleNestedOptionClick}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                <Audiotrack 
                                                    className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                                    style={{ color: colors.iconSecondary }}
                                                />  
                                                <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Open in sampler</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className={`px-3 py-1 md600:px-4 lg:px-6 md:py-2 flex gap-2 md600:gap-3 border-b outline-none transition-colors`}
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: colors.textSecondary,
                                                borderBottom: `1px solid ${colors.menuBorder}`
                                            }}
                                            onClick={() => setShareModalOpen(true)}
                                        >
                                            <Shareproject 
                                                className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                                style={{ color: colors.iconSecondary }}
                                            />  
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Share Project</span>
                                        </p>
                                    )}
                                </Menu.Item>

                                <Menu.Item>
                                    {({ active }) => (
                                        <Link to='/profile'>
                                            <p 
                                                className={`px-3 pt-2 pb-2 md600:px-4 lg:px-6 md600:pt-3 lg:pt-4 md600:pb-2 flex gap-2 md600:gap-3 border-[#FFFFFF1A] outline-none transition-colors`}
                                                style={{ 
                                                    backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                    color: colors.textSecondary,
                                                    borderBottom: `1px solid ${colors.menuBorder}`
                                                }}
                                            >
                                                <Gotoprofile 
                                                    className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                                    style={{ color: colors.iconSecondary }}
                                                />  
                                                <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Go to profile</span>
                                            </p>
                                        </Link>
                                    )}
                                </Menu.Item>

                            </div>
                        </Menu.Items>
                    </Menu>

                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <MenuButton className="outline-none" >
                                <p 
                                    className='text-[10px] sm:text-[12px] md:text-[12px] lg:text-[14px]'
                                    style={{ color: colors.textSecondary }}
                                > 
                                    Edit 
                                </p>
                            </MenuButton>
                        </div>

                        <Menu.Items 
                            className="absolute left-0 z-[99] mt-2 lg:mt-3 w-36 md600:w-48 lg:w-60 origin-top-right shadow-lg outline-none bg-red-500 rounded-b-md"
                            style={{ backgroundColor: colors.menuBackground }}
                        >
                            <div className="">
                                {/* First item: Print */}
                                <Menu.Item disabled={!canUndo}>
                                    {({ active }) => (
                                        <p 
                                            onClick={canUndo ? handleUndo : undefined}
                                            className={`flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 transition-colors ${canUndo ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: canUndo ? colors.textSecondary : colors.buttonDisabled
                                            }}
                                            aria-disabled={!canUndo}
                                        >
                                            <Undo 
                                                className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                                style={{ color: colors.iconSecondary }}
                                            />
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]' style={{ color: colors.textSecondary }}>Undo</span>
                                            <p 
                                                className="text-[10px] md:text-[12px] ms-auto"
                                                style={{ color: colors.textMuted }}
                                            >
                                                Ctrl+Z
                                            </p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item disabled={!canRedo}>
                                    {({ active }) => (
                                        <p className={`flex gap-2 pb-3 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 transition-colors ${canRedo ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            onClick={canRedo ? handleRedo : undefined}
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: canRedo ? colors.textSecondary : colors.buttonDisabled
                                            }}
                                            aria-disabled={!canRedo}
                                        >
                                            <Redo 
                                                className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' 
                                                style={{ color: colors.iconSecondary }}
                                            />
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]' style={{ color: colors.textSecondary }}>Redo</span>
                                            <p 
                                                className="text-[10px] md:text-[12px] ms-auto"
                                                style={{ color: colors.textMuted }}
                                            >
                                                Ctrl+Y
                                            </p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className={`mt-1 px-3 pb-2 pt-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 border-t outline-none transition-colors`}
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                borderTopColor: colors.menuBorder,
                                                color: colors.textSecondary
                                            }}
                                        >
                                            <span className='ps-5 md600:ps-7 lg:ps-8 text-[10px] md600:text-[12px] lg:text-[14px]'>Cut</span>
                                            <p className="text-[10px] md:text-[12px] ms-auto">Ctrl+X</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer transition-colors"
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: colors.textSecondary
                                            }}
                                        >
                                            <Copy className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Copy</span>
                                            <p className="text-[10px] md:text-[12px] ms-auto">Ctrl+C</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer transition-colors"
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: colors.textSecondary
                                            }}
                                        >
                                            <Paste className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Paste</span>
                                            <p className="text-[10px] md:text-[12px] ms-auto">Ctrl+V</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className="flex gap-2 mb-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer transition-colors"
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: colors.textSecondary
                                            }}
                                        >
                                            <Delete className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Delete</span>
                                            <p className="text-[10px] md:text-[12px] ms-auto">Backspace</p>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <div className="relative" onMouseEnter={() => handleSubmenuToggle('effects', true)} onMouseLeave={() => handleSubmenuToggle('effects', false)}>
                                            <p 
                                                className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 border-t cursor-pointer transition-colors"
                                                style={{ 
                                                    borderTopColor: colors.menuBorder,
                                                    color: colors.textSecondary
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            >
                                                <Effect className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                                <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Effects</span>
                                                <MdOutlineKeyboardArrowRight className="text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" style={{ color: colors.iconSecondary }} />
                                            </p>

                                            {showSubmenu.effects && (
                                                <div 
                                                    className="absolute left-full px-2 py-2 gap-2 md600:px-3 lg:px-4 md:py-2 top-0 z-50 w-40 md600:w-48 lg:w-56 lg:mt-0 shadow-lg outline-none text-nowrap rounded-md"
                                                    style={{ backgroundColor: colors.menuBackground }}
                                                >
                                                    <Link 
                                                        to="/sidebar/voice-transform" 
                                                        className="block cursor-pointer text-[10px] md600:text-[12px] lg:text-[14px] px-2 py-2 rounded transition-colors"
                                                        style={{ color: colors.textSecondary }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                    >
                                                        Voice Transform
                                                    </Link>
                                                    <Link 
                                                        to="/sidebar/advanced-voice-transform" 
                                                        className="block cursor-pointer text-[10px] md600:text-[12px] lg:text-[14px] px-2 py-2 rounded transition-colors"
                                                        style={{ color: colors.textSecondary }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                    >
                                                        Advanced Voice Transform
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md:py-2 cursor-pointer transition-colors"
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: colors.textSecondary
                                            }}
                                        >
                                            <Region className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Create region</span>
                                        </p>
                                    )}
                                </Menu.Item>

                            </div>
                        </Menu.Items>
                    </Menu >

                    <Menu as="div" className="relative inline-block text-left">
                        <div >
                            <MenuButton className="outline-none" >
                                <p 
                                    className='text-[10px] sm:text-[12px] md:text-[12px] lg:text-[14px]'
                                    style={{ color: colors.textSecondary }}
                                > 
                                    Setting 
                                </p>
                            </MenuButton>
                        </div>

                        <Menu.Items className="absolute left-[-60px] sm:left-0 z-[99] mt-2 lg:mt-3 w-40 sm:w-44 md600:w-48 lg:w-60 rounded-b-md origin-top-right bg-primary-light dark:bg-[#404040] shadow-lg outline-none">
                            <div className="">
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md600:py-2 flex md600:gap-3 outline-none transition-colors`} 
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: colors.textSecondary
                                            }}
                                            onClick={() => setMidiKeyboardModel(true)}
                                        >
                                            <Midisetting className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />  
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>MIDI Settings...</span>
                                        </p>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                        className={`px-3 py-1 gap-2 md600:px-4 lg:px-6 md:py-2 flex md600:gap-3 outline-none transition-colors ${getTrackType !== 'Voice & Mic' ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        style={{ 
                                            backgroundColor: active ? colors.menuItemHover : 'transparent',
                                            color: colors.textSecondary
                                        }}
                                        onClick={handleTunerClick}>
                                        <Tuner className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />  
                                        <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Tuner</span>
                                      </p>
                                    )}
                                </Menu.Item>
                                <div className="relative " onMouseEnter={() => handleSubmenuToggle('keyboard', true)} onMouseLeave={() => handleSubmenuToggle('keyboard', false)}>
                                    <div 
                                        className="px-3 pt-2 pb-2 gap-2 md600:px-4 lg:px-6 md600:pt-2 md600:pb-3 lg:pb-4 items-center flex md600:gap-3 outline-none border-b transition-colors"
                                        style={{ 
                                            borderBottomColor: colors.menuBorder,
                                            color: colors.textSecondary
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <Keyboard className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                        <span className='text-[10px] md600:text-[12px] lg:text-[14px]' onMouseEnter={(e) => e.target.style.backgroundColor = 'transparent'}>Keyboard</span>
                                        <MdOutlineKeyboardArrowRight className="text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" style={{ color: colors.iconSecondary }} />
                                    </div>

                                    {showSubmenu.keyboard && (
                                        <div 
                                            className="absolute flex left-full px-2 py-2 gap-2 md600:px-3 lg:px-4 md:py-2 top-0 z-50 w-32 md600:w-48 lg:w-56 lg:mt-0 shadow-lg outline-none text-nowrap rounded-md"
                                            style={{ backgroundColor: colors.menuBackground }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                            // onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <p 
                                                className="block cursor-pointer text-[10px] md600:text-[12px] lg:text-[14px] transition-colors" 
                                                style={{ color: colors.textSecondary }}
                                                onClick={handleNestedOptionClick}                                                
                                            >
                                                Musical Typing
                                            </p>
                                            <div className='ms-auto '>
                                                <label className="inline-flex cursor-pointer" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" className="sr-only peer" checked={isLowLatency2} onChange={() => { const next = !isLowLatency2; setIsLowLatency2(next); dispatch(setMusicalTypingEnabled(next)); }} />
                                                    <div className="relative w-8 md600:w-9 h-4 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-[#353535] peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-[#357935] peer-checked:bg-[#357935] dark:peer-checked:bg-[#357935]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className={`px-3 pb-2 pt-2 gap-2 md600:px-4 lg:px-6 md600:pb-2 md600:pt-3 lg:pt-4 flex md600:gap-3 outline-none transition-colors`}
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                color: colors.textSecondary
                                            }}
                                        >
                                            <Lowlatancy className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Low latency... </span>
                                            <div className='ms-auto '>
                                                <label className="inline-flex cursor-pointer" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" className="sr-only peer" checked={isLowLatency}
                                                        onChange={() => {
                                                            if (!isLowLatency) {
                                                                setLowLatencyModel(true);
                                                            } else {
                                                                localStorage.removeItem('lowLatencyMode');
                                                                setIsLowLatency(false);
                                                            }
                                                        }}
                                                    />
                                                    <div className="relative w-9 h-4 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-[#353535] peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-[#357935] peer-checked:bg-[#357935] dark:peer-checked:bg-[#357935]"></div>
                                                </label>
                                            </div>
                                        </p>
                                    )}
                                </Menu.Item>

                                <div className="relative" onMouseEnter={() => handleSubmenuToggle('soundquality', true)} onMouseLeave={() => handleSubmenuToggle('soundquality', false)}>
                                    <div 
                                        className="flex gap-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer transition-colors"
                                        style={{ color: colors.textSecondary }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <Soundquality className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                        <span className='text-[10px] md600:text-[12px] lg:text-[14px]' onMouseEnter={(e) => e.target.style.backgroundColor = 'transparent'}>Sound quality</span>
                                        <MdOutlineKeyboardArrowRight className="text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" style={{ color: colors.iconSecondary }} />
                                    </div>

                                    {showSubmenu.soundquality && (
                                        <div 
                                            className="absolute left-full top-0 z-50 w-28 md600:w-48 lg:w-56 lg:mt-0 shadow-lg outline-none rounded-md"
                                            style={{ backgroundColor: colors.menuBackground }}
                                        >
                                            {soundQualityOptions.map((option) => (
                                                <div 
                                                    key={option.id} 
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 cursor-pointer transition-colors"
                                                    style={{ color: colors.textSecondary }}
                                                    onClick={() => handleSoundQualitySelect(option.id, option.label)}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected option */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedSoundQuality === option.label && (
                                                                <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} style={{ color: colors.iconSecondary }} />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]' onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>{option.label}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <p 
                                            className={`px-3 py-1 mt-2 md600:px-4 lg:px-6 md:py-3 lg:py-4 flex gap-2 md600:gap-3 border-t border-b outline-none transition-colors`}
                                            style={{ 
                                                backgroundColor: active ? colors.menuItemHover : 'transparent',
                                                borderTopColor: colors.menuBorder,
                                                borderBottomColor: colors.menuBorder,
                                                color: colors.textSecondary
                                            }}
                                        >
                                            <Songsections className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Song Sections</span>
                                            <div className='ms-auto '>
                                                <label className="inline-flex cursor-pointer" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" className="sr-only peer" checked={isSongSection} onChange={() => dispatch(setIsSongSection(!isSongSection))} />
                                                    <div className="relative w-9 h-4 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-[#353535] peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-[#357935] peer-checked:bg-[#357935] dark:peer-checked:bg-[#357935]"></div>
                                                </label>
                                            </div>
                                        </p>
                                    )}
                                </Menu.Item>

                                <div className="relative" onMouseEnter={() => handleSubmenuToggle('language', true)} onMouseLeave={() => handleSubmenuToggle('language', false)}>
                                    <div 
                                        className="flex gap-2 mt-2 md600:gap-3 w-full items-center px-3 py-1 md600:px-4 lg:px-6 md600:py-2 cursor-pointer transition-colors"
                                        style={{ color: colors.textSecondary }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <Language className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                        <span className='text-[10px] md600:text-[12px] lg:text-[14px]' onMouseEnter={(e) => e.target.style.backgroundColor = 'transparent'}>Language</span>
                                        <MdOutlineKeyboardArrowRight className="text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" style={{ color: colors.iconSecondary }} />
                                    </div>

                                    {showSubmenu.language && (
                                        <div 
                                            className="absolute left-full top-0 z-50 w-32 md600:w-48 lg:w-56 lg:mt-0 shadow-lg outline-none rounded-md"
                                            style={{ backgroundColor: colors.menuBackground }}
                                        >
                                            {languageOptions.map((lang) => (
                                                <div 
                                                    key={lang.id} 
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 cursor-pointer transition-colors"
                                                    style={{ color: colors.textSecondary }}
                                                    onClick={() => handleLanguage(lang.id, lang.label)}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected lang */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedLanguage === lang.label && (
                                                                <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>{lang.label}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="relative" onMouseEnter={() => handleSubmenuToggle('theme', true)} onMouseLeave={() => handleSubmenuToggle('theme', false)}>
                                    <div 
                                        className="flex gap-2 md600:gap-3 mt-2 w-full items-center px-3 py-2 md600:px-4 lg:px-6 md600:py-3 cursor-pointer border-t transition-colors"
                                        style={{ 
                                            borderTopColor: colors.menuBorder,
                                            color: colors.textSecondary
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        <Theme className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                        <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>Themes</span>
                                        <MdOutlineKeyboardArrowRight className="text-[12px] md600:text-[16px] lg:text-[20px] ms-auto" style={{ color: colors.iconSecondary }} />
                                    </div>

                                    {showSubmenu.theme && (
                                        <div 
                                            className="absolute left-full top-0 z-50 w-28 md600:w-48 lg:w-56 lg:mt-0 shadow-lg outline-none rounded-md"
                                            style={{ backgroundColor: colors.menuBackground }}
                                        >
                                            {themesOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center justify-between px-3 py-1 lg:px-4 md600:py-2 cursor-pointer transition-colors"
                                                    style={{ color: colors.textSecondary }}
                                                    onClick={() => handlethemesSelect(option.id, option.label)}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = colors.menuItemHover}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                >
                                                    <div className="flex items-center gap-2 md600:gap-3">
                                                        {/* Show tick only for selected option */}
                                                        <div className="w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                                                            {selectedtheme === option.label && (
                                                                <Tick className='w-3 h-3 md600:w-4 md600:h-4 lg:w-5 lg:h-5' style={{ color: colors.iconSecondary }} />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className='text-[10px] md600:text-[12px] lg:text-[14px]'>{option.label}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Menu.Items>
                    </Menu >

                    <button
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={`transition-all duration-200 hidden md600:block relative hover:opacity-80 ${canUndo ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        style={{ 
                            color: canUndo ? colors.iconMuted : colors.buttonDisabled 
                        }}
                        title={canUndo ? `Undo (Ctrl+Z) - ${historyLength} steps available` : 'Nothing to undo'}
                    >
                        <PiArrowBendUpLeftBold className="md:text-[16px] lg:text-[20px] xl:text-[26px]" />
                        {canUndo && historyLength > 0 && (
                            <span 
                                className="absolute -top-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                style={{ backgroundColor: colors.accent }}
                            >
                                {historyLength > 9 ? '9+' : historyLength}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className={`transition-all duration-200 hidden md600:block relative hover:opacity-80 ${canRedo ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        style={{ 
                            color: canRedo ? colors.iconMuted : colors.buttonDisabled 
                        }}
                        title={canRedo ? `Redo (Ctrl+Y) - ${futureLength} steps available` : 'Nothing to redo'}
                    >
                        <PiArrowBendUpRightBold className="md:text-[16px] lg:text-[20px] xl:text-[26px]" />
                        {canRedo && futureLength > 0 && (
                            <span 
                                className="absolute -top-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                style={{ backgroundColor: colors.accent }}
                            >
                                {futureLength > 9 ? '9+' : futureLength}
                            </span>
                        )}
                    </button>
                </div >

                <div className="flex gap-2 md:gap-3 lg:gap-5 xl:gap-4 items-center" >
                    <div className="flex gap-2 items-center cursor-pointer" onClick={handleSaved}>
                        <img src={saveStatus === 'saved' ? greenSave : graySave} alt="" className='w-[14px] h-[14px] md:h-full' />
                        <p 
                            className="text-[14px] hidden md600:block"
                            style={{ 
                                color: saveStatus === 'saved' ? colors.success : colors.textSecondary 
                            }}
                        >
                            {saveStatus === 'saved' ? 'Saved!' : 'Saved!'}
                        </p>
                    </div>
                    {isEditingSongName ? (
                        <input
                            type="text"
                            value={songName}
                            onChange={handleSongNameChange}
                            onBlur={handleSongNameSave}
                            onKeyDown={handleSongNameKeyPress}
                            className='text-[12px] md:text-[14px] bg-transparent border rounded px-1 py-0.5 focus:outline-none focus:ring-1'
                            style={{ 
                                color: colors.textSecondary,
                                borderColor: colors.success,
                                focusRingColor: colors.success
                            }}
                            autoFocus
                        />
                    ) : (
                        <p 
                            className='text-[12px] md:text-[14px] cursor-pointer transition-colors'
                            style={{ 
                                color: colors.textSecondary
                            }}
                            onClick={handleSongNameClick}
                            onMouseEnter={(e) => e.target.style.color = colors.success}
                            onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
                        >
                            {songName}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 md:gap-3 lg:gap-5 xl:gap-3" style={{height:"max-content"}}>
                    <button 
                        onClick={toggleTheme} 
                        className="relative w-[60px] h-[30px] rounded-full p-1 transition-colors duration-300 outline-none focus:outline-none hidden md:block"
                        style={{ border: `1px solid ${colors.toggleBorder}` }}
                    >
                        {/* Background slider */}
                        <div 
                            className={`absolute top-0 left-0 w-[26px] h-[28px] rounded-full transition-transform duration-300 ${isDark ? 'translate-x-8' : 'translate-x-0'}`}
                            style={{ backgroundColor: colors.toggleSlider }}
                        />

                        {/* Sun icon */}
                        <div className={`absolute top-0 left-0 w-[26px] h-[28px] flex items-center justify-center transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-50'}`}>
                            <GoSun 
                                className="text-[16px]" 
                                style={{ color: colors.toggleIcon }}
                            />
                        </div>

                        {/* Moon icon */}
                        <div className={`absolute top-0 right-0 w-[26px] h-[28px] flex items-center justify-center transition-opacity duration-300 ${isDark ? 'opacity-50' : 'opacity-100'}`}>
                            <IoMoonOutline 
                                className="text-[16px]" 
                                style={{ color: colors.toggleIcon }}
                            />
                        </div>
                    </button>
                    <div 
                        onClick={handleExportModal} 
                        className="flex xl:gap-2 sm:p-2 md:p-1 lg:px-2 xl:px-3 lg:py-1 rounded-full cursor-pointer items-center transition-colors duration-200 hover:opacity-80"
                        style={{ 
                            border: `1px solid ${colors.borderStrong}`,
                            backgroundColor: colors.background
                        }}
                    >
                        <HiDownload 
                            className="xl:text-[18px]" 
                            style={{ color: colors.iconSecondary }}
                        />
                        <p 
                            className="text-[12px] hidden xl:block"
                            style={{ color: colors.textSecondary }}
                        > 
                            Export
                        </p>
                    </div>

                    <div 
                        className="flex xl:gap-2 justify-center items-center sm:p-2 md:p-1 lg:px-2 xl:px-3 lg:py-1 rounded-full cursor-pointer hover:opacity-80 transition-all"
                        style={{border: `1px solid ${colors.borderStrong}`, backgroundColor: colors.upgradeBackground }}
                        onClick={() => setPricingModalOpen(true)}
                    >
                        <img src={subscription} alt="" className='h-[18px] w-[18px]' />
                        <p 
                            className="text-[12px] font-semibold hidden xl:block"
                            style={{ color: colors.upgradeText }}
                        >
                            Upgrade Now
                        </p>
                    </div>

                    <div 
                        className="flex md:gap-2 sm:p-2 md:px-2 xl:px-3 md:py-1 rounded-full cursor-pointer hover:opacity-80 transition-all"
                        style={{ 
                            backgroundColor: colors.shareBackground,
                            border: `1px solid ${colors.borderStrong}`
                        }}
                        onClick={() => setShareModalOpen(true)}
                    >
                        <IoIosShareAlt 
                            className="xl:text-[18px]" 
                            style={{ color: colors.shareText }}
                        />
                        <p 
                            className="text-[12px] hidden md:block"
                            style={{ color: colors.shareText }}
                        >
                            Share
                        </p>
                    </div>

                    <Link to='/project' className="text-center hidden xl:block">
                        <RxExit 
                            className='xl:text-[14px]' 
                            style={{ color: colors.iconSecondary }}
                        />
                        <p 
                            className="text-[10px]"
                            style={{ color: colors.textSecondary }}
                        >
                            Exit
                        </p>
                    </Link>
                </div>
            </div>

            {/* Mobile Offcanvas Menu */}
            <div 
                className={`fixed inset-0 z-[999] md:hidden transition-opacity duration-300 ${
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setMobileMenuOpen(false)}
            >
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                />
                
                {/* Offcanvas Panel */}
                <div 
                    className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ${
                        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                    style={{ backgroundColor: colors.menuBackground }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.menuBorder }}>
                        <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>LOGO</h2>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 rounded-md hover:bg-opacity-10"
                            style={{ color: colors.iconSecondary }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu Content */}
                    <div className="p-4 space-y-2 overflow-y-auto h-full">
                        {/* File Menu */}
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium mb-2 px-2" style={{ color: colors.textPrimary }}>File</h3>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    handleNewProject();
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <NewFolderIcon className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>New...</span>
                            </button>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    setOpenProjectModal(true);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <OpenFolderIcon className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Open...</span>
                            </button>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    setPricingModalOpen(true);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Previous className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Previous versions</span>
                            </button>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    handleExportModal();
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Exports className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Export</span>
                            </button>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    setShareModalOpen(true);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Shareproject className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Share Project</span>
                            </button>
                        </div>

                        {/* Edit Menu */}
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium mb-2 px-2" style={{ color: colors.textPrimary }}>Edit</h3>
                            <button 
                                className={`w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3 ${
                                    !canUndo ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                style={{ color: colors.textSecondary }}
                                onClick={canUndo ? () => {
                                    handleUndo();
                                    setMobileMenuOpen(false);
                                } : undefined}
                                disabled={!canUndo}
                            >
                                <Undo className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Undo</span>
                                <span className="text-xs ml-auto" style={{ color: colors.textMuted }}>Ctrl+Z</span>
                            </button>
                            <button 
                                className={`w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3 ${
                                    !canRedo ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                style={{ color: colors.textSecondary }}
                                onClick={canRedo ? () => {
                                    handleRedo();
                                    setMobileMenuOpen(false);
                                } : undefined}
                                disabled={!canRedo}
                            >
                                <Redo className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Redo</span>
                                <span className="text-xs ml-auto" style={{ color: colors.textMuted }}>Ctrl+Y</span>
                            </button>
                        </div>

                        {/* Settings Menu */}
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium mb-2 px-2" style={{ color: colors.textPrimary }}>Settings</h3>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    setMidiKeyboardModel(true);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Midisetting className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>MIDI Settings...</span>
                            </button>
                            <button 
                                className={`w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3 ${
                                    getTrackType !== 'Voice & Mic' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                style={{ color: colors.textSecondary }}
                                onClick={getTrackType === 'Voice & Mic' ? () => {
                                    handleTunerClick();
                                    setMobileMenuOpen(false);
                                } : undefined}
                            >
                                <Tuner className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Tuner</span>
                            </button>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    setLowLatencyModel(true);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Lowlatancy className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Low latency...</span>
                            </button>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    dispatch(setIsSongSection(!isSongSection));
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Songsections className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Song Sections</span>
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="space-y-1 pt-4 border-t" style={{ borderColor: colors.menuBorder }}>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    handleExportModal();
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <HiDownload className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Export</span>
                            </button>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    setPricingModalOpen(true);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <img src={subscription} alt="" className='w-4 h-4' />
                                <span className='text-sm'>Upgrade Now</span>
                            </button>
                            <button 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3"
                                style={{ color: colors.textSecondary }}
                                onClick={() => {
                                    setShareModalOpen(true);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <IoIosShareAlt className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Share</span>
                            </button>
                            <Link 
                                to='/profile' 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3 block"
                                style={{ color: colors.textSecondary }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Gotoprofile className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Go to profile</span>
                            </Link>
                            <Link 
                                to='/project' 
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-opacity-10 transition-colors flex items-center gap-3 block"
                                style={{ color: colors.textSecondary }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <RxExit className='w-4 h-4' style={{ color: colors.iconSecondary }} />
                                <span className='text-sm'>Exit</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* MIDI Keyboard Modal */}
            <Dialog open={midikeyboardmodal} onClose={setMidiKeyboardModel} className="relative z-[99]">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-primary-light dark:bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:px-[10px] px-[20px]">
                                <div className="md:py-[20px] py-[10px] md:px-[10px] bg-primary-light dark:bg-[#1F1F1F] border-b-[0.5px] border-[#1414141A] dark:border-[#FFFFFF1A]">
                                    <div className="flex justify-between items-center">
                                        <div className="sm:text-xl text-lg font-[600] text-secondary-light dark:text-secondary-dark">MIDI Keyboard</div>
                                        <Close onClick={() => setMidiKeyboardModel(false)} className="cursor-pointer text-secondary-light dark:text-secondary-dark" />
                                    </div>
                                </div>
                                <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                    <div className="flex mb-5">
                                        <img src={midi} alt="" className='me-4 ' />
                                        <div className=''>
                                            <div className='text-sm text-secondary-light dark:text-secondary-dark font-[400] mb-[10px]'>Your device</div>
                                            <input type="text" placeholder='Folder Name' className='text-secondary-light dark:text-secondary-dark rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]' />
                                        </div>
                                    </div>
                                    <div className="md:w-[270px] [240px] bg-[#FF00001A] p-[12px] m-auto">
                                        <div className='text-sm font-[500] text-[#FF0000] mb-3'>No device found</div>
                                        <p className='text-secondary-light dark:text-secondary-dark text-sm font-[400]'>Check your keyboard connection and try pressing a key.</p>
                                    </div>
                                    <div className="text-center md:pt-[40px] pt-[20px]">
                                        <button className="d_btn d_createbtn">Ok</button>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Low Latency Mode Modal */}
            <Dialog open={lowlatencyomodal} onClose={setLowLatencyModel} className="relative z-50">
                <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-primary-light dark:bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
                            <div className="md:py-[20px] py-[10px] md:px-[20px] px-[10px] bg-primary-light dark:bg-[#1F1F1F]">
                                <div className="flex justify-end items-center">
                                    <Close onClick={() => setLowLatencyModel(false)} className="cursor-pointer text-secondary-light dark:text-secondary-dark" />
                                </div>
                            </div>
                            <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                                <div className='text-center'>
                                    <div className='text-base text-secondary-light dark:text-secondary-dark font-[600] mb-[20px]'>Enable Low Latency Mode</div>
                                    <p className='text-[#2D2D2D] dark:text-[#FFFFFF99] text-sm font-[400] md:w-[370px] w-[280px] m-auto'>Some audio effects will be disabled to reduce latency. We need to refresh the page to apply these changes. </p>
                                </div>
                                <div className="text-center md:pt-[40px] pt-[20px]">
                                    <button className="d_btn d_cancelbtn sm:me-7 me-5 d_permanentlyall" onClick={() => {
                                        setIsLowLatency(false);
                                        setLowLatencyModel(false);
                                    }}>Cancel </button>
                                    <button className="d_btn d_createbtn d_permanentlyall" onClick={handleApplyLowLatencyMode}>Apply and refresh</button>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Undo/Redo Toast Notification */}
            {showUndoRedoToast && (
                <div 
                    className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 border rounded-lg px-4 py-3 shadow-lg animate-fade-in"
                    style={{ 
                        backgroundColor: colors.background,
                        borderColor: colors.borderStrong
                    }}
                >
                    <div className="text-center">
                        <div 
                            className="text-sm opacity-80"
                            style={{ color: colors.textPrimary }}
                        >
                            {toastMessage}
                        </div>
                        <div 
                            className="text-xs opacity-60 mt-1"
                            style={{ color: colors.textMuted }}
                        >
                            Action completed
                        </div>
                    </div>
                </div>
            )}

            {/* Low Latency Info Banner (post-refresh) */}
            {showLowLatencyInfo && (
                <div 
                    className="fixed bottom-14 z-50 border rounded-lg px-4 py-3 shadow-lg"
                    style={{ 
                        backgroundColor: colors.background,
                        borderColor: colors.borderStrong,
                        maxWidth: '800px',
                        width: 'calc(100% - 24px)'
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div className="text-sm" style={{ color: colors.textPrimary }}>
                            <strong>Low Latency Mode enabled.</strong>
                            <div className="mt-1" style={{ color: colors.textMuted }}>
                                In a music player or digital audio workstation (DAW) app, Low Latency Mode reduces the delay between an action and the resulting sound.
                                Examples include playing a virtual piano, triggering drum pads, or pressing Play — interactions feel more instant and responsive.
                                Common uses: Live performance/recording, beatmaking/looping, audio monitoring, and overall better responsiveness.
                                Note: This may use more CPU because audio buffers are processed faster.
                            </div>
                        </div>
                        <button
                            onClick={() => setShowLowLatencyInfo(false)}
                            className="ml-auto px-2 py-1 rounded text-sm"
                            style={{ color: colors.textSecondary, border: `1px solid ${colors.borderStrong}` }}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -10px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>

            {/* Share Modal */}
            <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} projectId={currentMusic?._id}/>

            {/* Pricing Modal */}
            <PricingModel pricingModalOpen={pricingModalOpen} setPricingModalOpen={setPricingModalOpen} />

            {/* AccessPopup for microphone permission */}
            {showAccessPopup && (
                <AccessPopup onClose={() => setShowAccessPopup(false)} />
            )}

            {/* AccessPopup for microphone permission */}
            {showTunerPopup && (
                <TunerPopup onClose={() => setShowTunerPopup(false)} />
            )}

            {/* Add hidden file input for regular audio import */}
            <input
                type="file"
                ref={setFileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                style={{ display: 'none' }}
            />
            
            {/* Add hidden file input for Voice & Mic import */}
            <input
                type="file"
                ref={setVoiceMicFileInputRef}
                onChange={handleVoiceMicFileChange}
                accept="audio/*"
                style={{ display: 'none' }}
            />
        </>
    )
}


export default TopHeader