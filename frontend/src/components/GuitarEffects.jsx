import React, { useRef, useEffect, useState } from 'react'
import 'react-piano/dist/styles.css';
import { useSelector, useDispatch } from "react-redux";
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { setPianoNotes, setSelectedInstrument } from '../Redux/Slice/studio.slice';
import { setShowEffectsLibrary, addEffect, toggleEffectsOffcanvas } from '../Redux/Slice/effects.slice';
import { selectStudioState } from '../Redux/rootReducer';
import { ReactComponent as Track7 } from '../Images/track7.svg'
import PricingModel from './PricingModel';
import OpenInstrumentModal from './OpenInstrumentsModel';

function polarToCartesian(cx, cy, r, angle) {
  const a = (angle - 90) * Math.PI / 180.0;
  return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a)
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function Knob({ label = "Bite", min = -135, max = 135, defaultAngle, onChange }) {
  const [angle, setAngle] = useState(defaultAngle ?? min);
  const knobRef = useRef(null);
  const dragging = useRef(false);
  const lastY = useRef(0);

  const getResponsiveSize = () => {
      if (typeof window !== 'undefined') {
          if (window.innerWidth >= 1440) return 56;
          if (window.innerWidth >= 1280) return 52;
          if (window.innerWidth >= 1024) return 48;
          if (window.innerWidth >= 768) return 44;
          if (window.innerWidth >= 640) return 40;
          return 30;
      }
      return 56;
  };

  const [size, setSize] = useState(getResponsiveSize());

  useEffect(() => {
      const handleResize = () => setSize(getResponsiveSize());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);


  const getResponsiveStroke = () => {
      if (typeof window !== 'undefined') {
          if (window.innerWidth >= 768) return 3;
          // if (window.innerWidth >= 640) return 40;
          return 2;
      }
      return 56;
  };

  const [stroke, setStroke] = useState(getResponsiveStroke());

  useEffect(() => {
      const handleResizeStroke = () => setStroke(getResponsiveStroke());
      window.addEventListener('resize', handleResizeStroke);
      return () => window.removeEventListener('resize', handleResizeStroke);
  }, []);

  useEffect(() => {
      if (defaultAngle !== undefined) {
          setAngle(defaultAngle);
      }
  }, [defaultAngle]);

  const radius = (size - stroke) / 2;
  const center = size / 2;
  const onMouseDown = (e) => {
      dragging.current = true;
      lastY.current = e.clientY;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
      if (!dragging.current) return;
      const deltaY = lastY.current - e.clientY;
      lastY.current = e.clientY;
      setAngle((prev) => {
          let next = prev + deltaY * 1.5;
          next = Math.max(min, Math.min(max, next));

          if (onChange) {
              onChange(next);
          }
          return next;
      });
  };

  const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
  };

  const arcStart = min;
  const valueAngle = angle;
  const fgArc = describeArc(center, center, radius, arcStart, valueAngle);

  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", }}>
          <div ref={knobRef} style={{ width: size, height: size, position: "relative", cursor: "pointer", }} onMouseDown={onMouseDown}>
              <svg width={size} height={size}>
                  <circle cx={center} cy={center} r={radius} stroke="#444" strokeWidth={stroke} fill="#1F1F1F" />
                  <path d={fgArc} stroke="#bbb" strokeWidth={stroke} fill="#1F1F1F" strokeLinecap="round" />
              </svg>
              <div className={`absolute top-1.5 left-1/2 w-0.5 h-2 md600:h-3 lg:h-4 bg-gray-400 rounded-sm -translate-x-1/2 origin-bottom`} style={{ transform: `translateX(-50%) rotate(${angle}deg)`, }} />
          </div>
          <div className='text-[8px] md600:text-[10px] md:text-[12px] 2xl:text-[14px] mt-1 items-center text-[#aaa]' style={{ fontFamily: "sans-serif" }}>{label}</div>
      </div>
  );
}

const INSTRUMENTS = [
  { id: 'violin', name: 'Violin', category: 'Strings' },
  { id: 'cello', name: 'Cello', category: 'Strings' },
  { id: 'viola', name: 'Viola', category: 'Strings' },
  { id: 'flute', name: 'Flute', category: 'Woodwinds' },
  { id: 'oboe', name: 'Oboe', category: 'Woodwinds' },
  { id: 'clarinet', name: 'Clarinet', category: 'Woodwinds' },
  { id: 'trumpet', name: 'Trumpet', category: 'Brass' },
  { id: 'french_horn', name: 'French Horn', category: 'Brass' },
  { id: 'trombone', name: 'Trombone', category: 'Brass' },
  { id: 'tuba', name: 'Tuba', category: 'Brass' },
  { id: 'timpani', name: 'Timpani', category: 'Percussion' },
  { id: 'harp', name: 'Harp', category: 'Strings' },
  { id: 'string_ensemble_1', name: 'String Ensemble', category: 'Ensemble' },
  { id: 'choir_aahs', name: 'Choir Aahs', category: 'Voice' },
  { id: 'orchestral_harp', name: 'Orchestral Harp', category: 'Strings' },
  { id: 'contrabass', name: 'Contrabass', category: 'Strings' },
  { id: 'bassoon', name: 'Bassoon', category: 'Woodwinds' },
  { id: 'piccolo', name: 'Piccolo', category: 'Woodwinds' }
];

