import React, { useState, useContext } from "react"
import { Home, User, UserPen, LogOut, LogIn, Menu, X } from "lucide-react"
import { UserContext } from "../contexts/usercontexts/AuthContext"
import "../assets/css/header.css"
import { useNavigate } from "react-router-dom"

export default function Navbar() {
  let navigate = useNavigate()
  let { user, setUser, profilePic } = useContext(UserContext)
  let [isMenuOpen, setIsMenuOpen] = useState(false)

  let handleLogout = () => {
    setUser(null)
    sessionStorage.clear()
  }

  let handleLogin = () => {
    navigate("/login")
    setIsMenuOpen(false)
  }

  let handleRegisterAccount = () => {
    setIsMenuOpen(false)
    navigate("/signup")
  }

  return (
    <nav className="nav">
      <div className="webhead">
        {/* Hamburger for mobile */}
        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu />
        </div>

        <h1>NoteApp</h1>

        {/* Mobile profile icon */}
        <div className="mobileUserIcon">
          {profilePic ? (
            <img
              src={profilePic}
              alt="profile-pic"
              className="nav-profile-pic"
            />
          ) : (
            <div className="nav-profile-fallback">
              <User size={22} color="white" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      <div className={`overlayMenu ${isMenuOpen ? "show" : ""}`}>
        <span className="closeMenu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <X size={40} />
        </span>
        <span onClick={() => navigate("/")}>
          <Home size={20} /> Home
        </span>
        {user ? (
          <span onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </span>
        ) : (
          <>
            <span onClick={handleLogin}>
              <LogIn size={20} /> Login
            </span>
            <span onClick={handleRegisterAccount}>
              <UserPen size={20} /> Register
            </span>
          </>
        )}
      </div>

      {/* Desktop User Section */}
      <div className="userDetails">
        {user ? (
          <div className="userInfo">
            <div className="userdetail">
              {profilePic ? (
                <img src={profilePic} alt="profile-pic" className="nav-profile-pic" />
              ) : (
                <div className="nav-profile-fallback">
                  <User size={22} color="white" />
                </div>
              )}
              <span className="username-text">{user}</span>
            </div>
            <span className="logout-btn" onClick={handleLogout}>
              <LogOut color="white" />
            </span>
          </div>
        ) : (
          <div className="userInfo">
            <span onClick={handleLogin}>
              <LogIn color="white" />
            </span>
          </div>
        )}
      </div>
    </nav>
  )
}
