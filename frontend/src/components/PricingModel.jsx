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
            className="relative z-[210] transform overflow-hidden p-7 rounded-[8px] bg-[#1F1F1F] text-left shadow-xl w-[1000px] max-w-full transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8"
            // className="relative transform overflow-hidden rounded-2xl bg-[#0F1115] shadow-2xl w-[1000px] max-w-full transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 p-10"
          >
            {/* Close Button */}
            <button
              onClick={() => setPricingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white hover:scale-110 transition-transform"
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
              <p className="text-white text-3xl md:text-3xl font-extrabold tracking-wide">
                Our Pricing Plans
              </p>
              <div className="mt-2 h-1 w-20 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
            </div>

            {/* Tabs with Toggle */}
            <div className=" justify-center mb-10">
              <Tabs
                tabs={[
                  {
                    label: "Monthly",
                    content: (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {/* Starter */}
                        <div className="bg-[#14161c] border border-purple-400 rounded-2xl p-8 text-left flex flex-col hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Starter
                          </h3>
                          <p className="text-gray-400 text-sm mb-6">
                            Recommended for people with at least 1 year
                            experience.
                          </p>
                          <p className="text-3xl font-bold text-white">
                            $9<span className="text-lg font-normal">/mo</span>
                          </p>
                          <button className="mt-6 w-full py-2 rounded-lg border border-gray-600 text-white hover:bg-violet-500 hover:border-violet-600 transition">
                            Get started →
                          </button>
                          <ul className="mt-6 space-y-2 text-sm text-gray-300">
                            <li>10,000+ loops</li>
                            <li>200 instruments</li>
                            <li>50 effects</li>
                            <li>Advanced vocal tools</li>
                          </ul>
                        </div>

                        {/* Professional */}
                        <div className="bg-[#14161c] border border-purple-400 rounded-2xl p-8 text-left flex flex-col hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              Professional
                            </h3>
                            <span className="bg-purple-400 text-xs px-2 py-1 rounded-full text-black font-semibold">
                              Bestseller
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-6">
                            Perfect plan for advanced creators.
                          </p>
                          <p className="text-3xl font-bold text-white">
                            $15<span className="text-lg font-normal">/mo</span>
                          </p>
                          <button className="mt-6 w-full py-2 rounded-lg bg-violet-500 text-black font-semibold hover:bg-violet-600 transition">
                            Get started →
                          </button>
                          <ul className="mt-6 space-y-2 text-sm text-gray-300">
                            <li>7,000+ loops</li>
                            <li>150 instruments</li>
                            <li>30 effects</li>
                            <li>Basic vocal tools</li>
                          </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-[#14161c] border border-purple-400 rounded-2xl p-8 text-left flex flex-col hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Enterprise
                          </h3>
                          <p className="text-gray-400 text-sm mb-6">
                            For teams & companies managing audio projects.
                          </p>
                          <p className="text-3xl font-bold text-white">
                            $99<span className="text-lg font-normal">/mo</span>
                          </p>
                          <button className="mt-6 w-full py-2 rounded-lg border border-gray-600 text-white hover:bg-violet-500 hover:border-violet-600 transition">
                            Schedule a call
                          </button>
                          <ul className="mt-6 space-y-2 text-sm text-gray-300">
                            <li>Unlimited users</li>
                            <li>Priority mixing</li>
                            <li>High quality downloads</li>
                            <li>Multi-speaker transcription (8h)</li>
                          </ul>
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: "Yearly",
                    content: (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {/* Starter */}
                        <div className="bg-[#14161c] border border-purple-400 rounded-2xl p-8 text-left flex flex-col hover:hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Starter
                          </h3>
                          <p className="text-gray-400 text-sm mb-6">
                            Recommended for people with at least 1 year
                            experience.
                          </p>
                          <p className="text-3xl font-bold text-white">
                            $90
                            <span className="text-lg font-normal">/yr</span>
                          </p>
                          <button className="mt-6 w-full py-2 rounded-lg border border-gray-600 text-white hover:bg-violet-500 hover:border-violet-600 transition">
                            Get started →
                          </button>
                          <ul className="mt-6 space-y-2 text-sm text-gray-300">
                            <li>10,000+ loops</li>
                            <li>200 instruments</li>
                            <li>50 effects</li>
                            <li>Advanced vocal tools</li>
                          </ul>
                        </div>

                        {/* Professional */}
                        <div className="bg-[#14161c] border border-purple-400 rounded-2xl p-8 text-left flex flex-col hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              Professional
                            </h3>
                            <span className="bg-purple-400 text-xs px-2 py-1 rounded-full text-black font-semibold">
                              Bestseller
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-6">
                            Perfect plan for advanced creators.
                          </p>
                          <p className="text-3xl font-bold text-white">
                            $150
                            <span className="text-lg font-normal">/yr</span>
                          </p>
                          <button className="mt-6 w-full py-2 rounded-lg bg-violet-500 text-black font-semibold hover:bg-violet-600 transition">
                            Get started →
                          </button>
                          <ul className="mt-6 space-y-2 text-sm text-gray-300">
                            <li>7,000+ loops</li>
                            <li>150 instruments</li>
                            <li>30 effects</li>
                            <li>Basic vocal tools</li>
                          </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-[#14161c] border border-purple-400 rounded-2xl p-8 text-left flex flex-col hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            Enterprise
                          </h3>
                          <p className="text-gray-400 text-sm mb-6">
                            For teams & companies managing audio projects.
                          </p>
                          <p className="text-3xl font-bold text-white">
                            $999
                            <span className="text-lg font-normal">/yr</span>
                          </p>
                          <button className="mt-6 w-full py-2 rounded-lg border border-gray-600 text-white hover:bg-violet-500 hover:border-violet-600 transition">
                            Schedule a call
                          </button>
                          <ul className="mt-6 space-y-2 text-sm text-gray-300">
                            <li>Unlimited users</li>
                            <li>Priority mixing</li>
                            <li>High quality downloads</li>
                            <li>Multi-speaker transcription (8h)</li>
                          </ul>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            {/* Footer Button */}
            <div className="pri-next-btn text-center mt-10">
              <button className="bg-gradient-to-r from-indigo-500 to-purple-400 text-black font-semibold py-3 px-24 md:px-40 rounded-xl shadow-lg hover:scale-105 transition-transform">
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