const GuitarEffects = ({onClose}) => {

  const dispatch = useDispatch();
    const [showOffcanvas1, setShowOffcanvas1] = useState(true);
    const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState(0);
    const [volume, setVolume] = useState(90);
    const [reverb, setReverb] = useState(-90);
    const [pan, setPan] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const [pricingModalOpen, setPricingModalOpen] = useState(false);

    // Get the selected instrument from Redux  
    const selectedInstrumentFromRedux = useSelector((state) => 
        selectStudioState(state)?.selectedInstrument || 'violin'
    );

    useEffect(() => {
        const index = INSTRUMENTS.findIndex(inst => inst.id === selectedInstrumentFromRedux);
        if (index !== -1) {
            setCurrentInstrumentIndex(index);
        }
    }, []);

    // const audioContextRef = useRef(null);
    const panNodeRef = useRef(null);
    const reverbGainNodeRef = useRef(null);
    const dryGainNodeRef = useRef(null);
    const convolverNodeRef = useRef(null);
    const selectedInstrument = INSTRUMENTS[currentInstrumentIndex].id;

    // Update Redux when local instrument changes
    useEffect(() => {
        if (selectedInstrument !== selectedInstrumentFromRedux) {
            dispatch(setSelectedInstrument(selectedInstrument));
        }
    }, [selectedInstrument, selectedInstrumentFromRedux, dispatch]);

    const getIsRecording = useSelector((state) => selectStudioState(state).isRecording);
    const currentTrackId = useSelector((state) => selectStudioState(state).currentTrackId);    
    const existingPianoNotes = useSelector((state) => selectStudioState(state).pianoNotes || []);

    const createImpulseResponse = (audioContext, duration, decay, reverse = false) => {
        const length = audioContext.sampleRate * duration;
        const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = reverse ? length - i : i;
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        }
        return impulse;
    };

    const audioContextRef = useRef(null);

    useEffect(() => {
        if (reverbGainNodeRef.current && dryGainNodeRef.current && convolverNodeRef.current && audioContextRef.current) {
            const reverbAmount = (reverb + 135) / 270;

            const wetLevel = reverbAmount * 0.6;
            reverbGainNodeRef.current.gain.setValueAtTime(wetLevel, audioContextRef.current.currentTime);

            const dryLevel = Math.max(0.3, 1 - (reverbAmount * 0.4));
            dryGainNodeRef.current.gain.setValueAtTime(dryLevel, audioContextRef.current.currentTime);

            if (reverbAmount > 0.1) {
                const roomSize = 1 + (reverbAmount * 3);
                const decay = 1.5 + (reverbAmount * 2);

                const newImpulse = createImpulseResponse(audioContextRef.current, roomSize, decay);
                convolverNodeRef.current.buffer = newImpulse;
            }
        }
    }, [reverb]);

    useEffect(() => {
        if (panNodeRef.current) {
            const panValue = pan / 135;
            const clampedPanValue = Math.max(-1, Math.min(1, panValue));
            panNodeRef.current.pan.value = clampedPanValue;
        }
    }, [pan]);

    const nextInstrument = () => {
        const newIndex = currentInstrumentIndex === INSTRUMENTS.length - 1 ? 0 : currentInstrumentIndex + 1;
        setCurrentInstrumentIndex(newIndex);
        // Dispatch the selected instrument to Redux so PianoRolls can sync
        const newInstrument = INSTRUMENTS[newIndex].id;
        dispatch(setSelectedInstrument(newInstrument));
    };

    const prevInstrument = () => {
        const newIndex = currentInstrumentIndex === 0 ? INSTRUMENTS.length - 1 : currentInstrumentIndex - 1;
        setCurrentInstrumentIndex(newIndex);
        // Dispatch the selected instrument to Redux so PianoRolls can sync
        const newInstrument = INSTRUMENTS[newIndex].id;
        dispatch(setSelectedInstrument(newInstrument));
    };

    useEffect(() => {
        if (getIsRecording) return;
        if (!Array.isArray(existingPianoNotes) || existingPianoNotes.length === 0) return;

        const needsUpdate = existingPianoNotes.some(
            (n) => (n.trackId === (currentTrackId || null)) && n.instrumentId !== selectedInstrument
        );
        if (!needsUpdate) return;

        const updated = existingPianoNotes.map((n) =>
            n.trackId === (currentTrackId || null) ? { ...n, instrumentId: selectedInstrument } : n
        );
        dispatch(setPianoNotes(updated));
    }, [selectedInstrument, existingPianoNotes, currentTrackId, getIsRecording, dispatch]);

    // ****************** Chords *****************
    const [isProcessingDrop, setIsProcessingDrop] = useState(false);

    const { activeEffects, effectsLibrary } = useSelector((state) => state.effects);

    const handleAddEffectFromLibrary = (effect) => {

        if (isProcessingDrop) {
            console.log('Already processing a drop, skipping duplicate');
            return;
        }

        setIsProcessingDrop(true);
        dispatch(addEffect(effect));
        dispatch(setShowEffectsLibrary(false));

        setTimeout(() => {
            setIsProcessingDrop(false);
        }, 100);
    };

    const handlePlusButtonClick = () => {
        dispatch(toggleEffectsOffcanvas());
    };

    const [openInstrumentModal, setOpenInstrumentModal] = useState(false);

  return (
    <>
    {openInstrumentModal && (
        <OpenInstrumentModal onClose={() => setOpenInstrumentModal(false)} initialCategory={"Guitar"} initialSubCategory={"Jazz"} />
    )}
    {showOffcanvas1 === true && (
      <>
      <div className="fixed z-[10] w-full h-full transition-transform left-0 right-0 translate-y-full bottom-[330px] sm:bottom-[351px] md:bottom-[403px] lg:bottom-[437px] xl:bottom-[441px] 2xl:bottom-[467px] shadow-[0_-2px_11px_rgba(0,0,0,0.08)]" tabIndex="-1" aria-labelledby="drawer-swipe-label">
        <div className="border-b border-gray-300 dark:border-[#FFFFFF1A] h-full">
          <div className="bg-white dark:bg-[#1F1F1F] flex items-center p-1 pb-0 md600:px-2 md600:pt-2 lg:px-3 lg:pt-3">
            <div>
              <IoClose className='text-[14px] sm:text-[15px] md600:text-[16px] md:text-[16px] lg:text-[18px] 2xl:text-[20px] text-gray-600 dark:text-[#FFFFFF99] cursor-pointer' onClick={() => {
                setShowOffcanvas1(false);
                onClose && onClose();
              }} />
            </div>
          </div>
          <div className="bg-white dark:bg-[#1F1F1F] flex items-center justify-center pb-1 px-2 md600:px-2 gap-4 sm:gap-6 md600:gap-12 md:gap-16 lg:px-3 lg:gap-20 2xl:px-3 2xl:gap-24">
            <div className="bg-[#d1d1d1] dark:bg-[#353535] p-1 md600:p-2 lg:p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <button onClick={prevInstrument} className="text-gray-400 hover:text-white transition-colors p-1 md600:p-2">
                  <FaChevronLeft className='text-secondary-light dark:text-secondary-dark text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px]' />
                </button>
                <div className="flex items-center gap-1 md600:gap-2 px-1 md600:px-2 md:gap-3 w-[100px] sm:w-[150px] md600:w-[170px] md:w-[172px] lg:gap-4 lg:px-3 lg:w-[230px] 2xl:gap-5 flex-1 justify-start 2xl:px-4 2xl:w-[250px]"
                onClick={() => {
                    setOpenInstrumentModal(true);
                    // setGlide(135); // set glide to max visible position so it appears enabled
                }}
                >
                    <div className="text-white">
                        <Track7 className='text-secondary-light dark:text-secondary-dark text-[10px] sm:text-[12px] md600:text-[14px] md:txt-[16px] lg:text-[18px] 2xl:text-[20px]' />
                    </div>
                    <div className="">
                        <div className="text-secondary-light dark:text-secondary-dark fw-bolder text-[10px] sm:text-[12px] md600:text-[14px] md:txt-[16px] lg:text-[18px] 2xl:text-[16px]">
                            {INSTRUMENTS[currentInstrumentIndex].name}
                        </div>
                        <div className="text-secondary-light dark:text-secondary-dark text-[8px] sm:text-[10px] md600:text-[12px] lg:text-[14px]">
                            {INSTRUMENTS[currentInstrumentIndex].category}
                        </div>
                    </div>
                </div>
                <button onClick={nextInstrument} className="text-secondary-light/60 dark:text-secondary-dark/60 transition-colors p-1 lg:p-2">
                  <FaChevronRight className='text-secondary-light/60 dark:text-secondary-dark/60 text-[8px] md600:text-[10px] md:text-[12px] lg:text-[14px] 2xl:text-[16px] text-[#FFFFFF99]' />
                </button>
              </div>
            </div>
            <div className="flex space-x-1 md600:space-x-2 lg:space-x-4 2xl:space-x-6 items-center gap-1 md:gap-0">
                <div className="flex flex-col items-center">
                    <Knob label="Reverb" min={-135} max={135} defaultAngle={reverb} onChange={(value) => setReverb(value)} />
                </div>
                <div className="flex flex-col items-center">
                    <Knob label="Pan" min={-135} max={135} defaultAngle={pan} onChange={(value) => setPan(value)} />
                </div>
                <div className="flex flex-col items-center">
                    <Knob label="Volume" min={-135} max={135} defaultAngle={volume} onChange={(value) => setVolume(value)} />
                </div>
                <div onClick={() => setPricingModalOpen(true)} className="border rounded-lg border-secondary-light/10 dark:border-secondary-dark/10 ms-auto me-1 md600:me-2 lg:me-3 cursor-pointer">
                    <p className="text-secondary-light dark:text-secondary-dark text-[10px] md600:text-[10px] md:text-[12px] lg:text-[13px] px-2 md600:px-3 md:px-4 lg:px-5 2xl:px-6 py-1">Save Preset</p>
                </div>
            </div>
          </div>

          <div className={`w-full overflow-x-auto transition-all duration-200 ${isDragOver ? 'bg-[#409C9F] bg-opacity-10' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              setIsDragOver(true);
              console.log('Drag over Effects tab');
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsDragOver(false);
                console.log('Drag leave Effects tab');
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
              console.log('Drop on Effects tab');
              try {
                const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                console.log('Dropped effect data:', effectData);
                handleAddEffectFromLibrary(effectData);
              } catch (error) {
                console.error('Error parsing dropped effect data:', error);
              }
            }}
          >
            <div className="flex items-center p-2 min-w-max bg-white dark:bg-[#282828]">
              <div className="flex gap-2 sm:gap-4 min-w-max">
                {activeEffects.map((effect) => (
                  <div key={effect.instanceId} className="w-[150px] h-[205px] sm:w-[190px] sm:h-[235px] md600:w-[220px] md600:h-[250px] md:w-[185px] md:h-[250px] lg:w-[200px] lg:h-[270px] xl:w-[240px] xl:h-[270px] 2xl:w-[256px] 2xl:h-[290px] bg-gray-200 dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg text-black dark:text-white flex flex-col shrink-0">
                    <div className="flex-1 w-full flex items-center justify-center">
                      {effect.component ? (
                        <div className="w-full h-full flex items-center justify-center">
                          {React.createElement(effect.component)}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400 text-sm">No component available</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {activeEffects.length < effectsLibrary?.length && (
                  <div className="w-[150px] h-[205px] sm:w-[190px] sm:h-[235px] md600:w-[220px] md600:h-[250px] md:w-[185px] md:h-[250px] lg:w-[200px] lg:h-[270px] xl:w-[240px] xl:h-[270px] 2xl:w-[256px] 2xl:h-[290px] bg-gray-100 dark:bg-[#1a1a1a] rounded-xl flex flex-col items-center justify-center text-black dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors shrink-0 border-2 border-dashed border-gray-400 dark:border-gray-600"
                    onClick={handlePlusButtonClick}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                      e.currentTarget.style.borderColor = '#409C9F';
                      e.currentTarget.style.backgroundColor = '#2a2a2a';
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = '#6B7280';
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.borderColor = '#6B7280';
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                      try {
                          const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                          handleAddEffectFromLibrary(effectData);
                      } catch (error) {
                          console.error('Error parsing dropped effect data:', error);
                      }
                    }}
                  >
                    <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4">+</div>
                    <p className="text-center text-xs sm:text-sm leading-snug">Select From the<br />effects library</p>
                  </div>
                )}
                {Array.from({ length: 4 - activeEffects.length - 1 }, (_, index) => (
                  <div key={index} className="w-[150px] h-[205px] sm:w-[190px] sm:h-[235px] md600:w-[220px] md600:h-[250px] md:w-[185px] md:h-[250px] lg:w-[240px] lg:h-[270px] xl:w-[240px] xl:h-[270px] 2xl:w-[256px] 2xl:h-[290px] rounded-xl shrink-0 border-2 border-dashed bg-primary-light dark:bg-primary-dark 
                  border-gray-300 dark:border-gray-600 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; e.currentTarget.style.borderColor = '#409C9F'; e.currentTarget.style.backgroundColor = '#2a2a2a'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = '#4B5563'; e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.borderColor = '#4B5563';
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                      try {
                        const effectData = JSON.parse(e.dataTransfer.getData('application/json'));
                        handleAddEffectFromLibrary(effectData);
                      } catch (error) {
                        console.error('Error parsing dropped effect data:', error);
                      }
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    )}

    {/* Pricing Modal */}
    <PricingModel
        pricingModalOpen={pricingModalOpen}
        setPricingModalOpen={setPricingModalOpen}
      />
    </>
  );
};

export default GuitarEffects;