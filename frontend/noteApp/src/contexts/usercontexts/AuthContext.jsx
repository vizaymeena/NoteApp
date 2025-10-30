import React, { useEffect, useState, createContext } from "react"
import axios from "axios"
export let UserContext = createContext()


const API = import.meta.env.VITE_API_URL
export let UserProvider = ({ children }) => {
  let [user, setUser] = useState(null)
  let [profilePic,setProfilePic] = useState(null)

  // Load user from sessionStorage when app loads
  useEffect(() => {
    let savedUser = sessionStorage.getItem("user")
   try{
     if (savedUser) {
      setUser(savedUser)
    }
   } catch(err){
    console.log(err)
   }
  }, [])

  // Save user to sessionStorage when user changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", user)
    } else {
      sessionStorage.removeItem("user")
    }
  }, [user])

  useEffect(()=>{
    if(!user) return 
    let token = `Bearer ${sessionStorage.getItem("access")}`
    axios.get(`${API}/api/users/queryuser/${user}/`,{
      headers:{
        Authorization:token
      }
    }).then((res)=>{
      setProfilePic(res.data.profile_pic)
    }).catch((err)=>{
      console.error("Error Fetching Data:" , err.response?.data || err.message)
    })
    

  },[user])

  return (
    <UserContext.Provider value={{ user, setUser ,profilePic,setProfilePic }}>
      {children}
    </UserContext.Provider>
  )
}
