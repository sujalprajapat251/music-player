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
import Drum from './components/Drum';
import TopHeader from './components/Layout/TopHeader';
import Sidebar2 from './components/Sidebar2';
import Pricing from './Pages/Pricing';
import TearmsOfUse from './Pages/TearmsOfUse';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import Animation from './components/Animation';
import Demo from './Pages/Demo';
import Pianodemo from './components/Pianodemo';
import Piano from './components/Piano';
import Profile from './Pages/Profile';
import Timeline from './components/Timeline';
import { ThemeProvider } from './Utils/ThemeContext';
import Loops from './components/Loops';

function App() {
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

          <Route path='/login' element={<Login />} />
          <Route path='/drum' element={<Drum />} />
          <Route path='/pianox' element={<Pianodemo />} />

          <Route path="/" element={<Layout />} >
            <Route path='project' element={<Home2 />} />
            <Route path='profile' element={<Profile />} />
            <Route path='demo-project' element={<Demoproject />} />
          </Route>

            <Route path='/' element={<ThemeProvider><Sidebar2 /></ThemeProvider>} >
                <Route path='timeline' element={<Timeline />} />
                <Route path='loop' element={<Loops />} />
            </Route>
        </Routes>
      </SnackbarProvider>
    </Provider>
  );
}

export default App;
