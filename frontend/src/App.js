import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Doctors from './pages/Doctors'
import MyAppointments from './pages/MyAppointments'
import Contact from './pages/Contact'
import About from './pages/About'
import MyProfile from './pages/MyProfile'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%'>
      <Navbar/>
     <Routes>
      <Route path='/' element={<Home/>}>
      <Route path='/doctors' element={<Doctors/>}></Route>
      <Route path='/doctors/:speciality' element={<Doctors/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/about' element={<About/>}></Route>
      <Route path='/contact' element={<Contact/>}></Route>
      <Route path='/my-profile' element={<MyProfile/>}></Route>
      <Route path='/my-appointments' element={<MyAppointments/>}></Route>
      <Route path='/appointment/:docId' element={<Appointment/>}></Route>
      </Route>
     </Routes>
    </div>
  )
}

export default App
