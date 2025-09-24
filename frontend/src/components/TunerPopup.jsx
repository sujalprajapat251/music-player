import React from "react";
import tunerPath from "../Images/tuner-path.png";
import { IoMdClose } from "react-icons/io";

const TunerPopup = ({ onClose }) => {
    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                {/* Popup Box */}
                <div className="bg-[#525056] rounded-lg shadow-lg p-6 w-full max-w-md">
                    {/* Close Button */}
                    <div className="text-end">
                        <button onClick={onClose} className="">
                            <IoMdClose />
                        </button>
                    </div>

                    {/* Title */}
                    <h2 className="text-center text-lg font-semibold mb-6 text-white">
                        Tuner
                    </h2>

                    {/* Bars (visual tuner indicator placeholder) */}
                    <div className="flex justify-center items-center mb-6">
                        <img src={tunerPath} alt="" className='' />
                    </div>

                    {/* Message */}
                    <p className="text-center text-gray-300">Start playing</p>
                </div>
            </div>
        </>
    );
};

export default TunerPopup;