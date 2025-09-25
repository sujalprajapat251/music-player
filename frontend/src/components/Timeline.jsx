import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Player, start } from "tone";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import Soundfont from 'soundfont-player';
import { addTrack, addAudioClipToTrack, updateAudioClip, removeAudioClip, setPlaying, setCurrentTime, setAudioDuration, toggleMuteTrack, updateSectionLabel, removeSectionLabel, addSectionLabel, setTrackVolume, updateTrackAudio, resizeSectionLabel, moveSectionLabel, setRecordingAudio, setCurrentTrackId, setTrackType, triggerPatternDrumPlayback, clearTrackDeleted, setPianoNotes, setDrumRecordedData, setPianoRecordingClip, setDrumRecordingClip, setTracks, updateTrack, addPianoNote, createTrackWithDefaults } from "../Redux/Slice/studio.slice";
import { selectStudioState } from "../Redux/rootReducer";
import { createSynthSound, getAudioContext as getDrumAudioContext } from '../Utils/drumMachineUtils';
import { selectGridSettings, setSelectedGrid, setSelectedTime, setSelectedRuler, setBPM, zoomIn, zoomOut, resetZoom } from "../Redux/Slice/grid.slice";
import { setAudioDuration as setLoopAudioDuration, toggleLoopEnabled, setLoopEnd, setLoopRange, selectIsLoopEnabled } from "../Redux/Slice/loop.slice";
import { getGridSpacing, getGridSpacingWithTimeSignature, parseTimeSignature } from "../Utils/gridUtils";
import { IMAGE_URL } from "../Utils/baseUrl";
import { getAudioContext as getSharedAudioContext, ensureAudioUnlocked } from "../Utils/audioContext";
import { getNextTrackColor } from "../Utils/colorUtils";
import { drumMachineTypes } from "../Utils/drumMachineUtils";
import settingIcon from "../Images/setting.svg";
import reverceIcon from "../Images/reverce.svg";
import fxIcon from "../Images/fx.svg";
import offce from "../Images/offce.svg";
import magnetIcon from "../Images/magnet.svg";
import GridSetting from "./GridSetting";
import MusicOff from "./MusicOff";
import WaveMenu from "./WaveMenu";
import Effects from './Effects'
import MySection from "./MySection";
import TimelineActionBoxes from "./TimelineActionBoxes";
import AddNewTrackModel from "./AddNewTrackModel";
import Piano from "./Piano";
import WavEncoder from 'wav-encoder';
import Drum from './Drum';
import Pianodemo from "./Piano";
import SectionContextMenu from "./SectionContextMenu";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import close from '../Images/close.svg';
import LoopBar from "./LoopBar";
import TimelineTrack from "./TimelineTrack";
import ResizableSectionLabel from "./ResizableSectionLabel";
import { useSectionLabels } from "../hooks/useSectionLabels";
import { toggleEffectsOffcanvas } from "../Redux/Slice/effects.slice";
import EditTrackNameModal from "./EditTrackNameModal";
import { audioManager } from '../Utils/audioContext';
import audioQualityManager from '../Utils/audioQualityManager';
import { getEffectsProcessor } from '../Utils/audioEffectsProcessor';
import Guitar from "./Guitar";
import Orchestral from "./Orchestral";
import PricingModel from './PricingModel';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { setShowLoopLibrary } from "../Redux/Slice/ui.slice";
import { getAllMusic, setCurrentMusic } from "../Redux/Slice/music.slice";
import { setSelectedTrackId } from '../Redux/Slice/effects.slice';
import { motion, AnimatePresence } from "framer-motion";
import { io } from 'socket.io-client';
import { BASE_URL } from '../Utils/baseUrl';
import VoiceAndMic from "./VoiceAndMic";
import AccessPopup from "./AccessPopup";
import { setAlert } from "../Redux/Slice/alert.slice";
import NewSynth from "./NewSynth";
import BassAnd808 from "./BassAnd808";

