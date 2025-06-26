import React from 'react'
import Header from '../components/Header'
import leftTop from '../Images/leftTop.png'
import rightBottom from '../Images/rightBottom.png'
import Homepage from '../Images/Homepage.png'
import pianoImg from '../Images/piyano.png'
import playButtonSvg from '../Images/play.png'

const Home = () => {
    return (
        <div>
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
        </div>
    )
}

export default Home