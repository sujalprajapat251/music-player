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
          <Route path='/login' element={<Login />} />
          <Route path='/drum' element={<Drum />} />

          <Route path="/layout" element={<Layout />} >
            <Route path='project' element={<Home2 />} />
            <Route path='demo-project' element={<Demoproject />} />
          </Route>






          {/* <Route path='/top' element={<TopHeader />} /> */}
          <Route path='/sidebar' element={<Sidebar2 />} >
            
          </Route >


        </Routes>
      </SnackbarProvider>
    </Provider>
  );
}

export default App;
