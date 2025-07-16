import React from 'react'
import Header from '../components/Header'
import leftTop from '../Images/leftTop.png'
import rightBottom from '../Images/rightBottom.png'
import Homepage from '../Images/Homepage.png'
import pianoImg from '../Images/piyano.png'
import playButtonSvg from '../Images/play.png'
import f1 from "../Images/f1.svg"
import f2 from "../Images/f2.svg"
import f3 from "../Images/f3.svg"
import f4 from "../Images/f4.svg"
import f5 from "../Images/f5.svg"
import f6 from "../Images/f6.svg"
import mm1 from "../Images/mm-1.png"
import mm2 from "../Images/mm2.png"
import mm3 from "../Images/mm3.png"

const Home = () => {
    const features = [
        {
            icon: f1,
            title: "Music Creation Tools",
            desc: "Borem ipsum dolor sit amet consectetur. Turpis tristique nulla posuere et amet arcu dictum ultricies convallis."
        },
        {
            icon: f2,
            title: "Project Management",
            desc: "Borem ipsum dolor sit amet consectetur. Turpis tristique nulla posuere et amet arcu dictum ultricies convallis."
        },
        {
            icon: f3,
            title: "Audio Upload & Import",
            desc: "Borem ipsum dolor sit amet consectetur. Turpis tristique nulla posuere et amet arcu dictum ultricies convallis."
        },
        {
            icon: f4,
            title: "Sound Library",
            desc: "Borem ipsum dolor sit amet consectetur. Turpis tristique nulla posuere et amet arcu dictum ultricies convallis."
        },
        {
            icon: f5,
            title: "Easy Sharing",
            desc: "Borem ipsum dolor sit amet consectetur. Turpis tristique nulla posuere et amet arcu dictum ultricies convallis."
        },
        {
            icon: f6,
            title: "Mobile Experience",
            desc: "Borem ipsum dolor sit amet consectetur. Turpis tristique nulla posuere et amet arcu dictum ultricies convallis."
        }
    ];
    return (
        <>
            <div className="sticky top-0 z-10">
                <Header />
            </div>
            <div className="relative bg-[#141111] h-auto p-4 md:p-12 flex flex-col items-center justify-center overflow-hidden">
                {/* Top-left decorative image */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <img
                        src={leftTop}
                        alt="leftTop"
                        className="absolute top-0 left-0 w-1/3 max-w-xs pointer-events-none select-none"
                    // style={{ zIndex: 1 }}
                    />

                    {/* Main content goes here */}
                    <div className="relative flex flex-col items-center justify-center">
                        <h1 className='text-white text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-center mb-2'>Create. Remix. Release - Your<br />Music, Your Way.</h1>
                        <p className='text-white/60 text-center 3xl:w-[44%] 2xl:w-[62%] lg:w-[90%] w-full text-xs md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum .</p>
                        <div className="flex justify-center gap-4 mt-6 mb-3">
                            <button className="bg-white text-black border px-4 lg:px-6 py-2 rounded font-medium shadow hover:bg-transparent hover:border hover:border-white hover:text-white transition-colors duration-200 text-sm md:text-base">
                                Get Started
                            </button>
                            <button className="bg-transparent border border-white text-white px-4 lg:px-6 py-2 text-sm md:text-base rounded font-medium hover:bg-white hover:text-black transition-colors duration-200">
                                Go Premium
                            </button>
                        </div>
                        <img src={Homepage} alt="" className='h-full 3xl:h-[600px]' />
                    </div>

                    <img
                        src={rightBottom}
                        alt="rightBottom"
                        className="absolute right-0 bottom-0 w-1/3 max-w-xs pointer-events-none select-none"
                    // style={{ zIndex: 1 }}
                    />
                </div>
            </div>
            <div className="relative bg-[#141111] h-auto p-4 md:p-12 flex flex-col items-center justify-center overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top Heading */}
                    <div className="text-center mb-12">
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-white mb-4">
                            Generate audio and music
                        </h1>
                        <p className="text-white/60 3xl:w-[44%] 2xl:w-[62%] lg:w-[90%] mx-auto w-full text-xs md:text-base text-center">
                            Discover endless creativity with PromptVerse. Generate diverse content effortlessly using prompts. Stay updated with real-time trends, automate tasks, and extract insights from any document or URL. All within a sleek, futuristic design. Create more, effortlessly.
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
                        {/* Left: Text and Buttons */}
                        <div className="flex-1">
                            <h2 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-4 3xl:w-3/4 w-full ">
                                Enhance Your Projects with Ultra-Realistic AI Voices
                            </h2>
                            <p className="text-white/60 mb-2 text-xs md:text-base">
                                Create engaging voice content with unique Voices perfect for your audience.
                            </p>
                            <p className="text-white/60 mb-2 text-xs md:text-base">
                                Generate Conversational, Long-form or Short-form Voice Content With Consistent Quality and Performances.
                            </p>
                            <p className="text-white/60 mb-6 text-xs md:text-base">
                                Secure and Private Voice Generations with Full Commercial and Copyrights
                            </p>
                            {/* Buttons Grid */}
                            <div className="flex flex-wrap gap-2 3xl:gap-4 w-full 3xl:w-3/4">
                                {[
                                    'Listen to Music Demo',
                                    'Create',
                                    'Choose a Voice Style',
                                    'Record',
                                    'Make',
                                    'Make Background Music',
                                    'Try Now',
                                    'Make Your Own Tune',
                                ].map((label) => (
                                    <button
                                        key={label}
                                        className="border border-gray-400 text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-white hover:text-black transition-all duration-200 whitespace-nowrap flex items-center justify-center"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Right: Image with Play Button */}
                        <div className="flex-1 flex justify-center items-center relative">
                            <img
                                src={pianoImg}
                                alt="pianoImg"
                                className="rounded-xl w-[800px] h-full 3xl:h-[500px] object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                {/* {playButtonSvg} */}
                                <img
                                    src={playButtonSvg}
                                    alt="playButtonSvg"
                                    className="h-[130px] w-[130px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Powerful features section start */}

            <section className='container mx-auto p-0 px-2 py-6'>
                    <div className="text-center">
                        <p className='text-[#FFFFFF] font-bold text-lg sm:text-xl md:text-2xl lg:text-4xl'>Powerful features to help you manage all your leads</p>
                        <p className='text-[#FFFFFF99] 3xl:w-[40%] 2xl:w-[62%] lg:w-[90%] mx-auto text-xs md:text-base text-center mt-2'>Apsum dolor sit amet consectetur. Aliquam elementum elementum in ultrices. Dui maecenas ut eros turpis ultrices metus morbi aliquet vel.</p>
                    </div>
                    
                    <div className="flex flex-col items-center md:flex-row flex-wrap justify-center mt-12">
                        {features.map((feature, idx) => (
                            <div key={idx} className='w-full sm:w-full md:w-1/2 lg:w-1/3 p-3'>
                                <div className="bg-[#1F1F1F] rounded-md p-8 flex flex-col items-center text-center">
                                    <span className="mb-4"><img src={feature.icon} alt="" /></span>
                                    <h3 className="text-white text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-white/70 text-sm">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
            </section>

            {/* Powerful features section end */}

            {/* Music maker resources section start */}

            <section className='container mt-0 md:mt-10'>
                <div className="text-center">
                    <p className='text-[#FFFFFF] font-bold text-lg sm:text-xl md:text-2xl lg:text-4xl'>Music maker resources</p>
                    <p className='text-[#FFFFFF99] 3xl:w-[40%] 2xl:w-[62%] lg:w-[90%] mx-auto text-xs md:text-base text-center mt-2'>Apsum dolor sit amet consectetur. Aliquam elementum elementum in ultrices. Dui maecenas ut eros turpis ultrices metus morbi aliquet vel.</p>
                </div>
                <div className="mm-box flex flex-col lg:flex-row gap-5 mt-5">
                    <div className='w-full xl:w-1/3'>
                        <div className="bg-[#1F1F1F] mm-box-1 p-5 md:p-7 text-center flex justify-center items-center flex-col rounded-lg h-full">
                             <div className="mm-box-img w-full max-w-[300px] mx-auto">
                                <img src={mm1} alt="" width="100%" />
                            </div>
                            <div className="mm-box-1-texts">
                                <p className='text-[#F6F6F7] text-xl md:text-2xl lg:text-[30px] font-[500] mt-2 w-full md:w-[60%] mx-auto'>Perfect your mix with stellar effects</p>
                                <p className='text-[#FFFFFF99] w-full md:w-[80%] mx-auto mt-2 text-xs md:text-base'>Prem ipsum dolor sit amet consectetur. Viverra sed dignissim risus aliquet condimentum. Vulputate varius feugiat egestas congue </p>
                            </div>
                        </div>
                    </div>
                    <div className='w-full xl:w-2/3 mt-5 lg:mt-0'>
                        <div className="bg-[#1F1F1F] mm-box-1 px-5 md:px-7 pt-5 md:pt-7 text-center flex justify-center items-center flex-col rounded-lg h-full">
                             <div className="mm-box-1-texts">
                               <p className='text-[#F6F6F7] text-xl md:text-2xl lg:text-[30px] font-[500] mt-2'>Automation</p>
                                <p className='text-[#FFFFFF99] mt-2 text-xs md:text-base'>Tellus et adipiscing sit sit mauris pharetra bibendum. Ligula massa netus nulla ultricies purus.</p>
                             </div>
                             <div className="mm-box-img w-full mx-auto mt-4 md:mt-8">
                                <img src={mm2} alt="" width="100%" className='h-[250px] md:h-[400px] lg:h-[580px]' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mm-box-3 bg-[#1F1F1F] p-5 md:p-10 mt-5 rounded-lg">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="mm-box-3-text flex flex-col justify-center ps-0 lg:ps-5 w-full lg:w-1/2 text-center lg:text-start mb-4 lg:mb-0">
                            <p className='text-[#F6F6F7] text-xl md:text-2xl lg:text-[30px] w-full xl:w-[60%]'>Industry quality sounds, every 2 weeks</p>
                            <p className='text-[#FFFFFF99] w-full xl:w-[60%] mx-auto lg:mx-0 mt-2 text-xs md:text-base'>Rorem ipsum dolor sit amet consectetur. Proin dignissim tortor mauris viverra sed volutpat mauris. Amet nisi amet commodo adipiscing ut imperdiet nunc.</p>
                        </div>
                        <div className='mm-box-3-img w-full lg:w-1/2 flex justify-center'>
                            <img src={mm3} alt="" className="w-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Music maker resources section end */}

            {/* Get started with SoundWave today! start */}

            <section className='container mt-0 md:mt-10'>
                <div className="gs-heading">
                    <div className="text-center">
                        <p className='text-[#FFFFFF] font-bold text-lg sm:text-xl md:text-2xl lg:text-4xl'>Get started with SoundWave today!</p>
                        <p className='text-[#FFFFFF99] 3xl:w-[42%] 2xl:w-[62%] lg:w-[90%] mx-auto text-xs md:text-base text-center mt-2'>Discover endless creativity with PromptVerse. Generate diverse content effortlessly using prompts. Stay updated with real-time trends, automate tasks, and extract insights from any document or URL. All within a sleek, futuristic design. Create more, effortlessly.</p>
                     </div>
                </div>
            </section>

            {/* Get started with SoundWave today! end */}

        </>
    )
}

export default Home;