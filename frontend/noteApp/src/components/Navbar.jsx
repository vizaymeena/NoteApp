
import {  Outlet } from "react-router-dom"

import "../App.css" 
import FooterNoteApp from "./Footer"
import HeaderNoteApp from "./Header"

function Navbar() {
  

  return (
    <>
      
      <HeaderNoteApp/>

      <main style={{minHeight:'100vh'}}>
        <Outlet />
      </main>

      <footer>
        <FooterNoteApp/>
      </footer>
    </>
  )
}

export default Navbar
