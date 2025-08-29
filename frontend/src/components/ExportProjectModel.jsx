import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Download, SlidersHorizontal } from "lucide-react";
import subscription from "../Images/subscriptionIcon.svg";
import { PiWaveformLight } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { setMusicTypeExtention } from "../Redux/Slice/sound.slice";

export default function ExportPopup({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("audio");
  const [masteringOn, setMasteringOn] = useState(true);

  const dispatch = useDispatch();

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

  const handleMusicType = (type) => {
    console.log("type :::: > ", type)
    dispatch(setMusicTypeExtention(type))
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
                className={`px-5 py-1.5 text-sm font-medium rounded-full transition ${
                  activeTab === "audio"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Audio
              </button>
              <button
                onClick={() => setActiveTab("note")}
                className={`px-5 py-1.5 text-sm font-medium rounded-full transition ${
                  activeTab === "note"
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
                      className={`w-10 h-6 flex items-center rounded-full p-1 transition ${
                        masteringOn ? "bg-green-500" : "bg-neutral-600"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                          masteringOn ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Audio Formats */}
              <div className="px-5 pb-5 space-y-3">
                {audioFormats.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg hover:bg-neutral-700 transition"
                    onClick={() => handleMusicType(f.name)}
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
                    <button className="p-2 hover:bg-neutral-600 rounded-lg">
                      <Download size={20} />
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