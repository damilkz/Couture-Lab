import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import Home from './Pages/Home';
import Closet from './Pages/Closet';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUp';
import Contact from './Pages/Contact'
import VerifyEmail from './Pages/VerifyEmail';
import NotFound from './Pages/NotFound';
import BasicInfo from './Pages/BasicInfo';
import Profile from './Pages/Profile';

import { AuthProvider } from './Utilities/authcontext';
import { SettingsProvider } from './Utilities/settingscontext';
import PrivateRoute from './Utilities/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';


function App() {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <SettingsProvider>
            <ToastContainer />
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/signin' element={<SignIn />} />
              <Route path='/signup' element={<SignUp />} />
              <Route path='/closet' element={<PrivateRoute><Closet /></PrivateRoute>} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/verifyemail' element={<PrivateRoute><VerifyEmail /></PrivateRoute>} />
              <Route path='/basicinfo' element={<PrivateRoute><BasicInfo /></PrivateRoute>} />
              <Route path='/profile' element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path='*' element={<NotFound />}/>
            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;