import React, { useState } from 'react'
import axios from 'axios'
import '../assets/css/login.css' // Make sure to create this CSS file
import { useNavigate,Link } from 'react-router-dom'

import { UserContext } from '../contexts/usercontexts/AuthContext'
import { useContext } from 'react'

const API = import.meta.env.VITE_API_URL
export default function Login() {
  let navigate = useNavigate()
  let {setUser,setProfilePic} = useContext(UserContext)
  let [logform, setForm] = useState({})

  let handleChange = (e) => {
    let { name, value } = e.target
    
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  let submit = async (e) => {
    e.preventDefault()
    try {
       let res = await axios.post(`${API}/api/login/`, logform, {
    headers: { 
      "Content-Type": "application/json" 
      },
      withCredentials: true  
    })
      
      
      sessionStorage.setItem("user",res.data.email)
      sessionStorage.setItem("access", res.data.access)
      sessionStorage.setItem("refresh", res.data.refresh)
      sessionStorage.setItem("profile_pic",res.data.profile_pic)
      
    
      console.log(logform.email)
      setProfilePic(res.data.profile_pic)
      setUser(res.data.email)
      navigate('/')

    } catch (err) {
      console.error("Login failed", err.response?.data || err.message)
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={submit}>
        <h2>Login</h2>
        <input type="text" name='email'  value={logform.email || ''} placeholder='Email' onChange={handleChange} required/>
        <input  type="password"  name='password'   value={logform.password || ''}  placeholder='Password'  onChange={handleChange}  required />
        
        <button type='submit'>Sign In</button>
         <p className='elseSignUp'>dont't have an account ? <Link to={'/signup'} className='signupLink'>Signup</Link></p>
      </form>
     
    </div>
  )
}
