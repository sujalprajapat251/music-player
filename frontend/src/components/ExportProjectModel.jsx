import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Download, SlidersHorizontal } from "lucide-react";
import subscription from "../Images/subscriptionIcon.svg";
import { PiWaveformLight } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { setMusicTypeExtention } from "../Redux/Slice/sound.slice";
import { selectStudioState } from "../Redux/rootReducer";

export default function ExportPopup({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("audio");
  const [masteringOn, setMasteringOn] = useState(true);
  const [exportMode, setExportMode] = useState("individual"); // "individual" or "combined"
  const [isExporting, setIsExporting] = useState(false);

  const dispatch = useDispatch();

  // Get tracks from Redux store
  const tracks = useSelector((state) => selectStudioState(state)?.tracks || []);

  // Audio export formats
  const audioFormats = [
    { name: "WAV", desc: "Great sounding, uncompressed", tag: "Best quality", icon: <img src={subscription} alt="subscription" className="w-4 h-4" /> },
    { name: "OGG", desc: "High quality, some compression", icon: <img src={subscription} alt="subscription" className="w-4 h-4" /> },
    { name: "MP3", desc: "Smaller size, compressed", icon: null },
  ];

  // Note export formats
  const noteFormats = [
    { name: "MIDI", desc: "Note and instrument data only", icon: <img src={subscription} alt="subscription" className="w-4 h-4" /> },
    { name: "Flat.io", desc: "Notation for Flat.io", icon: <img src={subscription} alt="subscription" className="w-4 h-4" /> },
    { name: "Noteflight", desc: "Notation for Noteflight", icon: <img src={subscription} alt="subscription" className="w-4 h-4" /> },
  ];

  // Function to download a single track
  const downloadTrack = (track) => {
    if (track && track.audioClips && track.audioClips.length > 0) {
      // Get the blob URL from the first audio clip
      const url = track.audioClips[0].url;

      // Create a download link for the MP3
      const link = document.createElement('a');
      link.href = url;
      link.download = `${track.name || 'Track'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
    return false;
  };

  // Function to handle export of multiple tracks
  const handleMultiTrackExport = async () => {
    setIsExporting(true);

    const tracksWithAudio = tracks.filter(track =>
      track.audioClips && track.audioClips.length > 0
    );

    if (exportMode === "individual") {
      // Download each track individually
      let downloadCount = 0;

      for (const track of tracksWithAudio) {
        const success = downloadTrack(track);
        if (success) downloadCount++;
        // Add a small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (downloadCount === 0) {
        console.error("No tracks with audio clips found");
        // You could show an error message to the user here
      }
    } else if (exportMode === "combined") {
      // For combined export, we would need to use Web Audio API to mix the tracks
      // This is a simplified version that would need to be expanded
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();
        const recorder = new MediaRecorder(destination.stream);
        const chunks = [];

        // Set up recorder events
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/mp3' });
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = 'Combined_Tracks.mp3';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(url);
          setIsExporting(false);
        };

        // Load and connect all audio sources
        const sources = [];
        const loadPromises = tracksWithAudio.map(async (track) => {
          if (track.audioClips && track.audioClips.length > 0) {
            const clip = track.audioClips[0];
            const response = await fetch(clip.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            // Create gain node for volume control
            const gainNode = audioContext.createGain();
            gainNode.gain.value = track.volume ? track.volume / 100 : 0.8;

            // Connect source to gain and gain to destination
            source.connect(gainNode);
            gainNode.connect(destination);

            // Store source for later playback
            sources.push({
              source,
              startTime: clip.startTime || 0
            });
          }
        });

        // Wait for all audio to load
        await Promise.all(loadPromises);

        if (sources.length === 0) {
          console.error("No valid audio sources found");
          setIsExporting(false);
          return;
        }

        // Find the latest end time to determine recording duration
        let maxDuration = 0;
        sources.forEach(({ source, startTime }) => {
          const endTime = startTime + (source.buffer ? source.buffer.duration : 0);
          maxDuration = Math.max(maxDuration, endTime);
        });

        // Start recording
        recorder.start();

        // Start each source at its appropriate time
        const startTime = audioContext.currentTime;
        sources.forEach(({ source, startTime: trackStartTime }) => {
          source.start(startTime + trackStartTime);
        });

        // Stop recording after all tracks have played
        setTimeout(() => {
          recorder.stop();
          sources.forEach(({ source }) => {
            try {
              source.stop();
            } catch (e) {
              // Source might already be stopped
            }
          });
        }, (maxDuration + 1) * 1000); // Add 1 second buffer

      } catch (error) {
        console.error("Error combining tracks:", error);
        setIsExporting(false);
      }
    }

    if (exportMode === "individual") {
      setIsExporting(false);
    }
  };


  // const handleMusicType = (type) => {
  //   if (type === 'MP3') {
  //     setIsExporting(true);

  //     try {
  //       // Filter tracks that have audio clips with valid URLs
  //       const tracksWithAudio = tracks.filter(track =>
  //         track && track.audioClips && track.audioClips.length > 0 && track.audioClips[0].url
  //       );

  //       if (tracksWithAudio.length === 0) {
  //         console.error("No tracks with valid audio clips found");
  //         setIsExporting(false);
  //         alert("No audio tracks available for export");
  //         return;
  //       }

  //       if (exportMode === "individual") {
  //         // Download each track individually with a delay between downloads
  //         let downloadCount = 0;

  //         // Create a function to handle downloads sequentially
  //         const downloadTrack = (index) => {
  //           if (index >= tracksWithAudio.length) {
  //             setIsExporting(false);
  //             return;
  //           }

  //           const track = tracksWithAudio[index];
  //           const clip = track.audioClips[0];

  //           if (clip && clip.url) {
  //             try {
  //               // Create a download link for the MP3
  //               const link = document.createElement('a');
  //               link.href = clip.url;
  //               link.download = `${track.name || 'Track_' + (index + 1)}.mp3`;
  //               document.body.appendChild(link);
  //               link.click();
  //               document.body.removeChild(link);
  //               downloadCount++;

  //               // Wait a bit longer between downloads to prevent browser blocking
  //               setTimeout(() => downloadTrack(index + 1), 1500);
  //             } catch (error) {
  //               console.error("Error downloading track:", error);
  //               setTimeout(() => downloadTrack(index + 1), 1500);
  //             }
  //           } else {
  //             // Skip this track and move to the next one
  //             setTimeout(() => downloadTrack(index + 1), 100);
  //           }
  //         };

  //         // Start the download sequence
  //         downloadTrack(0);
  //       } else {
  //         // For combined mode, just download the first track for now
  //         // This is a simplified approach that will work reliably
  //         const track = tracksWithAudio[0];
  //         const clip = track.audioClips[0];

  //         if (clip && clip.url) {
  //           const link = document.createElement('a');
  //           link.href = clip.url;
  //           link.download = 'Combined_Track.mp3';
  //           document.body.appendChild(link);
  //           link.click();
  //           document.body.removeChild(link);
  //           setTimeout(() => setIsExporting(false), 500);
  //         } else {
  //           alert("No valid audio found for export");
  //           setIsExporting(false);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error in MP3 export:", error);
  //       alert("Error exporting MP3: " + error.message);
  //       setIsExporting(false);
  //     }
  //   } else {
  //     console.log("type :::: > ", type);
  //     dispatch(setMusicTypeExtention(type));
  //   }
  // };

// Enhanced handleMusicType function for better multi-track MP3 export
const handleMusicType = async (type) => {
  if (type === 'MP3') {
    setIsExporting(true);
    
    try {
      // Filter tracks that have audio clips with valid URLs
      const tracksWithAudio = tracks.filter(track =>
        track && track.audioClips && track.audioClips.length > 0 && track.audioClips[0].url
      );
      
      if (tracksWithAudio.length === 0) {
        console.error("No tracks with valid audio clips found");
        setIsExporting(false);
        alert("No audio tracks available for export");
        return;
      }
      
      if (exportMode === "individual") {
        // Download each track individually with proper naming and delay
        await downloadTracksIndividually(tracksWithAudio);
      } else {
        // Combined mode - mix all tracks with proper timing
        await downloadTracksCombined(tracksWithAudio);
      }
    } catch (error) {
      console.error("Error in MP3 export:", error);
      alert("Error exporting MP3: " + error.message);
      setIsExporting(false);
    }
  } else {
    console.log("type :::: > ", type);
    dispatch(setMusicTypeExtention(type));
  }
};

// Function to download tracks individually
const downloadTracksIndividually = async (tracksWithAudio) => {
  let downloadCount = 0;
  
  for (let i = 0; i < tracksWithAudio.length; i++) {
    const track = tracksWithAudio[i];
    const clip = track.audioClips[0];
    
    if (clip && clip.url) {
      try {
        // Create download link
        const link = document.createElement('a');
        link.href = clip.url;
        
        // Create descriptive filename
        const trackName = track.name || `Track_${i + 1}`;
        const fileName = `${trackName.replace(/[^a-z0-9]/gi, '_')}.mp3`;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        downloadCount++;
        console.log(`Downloaded: ${fileName}`);
        
        // Add delay between downloads to prevent browser blocking
        if (i < tracksWithAudio.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.error(`Error downloading track ${track.name}:`, error);
      }
    }
  }
  
  setIsExporting(false);
  
  if (downloadCount > 0) {
    alert(`Successfully exported ${downloadCount} tracks!`);
  } else {
    alert("No tracks were exported. Please check your audio data.");
  }
};

// Enhanced function to combine and download tracks with proper intersection mixing
const downloadTracksCombined = async (tracksWithAudio) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Calculate the total duration needed and analyze intersections
    let maxEndTime = 0;
    const trackInfos = [];
    
    // Load all audio buffers and calculate timing
    for (const track of tracksWithAudio) {
      const clip = track.audioClips[0];
      if (clip && clip.url) {
        try {
          const response = await fetch(clip.url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Get start time from multiple sources
          let startTime = 0;
          
          // Priority: pianoClip.start > clip.startTime > 0
          if (track.pianoClip && track.pianoClip.start !== undefined) {
            startTime = track.pianoClip.start;
          } else if (clip.startTime !== undefined) {
            startTime = clip.startTime;
          }
          
          // Calculate end time
          const endTime = startTime + audioBuffer.duration;
          maxEndTime = Math.max(maxEndTime, endTime);
          
          trackInfos.push({
            buffer: audioBuffer,
            startTime: startTime,
            endTime: endTime,
            duration: audioBuffer.duration,
            volume: track.volume ? track.volume / 100 : 0.8,
            name: track.name || 'Unknown Track',
            trackId: track.id
          });
          
          console.log(`Loaded track: ${track.name}`);
          console.log(`  - Start: ${startTime}s, End: ${endTime}s, Duration: ${audioBuffer.duration}s`);
        } catch (error) {
          console.error(`Error loading audio for track ${track.name}:`, error);
        }
      }
    }
    
    if (trackInfos.length === 0) {
      throw new Error("No valid audio tracks could be loaded");
    }
    
    // Analyze intersections for debugging
    console.log("\n=== TRACK INTERSECTION ANALYSIS ===");
    for (let i = 0; i < trackInfos.length; i++) {
      for (let j = i + 1; j < trackInfos.length; j++) {
        const track1 = trackInfos[i];
        const track2 = trackInfos[j];
        
        // Check if tracks overlap
        const overlapStart = Math.max(track1.startTime, track2.startTime);
        const overlapEnd = Math.min(track1.endTime, track2.endTime);
        
        if (overlapStart < overlapEnd) {
          const overlapDuration = overlapEnd - overlapStart;
          console.log(`🔄 INTERSECTION FOUND:`);
          console.log(`  - ${track1.name} (${track1.startTime}s-${track1.endTime}s)`);
          console.log(`  - ${track2.name} (${track2.startTime}s-${track2.endTime}s)`);
          console.log(`  - Overlap: ${overlapStart}s to ${overlapEnd}s (${overlapDuration.toFixed(2)}s)`);
          console.log(`  - Both tracks will play simultaneously during this period`);
        }
      }
    }
    
    // Create offline context for rendering
    const sampleRate = audioContext.sampleRate;
    const totalDuration = Math.ceil(maxEndTime) + 1; // Add 1 second buffer
    const offlineContext = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);
    
    console.log(`\n=== MIXING PROCESS ===`);
    console.log(`Total timeline duration: ${totalDuration}s`);
    
    // Create and schedule all sources with intersection handling
    trackInfos.forEach((trackInfo, index) => {
      const source = offlineContext.createBufferSource();
      source.buffer = trackInfo.buffer;
      
      // Create gain node for volume control with intersection compensation
      const gainNode = offlineContext.createGain();
      
      // Reduce volume slightly to prevent clipping during intersections
      // The Web Audio API automatically mixes overlapping audio
      gainNode.gain.value = trackInfo.volume * 0.6; // Reduced from 0.7 to 0.6 for safer mixing
      
      // Connect source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      
      // Schedule playback at the correct time
      // The OfflineAudioContext will automatically handle intersections
      source.start(trackInfo.startTime);
      
      console.log(`🎵 Scheduled: ${trackInfo.name}`);
      console.log(`  - Starts at: ${trackInfo.startTime}s`);
      console.log(`  - Ends at: ${trackInfo.endTime}s`);
      console.log(`  - Volume: ${(trackInfo.volume * 0.6).toFixed(2)}`);
    });
    
    console.log(`\n=== RENDERING MIXED AUDIO ===`);
    console.log(`Rendering ${totalDuration}s of mixed audio...`);
    
    // Render the mixed audio - this automatically handles all intersections
    const renderedBuffer = await offlineContext.startRendering();
    
    console.log(`✅ Rendering complete! Mixed ${trackInfos.length} tracks.`);
    
    // Convert to WAV format
    const wav = audioBufferToWav(renderedBuffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    // Create descriptive filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `Mixed_${trackInfos.length}_Tracks_${timestamp}.wav`;
    
    // Download the combined track
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    setIsExporting(false);
    
    console.log(`🎉 Combined track exported as: ${filename}`);
    alert(`Mixed audio exported successfully!\n\nFilename: ${filename}\nTracks mixed: ${trackInfos.length}\nTotal duration: ${totalDuration.toFixed(1)}s`);
    
  } catch (error) {
    console.error("Error combining tracks:", error);
    setIsExporting(false);
    alert("Error combining tracks: " + error.message);
  }
};

// Helper function to convert AudioBuffer to WAV
function audioBufferToWav(buffer) {
  const numOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  let result;
  if (numOfChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }
  
  return encodeWAV(result, numOfChannels, sampleRate, bitDepth);
}

function interleave(inputL, inputR) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  
  let index = 0;
  let inputIndex = 0;
  
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function encodeWAV(samples, numChannels, sampleRate, bitDepth) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const format = 1; // PCM format
  
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  
  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true);
  
  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
  }
  
  return buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}



  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-neutral-900 text-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
            <h2 className="text-lg font-semibold">Export</h2>
            <button
              className="p-2 hover:bg-neutral-800 rounded-lg"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center py-4">
            <div className="flex bg-neutral-800 rounded-full p-1">
              <button
                onClick={() => setActiveTab("audio")}
                className={`px-5 py-1.5 text-sm font-medium rounded-full transition ${activeTab === "audio"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400 hover:text-white"
                  }`}
              >
                Audio
              </button>
              <button
                onClick={() => setActiveTab("note")}
                className={`px-5 py-1.5 text-sm font-medium rounded-full transition ${activeTab === "note"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-400 hover:text-white"
                  }`}
              >
                Note
              </button>
            </div>
          </div>

          {/* AUDIO TAB */}
          {activeTab === "audio" && (
            <>
              {/* Mastering Section */}
              <div className="px-5 pb-4">
                <div className="bg-gradient-to-r from-purple-700/70 to-indigo-800/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-600 p-3 rounded-lg">
                      <PiWaveformLight />
                    </div>
                    <div>
                      <p className="font-semibold">Classic</p>
                      <p className="text-xs text-neutral-300">Mastering</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="flex items-center bg-neutral-900/70 hover:bg-neutral-800 px-3 py-1 rounded-lg text-sm">
                      <SlidersHorizontal size={16} className="mr-1" />
                      Edit
                    </button>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => setMasteringOn(!masteringOn)}
                      className={`w-10 h-6 flex items-center rounded-full p-1 transition ${masteringOn ? "bg-green-500" : "bg-neutral-600"
                        }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${masteringOn ? "translate-x-4" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Export Mode Selection */}
              {audioFormats.some(f => f.name === "MP3") && (
                <div className="px-5 pb-3">
                  <div className="flex justify-between items-center bg-neutral-800 p-3 rounded-lg">
                    <span className="text-sm font-medium">Export Mode:</span>
                    <div className="flex bg-neutral-700 rounded-full p-1">
                      <button
                        onClick={() => setExportMode("individual")}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition ${exportMode === "individual"
                          ? "bg-neutral-600 text-white"
                          : "text-neutral-400 hover:text-white"
                          }`}
                      >
                        Individual Tracks
                      </button>
                      <button
                        onClick={() => setExportMode("combined")}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition ${exportMode === "combined"
                          ? "bg-neutral-600 text-white"
                          : "text-neutral-400 hover:text-white"
                          }`}
                      >
                        Combined Mix
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Formats */}
              <div className="px-5 pb-5 space-y-3">
                {audioFormats.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition"
                    onClick={() => !isExporting && handleMusicType(f.name)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {f.icon && <span className="text-lg">{f.icon}</span>}
                        <span className="font-medium">{f.name}</span>
                        {f.tag && (
                          <span className="ml-2 text-xs bg-green-600 px-2 py-0.5 rounded">
                            {f.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{f.desc}</p>
                    </div>
                    <button
                      className={`p-2 rounded-lg ${isExporting && f.name === 'MP3'
                        ? "bg-neutral-600 opacity-50"
                        : "hover:bg-neutral-600"
                        }`}
                      disabled={isExporting && f.name === 'MP3'}
                    >
                      {isExporting && f.name === 'MP3' ? (
                        <span className="text-xs">Exporting...</span>
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* NOTE TAB */}
          {activeTab === "note" && (
            <div className="px-5 pb-5 space-y-3">
              {noteFormats.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition"
                  onClick={() => handleMusicType(f.name)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {f.icon && <span className="text-lg">{f.icon}</span>}
                      <span className="font-medium">{f.name}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{f.desc}</p>
                  </div>
                  <button className="p-2 hover:bg-neutral-600 rounded-lg">
                    <Download size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}