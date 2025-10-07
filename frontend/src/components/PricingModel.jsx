import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import p1 from "../Images/p1.svg";
import p2 from "../Images/p2.svg";
import p3 from "../Images/p3.svg";
import Tabs from "./Tabs";
import OpenPayment from "./OpenPayment";

const PricingModel = ({ pricingModalOpen, setPricingModalOpen }) => {

  const [plan, setPlan] = useState("yearly");
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: "Professional", price: 15 },{ name: "Professional", price: 150 }); // NEW

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [country, setCountry] = useState("India");
  const [agree, setAgree] = useState(false);
  const [cardError, setCardError] = useState(false);

  const handleCardInput = (e) => {
    setCardNumber(e.target.value);
    setCardError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.length < 16) {
      setCardError(true);
      return;
    }
    alert("Payment submitted!");
    setOpenPayment(false);
    // Optionally reset form here
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenPayment(true);
    setPricingModalOpen(false);
  };

  return (
    <>
    <Dialog
      open={pricingModalOpen}
      onClose={setPricingModalOpen}
      className="relative z-[200]"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
          <DialogPanel
            transition
            className="relative z-[210] transform overflow-hidden p-6 rounded-[8px] bg-white dark:bg-primary-dark text-secondary-light dark:text-secondary-dark border border-neutral-200 dark:border-neutral-800 text-left shadow-xl w-[1020px] max-w-full transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 max-h-[89vh] mx-4 sm:overflow-y-auto xl:overflow-hidden"
            // className="relative transform overflow-hidden rounded-2xl bg-[#0F1115] shadow-2xl w-[1000px] max-w-full transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 p-10"
          >
            {/* Close Button */}
            <button
              onClick={() => setPricingModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:scale-110 transition-transform"
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

            {/* Heading */}
            <div className="text-center mb-8">
              <p className="text-secondary-light dark:text-secondary-dark text-3xl md:text-3xl font-bold tracking-wide">
                Our Pricing Plans
              </p>
            </div>

            {/* Tabs with Toggle */}
            <div className=" justify-center mb-6">
              <Tabs
                tabs={[
                  {
                    label: "Monthly",
                    content: (
                      <>
                        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 w-full">
                          <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-[#FFFFFF4D] rounded-xl min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-110 hover:bg-[#353535] md:p-5 lg:p-6 md:max-w-xs lg:max-w-sm">
                            <div className="main-price-month text-center md:mr-6 lg:mr-8">
                              <span className="text-[#FFFFFF] text-[28px] font-semibold md:text-[26px] lg:text-[28px]">
                                $15
                              </span>{" "}
                              <span className="text-[#FFFFFF] mr-4 md:mr-2 lg:mr-4">/month</span>
                              <ul className="text-[#FFFFFF] flex flex-col mt-2">
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-6 md:mr-4 lg:mr-6">10,000+ loops</li>
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-2 md:mr-12 lg:mr-2">
                                  200 instruments
                                </li>
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-14 md:ml-0 lg:mr-15">
                                  50 effects
                                </li>
                                <li className="md:text-[14px] lg:text-[16px] tracking-wide whitespace-nowrap ml-7 md:ml-0 lg:ml-6 xl:ml-7">
                                  Advanced vocal tools
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-[#FFFFFF4D] rounded-xl min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-110 hover:bg-[#353535] md:p-5 lg:p-6 md:max-w-xs lg:max-w-sm">
                            <div className="main-price-month relative pt-0 text-center md:mr-6 lg:mr-8">
                              <span className="text-[#FFFFFF] text-[28px] font-semibold md:text-[26px] lg:text-[28px]">
                                $9
                              </span>{" "}
                              <span className="text-[#FFFFFF] mr-4 md:mr-2 lg:mr-4">/month</span>
                              <ul className="text-[#FFFFFF] flex flex-col mt-2">
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-6 md:ml-0 lg:mr-7">7,000+ loops</li>
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-1 md:mr-10 lg:mr-1">150 instruments</li>
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-11 md:ml-0 lg:mr-12">30 effects</li>
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap ml-2 md:ml-0 lg:ml-2">Basic vocal tools</li>
                              </ul>
                              <span className="bg-[#FFFFFF] text-[#141414] rounded-full text-[14px] py-[2px] px-[8px] lg:py-[4px] lg:px-[10px] lg:text-[16px] absolute sm:top-[-14px] lg:top-[-8px] sm:right-[28px] md:right-1 translate-x-1/2 shadow-md ">
                                Best Value
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-[#FFFFFF4D] rounded-xl min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-110 hover:bg-[#353535] md:p-5 lg:p-6 md:max-w-xs lg:max-w-sm">
                            <div className="main-price-month text-center md:mr-6 lg:mr-8">
                              <span className="text-[#FFFFFF] text-[28px] font-semibold md:text-[26px] lg:text-[28px]">
                                $15
                              </span>{" "}
                              <span className="text-[#FFFFFF] mr-4 md:mr-2 lg:mr-4">/month</span>
                              <ul className="text-[#FFFFFF] flex flex-col mt-2">
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-6 md:mr-7 lg:mr-6">10,000+ loops</li>
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-2 md:mr-10 lg:mr-1">200 instruments</li>
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-14 md:ml-0 lg:mr-14">50 effects</li>
                                <li className="md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap ml-7 md:ml-0 lg:ml-6 xl:ml-7">Advanced vocal tools</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="mt-7 w-full mb-[-16px]">
                          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-6 w-full">
                            {/* Box 1 */}
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[45px] h-[45px] border bg:border-black dark:border-[#FFFFFF4D] rounded-md flex justify-center items-center">
                                <img src={p1} alt="" className="invert dark:invert-0"/>
                              </div>
                              <div className="p1-contant text-black dark:text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-1">41K+</p>
                                <p className="text-[20px]">loops/one-shots</p>
                                <p className="text-[14px] text-black dark:text-[#FFFFFF99]">(everything)</p>
                              </div>
                              <div className="main-price-month mt-1 invert dark:invert-0 text-[#FFFFFF99] text-[14px] leading-relaxed">
                                <ul className="list-none ">
                                  <li>50+ effects</li>
                                  <li>Realtime vocal tuning</li>
                                  <li>Vocal tuning</li>
                                  <li>Vocal cleanup</li>
                                  <li>808 instrument (with glide)</li>
                                </ul>
                              </div>
                            </div>

                            {/* Box 2 */}
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[45px] h-[45px] border bg:border-black dark:border-[#FFFFFF4D] rounded-md flex justify-center items-center">
                                <img src={p2} alt="" className="invert dark:invert-0"/>
                              </div>
                              <div className="p1-contant text-black dark:text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-1">1250+</p>
                                <p className="text-[20px]">Music Production</p>
                                <p className="text-[14px] text-black dark:text-[#FFFFFF99]">(everything)</p>
                              </div>
                              <div className="main-price-month mt-1 invert dark:invert-0 text-[#FFFFFF99] text-[14px] leading-relaxed">
                                <ul className="list-none">
                                  <li>Chords</li>
                                  <li>Realtime vocal tuning</li>
                                  <li>Save presets and loops</li>
                                  <li>150k+ Sound Effects freesound</li>
                                  <li>Automation</li>
                                </ul>
                              </div>
                            </div>

                            {/* Box 3 */}
                            <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                              <div className="k-loop-icon w-[45px] h-[45px] border bg:border-black dark:border-[#FFFFFF4D] rounded-md flex justify-center items-center">
                                <img src={p3} alt="" className="invert dark:invert-0"/>
                              </div>
                              <div className="p1-contant text-black dark:text-[#FFFFFF] text-center">
                                <p className="text-[18px] mt-1">140+</p>
                                <p className="text-[20px]">loops/one-shots</p>
                                <p className="text-[14px] text-black dark:text-[#FFFFFF99]">(everything)</p>
                              </div>
                              <div className="main-price-month mt-1 invert dark:invert-0 text-[#FFFFFF99] text-[14px] leading-relaxed">
                                <ul className="list-none">
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
                        <div className="w-full flex flex-col items-center text-white">
                          {/* Top 3 Pricing Cards */}
                          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 w-full">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-[#FFFFFF4D] rounded-xl min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-110 hover:bg-[#353535]"
                              >
                                <div className="text-center">
                                  <span className="text-[#FFFFFF] text-[24px] lg:text-[28px] font-semibold">
                                    $144.79
                                  </span>{" "}
                                  <span className="text-[#FFFFFF] text-[18px]">/year</span>
                                  <p className="text-[#FFFFFF] mt-1 text-[16px]">
                                    Production & Vocals
                                  </p>
                                  <div className="price-year text-[#9f9f9f] mt-2">
                                    <p className="text-[14px]"> US $144.79/month (US$177.48/year)</p>
                                    <p className="break-words w-full lg:w-60 mx-auto mt-3 text-[14px]">
                                      A full suite to help you create professional sounding music
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Bottom 3 Feature Boxes */}
                          <div className="mt-8 w-full">
                            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-6 w-full">
                              {/* Box 1 */}
                              <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                                <div className="k-loop-icon w-[45px] h-[45px] border bg:border-black dark:border-[#FFFFFF4D] rounded-md flex justify-center items-center">
                                  <img src={p1} alt="" className="invert dark:invert-0"/>
                                </div>
                                <div className="p1-contant text-black dark:text-[#FFFFFF] text-center">
                                  <p className="text-[18px] mt-1">41K+</p>
                                  <p className="text-[20px]">loops/one-shots</p>
                                  <p className="text-[14px] text-black dark:text-[#FFFFFF99]">(everything)</p>
                                </div>
                                <div className="main-price-month mt-1 invert dark:invert-0 text-[#FFFFFF99] text-[14px] leading-relaxed">
                                  <ul className="list-none">
                                    <li>50+ effects</li>
                                    <li>Realtime vocal tuning</li>
                                    <li>Vocal tuning</li>
                                    <li>Vocal cleanup</li>
                                    <li>808 instrument (with glide)</li>
                                  </ul>
                                </div>
                              </div>

                              {/* Box 2 */}
                              <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                                <div className="k-loop-icon w-[45px] h-[45px] border bg:border-black dark:border-[#FFFFFF4D] rounded-md flex justify-center items-center">
                                  <img src={p2} alt="" className="invert dark:invert-0"/>
                                </div>
                                <div className="p1-contant text-black dark:text-[#FFFFFF] text-center">
                                  <p className="text-[18px] mt-1">1250+</p>
                                  <p className="text-[20px]">Music Production</p>
                                  <p className="text-[14px] text-black dark:text-[#FFFFFF99]">(everything)</p>
                                </div>
                                <div className="main-price-month mt-1 invert dark:invert-0 text-[#FFFFFF99] text-[14px] leading-relaxed">
                                  <ul className="list-none">
                                    <li>Chords</li>
                                    <li>Realtime vocal tuning</li>
                                    <li>Save presets and loops</li>
                                    <li>150k+ Sound Effects freesound</li>
                                    <li>Automation</li>
                                  </ul>
                                </div>
                              </div>

                              {/* Box 3 */}
                              <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                                <div className="k-loop-icon w-[45px] h-[45px] border bg:border-black dark:border-[#FFFFFF4D] rounded-md flex justify-center items-center">
                                  <img src={p3} alt="" className="invert dark:invert-0"/>
                                </div>
                                <div className="p1-contant text-black dark:text-[#FFFFFF] text-center">
                                  <p className="text-[18px] mt-1">140+</p>
                                  <p className="text-[20px]">loops/one-shots</p>
                                  <p className="text-[14px] text-black dark:text-[#FFFFFF99]">(everything)</p>
                                </div>
                                <div className="main-price-month mt-1 invert dark:invert-0 text-[#FFFFFF99] text-[14px] leading-relaxed">
                                  <ul className="list-none">
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
                        </div>
                      </>
                    ),
                  },
                ]}
              />
            </div>

            {/* Footer Button */}
            <div className="pri-next-btn text-center">
              <button className="bg-white border border-black text-black font-semibold py-3 px-24 md:px-40 rounded-md shadow-lg hover:scale-105 transition-transform"
                onClick={() => {
                  if (!selectedPlan) {
                    alert("Please select a plan first!");
                    return;
                  }
                  setOpenPayment(true);
                  setPricingModalOpen(false);
                }}
              >
                Next
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>

    <Dialog
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        className="relative z-[200]"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen ">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
            <DialogPanel className="relative z-[210] transform overflow-hidden p-1 rounded-[8px] bg-primary-light dark:bg-primary-dark text-secondary-light dark:text-secondary-dark border border-neutral-200 dark:border-neutral-800 text-left shadow-xl w-[1000px] max-w-full max-h-[80vh] mx-4">

              {openPayment && (
                <OpenPayment
                  backToPricing={() => {
                    setOpenPayment(false);
                    setPricingModalOpen(true); // reopen Pricing modal
                  }}
                  plan={selectedPlan}
                />
              )}
              <OpenPayment selectedPlan={selectedPlan} />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PricingModel;
