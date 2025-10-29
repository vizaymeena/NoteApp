import { useState } from 'react'
import './App.css'
import Signup from './components/Signup'
import Login from './components/Login'
import Notes from './components/Notes'
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Navbar from './components/Navbar'




function App() {

  return (
    <>
    {/* <Signup/> */}
    <BrowserRouter>

      <Routes>
        <Route element={<Navbar/>}>

           <Route index element={<Notes/>}/>
           <Route path='login' element={<Login/>}/>
           <Route path='signup' element={<Signup/>}/>


       </Route>
      </Routes>
     

    </BrowserRouter>
    </>
  )
}

export default App
