import { useState, useContext } from "react"
import axios from "axios"
import "../assets/css/signup.css"
import { useNavigate } from "react-router-dom"
import { UserContext } from "../contexts/usercontexts/AuthContext"

const API = import.meta.env.VITE_API_URL
export default function Signup() {
  let navigate = useNavigate()
  let { setUser } = useContext(UserContext)

  let [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    gender: "",
    state: "",
    country: "",
    password: "",
    confirm_password: "",
    profile_pic: null, // optional
  })

  let [preview, setPreview] = useState(null)
  let [error, setError] = useState("")

  // Handle text input
  let handleChange = (e) => {
    let { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle image preview
  let handleImageChange = (e) => {
    let file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, profile_pic: file }))
      setPreview(URL.createObjectURL(file))
    }
  }

  // Form Submit
  let handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match!")
      return
    }

    // Formatted to send binary and text data with the api
    try {
      let data = new FormData()
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key])
      })

      let res = await axios.post(`${API}/api/users/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      console.log("Signup successful:", res.data)

      // Store user info
      sessionStorage.setItem("user", formData.email)
      setUser(res.data.profile_pic)

      navigate("/")
    } catch (err) {
      console.error("Signup failed:", err.response?.data || err.message)
      setError("Signup failed. Try again")
    }
  }

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>

        {error && <p className="error-msg">{error}</p>}

        {/* Profile image upload */}
        <div className="profile-upload">
          <label htmlFor="profile_pic" className="upload-label">
            {preview ? (
              <img src={preview} alt="Profile Preview" className="profile-preview" />
            ) : (
              <span>Upload Profile Picture (Optional)</span>
            )}
          </label>

          <input type="file" id="profile_pic" accept="image/*" onChange={handleImageChange} hidden/>
        </div>

        {/* Form fields */}
        <div className="name-fields">
          <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />

          <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
        </div>

        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

        <input type="tel" name="contact_number" placeholder="Contact Number" value={formData.contact_number} onChange={handleChange} required />

        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />

        <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />

        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required
        />

        <input type="password" name="confirm_password" placeholder="Confirm Password" value={formData.confirm_password} onChange={handleChange} required />

        <button type="submit">Sign Up</button>
      </form>
    </div>
  )
}