const Timeline = () => {
  
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const lastReduxUpdateRef = useRef(0);
  const lastPlayerUpdateRef = useRef(0);
  const fileInputRef = useRef(null);
  const audioTrackFileInputRef = useRef(null);
  const voiceMicFileInputRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const isDragging = useRef(false);
  const animationFrameId = useRef(null);
  const playbackStartRef = useRef({ systemTime: 0, audioTime: 0 });
  const audioContextRef = useRef(null);

  const [players, setPlayers] = useState([]);
  const [waveSurfers, setWaveSurfers] = useState([]);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [showGridSetting, setShowGridSetting] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showOffcanvasEffects, setShowOffcanvasEffects] = useState(false);
  const [clipboard, setClipboard] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showPiano, setShowPiano] = useState(false);
  const [showSynth, setShowSynth] = useState(false);
  const [showBass808, setShowBass808] = useState(false);
  const [showAccessPopup, setShowAccessPopup] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const [micAccessDenied, setMicAccessDenied] = useState(false);
  const [showDrum, setShowDrum] = useState(false);
  const [showMicVoice, setShowMicVoice] = useState(false);
  const [showGuitar, setShowGuitar] = useState(false);
  const [showOrchestral, setShowOrchestral] = useState(false);
  const [renameSectionId, setRenameSectionId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameModal, setRenameModal] = useState(false);
  const [resizeSectionId, setResizeSectionId] = useState(null);
  const [resizeValue, setResizeValue] = useState("");
  const [resizeModal, setResizeModal] = useState(false);
  const [volumeIndicator, setVolumeIndicator] = useState({ show: false, volume: 0, trackName: '' });
  const [edirNameModel, setEdirNameModel] = useState(false);
  const [isMagnetEnabled, setIsMagnetEnabled] = useState(false);
  const gridSettingRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);

  // Piano playback functionality
  const pianoRef = useRef(null);
  const instrumentCacheRef = useRef({});
  const pianoAudioContextRef = useRef(null);
  const activePianoNotesRef = useRef(new Set());

  const { zoomLevel } = useSelector(selectGridSettings);
  const drumRecordedData = useSelector((state) => selectStudioState(state)?.drumRecordedData || []);
  const pianoNotes = useSelector((state) => selectStudioState(state).pianoNotes || []);
  const pianoRecordingClip = useSelector((state) => selectStudioState(state).pianoRecordingClip || null);
  const drumRecordingClip = useSelector((state) => selectStudioState(state).drumRecordingClip || null);
  const patternDrumPlayback = useSelector((state) => selectStudioState(state)?.patternDrumPlayback || {});
  const patternDrumEvents = useSelector((state) => selectStudioState(state)?.patternDrumEvents || {});
  // console.log("FFFFFFFFFFFFFFFFFF",drumRecordedData)

  const isPlaying = useSelector((state) => selectStudioState(state)?.isPlaying || false);
  const currentTime = useSelector((state) => selectStudioState(state)?.currentTime || 0);
  const audioDuration = useSelector((state) => selectStudioState(state)?.audioDuration || 150);
  const trackEffectsState = useSelector(state => state.effects?.trackEffects || {});
  // eslint-disable-next-line no-unused-vars
  const audioSettings = useSelector((state) => state.audioSettings);
  const currentTrackId = useSelector((state) => selectStudioState(state).currentTrackId);
  // Timeline.jsx (add near other refs)
  const pendingAnchorRef = useRef(null);
  const getScale = () => baseTimelineWidthPerSecond * zoomLevel;

  const baseTimelineWidthPerSecond = 100; // Base width per second
  const timelineWidthPerSecond = baseTimelineWidthPerSecond * zoomLevel; // Apply zoom level


  const timelineDrumAudioCtxRef = useRef(null);

  // Active drum clip for the current track (used for trim boundaries)
  const trackDrumClip =
    (drumRecordingClip && ((drumRecordingClip.trackId ?? null) === (currentTrackId ?? null)))
      ? drumRecordingClip
      : null;

  const playRecordedDrumHit = useCallback((drumHit) => {
    try {
      if (!drumHit || !Number.isFinite(drumHit.freq) || !Number.isFinite(drumHit.decay) || !drumHit.type) return;
      const audioContext = getDrumAudioContext(timelineDrumAudioCtxRef);
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => { });
      }
      const padData = { type: drumHit.type, freq: drumHit.freq, decay: drumHit.decay };
      const sourceNode = createSynthSound(padData, audioContext);
      if (!sourceNode) return;
      sourceNode.connect(audioContext.destination);
    } catch (_) { }
  }, []);

  const scheduledKeysRef = useRef(new Set());

  useEffect(() => {
    if (!isPlaying) {
      scheduledKeysRef.current.clear();
      return;
    }
    const LOOK_AHEAD = 0.20;
    const nowSec = Number.isFinite(currentTime) ? currentTime : 0;
    const windowStart = nowSec;
    const windowEnd = nowSec + LOOK_AHEAD;

    const hitsForTrack = Array.isArray(drumRecordedData)
      ? drumRecordedData.filter(h => (h?.trackId ?? null) === (currentTrackId ?? null))
      : [];

    const trimmedHits = (trackDrumClip && trackDrumClip.start != null && trackDrumClip.end != null)
      ? hitsForTrack.filter(h => {
        const start = h.currentTime || 0;
        const end = start + (h.decay || 0.2);
        return end > trackDrumClip.start && start < trackDrumClip.end;
      })
      : hitsForTrack;

    // Check if the current track is muted before playing drum hits
    const currentTrack = tracks.find(t => t.id === currentTrackId);
    const isCurrentTrackMuted = currentTrack ? (soloTrackId ? soloTrackId !== currentTrack.id : (currentTrack.muted || false)) : false;

    if (!isCurrentTrackMuted) {
      trimmedHits.forEach((hit, idx) => {
        const hitTime = hit.currentTime || 0;
        if (hitTime >= windowStart && hitTime < windowEnd) {
          const key = `${currentTrackId}:${hitTime.toFixed(4)}:${idx}`;
          if (scheduledKeysRef.current.has(key)) return;
          scheduledKeysRef.current.add(key);
          const delayMs = Math.max(0, Math.round((hitTime - nowSec) * 1000));
          setTimeout(() => { playRecordedDrumHit(hit); }, delayMs);
        }
      });
    }

    const tick = setInterval(() => { }, 50);
    return () => clearInterval(tick);
  }, [isPlaying, currentTime, drumRecordedData, currentTrackId, trackDrumClip, playRecordedDrumHit]);

  // Listen for anchor requests from the toolbar before zoom happens
  useEffect(() => {
    const onAnchor = (e) => {
      const container = timelineContainerRef.current;
      if (!container) return;

      const oldScale = getScale(); // current scale before zoom (ok to use; zoom not dispatched yet)
      const type = e?.detail?.type || 'center';
      if (type === 'mouse') {
        // Anchor under the mouse (optional if you add mouseX)
        const mouseX = e?.detail?.mouseX ?? (container.clientWidth / 2);
        const focalTime = (container.scrollLeft + mouseX) / oldScale;
        pendingAnchorRef.current = { type, focalTime, mouseX };
      } else {
        // Center anchor (works great for toolbar buttons)
        const centerX = container.scrollLeft + (container.clientWidth / 2);
        const focalTime = isPlaying ? currentTime : (centerX / oldScale);
        pendingAnchorRef.current = { type: 'center', focalTime };
      }
    };

    window.addEventListener('timeline:anchor', onAnchor);
    return () => window.removeEventListener('timeline:anchor', onAnchor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentTime, zoomLevel, baseTimelineWidthPerSecond]);

  // After zoomLevel changes, restore scrollLeft so the same time stays in view
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container || !pendingAnchorRef.current) return;

    const { focalTime, mouseX, type } = pendingAnchorRef.current;
    const newScale = getScale(); // scale AFTER zoom
    const desiredX = focalTime * newScale;

    const targetScrollLeft = type === 'mouse'
      ? (desiredX - (mouseX ?? container.clientWidth / 2))
      : (desiredX - container.clientWidth / 2);

    requestAnimationFrame(() => {
      const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
      container.scrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));
      pendingAnchorRef.current = null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel]);

  const trackDeleted = useSelector((state) => selectStudioState(state).trackDeleted);
  // Selected instrument for piano playback (sync with Piano.jsx)
  const selectedInstrument = useSelector((state) => selectStudioState(state)?.selectedInstrument || 'acoustic_grand_piano');

  // Stop all piano notes
  const stopAllPianoNotes = useCallback(() => {
    activePianoNotesRef.current.forEach(audioNode => {
      try {
        audioNode.stop();
      } catch (error) {
        console.error("Error stopping piano note:", error);
      }
    });
    activePianoNotesRef.current.clear();
  }, []);

  // Handle track deletion - stop audio for deleted track
  useEffect(() => {
    if (trackDeleted && trackDeleted.trackId) {
      console.log('Track deleted, stopping audio for track:', trackDeleted.trackId);
      dispatch(setAlert({ text: 'Track Deleted.', color: 'success' }));
      // Stop all players for this track
      const playersToStop = players.filter(playerObj =>
        playerObj.trackId === trackDeleted.trackId
      );

      playersToStop.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.stop === 'function') {
          try {
            playerObj.player.stop();
          } catch (error) {
            console.warn('Error stopping player for deleted track:', error);
          }
        }
      });

      // Remove players for this track from state
      setPlayers(prevPlayers =>
        prevPlayers.filter(playerObj => playerObj.trackId !== trackDeleted.trackId)
      );

      // Stop piano notes for this track
      stopAllPianoNotes();

      // Clear the trackDeleted flag
      dispatch(clearTrackDeleted());
    }
  }, [trackDeleted, players, dispatch, stopAllPianoNotes]);

  const tracks = useSelector((state) => selectStudioState(state)?.tracks || []);

  // Handle individual clip deletion - clean up audio players for deleted clips
  useEffect(() => {
    // Build a set of existing trackId:clipId pairs from Redux state
    const existingClips = new Set();
    tracks.forEach(track => {
      if (track.audioClips) {
        track.audioClips.forEach(clip => {
          existingClips.add(`${track.id}:${clip.id}`);
        });
      }
    });

    // Find and clean up players for clips that no longer exist
    const playersToRemove = [];
    players.forEach((playerObj) => {
      const clipKey = `${playerObj.trackId}:${playerObj.clipId}`;
      if (!existingClips.has(clipKey)) {
        playersToRemove.push(playerObj);
      }
    });

    // Stop and remove players for deleted clips
    if (playersToRemove.length > 0) {
      console.log('Cleaning up audio players for deleted clips:', playersToRemove.length);

      playersToRemove.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.stop === 'function') {
          try {
            playerObj.player.stop();
          } catch (error) {
            console.warn('Error stopping player for deleted clip:', error);
          }
        }
      });

      // Remove players for deleted clips from state
      setPlayers(prevPlayers =>
        prevPlayers.filter(playerObj => {
          const clipKey = `${playerObj.trackId}:${playerObj.clipId}`;
          return existingClips.has(clipKey);
        })
      );

      // Also clean up WaveSurfer instances for deleted clips
      setWaveSurfers(prevWaveSurfers =>
        prevWaveSurfers.filter(waveSurfer => {
          const clipKey = `${waveSurfer.trackId}:${waveSurfer.clipId}`;
          return existingClips.has(clipKey);
        })
      );
    }
  }, [tracks, players]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Stop all players when component unmounts
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.stop === 'function') {
          try {
            playerObj.player.stop();
          } catch (error) {
            console.warn('Error stopping player on unmount:', error);
          }
        }
      });

      // Stop all piano notes
      stopAllPianoNotes();
    };
  }, [players, stopAllPianoNotes]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = getSharedAudioContext();
      } catch (e) {
        audioContextRef.current = null;
      }
    }
    return audioContextRef.current;
  }, []);

  // Initialize or reinitialize piano for playback when instrument changes
  const initializePiano = useCallback(async () => {
    try {
      if (!pianoAudioContextRef.current) {
        pianoAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      // Stop any active notes before switching instruments
      stopAllPianoNotes();
      // Always (re)load the currently selected instrument
      pianoRef.current = await Soundfont.instrument(
        pianoAudioContextRef.current,
        selectedInstrument
      );
      // console.log("Piano instrument loaded for playback:", selectedInstrument);
    } catch (error) {
      console.error("Error loading piano instrument for playback:", selectedInstrument, error);
    }
  }, [selectedInstrument, stopAllPianoNotes]);

  // Ensure instrument is ready on mount and whenever selection changes
  useEffect(() => {
    initializePiano();
  }, [initializePiano]);

  // Play piano note
  const getInstrument = useCallback(async (instrumentId) => {
    if (!pianoAudioContextRef.current) {
      pianoAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const cache = instrumentCacheRef.current || {};
    const key = instrumentId || selectedInstrument || 'acoustic_grand_piano';
    if (cache[key]) return cache[key];
    try {
      const inst = await Soundfont.instrument(pianoAudioContextRef.current, key);
      cache[key] = inst;
      instrumentCacheRef.current = cache;
      return inst;
    } catch (e) {
      console.warn('Failed to load', key, e);
      return pianoRef.current; // fallback to current
    }
  }, [selectedInstrument]);

  const playPianoNote = useCallback(async (midiNumber, duration = 0.5, instrumentId) => {
    if (pianoAudioContextRef.current) {
      try {
        if (pianoAudioContextRef.current.state === 'suspended') {
          pianoAudioContextRef.current.resume();
        }
        const instrument = await getInstrument(instrumentId);
        if (!instrument) return;
        const audioNode = instrument.play(midiNumber, undefined, { duration });
        activePianoNotesRef.current.add(audioNode);

        // Clean up after note duration
        setTimeout(() => {
          activePianoNotesRef.current.delete(audioNode);
        }, duration * 1000);
      } catch (error) {
        console.error("Error playing piano note:", error);
      }
    }
  }, [getInstrument]);



  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    trackId: null,
    clipId: null
  });

  // Section label context menu state
  const [sectionContextMenu, setSectionContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    sectionId: null
  });

  // console.log("==========================================", tracks)

  const allTracks = useMemo(() => {
    // Now that piano data is embedded per track, just expose it from each track
    return (tracks || []).map((t) => ({
      ...t,
      pianoNotes: Array.isArray(t.pianoNotes) ? t.pianoNotes : [],
      pianoRecordingClip: t.pianoClip || null
    }));
  }, [tracks]);

  const trackHeight = useSelector((state) => selectStudioState(state)?.trackHeight || 100);
  const recordedData = useSelector((state) => selectStudioState(state)?.recordedData || []);
  const isRecording = useSelector((state) => selectStudioState(state)?.isRecording || false);

  const sidebarScrollOffset = useSelector((state) => selectStudioState(state)?.sidebarScrollOffset || 0);
  const soloTrackId = useSelector((state) => selectStudioState(state).soloTrackId);

  // Use custom hook for section labels management
  const { sectionLabels, resizeSection } = useSectionLabels();

  // Track if recording has ever started during this session
  useEffect(() => {
    if (isRecording) {
      setHasRecordingStarted(true);
    }
  }, [isRecording]);

  // Mute functionality

  useEffect(() => {
    // Force a re-render when recording state changes and we have drum data
    if (!isRecording && drumRecordedData.length > 0) {
      // Small delay to ensure all state updates are complete
      const timeoutId = setTimeout(() => {
        // Trigger a state update to force timeline re-render
        setLocalCurrentTime(prev => prev + 0.001); // Minimal change to trigger update
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isRecording, drumRecordedData.length]);

  useEffect(() => {
    players.forEach(playerObj => {
      const track = tracks.find(t => t.id === playerObj.trackId);
      if (!track) return; // Skip if track doesn't exist
      const isMuted = soloTrackId
        ? soloTrackId !== track.id
        : track.muted;
      if (playerObj.player) {
        playerObj.player.volume.value = isMuted ? -Infinity : 0;
      }
    });
  }, [tracks, players, soloTrackId]);

  // Get audio state from Redux

  // Grid settings from Redux
  const { selectedGrid, selectedTime, selectedRuler } = useSelector(selectGridSettings);

  // Loop settings from Redux
  const { loopStart, loopEnd, isLoopEnabled } = useSelector((state) => state.loop);

  // Add masterVolume selector after other selectors
  const masterVolume = useSelector((state) => selectStudioState(state)?.masterVolume ?? 80);

  const bpm = useSelector((state) => selectStudioState(state)?.bpm ?? 120);

  // UI state selector for MySection visibility
  const isSongSection = useSelector((state) => state.ui?.isSongSection ?? false);

  const ORIGINAL_BPM = 120;

  // Add tempo ratio calculation
  const tempoRatio = useMemo(() => {
    return bpm / ORIGINAL_BPM;
  }, [bpm]);

  const pianoRecording = useSelector((state) => selectStudioState(state).pianoRecord);
  // const currentTrackId = useSelector((state) => selectStudioState(state).currentTrackId);

  const lastProcessedRef = useRef(null);

  function generateRandomHexColor() {
    let randomNumber = Math.floor(Math.random() * 16777215);
    let hexColor = randomNumber.toString(16);
    hexColor = hexColor.padStart(6, '0');
    return `#${hexColor}`;
  }

  useEffect(() => {
    if (pianoRecording instanceof Blob && currentTrackId && pianoRecording !== lastProcessedRef.current) {
      lastProcessedRef.current = pianoRecording;
      getAudioDuration(pianoRecording).then((duration) => {
        // Ensure the blob is fully usable
        const url = URL.createObjectURL(pianoRecording);

        const audio = new Audio();
        audio.src = url;

        audio.oncanplaythrough = () => {
          const newColor = generateRandomHexColor();

          dispatch(updateTrackAudio({
            trackId: currentTrackId,
            audioData: {
              url,
              duration,
              color: newColor,
              trimStart: 0,
              trimEnd: duration,
              name: "Piano Recording",
              frozen: false,
            },
          }));
        };

        audio.onerror = (err) => {
          // console.error("Audio load error:", err);
        };
      }).catch((err) => {
        // console.error("Failed to decode audio:", err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pianoRecording, currentTrackId]);

  const getAudioDuration = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer.duration;
  };

  const getTrackType = useSelector((state) => selectStudioState(state).newtrackType);

  // Check microphone access
  const checkMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setMicAccessDenied(false);
      return true;
    } catch (error) {
      console.error('Microphone access denied:', error);
      setMicStream(null);
      setMicAccessDenied(true);
      return false;
    }
  };

  // Check microphone access when Voice & Mic is selected
  useEffect(() => {
    if (getTrackType === "Voice & Mic" || showMicVoice) {
      checkMicrophoneAccess();
    }
  }, [getTrackType, showMicVoice]);

  // Cleanup microphone stream when component unmounts or Voice & Mic is closed
  useEffect(() => {
    return () => {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [micStream]);

  // Mute functionality
  useEffect(() => {
    players.forEach(playerObj => {
      const track = tracks.find(t => t.id === playerObj.trackId);
      if (!track) return; // Skip if track doesn't exist
      const isMuted = soloTrackId
        ? soloTrackId !== track.id
        : track.muted;
      if (playerObj.player) {
        if (isMuted) {
          playerObj.player.volume.value = -Infinity;
        } else {
          // Calculate combined volume: master volume + track volume
          const masterVolumeDb = (masterVolume - 100) * 0.6;
          const trackVolumeDb = (track.volume - 100) * 0.6;
          const combinedVolumeDb = masterVolumeDb + trackVolumeDb;
          playerObj.player.volume.value = combinedVolumeDb;
        }
      }
    });
  }, [tracks, players, soloTrackId, masterVolume]);

  // After the mute functionality useEffect (line ~758), add a new useEffect for masterVolume
  useEffect(() => {
    // Convert masterVolume (0-100) to dB: 0 = -60dB, 100 = 0dB
    const volumeDb = (masterVolume - 100) * 0.6;
    players.forEach(playerObj => {
      if (playerObj.player && typeof playerObj.player.volume === 'object') {
        playerObj.player.volume.value = volumeDb;
      }
    });
  }, [masterVolume, players]);

  // Individual track volume control
  useEffect(() => {
    players.forEach(playerObj => {
      const track = tracks.find(t => t.id === playerObj.trackId);
      if (playerObj.player && track && typeof playerObj.player.volume === 'object') {
        // Calculate combined volume: master volume + track volume
        const masterVolumeDb = (masterVolume - 100) * 0.6;
        const trackVolumeDb = (track.volume - 100) * 0.6;
        const combinedVolumeDb = masterVolumeDb + trackVolumeDb;

        // Apply the combined volume
        playerObj.player.volume.value = combinedVolumeDb;
      }
    });
  }, [tracks, players, masterVolume]);

  // Handle clip position changes (drag) with conditional grid snapping
  const handleTrackPositionChange = useCallback((trackId, clipId, newStartTime) => {
    let finalStartTime = Math.max(0, newStartTime);

    // Apply grid snapping if magnet is enabled and not playing
    if (isMagnetEnabled && selectedGrid && !isPlaying) {
      const { snapToGrid } = require("../Utils/gridUtils");
      finalStartTime = snapToGrid(finalStartTime, selectedGrid, audioDuration);
    }

    dispatch(updateAudioClip({
      trackId: trackId,
      clipId: clipId,
      updates: { startTime: finalStartTime }
    }));

    // Update the corresponding player
    setPlayers((prev) => {
      return prev.map(playerObj => {
        if (playerObj.trackId === trackId && playerObj.clipId === clipId) {
          return {
            ...playerObj,
            startTime: finalStartTime
          };
        }
        return playerObj;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isMagnetEnabled, selectedGrid, audioDuration]);

  // Updated trim change handler to support position changes from left trim
  const handleTrimChange = useCallback((trackId, clipId, trimData) => {
    // Validate trim data
    const { trimStart, trimEnd, newStartTime } = trimData;
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.audioClips?.find(c => c.id === clipId);

    if (!track || !clip || !clip.duration) return;

    // Apply grid snapping if magnet is enabled
    let validatedTrimStart = Math.max(0, Math.min(trimStart, clip.duration));
    let validatedTrimEnd = Math.max(validatedTrimStart, Math.min(trimEnd, clip.duration));

    if (isMagnetEnabled && selectedGrid && !isPlaying) {
      const { snapToGrid } = require("../Utils/gridUtils");
      validatedTrimStart = snapToGrid(validatedTrimStart, selectedGrid, clip.duration);
      validatedTrimEnd = snapToGrid(validatedTrimEnd, selectedGrid, clip.duration);
    }

    // Prepare updates object
    const updates = {
      trimStart: validatedTrimStart,
      trimEnd: validatedTrimEnd
    };

    // If newStartTime is provided (from left trim), update the position too
    if (newStartTime !== undefined) {
      let finalStartTime = Math.max(0, newStartTime);

      // Apply grid snapping if magnet is enabled and not playing
      if (isMagnetEnabled && selectedGrid && !isPlaying) {
        const { snapToGrid } = require("../Utils/gridUtils");
        finalStartTime = snapToGrid(finalStartTime, selectedGrid, audioDuration);
      }

      updates.startTime = finalStartTime;
    }

    dispatch(updateAudioClip({
      trackId: trackId,
      clipId: clipId,
      updates: updates
    }));

    // Update the corresponding player with new trim data and position
    setPlayers((prev) => {
      return prev.map(playerObj => {
        if (playerObj.trackId === trackId && playerObj.clipId === clipId) {
          const updatedPlayer = {
            ...playerObj,
            trimStart: validatedTrimStart,
            trimEnd: validatedTrimEnd
          };

          // Update startTime if provided
          if (newStartTime !== undefined) {
            let finalStartTime = Math.max(0, newStartTime);

            // Apply grid snapping if magnet is enabled and not playing
            if (isMagnetEnabled && selectedGrid && !isPlaying) {
              const { snapToGrid } = require("../Utils/gridUtils");
              finalStartTime = snapToGrid(finalStartTime, selectedGrid, audioDuration);
            }

            updatedPlayer.startTime = finalStartTime;
          }

          return updatedPlayer;
        }
        return playerObj;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, tracks, isMagnetEnabled, selectedGrid, audioDuration]);

  // Add this function near other playback-related functions
  const playPatternDrumSound = useCallback((padData) => {
    const audioContext = getAudioContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const synthSource = createSynthSound(padData, audioContext);
    synthSource.connect(audioContext.destination);
  }, [getAudioContext]);

  // Modify the useEffect that handles patternDrumPlayback
  useEffect(() => {
    if (patternDrumPlayback.padData && isPlaying) {
      playPatternDrumSound(patternDrumPlayback.padData);
    }
  }, [patternDrumPlayback, isPlaying, playPatternDrumSound]);

  // Add effects processor reference
  const effectsProcessorRef = useRef(null);

  // Get active effects from Redux
  const activeEffects = useSelector((state) => state.effects.activeEffects);

  // Initialize effects processor
  useEffect(() => {
    const audioContext = getAudioContext();
    if (audioContext && !effectsProcessorRef.current) {
      effectsProcessorRef.current = getEffectsProcessor(audioContext);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the handleReady function to apply effects
  const handleReady = useCallback(async (wavesurfer, clip) => {
    if (!clip || !clip.url) return;

    try {
      const audioContext = audioQualityManager.getAudioContext();

      // Check if we already have this player
      const existingPlayer = players.find(p => p.trackId === clip.trackId && p.clipId === clip.id);
      if (existingPlayer) {
        return; // Don't create duplicate players
      }

      let audioBuffer = null;
      try {
        const response = await fetch(clip.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      } catch (fetchErr) {
        // Fallback: create a silent buffer so UI and playback logic keep working
        const durationSec = Math.max(0.1, Number(clip.duration || 0));
        const sampleRate = audioContext.sampleRate || 44100;
        const frameCount = Math.ceil(durationSec * sampleRate);
        try {
          audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
          // leave it silent
          // eslint-disable-next-line no-console
          console.warn('Audio fetch failed; using silent buffer fallback for clip:', clip.id, fetchErr);
        } catch (bufErr) {
          // If even buffer creation fails, abort gracefully for this clip
          // eslint-disable-next-line no-console
          console.error('Failed to create fallback buffer for clip:', clip.id, bufErr);
          return;
        }
      }

      const player = new Player(audioBuffer);
      audioManager.registerPlayer(player);

      // Find the track to get its volume
      const track = tracks.find(t => t.id === clip.trackId);
      const trackVolume = track?.volume || 80;

      // Calculate combined volume
      const masterVolumeDb = (masterVolume - 100) * 0.6;
      const trackVolumeDb = (trackVolume - 100) * 0.6;
      const combinedVolumeDb = masterVolumeDb + trackVolumeDb;

      player.volume.value = combinedVolumeDb;

      // Set playback rate based on tempo and any clip pitch adjustment
      player.playbackRate = tempoRatio * (clip.playbackRate || 1);

      // Apply effects if any are active
      let finalOutput = player;
      const appliedEffects = [];

      if (effectsProcessorRef.current && activeEffects.length > 0) {
        // Apply effects in chain order
        activeEffects.forEach((effect) => {
          if (effect.name === "Classic Dist" && effect.parameters) {
            const parameters = {
              mix: (effect.parameters[0]?.value + 135) / 270,
              amount: (effect.parameters[1]?.value + 135) / 270,
              makeup: (effect.parameters[2]?.value + 135) / 270
            };

            // Create effect chain using Web Audio API nodes
            const effectChain = effectsProcessorRef.current.createClassicDistortion(parameters);

            // Disconnect player from destination and connect through effects
            player.disconnect();
            player.connect(effectChain.input);

            finalOutput = effectChain.output;
            appliedEffects.push({
              effectId: effect.instanceId,
              chain: effectChain
            });
          }
        });
      }

      // Connect final output to destination
      finalOutput.toDestination();

      const clipDuration = clip.duration || audioBuffer.duration;
      const trimStart = clip.trimStart || 0;
      const trimEnd = clip.trimEnd || clipDuration;

      setPlayers((prev) => {
        const filtered = prev.filter(p => !(p.trackId === clip.trackId && p.clipId === clip.id));
        const playerData = {
          player,
          trackId: clip.trackId,
          clipId: clip.id,
          startTime: clip.startTime || 0,
          duration: clipDuration,
          trimStart: trimStart,
          trimEnd: trimEnd,
          originalDuration: audioBuffer.duration,
          playbackRate: tempoRatio,
          appliedEffects: appliedEffects // Store applied effects
        };
        return [...filtered, playerData];
      });

      setWaveSurfers((prev) => {
        if (prev.find(ws => ws === wavesurfer)) return prev;
        return [...prev, wavesurfer];
      });

    } catch (error) {
      console.error("Error loading audio:", error);
    }
  }, [masterVolume, tracks, players, tempoRatio, activeEffects]);

  // Listen for track-specific effect parameter changes and update audio
  useEffect(() => {
    if (!effectsProcessorRef.current) return;

    // Update effects for each track separately

    Object.keys(trackEffectsState).forEach(trackId => {
      const trackEffects = trackEffectsState[trackId] || [];

      trackEffects.forEach((effect) => {
        if (effect.name === "Classic Dist" && effect.parameters) {
          const parameters = {
            mix: effectsProcessorRef.current.angleToParameter(effect.parameters[0]?.value || -90),
            amount: effectsProcessorRef.current.angleToParameter(effect.parameters[1]?.value || 0),
            makeup: effectsProcessorRef.current.angleToParameter(effect.parameters[2]?.value || 90)
          };

          // Update only players for this specific track
          players.forEach((playerObj) => {
            if (playerObj.trackId === trackId && playerObj.appliedEffects) {
              const appliedEffect = playerObj.appliedEffects.find(
                ae => ae.effectId === effect.instanceId && ae.trackId === trackId
              );
              if (appliedEffect && appliedEffect.chain.updateParameters) {
                appliedEffect.chain.updateParameters(parameters);
              }
            }
          });
        }
      });
    });
  }, [trackEffectsState, players]);

  // Fixed seek logic to respect trim boundaries
  const movePlayhead = (e) => {
    if (!timelineContainerRef.current) return;

    const svgRect = timelineContainerRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const width = svgRect.width;
    const duration = audioDuration;

    if (width <= 0 || duration <= 0) return;

    let rawTime = (x / width) * duration;
    rawTime = Math.max(0, Math.min(duration, rawTime));

    // Apply grid snapping if magnet is enabled and not playing
    let finalTime = rawTime;
    if (isMagnetEnabled && selectedGrid && !isPlaying) {
      const { snapToGrid } = require("../Utils/gridUtils");
      finalTime = snapToGrid(rawTime, selectedGrid, duration);
    }

    dispatch(setCurrentTime(finalTime));

    // Update wavesurfer visual progress
    waveSurfers.forEach((ws) => {
      if (ws && typeof ws.seekTo === 'function' && typeof ws.getDuration === 'function') {
        const wsDuration = ws.getDuration();
        if (wsDuration > 0) {
          ws.seekTo(finalTime / wsDuration);
        }
      }
    });

    if (isPlaying) {
      // Stop all currently playing tracks
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.stop === 'function') {
          try {
            playerObj.player.stop();
          } catch (error) {
            // Stop during seek error can be ignored
          }
        }
      });

      // Restart clips that should be playing at the new position
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.start === 'function') {
          const clipStartTime = playerObj.startTime || 0;
          const trimStart = playerObj.trimStart || 0;
          const trimEnd = playerObj.trimEnd || playerObj.duration;

          const trimmedClipStart = clipStartTime;
          const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

          // Only start if seeking to within the trimmed region
          if (finalTime >= trimmedClipStart && finalTime < trimmedClipEnd) {
            const offsetInTrimmedRegion = finalTime - trimmedClipStart;
            const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
            const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;

            if (remainingTrimmedDuration > 0) {
              try {
                playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
              } catch (error) {
                // Start during seek error can be ignored
              }
            }
          }
        }
      });

      playbackStartRef.current = {
        systemTime: Date.now(),
        audioTime: finalTime,
      };
    }
  };

  // This ensures that only notes within the trimmed region are played
  const filteredPianoNotes = useMemo(() => {
    if (!pianoRecordingClip || !pianoRecordingClip.start || !pianoRecordingClip.end) {
      return pianoNotes;
    }

    return pianoNotes.filter(note => {
      if (note.trackId !== pianoRecordingClip.trackId) return true;

      const noteStartTime = note.startTime || 0;
      const noteEndTime = noteStartTime + (note.duration || 0.05);

      // Only include notes that overlap with the trimmed region
      return noteStartTime < pianoRecordingClip.end && noteEndTime > pianoRecordingClip.start;
    });
  }, [pianoNotes, pianoRecordingClip]);

  // Filter drum hits based on trimmed boundaries for playback
  // This ensures that only hits within the trimmed region are played
  const filteredDrumData = useMemo(() => {
    if (!drumRecordingClip || !drumRecordingClip.start || !drumRecordingClip.end) {
      return drumRecordedData;
    }

    return drumRecordedData.filter(hit => {
      if (hit.trackId !== drumRecordingClip.trackId) return true;

      const hitStartTime = hit.currentTime || 0;
      const hitEndTime = hitStartTime + (hit.decay || 0.2);

      // Only include hits that overlap with the trimmed region
      return hitStartTime < drumRecordingClip.end && hitEndTime > drumRecordingClip.start;
    });
  }, [drumRecordedData, drumRecordingClip]);

  // Fixed animation loop to respect trim boundaries and looping
  useEffect(() => {
    let localAnimationId = null;

    if (isPlaying) {
      const updateLoop = () => {
        if (!isPlaying) return;

        // Adjust elapsed time based on tempo ratio
        const elapsedTime = (Date.now() - playbackStartRef.current.systemTime) / 1000;
        let newTime = playbackStartRef.current.audioTime + (elapsedTime * tempoRatio);

        // Handle looping
        if (isLoopEnabled && newTime >= loopEnd) {
          newTime = loopStart;
          playbackStartRef.current = {
            systemTime: Date.now(),
            audioTime: loopStart,
          };

          // Stop all players and restart them at loop start
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.stop === 'function') {
              try {
                playerObj.player.stop();
              } catch (error) {
                // Silently ignore stop errors
              }
            }
          });

          // Restart clips that should be playing at loop start
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.start === 'function') {
              const clipStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;

              const trimmedClipStart = clipStartTime;
              const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

              if (loopStart >= trimmedClipStart && loopStart < trimmedClipEnd) {
                const offsetInTrimmedRegion = loopStart - trimmedClipStart;
                const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
                const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;

                if (remainingTrimmedDuration > 0) {
                  try {
                    playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                  } catch (error) {
                    // Clip start error during loop can be ignored
                  }
                }
              }
            }
          });
        } else if (!isLoopEnabled && newTime >= audioDuration) {
          dispatch(setPlaying(false));
          dispatch(setCurrentTime(audioDuration));
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.stop === 'function') {
              try {
                playerObj.player.stop();
              } catch (error) {
                // Silently ignore stop errors
              }
            }
          });
          return;
        }

        // Update local state for smooth animation (this runs every frame)
        setLocalCurrentTime(newTime);

        // Piano playback logic
        if (filteredPianoNotes.length > 0) {
          filteredPianoNotes.forEach(note => {
            // Check if the track containing this note is muted
            const track = tracks.find(t => t.id === note.trackId);
            if (!track) return;

            const isMuted = soloTrackId ? soloTrackId !== track.id : (track.muted || false);
            if (isMuted) return; // Skip playing notes from muted tracks

            const noteStartTime = note.startTime || 0;
            const noteEndTime = noteStartTime + (note.duration || 0.5);

            // Check if the current time is within the note's time range
            if (newTime >= noteStartTime && newTime <= noteEndTime) {
              // Check if we haven't already played this note in this time range
              const noteKey = `${note.id}-${Math.floor(noteStartTime * 10)}`;
              if (!activePianoNotesRef.current.has(noteKey)) {
                // Always use the currently selected instrument to re-voice the entire recording uniformly
                playPianoNote(note.midiNumber, note.duration || 0.5, selectedInstrument);
                activePianoNotesRef.current.add(noteKey);

                // Remove the note key after the note duration
                setTimeout(() => {
                  activePianoNotesRef.current.delete(noteKey);
                }, (note.duration || 0.5) * 1000);
              }
            }
          });
        }

        // CRITICAL: Drastically reduce Redux updates to prevent lag
        const reduxUpdateTime = Date.now();
        if (!lastReduxUpdateRef.current || reduxUpdateTime - lastReduxUpdateRef.current > 500) { // Changed from 120ms to 500ms
          dispatch(setCurrentTime(newTime));
          lastReduxUpdateRef.current = reduxUpdateTime;
        }

        // CRITICAL: Reduce player state checks to prevent audio stuttering
        const playerUpdateTime = Date.now();
        if (!lastPlayerUpdateRef.current || playerUpdateTime - lastPlayerUpdateRef.current > 300) { // Changed from 100ms to 300ms
          players.forEach((playerObj) => {
            if (playerObj?.player) {
              const clipStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;

              const trimmedClipStart = clipStartTime;
              const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

              // Stop clip if playhead moves beyond the trimmed end
              if (newTime >= trimmedClipEnd && playerObj.player.state === 'started') {
                try {
                  playerObj.player.stop();
                } catch (error) {
                  // Silently ignore stop errors
                }
              }

              // Start clip if playhead enters the trimmed region
              const previousTime = playbackStartRef.current.audioTime + ((elapsedTime - 1 / 60) * tempoRatio);
              if (previousTime < trimmedClipStart &&
                newTime >= trimmedClipStart &&
                newTime < trimmedClipEnd &&
                playerObj.player.state !== 'started') {
                try {
                  const offsetInTrimmedRegion = newTime - trimmedClipStart;
                  const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
                  const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;

                  if (remainingTrimmedDuration > 0) {
                    playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                  }
                } catch (error) {
                  // Clip start error during animation can be ignored
                }
              }
            }
          });
          lastPlayerUpdateRef.current = playerUpdateTime;
        }

        localAnimationId = requestAnimationFrame(updateLoop);
      };

      localAnimationId = requestAnimationFrame(updateLoop);
    }

    return () => {
      if (localAnimationId) {
        cancelAnimationFrame(localAnimationId);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      playedDrumHitsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, audioDuration, players, isLoopEnabled, loopStart, loopEnd, tempoRatio, filteredPianoNotes, playPianoNote]);

  // Smooth playhead animation loop for continuous movement
  useEffect(() => {
    let smoothAnimationId = null;

    if (isPlaying) {
      const smoothUpdateLoop = () => {
        // Update local current time for smooth playhead movement
        const elapsedTime = (Date.now() - playbackStartRef.current.systemTime) / 1000;
        const newTime = playbackStartRef.current.audioTime + (elapsedTime * tempoRatio);

        // Apply loop logic
        let finalTime = newTime;
        if (isLoopEnabled && loopEnd > 0) {
          if (finalTime >= loopEnd) {
            finalTime = loopStart;
            playbackStartRef.current = { systemTime: Date.now(), audioTime: loopStart };
          }
        } else if (finalTime >= audioDuration) {
          // Stop playback when reaching the end
          dispatch(setPlaying(false));
          return;
        }

        // Update local time for smooth playhead movement
        setLocalCurrentTime(finalTime);

        smoothAnimationId = requestAnimationFrame(smoothUpdateLoop);
      };
      smoothAnimationId = requestAnimationFrame(smoothUpdateLoop);
    }

    return () => {
      if (smoothAnimationId) {
        cancelAnimationFrame(smoothAnimationId);
      }
    };
  }, [isPlaying, audioDuration, isLoopEnabled, loopStart, loopEnd, tempoRatio, dispatch]);

  const debouncedVolumeUpdate = useMemo(() => {
    const updateVolumes = () => {
      players.forEach(playerObj => {
        const track = tracks.find(t => t.id === playerObj.trackId);
        if (!track) return; // Skip if track doesn't exist
        if (playerObj.player && typeof playerObj.player.volume === 'object') {
          const isMuted = soloTrackId
            ? soloTrackId !== track.id
            : track.muted;

          if (isMuted) {
            playerObj.player.volume.value = -Infinity;
          } else {
            const masterVolumeDb = (masterVolume - 100) * 0.6;
            const trackVolumeDb = (track.volume - 100) * 0.6;
            const combinedVolumeDb = masterVolumeDb + trackVolumeDb;
            playerObj.player.volume.value = combinedVolumeDb;
          }
        }
      });
    };

    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateVolumes, 16); // ~60fps debounce
    };
  }, [players, tracks, soloTrackId, masterVolume]);

  useEffect(() => {
    debouncedVolumeUpdate();
  }, [debouncedVolumeUpdate]);

  const renderRuler = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    // eslint-disable-next-line no-unused-vars
    const svgNode = svgRef.current;
    // Use the zoomed timeline width instead of container width
    const timelineWidth = Math.max(audioDuration, 12) * timelineWidthPerSecond;
    const axisY = 80;
    const duration = audioDuration;

    svg.selectAll("*").remove();

    if (timelineWidth <= 0 || duration <= 0) return;

    // Use the zoomed timeline width for the scale
    const xScale = d3.scaleLinear().domain([0, duration]).range([0, timelineWidth]);

    // Use time signature-aware grid spacing
    const gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
    const gridColor = "#FFFFFF";

    // Calculate label interval based on ruler type
    let labelInterval;
    if (selectedRuler === "Beats") {
      // For beats ruler, show labels every bar
      const { beats } = parseTimeSignature(selectedTime);
      const secondsPerBeat = 0.5; // Fixed at 120 BPM equivalent
      labelInterval = beats * secondsPerBeat;
    } else {
      // For time ruler, show labels every second
      labelInterval = 1;
    }

    // Create a set to track which labels have been added to avoid duplicates
    const addedLabels = new Set();

    for (let time = 0; time <= duration; time += gridSpacing) {
      const x = xScale(time);

      // Determine tick importance based on time signature
      const secondsPerBeat = 0.5; // Fixed at 120 BPM equivalent
      const { beats } = parseTimeSignature(selectedTime);
      const secondsPerBar = secondsPerBeat * beats;

      const isMainBeat = Math.abs(time % secondsPerBeat) < 0.01;
      const isBarStart = Math.abs(time % secondsPerBar) < 0.01;
      const isHalfBeat = Math.abs(time % (secondsPerBeat / 2)) < 0.01;
      const isQuarterBeat = Math.abs(time % (secondsPerBeat / 4)) < 0.01;

      // Improved label logic to prevent duplicates
      let isLabeled = false;
      if (selectedRuler === "Beats") {
        isLabeled = isBarStart;
      } else {
        // For time ruler, only show labels at whole seconds
        const roundedTime = Math.round(time);
        isLabeled = Math.abs(time - roundedTime) < 0.01 && roundedTime % Math.max(1, Math.round(labelInterval)) === 0;
      }

      let tickHeight = 4;
      let strokeWidth = 0.5;
      let opacity = 0.6;

      if (isBarStart) {
        tickHeight = 20;
        strokeWidth = 1.5;
        opacity = 1;
      } else if (isMainBeat) {
        tickHeight = 16;
        strokeWidth = 1.2;
        opacity = 0.9;
      } else if (isHalfBeat) {
        tickHeight = 12;
        strokeWidth = 1;
        opacity = 0.7;
      } else if (isQuarterBeat) {
        tickHeight = 8;
        strokeWidth = 0.8;
        opacity = 0.6;
      }

      svg
        .append("line")
        .attr("x1", x)
        .attr("y1", axisY)
        .attr("x2", x)
        .attr("y2", axisY - tickHeight)
        .attr("stroke", gridColor)
        .attr("stroke-width", strokeWidth)
        .attr("opacity", opacity);

      if (isLabeled) {
        let label;
        if (selectedRuler === "Beats") {
          // Show musical notation (bars:beats)
          const barNumber = Math.floor(time / secondsPerBar) + 1;
          label = `${barNumber}`;
        } else {
          // Show time notation (minutes:seconds)
          const minutes = Math.floor(time / 60);
          const seconds = Math.floor(time % 60);
          label = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }

        // Only add label if it hasn't been added before
        if (!addedLabels.has(label)) {
          svg
            .append("text")
            .attr("x", x + 4)
            .attr("y", axisY - tickHeight - 5)
            .attr("fill", "white")
            .attr("font-size", 12)
            .attr("text-anchor", "start")
            .text(label);
          addedLabels.add(label);
        }
      }
    }

    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", axisY)
      .attr("x2", timelineWidth)
      .attr("y2", axisY)
      .attr("stroke", "white")
      .attr("stroke-width", 1);
  }, [audioDuration, selectedGrid, selectedTime, selectedRuler, timelineWidthPerSecond]);

  // Keep a stable reference to the render function to avoid linter no-undef complaints
  const renderRulerRef = useRef(() => { });
  useEffect(() => {
    renderRulerRef.current = renderRuler;
  }, [renderRuler]);

  useEffect(() => {
    if (typeof renderRulerRef.current === 'function') {
      renderRulerRef.current();
    }
  }, [audioDuration, selectedGrid, selectedTime, selectedRuler, timelineWidthPerSecond, zoomLevel]);

  // Sync local state with Redux state
  useEffect(() => {
    setLocalCurrentTime(currentTime);
  }, [currentTime]);

  // Handle Redux play/pause state changes
  useEffect(() => {
    const handleReduxPlayPause = async () => {
      try {
        await ensureAudioUnlocked();
        await start();

        if (isPlaying) {
          // Start playback animation
          playbackStartRef.current = {
            systemTime: Date.now(),
            audioTime: currentTime,
          };

          // Start clips that should be playing at current time
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.start === 'function') {
              const clipStartTime = playerObj.startTime || 0;
              const trimStart = playerObj.trimStart || 0;
              const trimEnd = playerObj.trimEnd || playerObj.duration;

              // Calculate timeline positions for trimmed audio
              const trimmedClipStart = clipStartTime;
              const trimmedClipEnd = clipStartTime + (trimEnd - trimStart);

              // Only start if current time is within the trimmed region
              if (currentTime >= trimmedClipStart && currentTime < trimmedClipEnd) {
                const offsetInTrimmedRegion = currentTime - trimmedClipStart;
                const startOffsetInOriginalAudio = trimStart + offsetInTrimmedRegion;
                const remainingTrimmedDuration = (trimEnd - trimStart) - offsetInTrimmedRegion;

                if (remainingTrimmedDuration > 0) {
                  try {
                    playerObj.player.start(undefined, startOffsetInOriginalAudio, remainingTrimmedDuration);
                  } catch (error) {
                    // Start error can be ignored
                  }
                }
              }
            }
          });
        } else {
          // Stop all players
          players.forEach((playerObj) => {
            if (playerObj?.player && typeof playerObj.player.stop === 'function') {
              try {
                playerObj.player.stop();
              } catch (error) {
                // Stop error can be ignored
              }
            }
          });
        }
      } catch (error) {
        // console.error("Error handling Redux play/pause:", error);
      }
    };

    handleReduxPlayPause();
  }, [isPlaying, currentTime, players, tempoRatio]);

  // Update loop end when audio duration changes
  useEffect(() => {
    if (audioDuration > 0) {
      if (loopEnd > audioDuration) {
        dispatch(setLoopEnd(audioDuration));
      } else if (loopEnd === 10 && audioDuration > 10) {
        // Initialize loop end to a reasonable value when audio loads
        dispatch(setLoopEnd(Math.min(30, audioDuration)));
      }
    }
  }, [audioDuration, loopEnd, dispatch]);

  // Sync audio duration to loop slice
  useEffect(() => {
    if (audioDuration > 0) {
      dispatch(setLoopAudioDuration(audioDuration));
    }
  }, [audioDuration, dispatch]);

  useEffect(() => {
    return () => {
      players.forEach((player) => {
        if (player && typeof player.dispose === 'function') {
          player.dispose();
        }
      });
      waveSurfers.forEach((ws) => {
        if (ws && typeof ws.destroy === 'function') {
          ws.destroy();
        }
      });
      if (animationFrameId.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseDown = (e) => {
    // Only handle playhead movement if not clicking on a track
    const isTrackElement = e.target.closest('[data-rnd]');
    if (!isTrackElement) {
      isDragging.current = true;
      movePlayhead(e);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    movePlayhead(e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault(); // Prevent default browser zoom

      // Get mouse position for anchor
      const rect = timelineContainerRef.current?.getBoundingClientRect();
      const mouseX = rect ? e.clientX - rect.left : 0;

      // Dispatch anchor event before zooming
      window.dispatchEvent(new CustomEvent('timeline:anchor', {
        detail: { type: 'mouse', mouseX }
      }));

      if (e.deltaY < 0) {
        // Scroll up - zoom in
        dispatch(zoomIn());
      } else {
        // Scroll down - zoom out
        dispatch(zoomOut());
      }
    }
  }, [dispatch]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = e.dataTransfer.getData('text/plain');

      if (data) {
        const soundItem = JSON.parse(data);

        if (!soundItem.soundfile) {
          // console.error('No soundfile found in dropped item');
          return;
        }

        const rect = timelineContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const duration = audioDuration;

        // Calculate drop position with conditional grid snapping
        let dropTime = (x / width) * duration;
        let finalDropTime = Math.max(0, Math.min(duration, dropTime));

        // Apply grid snapping if magnet is enabled and not playing
        if (isMagnetEnabled && selectedGrid && !isPlaying) {
          const { snapToGrid } = require("../Utils/gridUtils");
          finalDropTime = snapToGrid(finalDropTime, selectedGrid, duration);
        }

        const url = `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`;
        let audioDurationSec = null;
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioDurationSec = audioBuffer.duration;
        } catch (err) {
          // console.error('Error fetching or decoding audio for duration:', err);
          // Use a default duration if we can't get the actual duration
          audioDurationSec = 5; // 5 seconds default
        }

        // Check if we're dropping on an existing track or creating a new one
        const trackElement = e.target.closest('[data-track-id]');
        const trackId = trackElement ? trackElement.getAttribute('data-track-id') : null;

        // If we're dropping on the timeline container itself (not on a track), create a new track
        const isDroppingOnTimeline = e.target === timelineContainerRef.current ||
          e.target.closest('[ref="timelineContainerRef"]') ||
          e.target.classList.contains('timeline-container') ||
          !trackId; // If no trackId is found, we're dropping on the timeline

        if (trackId) {
          // Add clip to existing track
          // eslint-disable-next-line eqeqeq
          const track = tracks.find(t => t.id == trackId);
          const newClip = {
            id: Date.now() + Math.random(),
            name: soundItem.soundname || 'New Clip',
            url: `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`,
            color: track?.color || '#FFB6C1', // Use track's color or fallback to pink
            startTime: finalDropTime,
            duration: audioDurationSec,
            trimStart: 0,
            trimEnd: audioDurationSec,
            soundData: soundItem,
          };

          dispatch(addAudioClipToTrack({
            trackId: trackId,
            audioClip: newClip,
            type: 'audio'
          }));
        } else if (isDroppingOnTimeline) {
          // Create new track with this clip when dropping on timeline
          const trackColor = getNextTrackColor(); // Get a unique color for the new track
          const newClip = {
            id: Date.now() + Math.random(),
            name: soundItem.soundname || 'New Clip',
            url: `${IMAGE_URL}uploads/soundfile/${soundItem.soundfile}`,
            color: trackColor, // Use the track's color
            startTime: finalDropTime,
            duration: audioDurationSec,
            trimStart: 0,
            trimEnd: audioDurationSec,
            soundData: soundItem,
          };

          const newTrack = {
            id: Date.now() + Math.random(), // Ensure unique ID
            name: soundItem.soundname || 'New Track',
            color: trackColor, // Set the track color
            audioClips: [newClip],
            type: 'audio'
          };

          dispatch(addTrack(newTrack));
        } else {
        }
      } else {
      }
    } catch (error) {
      // console.error('Error processing dropped item:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioDuration, dispatch, trackHeight, selectedGrid, selectedTime, isMagnetEnabled]);

  // Context menu handlers
  const handleContextMenu = useCallback((e, trackId, clipId = null) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      trackId: trackId,
      clipId: clipId
    });
  }, []);

  // Section label context menu handlers
  const handleSectionContextMenu = useCallback((e, sectionId) => {
    e.preventDefault();
    e.stopPropagation();

    setSectionContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      sectionId: sectionId
    });
  }, []);

  const handleSectionContextMenuClose = useCallback(() => {
    setSectionContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      sectionId: null
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      trackId: null,
      clipId: null
    });
  }, []);

  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const showLoopLibrary = useSelector((state) => state.ui?.showLoopLibrary);

  useEffect(() => {
    if (showLoopLibrary && !showOffcanvas) {
      setShowOffcanvas(true);
    }
    if (!showLoopLibrary && showOffcanvas) {
      setShowOffcanvas(false);
    }
  }, [showLoopLibrary]);

  const handleContextMenuAction = useCallback((action, overrideTrackId, overrideClipId) => {
    const trackId = overrideTrackId ?? contextMenu.trackId;
    const clipId = overrideClipId ?? contextMenu.clipId;

    if (!trackId) return; 

    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    // Always find the clip if clipId is provided
    const clip = clipId ? track.audioClips?.find(c => c.id === clipId) : undefined;

    // Check if this is a recording clip (piano or drum)
    const isPianoRecording = clipId === 'guitar-recording' || clipId === 'piano-recording';
    const isDrumRecording = clipId === 'drum-recording';
    const isRecordingClip = isPianoRecording || isDrumRecording;

    // console.log(isRecordingClip); 

    // Helper to split a regular clip at currentTime
    const splitSelectedClip = () => {
      if (!clip || !clip.duration) return;
      const clipStart = clip.startTime || 0;
      const trimStart = clip.trimStart || 0;
      const trimEnd = clip.trimEnd ?? clip.duration;
      const clipVisibleDuration = Math.max(0, trimEnd - trimStart);
      const splitPoint = currentTime;
      const relativeInClip = splitPoint - clipStart;
      if (relativeInClip <= 0 || relativeInClip >= clipVisibleDuration) return;

      // New trims around split point
      const leftTrimEnd = Math.min(trimStart + relativeInClip, trimEnd);
      const rightTrimStart = leftTrimEnd;

      // Update left part
      dispatch(updateAudioClip({
        trackId,
        clipId,
        updates: { trimEnd: leftTrimEnd }
      }));

      // Create right part
      const rightClip = {
        ...clip,
        id: Date.now() + Math.random(),
        startTime: splitPoint,
        trimStart: rightTrimStart,
        trimEnd: trimEnd
      };
      dispatch(addAudioClipToTrack({ trackId, audioClip: rightClip }));
    };

    const splitRecordingClip = () => {
      if (isPianoRecording && pianoRecordingClip && pianoRecordingClip.trackId === trackId) {
        const clipStart = pianoRecordingClip.start;
        const clipEnd = pianoRecordingClip.end;
        const splitPoint = currentTime;

        if (splitPoint <= clipStart || splitPoint >= clipEnd) return;

        const leftClip = {
          ...pianoRecordingClip,
          end: splitPoint
        };
        const rightClip = {
          ...pianoRecordingClip,
          start: splitPoint,
          id: Date.now() + Math.random()
        };

        dispatch(setPianoRecordingClip(leftClip));

        const rightAudioClip = {
          id: rightClip.id,
          name: `Piano Recording (Split)`,
          url: null,
          color: rightClip.color,
          startTime: splitPoint,
          duration: clipEnd - splitPoint,
          trimStart: 0,
          trimEnd: clipEnd - splitPoint,
          type: 'piano',
          fromRecording: true,
          pianoNotes: pianoNotes.filter(note =>
            note.trackId === trackId &&
            note.startTime >= splitPoint &&
            note.startTime < clipEnd
          )
        };

        dispatch(addAudioClipToTrack({ trackId, audioClip: rightAudioClip }));
      } else if (isDrumRecording && drumRecordingClip && drumRecordingClip.trackId === trackId) {
        const clipStart = drumRecordingClip.start;
        const clipEnd = drumRecordingClip.end;
        const splitPoint = currentTime;

        if (splitPoint <= clipStart || splitPoint >= clipEnd) return;

        const leftClip = {
          ...drumRecordingClip,
          end: splitPoint
        };
        const rightClip = {
          ...drumRecordingClip,
          start: splitPoint,
          id: Date.now() + Math.random()
        };

        dispatch(setDrumRecordingClip(leftClip));

        const rightAudioClip = {
          id: rightClip.id,
          name: `Drum Recording (Split)`,
          url: null,
          color: rightClip.color,
          startTime: splitPoint,
          duration: clipEnd - splitPoint,
          trimStart: 0,
          trimEnd: clipEnd - splitPoint,
          type: 'drum',
          fromRecording: true,
          drumSequence: drumRecordedData.filter(hit =>
            hit.trackId === trackId &&
            hit.currentTime >= splitPoint &&
            hit.currentTime < clipEnd
          )
        };

        dispatch(addAudioClipToTrack({ trackId, audioClip: rightAudioClip }));
      }
    };

    const applyPitchChangeToRecording = (semitones) => {
      if (isPianoRecording) {
        const rate = Math.pow(2, (semitones || 0) / 12);
        const updatedNotes = pianoNotes.map(note => {
          if (note.trackId === trackId) {
            return {
              ...note,
              playbackRate: rate,
              pitchSemitones: semitones
            };
          }
          return note;
        });
        dispatch(setPianoNotes(updatedNotes));
      } else if (isDrumRecording) {
        const rate = Math.pow(2, (semitones || 0) / 12);
        const updatedDrumData = drumRecordedData.map(hit => {
          if (hit.trackId === trackId) {
            return {
              ...hit,
              playbackRate: rate,
              pitchSemitones: semitones
            };
          }
          return hit;
        });
        dispatch(setDrumRecordedData(updatedDrumData));
      }
    };

    // Helper to apply voice transform to recording clips
    const applyVoiceTransformToRecording = (preset) => {
      if (isPianoRecording) {
        const updatedNotes = pianoNotes.map(note => {
          if (note.trackId === trackId) {
            return {
              ...note,
              voiceTransformPreset: String(preset || '')
            };
          }
          return note;
        });
        dispatch(setPianoNotes(updatedNotes));
      } else if (isDrumRecording) {
        const updatedDrumData = drumRecordedData.map(hit => {
          if (hit.trackId === trackId) {
            return {
              ...hit,
              voiceTransformPreset: String(preset || '')
            };
          }
          return hit;
        });
        dispatch(setDrumRecordedData(updatedDrumData));
      }
    };

    const reverseRecordingClip = async () => {
      if (isPianoRecording) {
        const reversedNotes = pianoNotes.map(note => {
          if (note.trackId === trackId) {
            const clipStart = pianoRecordingClip?.start || 0;
            const clipEnd = pianoRecordingClip?.end || 0;
            const clipDuration = clipEnd - clipStart;
            const reversedStartTime = clipEnd - (note.startTime - clipStart);
            return {
              ...note,
              startTime: reversedStartTime,
              reversed: true
            };
          }
          return note;
        });
        dispatch(setPianoNotes(reversedNotes));
      } else if (isDrumRecording) {
        const reversedDrumData = drumRecordedData.map(hit => {
          if (hit.trackId === trackId) {
            const clipStart = drumRecordingClip?.start || 0;
            const clipEnd = drumRecordingClip?.end || 0;
            const clipDuration = clipEnd - clipStart;
            const reversedCurrentTime = clipEnd - (hit.currentTime - clipStart);
            return {
              ...hit,
              currentTime: reversedCurrentTime,
              reversed: true
            };
          }
          return hit;
        });
        dispatch(setDrumRecordedData(reversedDrumData));
      }
    };


    const copyRecordingClip = () => {
      if (isPianoRecording && pianoRecordingClip) {
        const { start, end } = pianoRecordingClip;
        setClipboard({
          op: 'copy',
          type: 'piano-recording',
          clip: { ...pianoRecordingClip },
          trackId,
          // Only copy notes within the clip bounds
          notes: pianoNotes.filter(note =>
            note.trackId === trackId &&
            (note.startTime || 0) >= start &&
            (note.startTime || 0) < end
          )
        });
      } else if (isDrumRecording && drumRecordingClip) {
        const { start, end } = drumRecordingClip;
        setClipboard({
          op: 'copy',
          type: 'drum-recording',
          clip: { ...drumRecordingClip },
          trackId,
          // Only copy hits within the clip bounds
          hits: drumRecordedData.filter(hit =>
            hit.trackId === trackId &&
            (hit.currentTime || 0) >= start &&
            (hit.currentTime || 0) < end
          )
        });
      }
    };

    const cutRecordingClip = () => {
      // Build clipboard with op: 'cut' so paste can decide whether to move or duplicate
      if (isPianoRecording && pianoRecordingClip) {
        const { start, end } = pianoRecordingClip;
        setClipboard({
          op: 'cut',
          type: 'piano-recording',
          clip: { ...pianoRecordingClip },
          trackId,
          // Only include notes within the clip bounds
          notes: pianoNotes.filter(note =>
            note.trackId === trackId &&
            (note.startTime || 0) >= start &&
            (note.startTime || 0) < end
          )
        });
      } else if (isDrumRecording && drumRecordingClip) {
        const { start, end } = drumRecordingClip;
        setClipboard({
          op: 'cut',
          type: 'drum-recording',
          clip: { ...drumRecordingClip },
          trackId,
          // Only include hits within the clip bounds
        


    

  hits: drumRecordedData.filter(hit =>
            hit.trackId === trackId &&
            (hit.currentTime || 0) >= start &&
            (hit.currentTime || 0) < end
          )
        });
      }
      // Then remove original (same behavior as before for Cut)
      deleteRecordingClip();
    };


    const deleteRecordingClip = () => {
      if (isPianoRecording) {
        // Remove active clip and per-track mirror so the background disappears
        dispatch(setPianoRecordingClip(null));
        dispatch(updateTrack({ id: trackId, updates: { pianoClip: null } }));
        // Remove all notes for this track
        const updatedNotes = pianoNotes.filter(note => note.trackId !== trackId);
        dispatch(setPianoNotes(updatedNotes));
      } else if (isDrumRecording) {
        // Remove active clip and per-track mirror so the background disappears
        dispatch(setDrumRecordingClip(null));
        dispatch(updateTrack({ id: trackId, updates: { drumClip: null } }));
        // Remove all hits for this track
        const updatedDrumData = drumRecordedData.filter(hit => hit.trackId !== trackId);
        dispatch(setDrumRecordedData(updatedDrumData));
      }
    };

    const pasteRecordingClip = () => {
      if (!clipboard) return;

      // Helper: create a visual background block as a normal audio clip (no URL)
      const addVisualBackgroundClip = ({ type, duration, startTime, color }) => {
        const clipName = type === 'piano-recording' ? 'Piano Recording (Copy)' : 'Drum Recording (Copy)';
        dispatch(addAudioClipToTrack({
          trackId,
          audioClip: {
            name: clipName,
            url: null,
            color: color || (track?.color || '#FFB6C1'),
            startTime,
            duration,
            trimStart: 0,
            trimEnd: duration,
            type,
            fromRecording: true
          }
        }));
      };

      if (clipboard.type === 'piano-recording' && clipboard.clip && clipboard.notes) {
        const newStartTime = currentTime;
        const duration = clipboard.clip.end - clipboard.clip.start;
        const newClip = {
          ...clipboard.clip,
          start: newStartTime,
          end: newStartTime + duration,
          trackId: trackId
        };

        const adjustedNotes = clipboard.notes.map(note => ({
          ...note,
          trackId: trackId,
          startTime: (note.startTime || 0) - clipboard.clip.start + newStartTime
        }));

        if (clipboard.op === 'cut') {
          // Move the background (Cut behavior unchanged)
          dispatch(setPianoRecordingClip(newClip)); // also sets track.pianoClip internally
        } else {
          // Copy: keep original background; add a visual background block for the duplicate
          addVisualBackgroundClip({
            type: 'piano-recording',
            duration,
            startTime: newStartTime,
            color: clipboard.clip.color
          });
        }
        // In both cases, add the duplicated notes
        dispatch(setPianoNotes([...pianoNotes, ...adjustedNotes]));
      } else if (clipboard.type === 'drum-recording' && clipboard.clip && clipboard.hits) {
        const newStartTime = currentTime;
        const duration = clipboard.clip.end - clipboard.clip.start;
        const newClip = {
          ...clipboard.clip,
          start: newStartTime,
          end: newStartTime + duration,
          trackId: trackId
        };

        const adjustedHits = clipboard.hits.map(hit => ({
          ...hit,
          trackId: trackId,
          currentTime: (hit.currentTime || 0) - clipboard.clip.start + newStartTime
        }));

        if (clipboard.op === 'cut') {
          // Move the background (Cut behavior unchanged)
          dispatch(setDrumRecordingClip(newClip)); // also sets track.drumClip internally
        } else {
          // Copy: keep original background; add a visual background block for the duplicate
          addVisualBackgroundClip({
            type: 'drum-recording',
            duration,
            startTime: newStartTime,
            color: clipboard.clip.color
          });
        }
        // In both cases, add the duplicated hits
        dispatch(setDrumRecordedData([...drumRecordedData, ...adjustedHits]));
      }
    };




    // Numeric pitch change via semitones from structured payload
    const applyPitchChange = (semitones) => {
      if (!clip) return;
      const rate = Math.pow(2, (semitones || 0) / 12);
      // Store non-destructive metadata; playbackRate will be consumed in handleReady when rebuilding players
      dispatch(updateAudioClip({
        trackId,
        clipId: clip.id,
        updates: { playbackRate: rate, pitchSemitones: semitones }
      }));

      // Update player if present
      setPlayers(prev => prev.map(p => {
        if (p.trackId === trackId && p.clipId === clip.id && p.player) {
          try { p.player.playbackRate = (p.playbackRate || 1) * rate; } catch { }
          return { ...p, playbackRate: (p.playbackRate || 1) * rate };
        }
        return p;
      }));
    };

    const applyVoiceTransformPreset = (preset) => {
      // Placeholder: mark preset for later audio processing graph
      if (!clip) return;
      dispatch(updateAudioClip({
        trackId,
        clipId: clip.id,
        updates: { voiceTransformPreset: String(preset || '') }
      }));
    };

    // Handle recording clip actions
    if (isRecordingClip) {
      // Structured actions from WaveMenu
      if (typeof action === 'object' && action !== null) {
        if (action.type === 'changePitch') {
          applyPitchChangeToRecording(action.semitones);
          return;
        }
        if (action.type === 'voiceTransform') {
          applyVoiceTransformToRecording(action.preset);
          return;
        }
      }

      switch (action) {
        case 'cut':
          cutRecordingClip();
          break;
        case 'copy':
          copyRecordingClip();
          break;
        case 'paste':
          pasteRecordingClip();
          break;
        case 'delete':
          deleteRecordingClip();
          break;
        case 'editName':
          // TODO: Implement name editing for recording clips
          break;
        case 'splitRegion':
          splitRecordingClip();
          break;
        case 'muteRegion':
          dispatch(toggleMuteTrack(trackId));
          break;
        case 'reverse':
          reverseRecordingClip();
          break;
        case 'effects':
          setShowOffcanvasEffects(prev => !prev);
          setShowOffcanvas(false);
          break;
        case 'vocalCleanup':
          break;
        case 'vocalTuner':
          break;
        case 'voiceTransform':
          break;
        case 'volumeUp':
          const currentVolumeUp = track.volume || 80;
          const newVolumeUp = Math.min(100, currentVolumeUp + 10);
          dispatch(setTrackVolume({ trackId, volume: newVolumeUp }));
          setVolumeIndicator({ show: true, volume: newVolumeUp, trackName: track.name || 'Track' });
          setTimeout(() => setVolumeIndicator({ show: false, volume: 0, trackName: '' }), 2000);
          break;
        case 'volumeDown':
          const currentVolumeDown = track.volume || 80;
          const newVolumeDown = Math.max(0, currentVolumeDown - 10);
          dispatch(setTrackVolume({ trackId, volume: newVolumeDown }));
          setVolumeIndicator({ show: true, volume: newVolumeDown, trackName: track.name || 'Track' });
          setTimeout(() => setVolumeIndicator({ show: false, volume: 0, trackName: '' }), 2000);
          break;
        case 'volumeReset':
          dispatch(setTrackVolume({ trackId, volume: 80 }));
          setVolumeIndicator({ show: true, volume: 80, trackName: track.name || 'Track' });
          setTimeout(() => setVolumeIndicator({ show: false, volume: 0, trackName: '' }), 2000);
          break;
        case 'matchProjectKey':
          break;
        case 'addToLoopLibrary':
          break;
        case 'openInSampler':
          break;
        default:
          break;
      }
      return;
    }

    // Regular audio clip actions (existing code)
    if (clipId && clip) {
      // Structured actions from WaveMenu
      if (typeof action === 'object' && action !== null) {
        if (action.type === 'changePitch') {
          applyPitchChange(action.semitones);
          return;
        }
        if (action.type === 'voiceTransform') {
          applyVoiceTransformPreset(action.preset);
          return;
        }
      }

      switch (action) {
        case 'cut':
          setClipboard({ type: 'clip', clip: { ...clip }, trackId });
          dispatch(removeAudioClip({ trackId, clipId }));
          break;
        case 'copy':
          setClipboard({ type: 'clip', clip: { ...clip }, trackId });
          break;
        case 'paste':
          if (clipboard && clipboard.type === 'clip' && clipboard.clip) {

            const newClip = {
              ...clipboard.clip,
              id: Date.now() + Math.random(),
              startTime: (clip.startTime || 0) + 1
            };
            dispatch(addAudioClipToTrack({ trackId, audioClip: newClip }));
          }
          break;
        case 'delete':
          dispatch(removeAudioClip({ trackId, clipId }));
          break;
        case 'editName':
          setEdirNameModel(true);
          break;
        case 'splitRegion':
          splitSelectedClip();
          break;
        case 'muteRegion':
          dispatch(toggleMuteTrack(trackId));
          break;

        case 'reverse':
          (async () => {
            if (!clip || !clip.url) return;
            const response = await fetch(clip.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
              const channelData = audioBuffer.getChannelData(i);
              channelData.reverse();
            }
            const wavData = await WavEncoder.encode({
              sampleRate: audioBuffer.sampleRate,
              channelData: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i))
            });
            const blob = new Blob([wavData], { type: 'audio/wav' });
            const reversedUrl = URL.createObjectURL(blob);
            dispatch(updateAudioClip({ trackId, clipId: clip.id, updates: { url: reversedUrl, reversed: true } }));
          })();
          break;
        case 'effects':
          setShowOffcanvasEffects(prev => !prev);
          setShowOffcanvas(false);
          break;

        default:
          break;
      }
      return;
    }

    // Track-level actions (paste works even if no clip is selected)
    if (typeof action === 'object' && action !== null) {
      if (action.type === 'changePitch' && track.audioClips?.length) {
        // Apply same pitch to last clip on track as a convenience
        const last = track.audioClips[track.audioClips.length - 1];
        if (last) {
          const rate = Math.pow(2, (action.semitones || 0) / 12);
          dispatch(updateAudioClip({ trackId, clipId: last.id, updates: { playbackRate: rate, pitchSemitones: action.semitones } }));
        }
        return;
      }
      if (action.type === 'voiceTransform' && track.audioClips?.length) {
        const last = track.audioClips[track.audioClips.length - 1];
        if (last) {
          dispatch(updateAudioClip({ trackId, clipId: last.id, updates: { voiceTransformPreset: String(action.preset || '') } }));
        }
        return;
      }
    }

    switch (action) {
      case 'paste':
        // Allow pasting recording clips (piano/drum) at the track level at the current ruler position
        if (clipboard && (clipboard.type === 'piano-recording' || clipboard.type === 'drum-recording')) {
          pasteRecordingClip();
          break;
        }
        if (clipboard && clipboard.type === 'clip' && clipboard.clip) {
          let newStartTime = 0;
          if (track.audioClips && track.audioClips.length > 0) {
            const lastClip = track.audioClips[track.audioClips.length - 1];
            newStartTime = (lastClip.startTime || 0) + (lastClip.duration || 1);
          }
          const newClip = {
            ...clipboard.clip,
            id: Date.now() + Math.random(),
            startTime: newStartTime
          };
          dispatch(addAudioClipToTrack({ trackId, audioClip: newClip }));
        }
        break;
      case 'delete':
        dispatch(removeAudioClip({ trackId, clipId }));
        break;
      case 'editName':
        break;
      case 'splitRegion':
        // If no clip specified, try to split last clip on the track
        if (track.audioClips && track.audioClips.length) {
          const last = track.audioClips[track.audioClips.length - 1];
          if (last) {
            contextMenu.clipId = last.id; // temporary for split helper
            const tmpClip = track.audioClips.find(c => c.id === last.id);
            if (tmpClip) {
              const lfClip = tmpClip; // use local var
              const clipStart = lfClip.startTime || 0;
              const trimStart = lfClip.trimStart || 0;
              const trimEnd = lfClip.trimEnd ?? lfClip.duration;
              const visible = Math.max(0, trimEnd - trimStart);
              const rel = currentTime - clipStart;
              if (rel > 0 && rel < visible) {
                dispatch(updateAudioClip({ trackId, clipId: lfClip.id, updates: { trimEnd: trimStart + rel } }));
                const right = { ...lfClip, id: Date.now() + Math.random(), startTime: currentTime, trimStart: trimStart + rel };
                dispatch(addAudioClipToTrack({ trackId, audioClip: right }));
              }
            }
          }
        }
        break;
      case 'muteRegion':
        dispatch(toggleMuteTrack(trackId));
        break;
      case 'changePitch':
        break;
      case 'vocalCleanup':
        break;
      case 'vocalTuner':
        break;
      case 'voiceTransform':
        break;
      case 'volumeUp':
        const currentVolumeUp = track.volume || 80;
        const newVolumeUp = Math.min(100, currentVolumeUp + 10);
        dispatch(setTrackVolume({ trackId, volume: newVolumeUp }));
        setVolumeIndicator({ show: true, volume: newVolumeUp, trackName: track.name || 'Track' });
        setTimeout(() => setVolumeIndicator({ show: false, volume: 0, trackName: '' }), 2000);
        break;
      case 'volumeDown':
        const currentVolumeDown = track.volume || 80;
        const newVolumeDown = Math.max(0, currentVolumeDown - 10);
        dispatch(setTrackVolume({ trackId, volume: newVolumeDown }));
        setVolumeIndicator({ show: true, volume: newVolumeDown, trackName: track.name || 'Track' });
        setTimeout(() => setVolumeIndicator({ show: false, volume: 0, trackName: '' }), 2000);
        break;
      case 'volumeReset':
        dispatch(setTrackVolume({ trackId, volume: 80 }));
        setVolumeIndicator({ show: true, volume: 80, trackName: track.name || 'Track' });
        setTimeout(() => setVolumeIndicator({ show: false, volume: 0, trackName: '' }), 2000);
        break;
      case 'reverse':
        (async () => {
          if (!track.audioClips || track.audioClips.length === 0) return;
          const firstClip = track.audioClips[0];
          if (!firstClip || !firstClip.url) return;
          const response = await fetch(firstClip.url);
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            const channelData = audioBuffer.getChannelData(i);
            channelData.reverse();
          }
          const wavData = await WavEncoder.encode({
            sampleRate: audioBuffer.sampleRate,
            channelData: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i))
          });
          const blob = new Blob([wavData], { type: 'audio/wav' });
          const reversedUrl = URL.createObjectURL(blob);
          dispatch(updateAudioClip({ trackId, clipId: firstClip.id, updates: { url: reversedUrl, reversed: true } }));
        })();
        break;
      case 'effects':
        setShowOffcanvasEffects(prev => !prev);
        setShowOffcanvas(false);
        break;
      case 'matchProjectKey':
        break;
      case 'addToLoopLibrary':
        setPricingModalOpen(true);
        break;
      case 'openInSampler':
        setPricingModalOpen(true);
        break;
      default:
    }
    // ... rest of the existing track-level actions
  }, [contextMenu, tracks, clipboard, dispatch, currentTime, setPlayers, setShowOffcanvasEffects, setShowOffcanvas, pianoRecordingClip, drumRecordingClip, pianoNotes, drumRecordedData]);

  // Section label context menu action handler
  const handleSectionContextMenuAction = useCallback((action) => {
    const sectionId = sectionContextMenu.sectionId;
    if (!sectionId) return;

    const section = sectionLabels.find(s => s.id === sectionId);
    if (!section) return;

    switch (action) {
      case 'rename':
        setRenameSectionId(sectionId);
        setRenameValue(section.name);
        setRenameModal(true);
        break;
      case 'resize':
        setResizeSectionId(sectionId);
        setResizeValue(section.width ? String(Math.round(section.width)) : "");
        setResizeModal(true);
        break;
      case 'delete':
        dispatch(removeSectionLabel(sectionId));
        break;
      case 'copy':
        setClipboard({ type: 'section', section: { ...section } });
        break;
      case 'loop':
        dispatch(setLoopRange({ start: section.startTime, end: section.endTime }));
        break;
      case 'createSectionAfter':
        const newSection = {
          id: Date.now() + Math.random(),
          name: 'New Section',
          startTime: section.endTime,
          endTime: Math.min(audioDuration, section.endTime + (section.endTime - section.startTime)),
          position: (section.endTime / audioDuration) * 100,
          width: section.width
        };
        dispatch(addSectionLabel(newSection));
        break;
      default:
    }
  }, [sectionContextMenu, sectionLabels, dispatch, audioDuration]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcuts while typing into inputs/textareas/contenteditable
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (!selectedTrackId) return;

      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        handleContextMenuAction('cut', selectedTrackId, selectedClipId);
      } else if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        handleContextMenuAction('copy', selectedTrackId, selectedClipId);
      } else if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        handleContextMenuAction('paste', selectedTrackId, selectedClipId);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleContextMenuAction('delete', selectedTrackId, selectedClipId);
      }
      else if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        handleContextMenuAction('muteRegion', selectedTrackId, selectedClipId);
      }
      // Volume control shortcuts
      else if (e.key === 'ArrowUp' && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        const selectedTrack = tracks.find(t => t.id === selectedTrackId);
        if (selectedTrack) {
          const newVolume = Math.min(100, (selectedTrack.volume || 80) + 5);
          dispatch(setTrackVolume({ trackId: selectedTrackId, volume: newVolume }));
          setVolumeIndicator({ show: true, volume: newVolume, trackName: selectedTrack.name || 'Track' });
          setTimeout(() => setVolumeIndicator({ show: false, volume: 0, trackName: '' }), 2000);
        }
      } else if (e.key === 'ArrowDown' && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        const selectedTrack = tracks.find(t => t.id === selectedTrackId);
        if (selectedTrack) {
          const newVolume = Math.max(0, (selectedTrack.volume || 80) - 5);
          dispatch(setTrackVolume({ trackId: selectedTrackId, volume: newVolume }));
          setVolumeIndicator({ show: true, volume: newVolume, trackName: selectedTrack.name || 'Track' });
          setTimeout(() => setVolumeIndicator({ show: false, volume: 0, trackName: '' }), 2000);
        }
      }
      // Add more shortcuts as needed
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrackId, selectedClipId, handleContextMenuAction, tracks, dispatch]);

  const renderGridLines = useMemo(() => {
    // Early return if required dependencies are not available
    if (!timelineContainerRef.current || !audioDuration || tracks.length === 0) {
      return [];
    }

    const gridLines = [];
    // Use the actual timeline width that changes with zoom, not the container width
    const timelineWidth = Math.max(audioDuration, 12) * timelineWidthPerSecond;
    const duration = audioDuration;

    // Validate dimensions
    if (timelineWidth <= 0 || duration <= 0) return [];

    // Get grid spacing with proper error handling
    let gridSpacing;
    try {
      gridSpacing = getGridSpacingWithTimeSignature(selectedGrid, selectedTime);
    } catch (error) {
      console.warn('Invalid grid spacing configuration:', error);
      gridSpacing = 1; // fallback to 1 second
    }

    if (gridSpacing <= 0) return [];

    // Use the zoomed timeline width for the scale
    const xScale = d3.scaleLinear().domain([0, duration]).range([0, timelineWidth]);
    const totalTracksHeight = trackHeight * tracks.length;

    // Calculate grid parameters with error handling
    let secondsPerBeat = 0.5;
    let beats = 4;

    try {
      const timeSignature = parseTimeSignature(selectedTime);
      beats = timeSignature.beats || 4;
      // You might want to make secondsPerBeat configurable based on tempo
      // secondsPerBeat = 60 / (tempo || 120); // 120 BPM default
    } catch (error) {
      console.warn('Invalid time signature:', error);
    }

    const secondsPerBar = secondsPerBeat * beats;

    // Optimize grid line calculation
    const maxGridLines = Math.min(Math.ceil(duration / gridSpacing), 2000);
    const tolerance = gridSpacing * 0.001; // More precise tolerance

    for (let i = 0; i <= maxGridLines; i++) {
      const time = i * gridSpacing;
      if (time > duration) break;

      const x = Math.round(xScale(time)); // Round to prevent sub-pixel rendering

      // More accurate beat/bar detection
      const timeInBar = time % secondsPerBar;
      const timeInBeat = time % secondsPerBeat;

      const isBarStart = timeInBar < tolerance;
      const isMainBeat = !isBarStart && timeInBeat < tolerance;
      const isSubdivision = !isBarStart && !isMainBeat;

      // Define grid line styles
      let lineStyle;
      if (isBarStart) {
        lineStyle = {
          background: "#FFFFFF50",
          width: 2,
          opacity: 0.7,
          zIndex: 3
        };
      } else if (isMainBeat) {
        lineStyle = {
          background: "#FFFFFF40",
          width: 1,
          opacity: 0.5,
          zIndex: 2
        };
      } else if (isSubdivision) {
        lineStyle = {
          background: "#FFFFFF25",
          width: 1,
          opacity: 0.25,
          zIndex: 1
        };
      } else {
        continue; // Skip lines that don't match any category
      }

      // Only render lines within visible bounds (use timeline width)
      if (x >= -lineStyle.width && x <= timelineWidth + lineStyle.width) {
        gridLines.push(
          <div
            key={`grid-${time.toFixed(3)}`} // Use time-based key for consistency
            className="timeline-grid-line" // Add class for easier styling/debugging
            style={{
              position: "absolute",
              left: x,
              top: 0,
              width: lineStyle.width,
              height: totalTracksHeight,
              background: lineStyle.background,
              opacity: lineStyle.opacity,
              zIndex: lineStyle.zIndex,
              pointerEvents: "none",
              transform: "translateZ(0)", // Force GPU acceleration
            }}
          />
        );
      }
    }

    return gridLines;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Include all dependencies to prevent stale closures
    audioDuration,
    selectedGrid,
    selectedTime,
    tracks.length,
    trackHeight,
    timelineWidthPerSecond, // Add zoom-dependent timeline width
    zoomLevel // Add zoom level dependency
  ]);

  // Calculate playhead position in pixels for smoother animation
  const playheadPosition = useMemo(() => {
    let time = localCurrentTime;

    // Apply magnet snapping if enabled and not playing
    if (isMagnetEnabled && selectedGrid && !isPlaying) {
      const { snapToGrid } = require("../Utils/gridUtils");
      time = snapToGrid(time, selectedGrid, audioDuration);
    }

    return time * timelineWidthPerSecond;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCurrentTime, timelineWidthPerSecond, isMagnetEnabled, selectedGrid, audioDuration]);

  // Handler for TimelineActionBoxes
  const handleAction = (action) => {
    if (action === "Browse loops") {
      setShowOffcanvas((prev) => !prev);
    } else if (action === "Add new track") {
      setShowAddTrackModal(true);
    } else if (action === "Import file") {
      fileInputRef.current && fileInputRef.current.click();
    } else if (action === "Import to Audio track") {
      audioTrackFileInputRef.current && audioTrackFileInputRef.current.click();
    } else if (action === "Import to Voice & Mic track") {
      voiceMicFileInputRef.current && voiceMicFileInputRef.current.click();
    } else if (action === "Open in sampler") {
      console.log("Open in sampler - not implemented yet");
    } else if (action === "Play the synth") {
      const newTrackId = Date.now() + Math.random();
      const newTrack = {
        id: newTrackId,
        name: 'Synth',
        type: 'Synth',
        volume: 80,
        audioClips: []
      };
      dispatch(addTrack(newTrack));
      dispatch(setCurrentTrackId(newTrackId));
      dispatch(setTrackType('Synth'));
    } else if (action === "Patterns Beatmaker") {
      const newTrackId = Date.now() + Math.random();
      const newTrack = {
        id: newTrackId,
        name: 'Drums & Machines',
        type: 'drum',
        volume: 80,
        audioClips: []
      };
      dispatch(addTrack(newTrack));
      dispatch(setCurrentTrackId(newTrackId));
      dispatch(setTrackType('Drums & Machines'));
    }
    // Add more actions as needed
  };

  // eslint-disable-next-line no-unused-vars
  const handleDrumRecordingComplete = async (blob) => {
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", blob)
    const newTrack = {
      id: Date.now().toString(),
      name: `Drum Track ${tracks.length + 1}`,
      type: 'drum',
      color: generateRandomHexColor(),
      volume: 80,
      audioClips: []
    };
    dispatch(addTrack(newTrack));
  };

  // Rename submit handler
  const handleRenameSubmit = () => {
    if (renameSectionId && renameValue.trim()) {
      dispatch(updateSectionLabel({
        id: renameSectionId,
        updates: { name: renameValue.trim() }
      }));
      setRenameModal(false);
      setRenameSectionId(null);
      setRenameValue("");
    }
  };

  // Resize submit handler
  const handleResizeSubmit = () => {
    const widthNum = parseInt(resizeValue, 10);
    if (resizeSectionId && widthNum > 0) {
      dispatch(updateSectionLabel({
        id: resizeSectionId,
        updates: { width: widthNum }
      }));
      setResizeModal(false);
      setResizeSectionId(null);
      setResizeValue("");
    }
  };

  const createReverbBuffer = useCallback(() => {
    const audioContext = getAudioContext();
    const length = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(2, length, audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2);
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    return buffer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTypeEffects = useCallback((audioNode, typeEffects) => {
    const audioContext = getAudioContext();

    // Create EQ for bass boost
    const lowShelf = audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.setValueAtTime(200, audioContext.currentTime);
    {
      const effects = typeEffects || { bassBoost: 1.0, saturation: 0.0 };
      lowShelf.gain.setValueAtTime((effects.bassBoost - 1) * 10, audioContext.currentTime);
    }

    // Create compressor
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
    compressor.knee.setValueAtTime(30, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);

    // Create waveshaper for saturation
    const waveshaper = audioContext.createWaveShaper();
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    {
      const effects = typeEffects || { bassBoost: 1.0, saturation: 0.0 };
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = (3 + effects.saturation) * x * 20 * deg / (Math.PI + effects.saturation * Math.abs(x));
      }
    }
    waveshaper.curve = curve;
    waveshaper.oversample = '4x';

    // Connect effects chain
    audioNode.connect(lowShelf);
    lowShelf.connect(compressor);
    compressor.connect(waveshaper);

    return waveshaper;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enhanced drum sound playback that works with timeline
  const playDrumSound = useCallback((drumData) => {
    try {
      if (!drumData || !drumData.sound) return;

      const audioContext = getAudioContext();

      // Ensure audio context is running
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(console.error);
      }

      // Find the drum machine type based on the recorded data
      const drumMachine = drumMachineTypes.find(dm => dm.name === drumData.drumMachine) || drumMachineTypes[0];

      // Create pad data from drum recording
      const padData = {
        id: drumData.padId,
        sound: drumData.sound,
        freq: drumData.freq,
        decay: drumData.decay,
        type: drumData.type
      };

      // Create synthetic sound using the same logic as Drum.jsx
      const synthSource = createSynthSound(padData, audioContext);

      // Create audio nodes for effects
      const gainNode = audioContext.createGain();
      const panNode = audioContext.createStereoPanner();
      const dryGainNode = audioContext.createGain();
      const wetGainNode = audioContext.createGain();
      const convolver = audioContext.createConvolver();

      // Set up reverb
      const reverbBuffer = createReverbBuffer();
      convolver.buffer = reverbBuffer;

      // Set up gain (volume) - use default values
      gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);

      // Set up pan (center)
      panNode.pan.setValueAtTime(0, audioContext.currentTime);

      // Set up reverb mix (default 20%)
      dryGainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
      wetGainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

      // Apply drum machine type effects
      const effectsOutput = applyTypeEffects(synthSource, drumMachine.effects);

      // Connect nodes with type effects
      effectsOutput.connect(gainNode);
      gainNode.connect(panNode);

      // Dry path
      panNode.connect(dryGainNode);
      dryGainNode.connect(audioContext.destination);

      // Wet path (reverb)
      panNode.connect(convolver);
      convolver.connect(wetGainNode);
      wetGainNode.connect(audioContext.destination);

      // console.log('Playing drum sound on timeline:', drumData.sound, 'from', drumData.drumMachine);
    } catch (error) {
      console.error('Error playing drum sound on timeline:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createReverbBuffer, applyTypeEffects]);

  const playedDrumHitsRef = useRef(new Set());

  // Enhanced drum clip checking for timeline playback
  useEffect(() => {
    if (isPlaying && currentTime > 0) {
      // Check drum recorded data for playback
      filteredDrumData.forEach(drumHit => {
        // Check if the track containing this drum hit is muted
        const track = tracks.find(t => t.id === drumHit.trackId);
        if (!track) return;

        const isMuted = soloTrackId ? soloTrackId !== track.id : (track.muted || false);
        if (isMuted) return; // Skip playing drum hits from muted tracks

        const hitTime = drumHit.currentTime;
        const tolerance = 0.05; // 50ms tolerance
        const hitKey = `${drumHit.padId}-${Math.floor(hitTime * 10)}`; // Create unique key

        if (Math.abs(currentTime - hitTime) <= tolerance && !playedDrumHitsRef.current.has(hitKey)) {
          playDrumSound(drumHit);
          playedDrumHitsRef.current.add(hitKey);
        }
      });

      // Also check regular drum tracks
      tracks.forEach(track => {
        // Check if this track is muted
        const isMuted = soloTrackId ? soloTrackId !== track.id : (track.muted || false);
        if (isMuted) return; // Skip muted tracks

        if (track.type === 'drum' && track.audioClips) {
          track.audioClips.forEach(clip => {
            if (clip.type === 'drum' && clip.drumSequence) {
              const clipStart = clip.startTime;
              const clipEnd = clip.startTime + clip.duration;

              if (currentTime >= clipStart && currentTime <= clipEnd) {
                clip.drumSequence.forEach(drumHit => {
                  const adjustedHitTime = clipStart + (drumHit.currentTime - clip.startTime);
                  const hitKey = `${drumHit.padId}-${Math.floor(adjustedHitTime * 10)}`;
                  if (Math.abs(currentTime - adjustedHitTime) <= 0.05 && !playedDrumHitsRef.current.has(hitKey)) {
                    playDrumSound(drumHit);
                    playedDrumHitsRef.current.add(hitKey);
                  }
                });
              }
            }
          });
        }
      });
    }
    else {
      // Clear played hits when not playing
      playedDrumHitsRef.current.clear();
    }
  }, [isPlaying, currentTime, tracks, filteredDrumData, playDrumSound, soloTrackId]);

  // Enhance the existing playDrumSound function to handle pattern drum events
  useEffect(() => {
    // Check for pattern drum events that need to be played
    Object.entries(patternDrumEvents).forEach(([trackId, trackEvents]) => {
      // Check if this track is muted
      const track = tracks.find(t => t.id === trackId);
      if (!track) return;

      const isMuted = soloTrackId ? soloTrackId !== track.id : (track.muted || false);
      if (isMuted) return; // Skip muted tracks

      Object.entries(trackEvents).forEach(([clipId, drumEvents]) => {
        if (patternDrumPlayback[trackId]?.[clipId]) {
          // Play each drum event
          drumEvents.forEach(drumEvent => {
            playDrumSound(drumEvent);
          });
        }
      });
    });
  }, [patternDrumEvents, patternDrumPlayback, playDrumSound, tracks, soloTrackId]);

  // Add this useEffect after the existing drum playback effect
  useEffect(() => {
    if (isPlaying && currentTime > 0) {
      // Check each track for pattern drum clips
      tracks.forEach(track => {
        // Check if this track is muted
        const isMuted = soloTrackId ? soloTrackId !== track.id : (track.muted || false);
        if (isMuted) return; // Skip muted tracks

        if (track.audioClips) {
          track.audioClips.forEach(clip => {
            if (clip.fromPattern && clip.drumSequence) {
              // Dispatch the thunk to check and trigger drum events
              dispatch(triggerPatternDrumPlayback({
                trackId: track.id,
                clipId: clip.id,
                currentTime
              }));
            }
          });
        }
      });
    }
  }, [isPlaying, currentTime, tracks, dispatch, soloTrackId]);

  // Initialize piano for playback when component mounts
  useEffect(() => {
    initializePiano();
  }, [initializePiano]);

  // Cleanup piano notes when playback stops
  useEffect(() => {
    if (!isPlaying) {
      stopAllPianoNotes();
      playedDrumHitsRef.current.clear();
    }
  }, [isPlaying, stopAllPianoNotes]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopAllPianoNotes();
      if (pianoAudioContextRef.current) {
        pianoAudioContextRef.current.close();
      }
    };
  }, [stopAllPianoNotes]);

  // Handle click outside grid settings dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (gridSettingRef.current && !gridSettingRef.current.contains(event.target)) {
        setShowGridSetting(false);
      }
    };

    if (showGridSetting) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGridSetting]);

  const handleSave = (name) => {
    console.log("get name ::: > ", name);
  };

  // sound quality code
  // Listen for audio quality changes and recreate all audio
  useEffect(() => {
    const handleQualityChange = async (quality, settings) => {
      console.log(`Timeline: Audio quality changed to ${quality}, recreating audio...`);

      // Stop all current playback
      players.forEach((playerObj) => {
        if (playerObj?.player && typeof playerObj.player.stop === 'function') {
          try {
            playerObj.player.stop();
          } catch (error) {
            // Ignore stop errors
          }
        }
      });

      // Clear existing players
      setPlayers([]);
      setWaveSurfers([]);

      // Reinitialize audio context reference
      audioContextRef.current = null;

      // Recreate all audio clips with new quality
      recreateAllAudioClips();
    };

    audioQualityManager.addListener(handleQualityChange);

    return () => {
      audioQualityManager.removeListener(handleQualityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  // Function to recreate all audio clips with new quality
  const recreateAllAudioClips = async () => {
    const newAudioContext = audioQualityManager.getAudioContext();
    const newSampleRate = audioQualityManager.getCurrentSampleRate();

    // Recreate all existing audio clips with new sample rate
    for (const track of tracks) {
      if (track.audioClips) {
        for (const clip of track.audioClips) {
          if (clip.url) {
            try {
              // Reload audio with new quality
              await reloadAudioClip(clip, newAudioContext, newSampleRate);
            } catch (error) {
              console.error('Error recreating audio clip:', error);
            }
          }
        }
      }
    }
  };

  // Function to reload an audio clip with new quality
  const reloadAudioClip = async (clip, audioContext, sampleRate) => {
    try {
      const response = await fetch(clip.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create new player with updated audio buffer
      const player = new Player(audioBuffer).toDestination();

      // Find the track to get its volume
      const track = tracks.find(t => t.id === clip.trackId);
      const trackVolume = track?.volume || 80;

      // Calculate combined volume
      const masterVolumeDb = (masterVolume - 100) * 0.6;
      const trackVolumeDb = (trackVolume - 100) * 0.6;
      const combinedVolumeDb = masterVolumeDb + trackVolumeDb;

      player.volume.value = combinedVolumeDb;
      player.playbackRate = tempoRatio;

      const clipDuration = clip.duration || audioBuffer.duration;
      const trimStart = clip.trimStart || 0;
      const trimEnd = clip.trimEnd || clipDuration;

      // Add to players list
      setPlayers((prev) => {
        const filtered = prev.filter(p => !(p.trackId === clip.trackId && p.clipId === clip.id));
        const playerData = {
          player,
          trackId: clip.trackId,
          clipId: clip.id,
          startTime: clip.startTime || 0,
          duration: clipDuration,
          trimStart: trimStart,
          trimEnd: trimEnd,
          originalDuration: audioBuffer.duration,
          playbackRate: tempoRatio
        };
        return [...filtered, playerData];
      });

    } catch (error) {
      console.error("Error reloading audio clip:", error);
    }
  };

  // ************************************************** Get the project data API **************************************************

  const { id: projectId } = useParams();
  const allMusic = useSelector((state) => state.music?.allmusic || []);
  const musicLoading = useSelector((state) => state.music?.loading || false);

  useEffect(() => {
    // If navigated with a demo sound from Home2, create a track and clip immediately
    const demoSound = location?.state?.demoSound;
    if (demoSound && (!projectId)) {
      // Clear navigation state immediately so refresh shows no demo
      try {
        navigate('.', { replace: true, state: {} });
      } catch (_) {
        try {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        } catch (_) {}
      }

      // If there's already content on the timeline, replace it with the new demo
      if (Array.isArray(tracks) && tracks.length > 0) {
        dispatch(setTracks([]));
      }
      const url = `${IMAGE_URL}uploads/soundfile/${demoSound.soundfile}`;
      const newClipId = Date.now() + Math.random();
      const newTrackId = Date.now() + Math.random();

      // Create a minimal track with a single clip; duration will be updated once decoded/ready
      const initialDuration = 5; // temporary placeholder
      const clip = {
        id: newClipId,
        name: demoSound.soundname || 'New Clip',
        url,
        color: '#FFB6C1',
        startTime: 0,
        duration: initialDuration,
        trimStart: 0,
        trimEnd: initialDuration,
        soundData: demoSound,
        type: 'audio'
      };

      const track = {
        id: newTrackId,
        name: demoSound.soundname || 'New Track',
        volume: 80,
        audioClips: [clip],
        type: 'audio',
        color: getNextTrackColor(0)
      };

      dispatch(addTrack(track));
      dispatch(setCurrentTrackId(newTrackId));

      // Try to fetch real duration asynchronously and update clip
      (async () => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const realDuration = audioBuffer.duration || initialDuration;
          dispatch(updateAudioClip({
            trackId: newTrackId,
            clipId: newClipId,
            updates: { duration: realDuration, trimEnd: realDuration }
          }));
          dispatch(setAudioDuration(Math.max(realDuration, 120)));
        } catch (_) {
          // ignore
        }
      })();
    }
  }, [location?.state?.demoSound, projectId, dispatch]);

  useEffect(() => {
    if (!projectId) return;

    try {
  const project = (allMusic || []).find(m => String(m?._id) === String(projectId));
  if (!project) return;

  dispatch(setCurrentMusic(project));
  
      const incomingTracks = Array.isArray(project.musicdata) ? project.musicdata : [];
      const studioTracks = [];
      const aggregatedPianoNotes = [];
      const aggregatedDrumData = [];
      let maxEnd = 0;

      // Check for saved project duration
      let savedDuration = 0;

      // Check multiple possible duration properties
      if (project.duration && Number(project.duration) > 0) {
        savedDuration = Number(project.duration);
      }

      if (project.audioDuration && Number(project.audioDuration) > 0) {
        savedDuration = Math.max(savedDuration, Number(project.audioDuration));
      }

      // Process tracks and calculate maxEnd
      incomingTracks.forEach((t, idx) => {
        const trackId = t.id ?? (t._id ?? (Date.now() + Math.random() + idx));

        // Filter and validate audio clips
        const audioClips = Array.isArray(t.audioClips)
          ? t.audioClips
            .filter(c => c && (c.url || c.type === 'piano' || c.type === 'drum' || c.fromRecording || c.fromPattern || (c.duration && Number(c.duration) > 0)))
            .map((c) => {
              const duration = Number(c.duration || 0);
              const trimStart = Number(c.trimStart || 0);
              const trimEnd = Number((c.trimEnd != null ? c.trimEnd : duration) || duration);
              const startTime = Number(c.startTime || 0);
              const visible = Math.max(0, trimEnd - trimStart);
              const clipEnd = startTime + (visible || duration);

              maxEnd = Math.max(maxEnd, clipEnd);

              return {
                id: c.id ?? (Date.now() + Math.random()),
                name: c.name || 'Clip',
                url: c.url || null,
                color: c.color || t.color || '#FFB6C1',
                startTime,
                duration: duration || visible || 0,
                trimStart,
                trimEnd,
              };
            })
          : [];

        // Handle piano notes
        if (Array.isArray(t.pianoNotes)) {
          t.pianoNotes.forEach(n => {
            const note = { ...n };
            if (note.trackId == null) note.trackId = trackId;
            aggregatedPianoNotes.push(note);
            const noteEnd = (note.startTime || 0) + (note.duration || 0.05);
            maxEnd = Math.max(maxEnd, noteEnd);
          });
        }

        // Handle drum recorded data
        if (Array.isArray(t.drumNotes)) {
          t.drumNotes.forEach(d => {
            const hit = { ...d };
            if (hit.trackId == null) hit.trackId = trackId;
            aggregatedDrumData.push(hit);
            const hitEnd = (hit.currentTime || 0) + (hit.decay || 0.2);
            maxEnd = Math.max(maxEnd, hitEnd);
          });
        }

        // Consider piano clip bounds
        if (t.pianoClip && t.pianoClip.start != null && t.pianoClip.end != null) {
          maxEnd = Math.max(maxEnd, Number(t.pianoClip.end) || 0);
        }

        if (t.drumClip && t.drumClip.start != null && t.drumClip.end != null) {
          maxEnd = Math.max(maxEnd, Number(t.drumClip.end) || 0);
        }

        // Only add tracks that have valid content
        if (audioClips.length > 0 || 
            (Array.isArray(t.pianoNotes) && t.pianoNotes.length > 0) ||
            (Array.isArray(t.drumNotes) && t.drumNotes.length > 0) ||
            t.pianoClip || t.drumClip) {
          
          studioTracks.push({
            id: trackId,
            name: t.name || `Track ${idx + 1}`,
            type: t.type || t.trackType || 'audio',
            color: t.color || '#FFB6C1',
            volume: Number(t.volume || 80),
            muted: Boolean(t.muted || false),
            frozen: Boolean(t.frozen || false),
            audioClips,
            pianoNotes: Array.isArray(t.pianoNotes) ? t.pianoNotes.map(n => ({ ...n, trackId })) : [],
            pianoClip: t.pianoClip || null,
            drumClip: t.drumClip || null,
          });
        }
      });

      // Calculate final duration - PRIORITIZE SAVED DURATION
      let finalDuration = savedDuration; // Start with saved duration

      if (finalDuration === 0) {
        // Only if no saved duration, calculate from content
        finalDuration = maxEnd > 0 ? Math.max(maxEnd + 10, 150) : 150;
      } else {
        // If we have saved duration, ensure it covers all content but don't reduce it
        finalDuration = Math.max(savedDuration, maxEnd + 5);
      }

      // Update Redux state
      dispatch(setTracks(studioTracks));

      // Set duration AFTER tracks to prevent override
      setTimeout(() => {
        dispatch(setAudioDuration(finalDuration));
      }, 100);

      if (aggregatedPianoNotes.length > 0) {
        dispatch(setPianoNotes(aggregatedPianoNotes));
      }
      if (aggregatedDrumData.length > 0) {
        dispatch(setDrumRecordedData(aggregatedDrumData));
      }

      // Focus first track
      if (studioTracks.length > 0) {
        dispatch(setCurrentTrackId(studioTracks[0].id));
      }

    } catch (error) {
      console.error('Error loading project data:', error);
    }
  }, [projectId, allMusic, dispatch]);

  // Add a protective effect to prevent audioDuration from being reduced unexpectedly
  const savedDurationRef = useRef(0);

  useEffect(() => {
    if (audioDuration > savedDurationRef.current) {
      savedDurationRef.current = audioDuration;
    } else if (audioDuration < savedDurationRef.current && savedDurationRef.current > 0) {
      console.log('⚠️ AudioDuration being reduced from', savedDurationRef.current, 'to', audioDuration);
      // Uncomment the next line if you want to prevent duration reduction
      // dispatch(setAudioDuration(savedDurationRef.current));
    }
  }, [audioDuration]);

  // Enhanced timeline container effect with width locking
  useEffect(() => {
    if (timelineContainerRef.current && audioDuration > 0) {
      const expectedWidth = Math.max(audioDuration, 12) * timelineWidthPerSecond;

      // Force update the container min-width and store it
      timelineContainerRef.current.style.minWidth = `${expectedWidth}px`;
      timelineContainerRef.current.setAttribute('data-expected-width', expectedWidth.toString());
    }
  }, [audioDuration, timelineWidthPerSecond]);

  useEffect(() => {
    if (!projectId) return;
    if (!musicLoading && (!allMusic || allMusic.length === 0)) {
      dispatch(getAllMusic());
    }
  }, [projectId, allMusic, musicLoading, dispatch]);

  // File import handlers
  const handleAudioTrackFileImport = async (e) => {
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

      // Reset file input
      e.target.value = '';
      
    } catch (error) {
      console.error('Error importing audio file:', error);
      alert('Failed to import audio file. Please try again.');
    }
  };

  const handleVoiceMicFileImport = async (e) => {
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

      // Reset file input
      e.target.value = '';
      
    } catch (error) {
      console.error('Error importing voice & mic file:', error);
      alert('Failed to import voice & mic file. Please try again.');
    }
  };

  return (
    <>
      <EditTrackNameModal isOpen={edirNameModel} onClose={() => setEdirNameModel(false)} onSave={handleSave} />
      <div style={{ padding: "0", color: "white", background: "transparent", height: "100%", marginRight: showOffcanvas || showOffcanvasEffects ? "23vw" : 0, }} className="relative overflow-hidden">
        <div style={{ width: "100%", overflowX: "auto" }} className="hide-scrollbar">
          <div
            ref={timelineContainerRef}
            className="timeline-container"
            style={{ minWidth: `${Math.max(audioDuration, 12) * timelineWidthPerSecond}px`, position: "relative", height: "100vh", transition: "min-width 0.2s ease-in-out", }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onWheel={handleWheel}
          >

            <div
              style={{ height: "100px", borderBottom: "1px solid #1414141A", position: "relative", top: 0, zIndex: 10, background: "#141414" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Magnet Status Indicator */}
              {isMagnetEnabled && (
                <div style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#FF6B35",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  zIndex: 25,
                  boxShadow: "0 2px 8px rgba(255, 107, 53, 0.3)",
                  animation: "magnetSnap 2s ease-in-out infinite"
                }}>
                  🧲 Magnet: {selectedGrid || "Grid"} Active
                </div>
              )}

              <svg ref={svgRef} width={`${Math.max(audioDuration, 12) * timelineWidthPerSecond}px`} height="100%" style={{ color: "white", background: "#141414" }} />
            </div>

            <LoopBar />

            {isSongSection && (
              <MySection timelineContainerRef={timelineContainerRef} audioDuration={audioDuration} selectedGrid={selectedGrid} />
            )}

            {isSongSection && sectionLabels.map((section) => (
              <ResizableSectionLabel
                key={section.id}
                section={section}
                audioDuration={audioDuration}
                selectedGrid={selectedGrid}
                timelineContainerRef={timelineContainerRef}
                onResize={resizeSection}
                onContextMenu={handleSectionContextMenu}
              />
            ))}

            {recordedData && recordedData.length > 0 && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}>
                {recordedData.map((rec, idx) => (
                  <div key={`recorded-${idx}`}
                    style={{ position: "absolute", top: 0, left: `${(rec.currentTime / audioDuration) * 100}%`, width: "6px", height: "100%", background: "#FF6767", opacity: 0.8, zIndex: 51, borderRadius: "2px", boxShadow: "0 0 4px rgba(255, 103, 103, 0.6)" }}
                    title={`Recorded at ${rec.currentTime.toFixed(2)}s - Volume: ${rec.volume} - Playing: ${rec.isPlaying ? 'Yes' : 'No'}`}
                  />
                ))}

                {recordedData.length > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${(recordedData[0].currentTime / audioDuration) * 100}%`,
                      width: `${((recordedData[recordedData.length - 1].currentTime - recordedData[0].currentTime) / audioDuration) * 100}%`,
                      height: "100%",
                      background: "rgba(255, 103, 103, 0.1)",
                      border: "1px solid rgba(255, 103, 103, 0.3)",
                      zIndex: 49,
                      pointerEvents: "none",
                    }}
                    title="Recorded region"
                  />
                )}
              </div>
            )}

            <style>
              {`
                 @keyframes sectionLabelAppear {
                   from {
                     opacity: 0;
                     transform: translateX(-50%) scale(0.8);
                   }
                   to {
                     opacity: 1;
                     transform: translateX(-50%) scale(1);
                   }
                 }
                 
                 @keyframes magnetSnap {
                   0% { transform: translateX(-50%) scale(1); }
                   50% { transform: translateX(-50%) scale(1.1); }
                   100% { transform: translateX(-50%) scale(1); }
                 }
               `}
            </style>

            <div style={{ overflow: "visible", position: "relative", minHeight: tracks.length > 0 ? `${trackHeight * tracks.length}px` : "0px", height: tracks.length > 0 ? `${trackHeight * tracks.length}px` : "0px", marginTop: "40px", }}>
              {tracks.length > 0 && Array.from({ length: tracks.length }).map((_, index) => (
                <div key={`lane-${index}`} style={{ position: "absolute", top: `${(index * trackHeight) - sidebarScrollOffset}px`, left: 0, width: "100%", height: `${trackHeight}px`, borderTop: "1px solid #FFFFFF1A", borderBottom: "1px solid #FFFFFF1A", zIndex: 0, }} />
              ))}

              {tracks.map((track, index) => {
                return (
                  <div
                    key={track.id}
                    data-track-id={track.id}
                    style={{
                      position: "absolute",
                      top: `${(index * trackHeight) - sidebarScrollOffset}px`,
                      left: 0,
                      width: "100%",
                      height: `${trackHeight}px`,
                      zIndex: 0,
                      opacity: (soloTrackId ? soloTrackId !== track.id : (track?.muted || false)) ? 0.5 : 1,
                      pointerEvents: "auto",
                    }}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setSelectedClipId(null);
                        setSelectedTrackId(track.id);
                        dispatch(setCurrentTrackId(track.id));
                      }
                    }}
                    tabIndex={0}
                    onFocus={() => { setSelectedTrackId(track.id); dispatch(setCurrentTrackId(track.id)); }}
                    onContextMenu={(e) => handleContextMenu(e, track.id)}
                  >
                    {/* {hasRecordingStarted && ( */}
                    <TimelineTrack
                      key={track.id}
                      track={track}
                      trackId={track.id}
                      height={trackHeight}
                      onReady={handleReady}
                      onTrimChange={(clipId, trimData) => handleTrimChange(track.id, clipId, trimData)}
                      onPositionChange={(clipId, newStartTime) => handleTrackPositionChange(track.id, clipId, newStartTime)}
                      onRemoveClip={(clipId) => dispatch(removeAudioClip({
                        trackId: track.id,
                        clipId: clipId
                      }))}
                      timelineWidthPerSecond={timelineWidthPerSecond}
                      frozen={track.frozen}
                      onContextMenu={handleContextMenu}
                      onSelect={(clip) => setSelectedClipId(clip.id)}
                      selectedClipId={selectedClipId}
                      color={track.color}
                      bpm={120}              // Set your track's BPM
                      beatsPerBar={4}        // Time signature (4/4, etc.)
                      showBeatRectangles={true} // Toggle beat visualization
                    />
                  </div>
                );
              })}
            </div>

            {/* Show action boxes when there are no tracks */}
            {tracks.length === 0 && (
              <TimelineActionBoxes onAction={handleAction} />
            )}

            {/* Playhead - adjusted to account for loop bar */}
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: "2px",
              pointerEvents: "none",
              zIndex: 10,
              transform: `translateX(${playheadPosition}px)`,
              willChange: "transform",
              transition: (isMagnetEnabled && isDragging.current) ? "none" : "transform 0.05s linear" // Only disable during mouse drag with magnet
            }}>
              <div style={{
                position: "absolute",
                top: "60px",
                left: "-8px",
                width: "18px",
                height: "18px",
                background: "#AD00FF",
                borderRadius: "3px",
                border: "1px solid #fff",
                transition: "background-color 0.2s ease",
                // boxShadow: isMagnetEnabled ? "0 0 10px #FF6B35, 0 0 20px #FF6B35" : "none"
              }} />
              <div style={{
                position: "absolute",
                top: "78px",
                left: 0,
                bottom: 0,
                width: "2px",
                background: "#AD00FF",
                transition: "background-color 0.2s ease",
                // boxShadow: isMagnetEnabled ? "0 0 5px #FF6B35" : "none"
              }} />

            </div>

            {/* Loop Start vertical line */}
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "2px", pointerEvents: "none", zIndex: 12, transform: `translateX(${(loopStart || 0) * timelineWidthPerSecond}px)`}}>
              <div style={{ position: "absolute", top: "90px", left: 0, bottom: 0, width: "2px", background: "#FF8C00", display: isLoopEnabled ? "block" : "none"}}/>
            </div>
            {/* Loop End vertical line (behind LoopBar) */}
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "2px", pointerEvents: "none", zIndex: 12, transform: `translateX(${(loopEnd || 0) * timelineWidthPerSecond}px)`}}>
              <div style={{ position: "absolute", top: "90px", left: 0, bottom: 0, width: "2px", background: "#FF8C00", display: isLoopEnabled ? "block" : "none"}}/>
            </div>
            {/* Grid lines - only show when there are tracks */}
            {tracks.length > 0 && (
              <div style={{ position: "absolute", top: `${140 - sidebarScrollOffset}px`, left: 0, width: "100%", height: `${trackHeight * tracks.length}px`, pointerEvents: "none", }}>{renderGridLines}</div>
            )}
          </div>
        </div>

        {/* Top right controls */}
        <div className="flex gap-2 absolute top-[60px] right-[10px] -translate-x-1/2 bg-[#141414]" style={{ zIndex: 51 }}>
          {/* Magnet Button */}
          <div className="relative">
            <div
              className={`w-[30px] h-[30px] flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${isMagnetEnabled
                ? 'bg-[#A6A3AC]'
                : 'hover:bg-[#1F1F1F]'
                }`}
              onClick={() => {
                const next = !isMagnetEnabled;
                setIsMagnetEnabled(next);
              }}
              title={isMagnetEnabled ? "Magnet: ON" : "Magnet: OFF"}
            >
              <img src={magnetIcon} alt="Magnet" />
            </div>
          </div>

          <div ref={gridSettingRef} className="hover:bg-[#1F1F1F] w-[30px] h-[30px] z-[60] flex items-center justify-center rounded-full cursor-pointer" onClick={() => setShowGridSetting((prev) => !prev)}>
            <img src={settingIcon} alt="Settings" />
            {showGridSetting && (
              <div className="absolute top-full right-0 z-[150]">
                <GridSetting
                  // anchorRef={gridSettingRef}
                  selectedGrid={selectedGrid}
                  selectedTime={selectedTime}
                  selectedRuler={selectedRuler}
                  onGridChange={(grid) => dispatch(setSelectedGrid(grid))}
                  onTimeChange={(time) => dispatch(setSelectedTime(time))}
                  onRulerChange={(ruler) => dispatch(setSelectedRuler(ruler))}
                />
              </div>
            )}
          </div>

          <div className={`w-[30px] h-[30px] flex items-center justify-center rounded-full cursor-pointer  ${isLoopEnabled ? 'bg-[#FF8014]' : 'hover:bg-[#1F1F1F]'}`} onClick={() => dispatch(toggleLoopEnabled())}>
            <img src={reverceIcon} alt="Reverse" />
          </div>
        </div>

        {/* Right side controls */}
        <div className="absolute top-[60px] right-[0] -translate-x-1/2 z-30">
          <div
            className="bg-[#FFFFFF] w-[40px] h-[40px] flex items-center justify-center rounded-full cursor-pointer"
            onClick={() => { const next = !showOffcanvas; setShowOffcanvas(next); setShowOffcanvasEffects(false); dispatch(setShowLoopLibrary(next)); }}
          >
            <img src={offce} alt="Off canvas" />
          </div>
          <div className="bg-[#1F1F1F] w-[40px] h-[40px] flex items-center justify-center rounded-full mt-2 cursor-pointer"
            onClick={() => {  
              setShowOffcanvasEffects((prev) => !prev);
              setShowOffcanvas(false);
              dispatch(setShowLoopLibrary(false));}}         
          >
            {/* <img src={fxIcon} alt="Effects" onClick={() => { setShowOffcanvasEffects((prev) => !prev); setShowOffcanvas(false); }} /> */}
            <img src={fxIcon} alt="Effects" />
          </div>
        </div>

        {/* Volume Indicator */}
        {volumeIndicator.show && (
          <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1F1F1F] border border-[#444] rounded-lg px-4 py-3 shadow-lg">
            <div className="text-white text-center">
              <div className="text-sm opacity-80">{volumeIndicator.trackName}</div>
              <div className="text-2xl font-bold">{volumeIndicator.volume}%</div>
              <div className="text-xs opacity-60 mt-1">Volume</div>
            </div>
          </div>
        )}

      </div>

      {/* <Drum onDrumRecordingComplete={handleDrumRecordingComplete} /> */}

      {/* Add Track Modal */}
      {/* {showAddTrackModal && (
        <AddNewTrackModel
          onClose={() => setShowAddTrackModal(false)}
          onOpenLoopLibrary={() => { setShowOffcanvas(true); setShowOffcanvasEffects(false); dispatch(setShowLoopLibrary(true)); }}
        />
      )} */}

      <AnimatePresence>
        {showAddTrackModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div
              className="rounded-xl p-6 w-full"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AddNewTrackModel onClose={() => setShowAddTrackModal(false)} onOpenLoopLibrary={() => {
                dispatch(setShowLoopLibrary(true));
                setShowAddTrackModal(false);
              }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for import */}
      <input type="file" ref={fileInputRef} style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try {
            const blob = file;
            const url = URL.createObjectURL(blob);
            const duration = await getAudioDuration(blob);

            const trackColor = generateRandomHexColor();
            const newClip = {
              id: Date.now() + Math.random(),
              name: file.name,
              url,
              duration,
              trimStart: 0,
              trimEnd: duration,
              startTime: 0,
              color: trackColor,
            };

            const newTrack = {
              id: Date.now() + Math.random(),
              name: file.name,
              color: trackColor,
              volume: 80,
              audioClips: [newClip],
            };

            dispatch(addTrack(newTrack));
          } catch (err) {
            // Failed to import audio file
          } finally {
            e.target.value = '';
          }
        }}
      />

      {/* Audio track import */}
      <input 
        type="file" 
        ref={audioTrackFileInputRef} 
        style={{ display: "none" }}
        accept="audio/*"
        onChange={handleAudioTrackFileImport}
      />

      {/* Voice & Mic track import */}
      <input 
        type="file" 
        ref={voiceMicFileInputRef} 
        style={{ display: "none" }}
        accept="audio/*"
        onChange={handleVoiceMicFileImport}
      />

      <MusicOff showOffcanvas={showOffcanvas} setShowOffcanvas={(v) => { setShowOffcanvas(v); dispatch(setShowLoopLibrary(Boolean(v))); }} />
      <Effects showOffcanvas={showOffcanvasEffects} setShowOffcanvas={setShowOffcanvasEffects} />

      {/* Context Menu */}
      <WaveMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={handleContextMenuClose}
        onAction={handleContextMenuAction}
        onOpenMusicOff={() => { setShowOffcanvas(true); dispatch(setShowLoopLibrary(true)); }}
      />

      {/* Section Context Menu */}
      <SectionContextMenu
        isOpen={sectionContextMenu.isOpen}
        position={sectionContextMenu.position}
        onClose={handleSectionContextMenuClose}
        onAction={handleSectionContextMenuAction}
      />

      {/* Piano Component */}
      {/* {(showPiano || getTrackType === "Keys") && (
        <Piano onClose={() => { setShowPiano(false); dispatch(setTrackType(null)); }} />
      )} */}

      <AnimatePresence>
        {(showPiano || getTrackType === "Keys") && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-4 z-50"
          >
            <Piano onClose={() => { setShowPiano(false); dispatch(setTrackType(null)); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drum Component */}
      {(showDrum || getTrackType === "Drums & Machines") && (
        <Drum onClose={() => { setShowDrum(false); dispatch(setTrackType(null)); }} />
      )}

      {/* <AnimatePresence>
        {(showDrum || getTrackType === "Drums & Machines") && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "20%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-4 z-50"
          >
            <Drum onClose={() => { setShowDrum(false); dispatch(setTrackType(null)); }} />
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* {(showGuitar || getTrackType === "Guitar") && (
        <Guitar onClose={() => { setShowGuitar(false); dispatch(setTrackType(null)); }} />
      )} */}

      <AnimatePresence>
        {(showGuitar || getTrackType === "Guitar") && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "20%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-4 z-50"
          >
            <Guitar onClose={() => { setShowGuitar(false); dispatch(setTrackType(null)); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* {(showOrchestral || getTrackType === "Orchestral") && (
        <Orchestral onClose={() => { setShowOrchestral(false); dispatch(setTrackType(null)); }} />
      )} */}

      <AnimatePresence>
        {(showOrchestral || getTrackType === "Orchestral") && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "20%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-4 z-50"
          >
            <Orchestral onClose={() => { setShowOrchestral(false); dispatch(setTrackType(null)); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {(showMicVoice || getTrackType === "Voice & Mic") && (
        <VoiceAndMic onClose={() => { setShowMicVoice(false); dispatch(setTrackType(null));
          if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            setMicStream(null);
          }
          setMicAccessDenied(false);
        }} />
      )}

      {((showMicVoice || getTrackType === "Voice & Mic") && micAccessDenied) && (
        <AccessPopup onClose={() => { setShowAccessPopup(false); setMicAccessDenied(false); }} />
      )}

      <AnimatePresence>
        {(showSynth || getTrackType === "Synth") && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-4 z-50"
          >
            <NewSynth onClose={() => { setShowSynth(false); dispatch(setTrackType(null)); }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showBass808 || getTrackType === "Bass & 808") && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg p-4 z-50"
          >
            <BassAnd808 onClose={() => { setShowBass808(false); dispatch(setTrackType(null)); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Section Modal */}
      <Dialog open={renameModal} onClose={() => setRenameModal(false)} className="relative z-10">
        <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
              <div className="md:px-[10px] px-[20px]">
                <div className="md:py-[20px] py-[10px] md:px-[10px] bg-[#1F1F1F] border-b-[0.5px] border-b-[#FFFFFF1A]">
                  <div className="flex justify-between items-center">
                    <div className="sm:text-xl text-lg font-[600] text-[#fff]">Rename Section</div>
                    <img src={close} alt="" onClick={() => setRenameModal(false)} className="cursor-pointer" />
                  </div>
                </div>
                <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                  <div className=''>
                    <div className='text-sm text-[#FFFFFF] font-[400] mb-[10px]'>Name</div>
                    <input type="text" value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') handleRenameSubmit(); }}
                      className='text-[#FFFFFF99] rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]' />
                  </div>
                  <div className="text-center md:pt-[40px] pt-[20px]">
                    <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => setRenameModal(false)}>Cancel</button>
                    <button className="d_btn d_createbtn" onClick={handleRenameSubmit}>Rename</button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Pricing Modal */}
      <PricingModel pricingModalOpen={pricingModalOpen} setPricingModalOpen={setPricingModalOpen} />

      {/* Resize Section Modal */}
      <Dialog open={resizeModal} onClose={() => setResizeModal(false)} className="relative z-10">
        <DialogBackdrop transition className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel transition className="relative transform overflow-hidden rounded-[4px] bg-[#1F1F1F] text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 w-full xs:max-w-[340px] sm:max-w-[400px] md:max-w-lg xl:max-w-xl  data-closed:sm:translate-y-0 data-closed:sm:scale-95">
              <div className="md:px-[10px] px-[20px]">
                <div className="md:py-[20px] py-[10px] md:px-[10px] bg-[#1F1F1F] border-b-[0.5px] border-b-[#FFFFFF1A]">
                  <div className="flex justify-between items-center">
                    <div className="sm:text-xl text-lg font-[600] text-[#fff]">Resize Section</div>
                    <img src={close} alt="" onClick={() => setResizeModal(false)} className="cursor-pointer" />
                  </div>
                </div>
                <div className="md:pt-[20px] md:pb-[30px] py-[20px] md:w-[400px] m-auto">
                  <div className=''>
                    <div className='text-sm text-[#FFFFFF] font-[400] mb-[10px]'>Width (px)</div>
                    <input type="number" min={10} value={resizeValue} onChange={e => setResizeValue(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') handleResizeSubmit(); }}
                      className='text-[#FFFFFF99] rounded-[4px] w-full md:p-[11px] p-[8px] bg-[#FFFFFF0F] border-[0.5px] border-[#14141499]' />
                  </div>
                  <div className="text-center md:pt-[40px] pt-[20px]">
                    <button className="d_btn d_cancelbtn sm:me-7 me-5" onClick={() => setResizeModal(false)}>Cancel</button>
                    <button className="d_btn d_createbtn" onClick={handleResizeSubmit}>Resize</button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

    </>
  );
};

export default Timeline;