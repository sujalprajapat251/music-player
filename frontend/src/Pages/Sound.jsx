import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAllSound } from '../Redux/Slice/sound.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import play from '../Images/play.svg';
import pause from '../Images/pause.svg'; 


const Sound = () => {
    const dispatch = useDispatch();
    const sounds = useSelector((state) => state.sound.allsounds)
    const audioRefs = useRef([]);
    const [playingIndex, setPlayingIndex] = useState(null); 

    useEffect(() => {
        dispatch(getAllSound());
    }, [dispatch])

    const handlePlayPause = (index) => {
        debugger
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


    return (
        <div className="min-h-screen bg-[#141414] p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-6">
                {sounds.map((sound, index) => (
                    <div key={sound._id || index} className="bg-[#14141480] rounded-[4px] overflow-hidden d_customborder">
                        <div className='w-full h-[160px]'>
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
                {sounds.map((sound, index) => (
                    <div key={sound._id || index} className="bg-[#14141480] rounded-[4px] overflow-hidden d_customborder">
                        <div className='w-full h-[160px]'>
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
    )
}

export default Sound