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
import React, { useEffect } from "react";
import * as soundtouch from 'soundtouchjs';
window.soundtouch = soundtouch;

function App() {
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

  const { store, persistor } = configureStore();
  return (
    <Provider store={store}>
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={3000}
      >
        <Alert />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='contact' element={<ContactUs />} />
          <Route path='faqs' element={<Faqs />} />
          <Route path='pricing' element={<Pricing />} />
          <Route path='tearms' element={<TearmsOfUse />} />
          <Route path='privacy' element={<PrivacyPolicy />} />
          <Route path='ani' element={<Animation />} />
          <Route path='piano' element={<Piano />} />
          <Route path='effcts2' element={<Effects2 />} />
          {/* <Route path='fuzz' element={<Fuzz />} />
          <Route path='Overdrive' element={<Overdrive />} />
          <Route path='autopan' element={<AutoPan />} />
          <Route path='autowah' element={<AutoWah />} />
          <Route path="Chorus" element={<Chorus />} />
          <Route path="Flanger" element={<Flanger />} />
          <Route path="Phaser" element={<Phaser />} />
          <Route path="rotery" element={<Rotary />} />
          <Route path="StereoChorus" element={<StereoChorus />} />
          <Route path='Clipper' element={<Clipper />} />
          <Route path='Crusher' element={<Crusher />} />
          <Route path='JuicyDistrotion' element={<JuicyDistrotion />} />
          <Route path='TapeWobble' element={<TapeWobble />} /> */}


          <Route path='/login' element={<Login />} />

          <Route path="/" element={<Layout />} >
            <Route path='project' element={<Home2 />} />
            <Route path='demo-project' element={<Demoproject />} />
            <Route path='profile' element={<Profile />} />
          </Route>

          <Route path='/sidebar' element={<ThemeProvider><Sidebar2 /></ThemeProvider>} >
            <Route path='timeline' element={<Timeline />} />
            {/* <Route path='knob' element={<Knob />} />
            <Route path='loop' element={<Loops />} /> */}
            <Route path="effects" element={<Effects />} />
            <Route path="savani" element={<SDemo />} />
            <Route path="piano" element={<Piano />} />
            <Route path="voice" element={<VoiceTransformer />} />
          </Route>
          
        </Routes>
      </SnackbarProvider>
    </Provider>
  );
}

export default App;
