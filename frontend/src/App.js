import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import { Provider } from 'react-redux';
import { configureStore } from './Redux/Store';
import { SnackbarProvider } from 'notistack';
import Alert from './Pages/Alert';
import Login from './Pages/Login';

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
          <Route path='/login' element={<Login />} />
        </Routes>
      </SnackbarProvider>
    </Provider>
  );
}

export default App;
