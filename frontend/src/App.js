import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import { Provider } from 'react-redux';
import { configureStore } from './Redux/Store';
import { SnackbarProvider } from 'notistack';
import Alert from './Pages/Alert';
import Login from './Pages/Login';
import Layout from './components/Layout/Layout';
import Home2 from './components/Home2';
import RecentlyDeleted from './components/RecentlyDeleted';
import Demoproject from './Pages/Demoproject';
import ContactUs from './Pages/ContactUs';
import Faqs from './Pages/Faqs';
// import Drum from './components/Drum';
// import TopHeader from './components/Layout/TopHeader';
import Sidebar2 from './components/Sidebar2';
import Pricing from './Pages/Pricing';
import TearmsOfUse from './Pages/TearmsOfUse';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import Animation from './components/Animation';
// import Demo from './Pages/Demo';
// import Pianodemo from './components/Pianodemo';
import Piano from './components/Piano';
import Profile from './Pages/Profile';
import Timeline from './components/Timeline';
import { ThemeProvider } from './Utils/ThemeContext';
import RequireAuth from './Utils/RequireAuth';
import GuestOnly from './Utils/GuestOnly';
// import Loops from './components/Loops';
// import GridSetting from './components/GridSetting';
// import Knob from './components/Knob';
// import Pattern from './components/Pattern';
import Effects from './components/Effects';
import Effects2 from './components/Effects2';
// import Fuzz from './components/Fuzz';
// import Overdrive from "./components/Overdrive";
// import AutoPan from "./components/AutoPan";
// import AutoWah from "./components/AutoWah";
// import Chorus from "./components/Chorus";
// import Flanger from "./components/Flanger";
// import Phaser from "./components/Phaser";
// import Rotary from "./components/Rotary";
// import StereoChorus from "./components/StereoChorus";
// import Clipper from "./components/Clipper";
// import Crusher from "./components/Crusher";
import SDemo from './components/SDemo';
// import JuicyDistrotion from './components/JuicyDistrotion';
// import TapeWobble from './components/TapeWobble';
import VoiceTransformer from './components/VoiceTransfrom';
import React, { useEffect, useState } from "react";
import * as soundtouch from 'soundtouchjs';
import Guitar from './components/Guitar';
import File from './components/File';
import OpenProjectModal from './components/OpenProjectModal';
import Sound from './components/Sound';
import FolderView from './components/FolderView';
window.soundtouch = soundtouch;

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent zoom with Ctrl + wheel
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Prevent zoom with keyboard
    const handleKeyDown = (e) => {
      // Ctrl or Cmd + (+, -, 0)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };

    // Prevent pinch zoom on touch devices
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    // Simulate loading time and hide spinner
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  const { store, persistor } = configureStore();
  return (
  <>
    {isLoading && (
      <div className="spinner">
        <div className="r1"></div>
        <div className="r2"></div>
        <div className="r3"></div>
        <div className="r4"></div>
        <div className="r5"></div>
      </div>
    )}
    <Provider store={store}>
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={3000}
      >
        <Alert />
        <ThemeProvider>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='contact' element={<ContactUs />} />
            <Route path='faqs' element={<Faqs />} />
            <Route path='pricing' element={<Pricing />} />
            <Route path='tearms' element={<TearmsOfUse />} />
            <Route path='privacy' element={<PrivacyPolicy />} />
            <Route path='ani' element={<Animation />} />

            <Route element={<GuestOnly />}>
              <Route path='/login' element={<Login />} />
            </Route>

            {/* <Route element={<RequireAuth />}> */}
              <Route path="/" element={<Layout />} >
                <Route path='project' element={<Home2 />} />
                <Route path='project/folder/:id' element={<FolderView />} />
                <Route path='recently-deleted' element={<RecentlyDeleted />} />
                <Route path='recentlydeleted' element={<RecentlyDeleted />} />
                <Route path='demo-project' element={<Demoproject />} />
                <Route path='profile' element={<Profile />} />
              </Route>

              {/* Standalone feature routes (protected) */}
              <Route path='piano' element={<Piano />} />  
              <Route path='effcts2' element={<Effects2 />} />
              <Route path='file' element={<File />} />
              <Route path='sound' element={<Sound />} />

              {/* Sidebar namespace (protected) */}
              <Route path='/sidebar' element={<Sidebar2 />} >
                <Route path='timeline' element={<Timeline />} />
                <Route path='timeline/:id' element={<Timeline />} />
                {/* <Route path='knob' element={<Knob />} />
              <Route path='loop' element={<Loops />} /> */}
                <Route path="effects" element={<Effects />} />
                <Route path="savani" element={<SDemo />} />
                <Route path="piano" element={<Piano />} />
                <Route path="guitar" element={<Guitar />} />
                <Route path="voice" element={<VoiceTransformer />} />
              </Route>
            {/* </Route> */}
          </Routes>
        </ThemeProvider>
      </SnackbarProvider>
    </Provider >
  </>
  );
}

export default App;
