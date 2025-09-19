import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import p1 from "../Images/p1.svg";
import p2 from "../Images/p2.svg";
import p3 from "../Images/p3.svg";
import Tabs from "./Tabs";

const PricingModel = ({ pricingModalOpen, setPricingModalOpen }) => {
  const [plan, setPlan] = useState("yearly");

  return (
    <Dialog
      open={pricingModalOpen}
      onClose={setPricingModalOpen}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed backdrop-blur-sm inset-0 bg-black/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden p-7 rounded-[8px] bg-[#1F1F1F] text-left shadow-xl w-[1000px] max-w-full transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8"
          >
            {/* Close Icon Button */}
            <button
              onClick={() => setPricingModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="price-heading text-center mb-3">
              <p className="text-[#FFFFFF] text-[32px] font-bold">
                Our Pricing Plans
              </p>
            </div>
            <div className="price-navs">
              <Tabs
                tabs={[
                  {
                    label: "Monthly",
                    content: (
                      <>
                        {/*  Monthly pricing cards start -------------------------------------------------------------- */}
                        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 w-full">
                          <div className="basis-0 flex-1 w-full max-w-full p-2 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105 hover:border-white hover:bg-white/10">
                            <div className="main-price-month">
                              <span className="text-[#FFFFFF] text-[24px] font-semibold">
                                $15
                              </span>{" "}
                              <span className="text-[#FFFFFF]">/month</span>
                              <ul className="text-[#FFFFFF] flex flex-col">
                                <li>10,000+ loops</li>
                                <li>200 instruments</li>
                                <li>50 effects</li>
                                <li>Advanced vocal tools</li>
                              </ul>
                            </div>
                          </div>
                          <div className="basis-0 flex-1 w-full max-w-full p-2 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105 hover:border-white hover:bg-white/10">
                            <div className="main-price-month">
                              <span className="text-[#FFFFFF] text-[24px] font-semibold">
                                $9
                              </span>{" "}
                              <span className="text-[#FFFFFF]">/month</span>
                              <ul className="text-[#FFFFFF] flex flex-col">
                                <li>7,000+ loops</li>
                                <li>150 instruments</li>
                                <li>30 effects</li>
                                <li>Basic vocal tools</li>
                              </ul>
                            </div>
                          </div>
                          <div className="basis-0 flex-1 w-full max-w-full p-2 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105 hover:border-white hover:bg-white/10">
                            <div className="main-price-month">
                              <span className="text-[#FFFFFF] text-[24px] font-semibold">
                                $15
                              </span>{" "}
                              <span className="text-[#FFFFFF]">/month</span>
                              <ul className="text-[#FFFFFF] flex flex-col">
                                <li>10,000+ loops</li>
                                <li>200 instruments</li>
                                <li>50 effects</li>
                                <li>Advanced vocal tools</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mt-7 w-full">
                          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 w-full">
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center">
                                <img src={p1} alt="" />
                              </div>
                              <div className="p1-contant text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-2">41K+</p>
                                <p className="text-[20px]">loops/one-shots</p>
                                <p className="text-[12px] text-[#FFFFFF99]">
                                  (everything)
                                </p>
                              </div>
                              <div className="main-price-month mt-2 text-[#FFFFFF99] text-[14px]">
                                <ul>
                                  <li>50+ effects</li>
                                  <li>Realtime vocal tuning</li>
                                  <li>Vocal tuning</li>
                                  <li>Vocal cleanup</li>
                                  <li>808 instrument (with glide)</li>
                                </ul>
                              </div>
                            </div>
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center">
                                <img src={p2} alt="" />
                              </div>
                              <div className="p1-contant text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-2">1250+</p>
                                <p className="text-[20px]">Music Production</p>
                                <p className="text-[12px] text-[#FFFFFF99]">
                                  (everything)
                                </p>
                              </div>
                              <div className="main-price-month mt-2 text-[#FFFFFF99] text-[14px]">
                                <ul>
                                  <li>Chords</li>
                                  <li>Realtime vocal tuning</li>
                                  <li>Save presets and loops </li>
                                  <li>150k+ Sound Effects freesound</li>
                                  <li>Automation</li>
                                </ul>
                              </div>
                            </div>
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center">
                                <img src={p3} alt="" />
                              </div>
                              <div className="p1-contant text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-2">41K+</p>
                                <p className="text-[20px]">loops/one-shots</p>
                                <p className="text-[12px] text-[#FFFFFF99]">
                                  (everything)
                                </p>
                              </div>
                              <div className="main-price-month mt-2 text-[#FFFFFF99] text-[14px]">
                                <ul>
                                  <li>Sampler</li>
                                  <li>Priority mixing</li>
                                  <li>High quality downloads</li>
                                  <li>8 mastering styles</li>
                                  <li>Multi-speaker transcription (8h)</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ),
                  },
                  {
                    label: "Yearly",
                    content: (
                      <>
                        {/* Yearly pricing cards start -------------------------------------------------------------- */}
                        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 w-full">
                          <div className="basis-0 flex-1 w-full max-w-full p-1 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105 hover:border-white hover:bg-white/10">
                            <div className="text-center">
                              <span className="text-[#FFFFFF] text-[12px] lg:text-[26px] font-semibold">
                                $144.79
                              </span>{" "}
                              <span className="text-[#FFFFFF]">/year</span>
                              <p className="text-[#FFFFFF]">
                                Production & Vocals
                              </p>
                              <div className="price-year text-[#FFFFFF99] text-center mt-1">
                                <p>US $144.79/month (US$177.48/year)</p>
                                <p className="break-words w-full lg:w-60  mt-1">
                                  A full suite to help you create professional
                                  sounding music
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="basis-0 flex-1 w-full max-w-full p-1 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105 hover:border-white hover:bg-white/10">
                            <div className="text-center">
                              <span className="text-[#FFFFFF] text-[12px] lg:text-[26px] font-semibold">
                                $144.79
                              </span>{" "}
                              <span className="text-[#FFFFFF]">/year</span>
                              <p className="text-[#FFFFFF]">
                                Production & Vocals
                              </p>
                              <div className="price-year text-[#FFFFFF99] text-center mt-1">
                                <p>US $144.79/month (US$177.48/year)</p>
                                <p className="break-words w-full lg:w-60 mx-auto mt-1">
                                  A full suite to help you create professional
                                  sounding music
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="basis-0 flex-1 w-full max-w-full p-1 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105 hover:border-white hover:bg-white/10">
                            <div className="text-center">
                              <span className="text-[#FFFFFF] text-[12px] lg:text-[26px] font-semibold">
                                $144.79
                              </span>{" "}
                              <span className="text-[#FFFFFF]">/year</span>
                              <p className="text-[#FFFFFF]">
                                Production & Vocals
                              </p>
                              <div className="price-year text-[#FFFFFF99] text-center mt-1">
                                <p>US $144.79/month (US$177.48/year)</p>
                                <p className="break-words w-full lg:w-60 mx-auto mt-1">
                                  A full suite to help you create professional
                                  sounding music
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-7 w-full">
                          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 w-full">
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center">
                                <img src={p1} alt="" />
                              </div>
                              <div className="p1-contant text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-2">41K+</p>
                                <p className="text-[20px]">loops/one-shots</p>
                                <p className="text-[12px] text-[#FFFFFF99]">
                                  (everything)
                                </p>
                              </div>
                              <div className="main-price-month mt-2 text-[#FFFFFF99] text-[14px]">
                                <ul>
                                  <li>50+ effects</li>
                                  <li>Realtime vocal tuning</li>
                                  <li>Vocal tuning</li>
                                  <li>Vocal cleanup</li>
                                  <li>808 instrument (with glide)</li>
                                </ul>
                              </div>
                            </div>
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center">
                                <img src={p2} alt="" />
                              </div>
                              <div className="p1-contant text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-2">1250+</p>
                                <p className="text-[20px]">Music Production</p>
                                <p className="text-[12px] text-[#FFFFFF99]">
                                  (everything)
                                </p>
                              </div>
                              <div className="main-price-month mt-2 text-[#FFFFFF99] text-[14px]">
                                <ul>
                                  <li>Chords</li>
                                  <li>Realtime vocal tuning</li>
                                  <li>Save presets and loops </li>
                                  <li>150k+ Sound Effects freesound</li>
                                  <li>Automation</li>
                                </ul>
                              </div>
                            </div>
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center">
                                <img src={p3} alt="" />
                              </div>
                              <div className="p1-contant text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-2">41K+</p>
                                <p className="text-[20px]">loops/one-shots</p>
                                <p className="text-[12px] text-[#FFFFFF99]">
                                  (everything)
                                </p>
                              </div>
                              <div className="main-price-month mt-2 text-[#FFFFFF99] text-[14px]">
                                <ul>
                                  <li>Sampler</li>
                                  <li>Priority mixing</li>
                                  <li>High quality downloads</li>
                                  <li>8 mastering styles</li>
                                  <li>Multi-speaker transcription (8h)</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ),
                  },
                ]}
              />
            </div>
            <div className="pri-next-btn text-center">
              <button className="bg-[#FFFFFF] cursor-pointer text-[#141414] py-[10px] px-[90px] md:px-[168px] rounded">
                Next
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default PricingModel;
