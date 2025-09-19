import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllMusic } from "../Redux/Slice/music.slice";
import { IMAGE_URL } from "../Utils/baseUrl"; 
import { useTheme } from "../Utils/ThemeContext";

// Theme-aware color system for OpenProjectModal
const getOpenProjectColors = (isDark) => ({
  // Overlay and modal
  overlayBg: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.3)",
  modalBg: isDark ? "#181818" : "#ffffff",
  modalBorder: isDark ? "#2a2a2a" : "#e6e6e6",

  // Text
  textPrimary: isDark ? "#ffffff" : "#141414",
  textSecondary: isDark ? "#cfcfcf" : "#404040",

  // Inputs
  inputBg: isDark ? "#232323" : "#f5f5f5",
  inputBorder: isDark ? "#333333" : "#d0d0d0",
  placeholder: isDark ? "#9ca3af" : "#6b7280",

  // List rows
  rowHover: isDark ? "#232323" : "#f5f5f5",
  rowSelected: isDark ? "#232323" : "#eaeaea",
  divider: isDark ? "#232323" : "#e6e6e6",

  // Buttons
  buttonBg: isDark ? "#232323" : "#f5f5f5",
  buttonText: isDark ? "#e5e5e5" : "#141414",
  buttonHoverBg: isDark ? "#2c2c2c" : "#ebebeb",
  buttonBorder: isDark ? "#4b5563" : "#d1d5db",

  // Primary action
  primaryBg: isDark ? "#6c2bd7" : "#5b21b6",
  primaryHoverBg: isDark ? "#4b1fa3" : "#4c1d95",
  primaryText: "#ffffff",

  // Playback button
  pillBg: isDark ? "#2a2a2a" : "#efefef",
  pillText: isDark ? "#d1d5db" : "#374151",

  // Waveform
  waveformProgress: isDark ? "#6c2bd7" : "#5b21b6",
  waveformBase: isDark ? "#444444" : "#bdbdbd",
});

