import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore.js';
import { useEffect } from 'react'
import { Loader } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import { Toaster } from 'react-hot-toast'
import {useThemeStore} from './store/useThemeStore.js'

const App = () => {
  // whenever this changes, update the entire application
  const {theme} = useThemeStore();

  // on main routes, get context
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  // check auth with JWT whenever page hits
  useEffect(()=>{
    checkAuth()
  }, [checkAuth]);

  
  
  // if checking auth and user is not authenticated, protect page
  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin'/>
      </div>
    );
  }

  return (

    <div data-theme ={theme}>
      {/*Navbar is present in all pages, with options limited by path and auth*/}
      <Navbar />

      <Routes>
        
        <Route path='/' element={authUser ? <HomePage/> : <Navigate to='/login'/>} />

        <Route path='/signup' element={!authUser ? <SignupPage/> : <Navigate to='/'/>} />

        <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to='/'/>} />

        <Route path='/settings' element={<SettingsPage/>} />

        <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to='/login'/>} />
      </Routes>

      {/* Toaster: Alerts present throughout app*/}
      <Toaster />

    </div>

     


  )
};

export default App