import React, { useEffect } from "react";
import Tabs from "../components/Tabs";
import Header from "../components/Header";
import p1 from "../Images/p1.svg";
import p2 from "../Images/p2.svg";
import p3 from "../Images/p3.svg";
import { useDispatch, useSelector } from "react-redux";
import Accordion from "../components/Accordion";
import { fetchFaqs } from "../Redux/Slice/faqs.slice";
import Footer from "../components/Footer";

const Pricing = () => {
  const dispatch = useDispatch();
  const {
    items: faqItems,
    loading,
    error,
  } = useSelector((state) => state.faqs);

  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch]);
  return (
    <>
      {/* header section start */}
      <Header />

      {/* Pricing section start */}

      <section className="container my-10">
        <div className="price-heading text-center mb-10">
          <p className="text-[#FFFFFF] text-[36px] font-bold md:text-[36px] sm:text-[25px]">
            Choose Your Plan
          </p>
          <p className="text-[#FFFFFF99]">
            Find the perfect plan for individuals or educators.
          </p>
        </div>
        <div className="price-main">
          <div className="price-navs">
            <Tabs
              tabs={[
                {
                  label: "Monthly",
                  content: (
                    <>
                      {/*  Monthly pricing cards start -------------------------------------------------------------- */}
                      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 w-full">
                        <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105">
                          <div className="main-price-month mt-1 text-center mr-8">
                            <span className="text-[#FFFFFF] text-[32px] font-semibold">
                              $15
                            </span>{" "}
                            <span className="text-[#FFFFFF]">/month</span>
                            <ul className="text-[#FFFFFF] flex flex-col gap-1">
                              <li>10,000+ loops</li>
                              <li className="ml-4">200 instruments</li>
                              <li className="mr-8">50 effects</li>
                              <li className="ml-12">Advanced vocal tools</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105">
                          <div className="main-price-month relative pt-1 text-center mr-8">
                            <span className="text-[#FFFFFF] text-[32px] font-semibold">
                              $9
                            </span>{" "}
                            <span className="text-[#FFFFFF]">/month</span>
                            <ul className="text-[#FFFFFF] flex flex-col gap-1">
                              <li>7,000+ loops</li>
                              <li className="ml-6">150 instruments</li>
                              <li className="mr-4">30 effects</li>
                              <li className="ml-8">Basic vocal tools</li>
                            </ul>
                            <span className="bg-[#FFFFFF] text-[#141414] rounded-full text-[14px] py-[2px] px-[8px] lg:py-[4px] lg:px-[10px] lg:text-[16px] absolute top-0 right-1 translate-x-1/2 shadow-md ">
                              Best Value
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105">
                          <div className="main-price-month mt-1 text-center mr-8">
                            <span className="text-[#FFFFFF] text-[32px] font-semibold">
                              $15
                            </span>{" "}
                            <span className="text-[#FFFFFF]">/month</span>
                            <ul className="text-[#FFFFFF] flex flex-col gap-1">
                              <li>10,000+ loops</li>
                              <li className="ml-4">200 instruments</li>
                              <li className="mr-6">50 effects</li>
                              <li className="ml-14">Advanced vocal tools</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="mt-14 w-full">
                        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 w-full">
                          <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                            <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center">
                              <img src={p1} alt="" />
                            </div>
                            <div className="p1-contant text-[#FFFFFF] text-center">
                              <p className="text-[20px] mt-2">41K+</p>
                              <p className="text-[22px]">loops/one-shots</p>
                              <p className="text-[14px] text-[#FFFFFF99]">
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
                              <p className="text-[20px] mt-2">1250+</p>
                              <p className="text-[22px]">Music Production</p>
                              <p className="text-[14px] text-[#FFFFFF99]">
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
                              <p className="text-[20px] mt-2">41K+</p>
                              <p className="text-[22px]">loops/one-shots</p>
                              <p className="text-[14px] text-[#FFFFFF99]">
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
                        <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105">
                          <div className="text-center">
                            <span className="text-[#FFFFFF] text-[28px] lg:text-[36px] font-semibold">
                              $144.79
                            </span>{" "}
                            <span className="text-[#FFFFFF]">/year</span>
                            <p className="text-[#FFFFFF] mt-1">
                              Production & Vocals
                            </p>
                            <div className="price-year text-[#FFFFFF99] text-center mt-2">
                              <p>US $144.79/month (US$177.48/year)</p>
                              <p className="break-words w-full lg:w-60 mx-auto mt-3">
                                A full suite to help you create professional
                                sounding music
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105">
                          <div className="text-center">
                            <span className="text-[#FFFFFF] text-[28px] lg:text-[36px] font-semibold">
                              $144.79
                            </span>{" "}
                            <span className="text-[#FFFFFF]">/year</span>
                            <p className="text-[#FFFFFF] mt-1">
                              Production & Vocals
                            </p>
                            <div className="price-year text-[#FFFFFF99] text-center mt-2">
                              <p>US $144.79/month (US$177.48/year)</p>
                              <p className="break-words w-full lg:w-60 mx-auto mt-3">
                                A full suite to help you create professional
                                sounding music
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 max-w-sm p-6 bg-[#1F1F1F] border border-white rounded min-w-0 flex flex-col transform transition-transform duration-300 hover:scale-105">
                          <div className="text-center">
                            <span className="text-[#FFFFFF] text-[28px] lg:text-[36px] font-semibold">
                              $144.79
                            </span>{" "}
                            <span className="text-[#FFFFFF]">/year</span>
                            <p className="text-[#FFFFFF] mt-1">
                              Production & Vocals
                            </p>
                            <div className="price-year text-[#FFFFFF99] text-center mt-2">
                              <p>US $144.79/month (US$177.48/year)</p>
                              <p className="break-words w-full lg:w-60 mx-auto mt-3">
                                A full suite to help you create professional
                                sounding music
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-14 w-full">
                        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-8 w-full">
                          <div className="p1-box flex-1 w-full max-w-full flex justify-center items-center flex-col">
                            <div className="k-loop-icon w-[50px] h-[50px] border-[1px] border-[#FFFFFF4D] rounded-sm flex justify-center items-center">
                              <img src={p1} alt="" />
                            </div>
                            <div className="p1-contant text-[#FFFFFF] text-center">
                              <p className="text-[20px] mt-2">41K+</p>
                              <p className="text-[22px]">loops/one-shots</p>
                              <p className="text-[14px] text-[#FFFFFF99]">
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
                              <p className="text-[20px] mt-2">1250+</p>
                              <p className="text-[22px]">Music Production</p>
                              <p className="text-[14px] text-[#FFFFFF99]">
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
                              <p className="text-[20px] mt-2">41K+</p>
                              <p className="text-[22px]">loops/one-shots</p>
                              <p className="text-[14px] text-[#FFFFFF99]">
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
          {/* FAQs section start */}
          <div className="faqs-heading text-center my-20">
            <p className="text-[#FFFFFF] text-[35px] font-bold md:text-[35px] sm:text-[30px]">FAQs</p>
            <p className="text-[#FFFFFF99]">Your questions, answered simply.</p>
          </div>
          <section className="container my-10">
            {loading && <p className="text-white">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && <Accordion items={faqItems.slice(0, 6)} />}
          </section>
          {/* FAQs section end */}
        </div>
      </section>
      
      {/* Pricing section end */}

      {/* Footer section start */}

      <Footer />
    </>
  );
};

export default Pricing;
