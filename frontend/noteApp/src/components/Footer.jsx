import React from 'react'
import { PenTool, Heart } from "lucide-react"

export default function FooterNoteApp() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <PenTool size={20} />
          <h3>NoteApp</h3>
        </div>

        <p className="footer-tagline">
          Because great ideas deserve to be remembered — one note at a time.
        </p>

        <div className="footer-right">
          <p>Made with <Heart size={16} className="heart" /> by Vijay Meena</p>
        </div>
      </div>
    </footer>
  )
}
