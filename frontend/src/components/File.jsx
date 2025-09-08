import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllMusic } from '../Redux/Slice/music.slice';
import { Link } from 'react-router-dom';
import WavEncoder from 'wav-encoder';

const File = () => {
    const dispatch = useDispatch();
    const music = useSelector((state) => state.music.allmusic);
    const [audioErrors, setAudioErrors] = useState({});
    const [previewUrls, setPreviewUrls] = useState({}); // per musicId -> blob url
    const allocatedUrlsRef = useRef(new Set()); // track all created to revoke on unmount

    useEffect(() => {
        dispatch(getAllMusic());
    }, [dispatch]);

    const handleAudioError = (musicId, error) => {
        console.error(`Audio error for ${musicId}:`, error);
        setAudioErrors(prev => ({
            ...prev,
            [musicId]: true
        }));
    };

    const handleAudioLoad = (musicId) => {
        setAudioErrors(prev => ({
            ...prev,
            [musicId]: false
        }));
    };

    // Function to recreate mixdown if blob URL is invalid or missing
    const recreateMixdown = async (musicData) => {
        try {
            // This should match your renderProjectMixdown function from handleSaved
            const clips = [];
            musicData.forEach(track => {
                (track.audioClips || []).forEach(clip => {
                    if (clip && clip.url) {
                        const trimStart = Number(clip.trimStart || 0);
                        const trimEnd = Number((clip.trimEnd != null ? clip.trimEnd : clip.duration) || clip.duration || 0);
                        const visible = Math.max(0, trimEnd - trimStart);
                        clips.push({
                            url: clip.url,
                            startTime: Number(clip.startTime || 0),
                            offset: trimStart,
                            duration: visible,
                            playbackRate: Number(clip.playbackRate || 1)
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

            const usable = decodedBuffers.filter(Boolean);

            // Fallback: if no decodable clips (likely old blob: URLs), synthesize from pianoNotes
            if (usable.length === 0) {
                // Try to render from stored pianoNotes
                const notes = [];
                (musicData || []).forEach(t => {
                    if (Array.isArray(t.pianoNotes)) {
                        notes.push(...t.pianoNotes);
                    }
                });

                if (notes.length === 0) {
                    return null; // nothing to render
                }

                // Sine wave synthesis similar to TopHeader.jsx
                const endTimes = notes.map(n => (n.startTime || 0) + (n.duration || 0.5));
                const renderDuration = Math.max(1, Math.max(...endTimes) + 0.25);
                const synthChannels = 1;
                const synthFrameCount = Math.ceil(renderDuration * sampleRate);
                const SynthCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
                const synthOffline = new SynthCtx(synthChannels, synthFrameCount, sampleRate);

                const master2 = synthOffline.createGain();
                master2.gain.setValueAtTime(0.8, 0);
                master2.connect(synthOffline.destination);

                const midiToFrequency = (midiNumber) => {
                    const m = Number(midiNumber);
                    if (!Number.isFinite(m)) return 440;
                    return 440 * Math.pow(2, (m - 69) / 12);
                };

                const applyEnv = (gainNode, start, duration) => {
                    const attack = Math.min(0.01, duration * 0.1);
                    const release = Math.min(0.05, duration * 0.2);
                    const sustainStart = start + attack;
                    const end = start + duration;
                    gainNode.gain.setValueAtTime(0.0, start);
                    gainNode.gain.linearRampToValueAtTime(0.9, sustainStart);
                    gainNode.gain.setValueAtTime(0.9, Math.max(sustainStart, start));
                    gainNode.gain.linearRampToValueAtTime(0.0, Math.max(end, end + release));
                };

                notes.forEach(n => {
                    const start = Math.max(0, Number(n.startTime) || 0);
                    const dur = Math.max(0.05, Number(n.duration) || 0.5);
                    const freq = midiToFrequency(n.midiNumber);
                    const osc = synthOffline.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, start);
                    const g = synthOffline.createGain();
                    applyEnv(g, start, dur);
                    osc.connect(g);
                    g.connect(master2);
                    osc.start(start);
                    osc.stop(start + dur + 0.1);
                });

                const buffer2 = await synthOffline.startRendering();
                const channelData2 = Array.from({ length: buffer2.numberOfChannels }, (_, i) => buffer2.getChannelData(i));
                const wavData2 = await WavEncoder.encode({ sampleRate: buffer2.sampleRate, channelData: channelData2 });
                const blob2 = new Blob([wavData2], { type: 'audio/wav' });
                const url2 = URL.createObjectURL(blob2);
                allocatedUrlsRef.current.add(url2);
                return { url: url2, duration: buffer2.duration };
            }

            usable.forEach(({ audioBuf, startTime, offset, duration, playbackRate }) => {
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
            
            // Assuming you have WavEncoder available
            const wavData = await WavEncoder.encode({ sampleRate: mixed.sampleRate, channelData });
            const blob = new Blob([wavData], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            allocatedUrlsRef.current.add(url);
            return { url, duration: mixed.duration };
        } catch (e) {
            console.error('Mixdown recreation failed:', e);
            return null;
        }
    };

    // Auto-create previews for items lacking a playable URL
    useEffect(() => {
        const generateMissingPreviews = async () => {
            if (!Array.isArray(music)) return;
            const tasks = music.map(async (mus) => {
                const id = mus?._id;
                if (!id) return;
                // If we already have a local preview URL and there was no error, skip
                if (previewUrls[id] && !audioErrors[id]) return;
                // Always prefer regenerating from stored project data
                const result = await recreateMixdown(mus.musicdata || []);
                if (result && result.url) {
                    // Revoke old url if present
                    if (previewUrls[id]) {
                        try { URL.revokeObjectURL(previewUrls[id]); } catch (_) {}
                        allocatedUrlsRef.current.delete(previewUrls[id]);
                    }
                    setPreviewUrls(prev => ({ ...prev, [id]: result.url }));
                    setAudioErrors(prev => ({ ...prev, [id]: false }));
                }
            });
            await Promise.all(tasks);
        };
        generateMissingPreviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [music]);

    // Cleanup: revoke all allocated URLs on unmount
    useEffect(() => {
        return () => {
            allocatedUrlsRef.current.forEach((u) => {
                try { URL.revokeObjectURL(u); } catch (_) {}
            });
            allocatedUrlsRef.current.clear();
        };
    }, []);

    return (
        <div className='bg-[green] p-4'>
            {music.map((mus) => (
                <div key={mus._id} className='mb-3 bg-white p-3 rounded'>
                    <Link 
                        to={`/sidebar/timeline/${mus._id}`}
                        className='text-blue-600 hover:underline font-medium'
                    >
                        {mus.name}
                    </Link>
                    
                    {/* Project mixdown preview with error handling */}
                    {previewUrls[mus._id] && !audioErrors[mus._id] ? (
                        <div className='mt-2'>
                            <audio 
                                controls 
                                src={previewUrls[mus._id]}
                                style={{ width: '100%' }}
                                onError={(e) => handleAudioError(mus._id, e)}
                                onLoadedData={() => handleAudioLoad(mus._id)}
                                preload="metadata"
                            />
                        </div>
                    ) : audioErrors[mus._id] ? (
                        <div className='mt-2'>
                            <div className='text-red-500 text-sm mb-2'>
                                Audio file unavailable (blob URL expired)
                            </div>
                            <button 
                                className='bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600'
                                onClick={async () => {
                                    const newMixdown = await recreateMixdown(mus.musicdata);
                                    if (newMixdown) {
                                        if (previewUrls[mus._id]) {
                                            try { URL.revokeObjectURL(previewUrls[mus._id]); } catch (_) {}
                                            allocatedUrlsRef.current.delete(previewUrls[mus._id]);
                                        }
                                        setPreviewUrls(prev => ({ ...prev, [mus._id]: newMixdown.url }));
                                        setAudioErrors(prev => ({ ...prev, [mus._id]: false }));
                                    }
                                }}
                            >
                                Recreate Audio
                            </button>
                        </div>
                    ) : (
                        <div className='mt-2 text-gray-500 text-sm'>
                            Preparing audio preview...
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default File;