const OpenProjectModal = ({ open, onClose, onSelect }) => {

  const dispatch = useDispatch();
  const { allmusic, loading } = useSelector((state) => state.music);

  const { isDark } = useTheme();
  const colors = getOpenProjectColors(isDark);

  const [search, setSearch] = useState("");
  const [excludeUntitled, setExcludeUntitled] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // 🔑 sorting state

  const musicAudioRefs = useRef([]);
  const canvasRefs = useRef([]);
  const [playingMusicId, setPlayingMusicId] = useState(null);
  const [musicProgress, setMusicProgress] = useState({});


  const handlePlayPause = (project, idx) => {
    const audioRef = musicAudioRefs.current[idx];
    if (!audioRef) return;  

    setSelectedProject(idx); // Enable Open button when play is clicked

    if (playingMusicId === project._id) {
      audioRef.pause();
      setPlayingMusicId(null);
    } else {
      // pause all others
      musicAudioRefs.current.forEach((ref, i) => {
        if (i !== idx && ref) {
          ref.pause();
        }
      });
      let p = audioRef.play();
      if (p !== undefined) {
        p.catch(err => console.warn("Play failed:", err));
      }
      setPlayingMusicId(project._id);
    }
    // Force waveform redraw after play/pause
    drawWaveform(project._id, idx);
  };

const handleCanvasClick = (e, musicId, idx) => {
  const audioRef = musicAudioRefs.current[idx];
  const canvas = canvasRefs.current[idx];
  if (!audioRef || !canvas) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickProgress = clickX / canvas.width;

  // 🟣 Debug log
  console.log("Canvas click:", clickProgress, "Audio duration:", audioRef.duration);

  // Prevent error if duration is not loaded or invalid
  if (!isFinite(audioRef.duration) || audioRef.duration <= 0) {
    console.warn("Audio duration is not loaded or invalid.");
    return;
  }

  // Seek to position
  audioRef.currentTime = clickProgress * audioRef.duration;
  setMusicProgress((prev) => ({
    ...prev,
    [musicId]: clickProgress,
  }));

  // Toggle play/pause on waveform click
  if (!audioRef.paused) {
    audioRef.pause();
    setPlayingMusicId(null);
  } else {
    let p = audioRef.play();
    if (p !== undefined) {
      p.catch(err => console.warn("Play failed:", err));
    }
    setPlayingMusicId(musicId);
  }
};


// draw waveform bars (static but with progress color)
const drawWaveform = useCallback((musicId, idx) => {
  const canvas = canvasRefs.current[idx];
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const barCount = 60;
  const barWidth = 3;
  const spacing = 2;
  let progress = musicProgress[musicId] || 0;

  // If audio is finished, reset waveform color
  if (progress >= 1) {
    progress = 0;
  }

  for (let i = 0; i < barCount; i++) {
    const barHeight = 8 + (i % 12) * 2;
    const x = i * (barWidth + spacing);
    const y = (height - barHeight) / 2;
    const progressPoint = progress * barCount;
    ctx.fillStyle = i < progressPoint ? colors.waveformProgress : colors.waveformBase;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
}, [musicProgress, colors]);

  useEffect(() => {
    if (open) {
      dispatch(getAllMusic());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) {
      setSelectedProject(null);
      setSearch("");
      setSortOrder("desc");
      setPlayingMusicId(null);
    }
  }, [open]);

  // let filteredProjects = allmusic.filter(
  //   (p) =>
  //     (!excludeUntitled || !p.name?.toLowerCase().includes("untitled")) &&
  //     p.name?.toLowerCase().includes(search.toLowerCase())
  // );

  let filteredProjects = allmusic.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const isUntitled = name.includes("untitled");

    if (excludeUntitled && isUntitled) {
      return false; // hide untitled if toggle ON
    }
    return matchSearch;
  });

  // Always sort before paginating
  filteredProjects = [...filteredProjects].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.lastModified || 0);
    const dateB = new Date(b.updatedAt || b.lastModified || 0);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    filteredProjects.forEach((p, idx) => {
      const canvas = canvasRefs.current[idx];
      if (canvas) {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = 48;
        drawWaveform(p._id, idx);
      }
      // drawWaveform(p._id, idx);
    });
  }, [filteredProjects, drawWaveform, musicProgress]);

  useEffect(() => {
    filteredProjects.forEach((p, idx) => {
      const audioRef = musicAudioRefs.current[idx];
      if (!audioRef) return;

      const onTimeUpdate = () => {
        if (audioRef.duration > 0) {
          const progress = audioRef.currentTime / audioRef.duration;
          setMusicProgress(prev => ({
            ...prev,
            [p._id]: progress,
          }));
          drawWaveform(p._id, idx);
        }
      };

      audioRef.addEventListener("timeupdate", onTimeUpdate);

      return () => {
        audioRef.removeEventListener("timeupdate", onTimeUpdate);
      };
    });
  }, [filteredProjects, drawWaveform]);

  const isOpenDisabled = selectedProject === null || filteredProjects.length === 0;

  // Handle Open button click
  const handleOpen = () => {
    if (selectedProject !== null && filteredProjects[selectedProject]) {
      onSelect?.(filteredProjects[selectedProject]); // 🔑 parent ne data pass karo
      onClose();
    }
  };

  return (
    <div>
      {open && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center"
          style={{ backgroundColor: colors.overlayBg }}
          onClick={onClose}
        >
          <div
            className="rounded-xl shadow-2xl w-full max-w-2xl p-6 relative"
            style={{ backgroundColor: colors.modalBg, border: `1px solid ${colors.modalBorder}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-5 text-2xl font-bold"
              style={{ color: colors.textSecondary }}
              onClick={onClose}
            >
              &times;
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mt-2 mb-4">
              <h2 className="font-bold text-2xl mb-1 ml-10" style={{ color: colors.textPrimary }}>
                Open project
              </h2>
              <input
                type="text"
                placeholder="Search projects"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 w-56 mr-8 rounded border focus:outline-none"
                style={{ backgroundColor: colors.inputBg, color: colors.textPrimary, borderColor: colors.inputBorder }}
              />
            </div>

            {/* Exclude toggle */}
            <div className="flex items-center gap-2 mb-3">
              <label className="flex items-center gap-3 text-sm ml-10" style={{ color: colors.textSecondary }}>
                <span className="relative inline-block w-10 h-5">
                  <input
                    type="checkbox"
                    checked={excludeUntitled}
                    onChange={() => {
                      setExcludeUntitled(!excludeUntitled);
                      setSelectedProject(null); // deselect on toggle
                    }}
                    className="sr-only peer"
                  />
                  <span className="absolute w-10 h-5 rounded-full transition-colors" style={{ backgroundColor: colors.inputBg }}></span>
                  <span
                    className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-gray-400 peer-checked:bg-white transition-transform duration-200 ${
                      excludeUntitled ? "translate-x-5" : ""
                    }`}
                  ></span>
                </span>
                Exclude untitled projects
              </label>
            </div>

            <hr className="my-1" style={{ borderColor: colors.divider }} />

            {/* Table Header */}
            <div className="flex justify-between px-6 py-1">
              <span className="text-md ml-36" style={{ color: colors.textSecondary }}>Project</span>
              <button
                type="button"
                className="text-md focus:outline-none"
                style={{ color: colors.textSecondary }}
                onClick={() =>
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
                }
              >
                Last Modified {sortOrder === "desc" ? "↓" : "↑"}
              </button>
            </div>

            <hr className="my-1" style={{ borderColor: colors.divider }} />

            {/* Projects list */}
            <div className="overflow-y-auto h-[320px]">
              {loading ? (
                <div className="text-center py-8" style={{ color: colors.textSecondary }}>Loading...</div>
              ) : filteredProjects.length === 0 ? (
                <div className="px-6 py-8 text-center" style={{ color: colors.textSecondary }}>
                  No projects found.
                </div>
              ) : (
                currentProjects.map((project, idx) => {
                  const audioUrl = project?.soundfile
                    ? `${IMAGE_URL}uploads/soundfile/${project.soundfile}`
                    : project?.url?.startsWith("http")
                      ? project.url
                      : project?.url
                        ? `${IMAGE_URL}${project.url}`
                        : null;

                  // Calculate the absolute index for selectedProject
                  const absIdx = indexOfFirst + idx;

                  return (
                    <div
                      key={project._id}
                      className={`flex justify-between items-center px-6 py-4 border-b cursor-pointer`}
                      style={{ 
                        borderColor: colors.divider,
                        backgroundColor: selectedProject === absIdx ? colors.rowSelected : "transparent",
                        color: colors.textSecondary
                      }}
                      onClick={() => setSelectedProject(absIdx)}
                    >
                      {/* Left */}
                      <div className="flex items-center gap-4">
                        {audioUrl ? (
                          <audio
                            ref={(el) => (musicAudioRefs.current[absIdx] = el)}
                            src={audioUrl}
                            preload="metadata"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.target.style.display = "none";
                              const parent = e.target.parentElement;
                            }}
                            onEnded={() => {
                              setPlayingMusicId(null);
                              setMusicProgress(prev => ({
                                ...prev,
                                [project._id]: 1,
                              }));
                              drawWaveform(project._id, absIdx);
                            }}
                          />
                        ) : (
                          <span className="text-red-400 text-xs">⚠ No audio found</span>
                        )}

                        <button
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.pillBg }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause(project, absIdx);
                          }}
                        >
                          <span className="text-lg" style={{ color: colors.pillText }}>
                            {playingMusicId === project._id ? "⏸" : "▶"}
                          </span>
                        </button>
                        <div>
                          <span className="text-sm" style={{ color: colors.textPrimary }}>
                            {project.name}
                          </span>
                          <span className="text-xs block" style={{ color: colors.textSecondary }}>
                            {project.fileName}
                          </span>
                          <canvas
                            ref={(el) => (canvasRefs.current[absIdx] = el)}
                            className="w-44 h-12 cursor-pointer"
                            onClick={(e) =>
                              handleCanvasClick(e, project._id, absIdx)
                            }
                          />
                        </div>
                      </div>

                      {/* Right: Date */}
                      <span className="text-sm" style={{ color: colors.textSecondary }}>
                        {new Date(project.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <hr className="my-1" style={{ borderColor: colors.divider }} />

            {/* Footer */}
            <div className="flex items-center justify-between mt-8 mb-1">
              {/* <span className="text-gray-400 text-sm ml-6">
                Projects 1 - {filteredProjects.length} of{" "}
                {filteredProjects.length}
              </span> */}
              <span className="text-sm ml-6" style={{ color: colors.textSecondary }}>
                Project {currentPage} - {Math.min(indexOfLast, filteredProjects.length)} of {filteredProjects.length}
              </span>


              <div className="flex gap-2 mr-32">
                <button 
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: colors.buttonBg, color: colors.buttonText, border: `1px solid ${colors.buttonBorder}` }}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  &#60;
                </button>
                <button 
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: colors.buttonBg, color: colors.buttonText, border: `1px solid ${colors.buttonBorder}` }}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev < Math.ceil(filteredProjects.length / itemsPerPage)
                        ? prev + 1
                        : prev
                    )
                  }
                  disabled={currentPage === Math.ceil(filteredProjects.length / itemsPerPage)}
                >
                  &#62;
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  className="px-6 py-1 rounded-full"
                  style={{ backgroundColor: colors.buttonBg, color: colors.buttonText, border: `1px solid ${colors.buttonBorder}` }}
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpen}
                  className={`px-6 py-1 rounded-full text-white ${isOpenDisabled ? "opacity-50" : ""}`}
                  style={{ backgroundColor: isOpenDisabled ? colors.primaryBg : colors.primaryBg }}
                  disabled={isOpenDisabled}
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenProjectModal;