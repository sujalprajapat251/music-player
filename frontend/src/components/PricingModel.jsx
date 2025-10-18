import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import p1 from "../Images/p1.svg";
import p2 from "../Images/p2.svg";
import p3 from "../Images/p3.svg";
import Tabs from "./Tabs";
import OpenPayment from "./OpenPayment";
import { fetchPremium, setSelectedPlan } from "../Redux/Slice/PremiumSlice";

const PricingModel = ({ pricingModalOpen, setPricingModalOpen }) => {
  const dispatch = useDispatch();
  const { premiums, loading, error, selectedPlan } = useSelector((state) => state.premium);

  const [plan, setPlan] = useState("yearly");
  const [openPayment, setOpenPayment] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [country, setCountry] = useState("India");
  const [agree, setAgree] = useState(false);
  const [cardError, setCardError] = useState(false);

  useEffect(() => {
    if (pricingModalOpen) {
      dispatch(fetchPremium());
    }
  }, [dispatch, pricingModalOpen]);

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
    dispatch(setSelectedPlan(plan));
    setOpenPayment(true);
    setPricingModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Dialog
        open={pricingModalOpen}
        onClose={setPricingModalOpen}
        className="relative z-[999]"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
            <DialogPanel
              transition
              className="relative z-[210] transform overflow-hidden p-6 rounded-[8px] bg-white dark:bg-primary-dark text-secondary-light dark:text-secondary-dark border border-neutral-200 dark:border-neutral-800 text-left shadow-xl w-[1020px] max-w-full transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 max-h-[89vh] mx-4 sm:overflow-y-auto 3xl:overflow-hidden"
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
                <p className="text-secondary-light dark:text-secondary-dark text-xl md:text-3xl font-bold tracking-wide">
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
                            {premiums && premiums?.filter(p => p.period === 'monthly').map((premium, index) => (
                              <div 
                                key={index} 
                                className={`flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-[#FFFFFF4D] rounded-xl min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-110 hover:bg-[#353535] md:p-5 lg:p-6 md:max-w-xs lg:max-w-sm cursor-pointer ${selectedPlan?._id === premium._id ? 'border-2 border-white ring-2 ring-white' : ''}`}
                                onClick={() => {
                                  console.log("Selected Monthly Premium:", premium);
                                  // Dispatch the selected plan to Redux store
                                  dispatch(setSelectedPlan({
                                    ...premium,
                                    price: premium.amount,
                                    name: premium.premiumType
                                  }));
                                }}
                              >
                                <div className="main-price-month text-center md:mr-6 lg:mr-8 w-[100%]">
                                  <span className="text-[#FFFFFF] text-[28px] font-semibold md:text-[26px] lg:text-[28px]">
                                    ${premium.amount}
                                  </span>{" "}
                                  <span className="text-[#FFFFFF] mr-4 md:mr-2 lg:mr-4">/month</span>
                                  <ul className="text-[#FFFFFF] text-start mt-2">
                                    {premium.features && premium.features.map((feature, idx) => (
                                      <li key={idx} className="text-[13px] md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-6 md:mr-4 lg:mr-6">{feature}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-7 w-full mb-[-16px]">
                            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-6 w-full">
                              {/* Box 1 */}
                              <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                                <div className="k-loop-icon w-[45px] h-[45px] border bg:border-black dark:border-[#FFFFFF4D] rounded-md flex justify-center items-center">
                                  <img src={p1} alt="" className="invert dark:invert-0" />
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
                                  <img src={p2} alt="" className="invert dark:invert-0" />
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
                                  <img src={p3} alt="" className="invert dark:invert-0" />
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
                          {/* <div className="w-full flex flex-col items-center text-white"> */}
                            {/* Top 3 Pricing Cards */}
                            <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 w-full">
                              {premiums && premiums.filter(p => p.period === 'yearly').map((premium, index) => (
                                <div
                                  key={index}
                                  className={`flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-[#FFFFFF4D] rounded-xl min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-110 hover:bg-[#353535] cursor-pointer ${selectedPlan?._id === premium._id ? 'border-2 border-white ring-2 ring-white' : ''}`}
                                  onClick={() => {
                                    console.log("Selected Yearly Premium:", premium);
                                    // Dispatch the selected plan to Redux store
                                    dispatch(setSelectedPlan({
                                      ...premium,
                                      price: premium.amount,
                                      name: premium.premiumType
                                    }));
                                  }}
                                >
                                  <div className="main-price-month text-center w-[100%]">
                                    <span className="text-[#FFFFFF] text-[24px] lg:text-[28px] font-semibold">
                                      ${premium.amount}
                                    </span>{" "}
                                    <span className="text-[#FFFFFF] text-[18px]">/year</span>
                                    <ul className="text-[#FFFFFF] text-start mt-2">
                                      {premium.features && premium.features.map((feature, idx) => (
                                        <li key={idx} className="text-[13px] md:text-[15px] lg:text-[16px] tracking-wide whitespace-nowrap mr-6 md:mr-4 lg:mr-6">{feature}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Bottom 3 Feature Boxes */}
                            <div className="mt-7 w-full mb-[-16px]">
                              <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-6 w-full">
                                {/* Box 1 */}
                                <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                                  <div className="k-loop-icon w-[45px] h-[45px] border bg:border-black dark:border-[#FFFFFF4D] rounded-md flex justify-center items-center">
                                    <img src={p1} alt="" className="invert dark:invert-0" />
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
                                    <img src={p2} alt="" className="invert dark:invert-0" />
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
                                    <img src={p3} alt="" className="invert dark:invert-0" />
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
                          {/* </div> */}
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
        className="relative z-[999]"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen ">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
            <DialogPanel className="relative z-[210] transform overflow-hidden p-1 rounded-[8px] bg-primary-light dark:bg-[#1f1f1f] text-secondary-light dark:text-secondary-dark border border-neutral-200 dark:border-neutral-800 text-left shadow-xl w-[1000px] max-w-full max-h-[80vh] mx-4">

              {openPayment && (
                <OpenPayment
                  backToPricing={() => {
                    setOpenPayment(false);
                    setPricingModalOpen(true); // reopen Pricing modal
                  }}
                  selectedPlan={selectedPlan}
                />
              )}
              {/* Remove the duplicate OpenPayment component */}
              {/* <OpenPayment selectedPlan={selectedPlan} /> */}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PricingModel;