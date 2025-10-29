import React, { useEffect, useState } from "react"
import axios from "axios"
import "../App.css"

const API = import.meta.env.VITE_API_URL

function Notes() {
  let [note, setNote] = useState({ title: "", description: "" })
  let [data, setData] = useState([])
  let [update, setUpdate] = useState(false)
  let [updateIx, setUpdateIx] = useState()
  let [filter, setFilter] = useState("all") // all / today
  let [sortBy, setSortBy] = useState("asc") // asc / desc
  let [pageNum, setPageNum] = useState(1)
  let [nextPage, setNextPage] = useState(null)
  let [prevPage, setPrevPage] = useState(null)

  let [error,setError] = useState("")

  // Get notes from API
  let getNotes = async (filter, page = 1) => {
    try {
      let token = `Bearer ${sessionStorage.getItem("access")}`
      let res = await axios.get(
        `${API}/notes/?filter=${filter}&page=${page}&page_size=${5}`,
        {
          headers: { Authorization: token },
        }
      )
      setData(res.data.results) // extract results array
      setNextPage(res.data.next)
      setPrevPage(res.data.previous)
      setPageNum(page)
    } catch (error) {
      console.error("Error Fetching Notes", error.response?.data || error.message)
    }
  }

  useEffect(() => {
    getNotes(filter, 1)
  }, [filter])

  let handleNote = (e) => {
    let { name, value } = e.target
    setNote((prev) => ({ ...prev, [name]: value }))
  }

  let addNote = async () => {
    try {
      let token = `Bearer ${sessionStorage.getItem("access")}`
      await axios.post(`${API}/notes/`, note, {
        headers: { Authorization: token },
      })
      setNote({ title: "", description: "" })
      getNotes(filter, pageNum)
      setError("")
    } catch (error) {
      setError(error.response?.data.title[0])
      console.error("Error posting note", error.response?.data || error.message)
    }
  }

  let edit = (idx) => {
    let updateObj = data[idx]
    setUpdateIx(updateObj.id)
    setNote(updateObj)
    setUpdate(true)
  }

  let handleUpdate = async () => {
    try {
      let token = `Bearer ${sessionStorage.getItem("access")}`
      await axios.put(`${API}/notes/${updateIx}/`, note, {
        headers: { Authorization: token },
      })
      setUpdate(false)
      setNote({ title: "", description: "" })
      getNotes(filter, pageNum)
    } catch (error) {
      console.error("Error updating note", error.response?.data || error.message)
    }
  }

  let remove = async (id) => {
    try {
      let token = `Bearer ${sessionStorage.getItem("access")}`
      await axios.delete(`${API}/notes/${id}/`, {
        headers: { Authorization: token },
      })
      setData((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting note", error.response?.data || error.message)
    }
  }

  let handleFilter = (selectedFilter) => {
      setFilter(selectedFilter)
      setPageNum(1) // reset to first page
    }

  let handleSort=(sortOrder)=>{
    setSortBy(sortOrder)
    let sortedData = [...data].sort((a,b)=>{
        if(sortOrder=="asc") return a.title.localeCompare(b.title)
            else return b.title.localeCompare(a.title)
    })

    setData(sortedData)
  } 
  

  return (
    <div className="notes-container">
      <h1 className="app-title">My Notes App</h1>

      {/* Add / Update Note Form */}
      <div className="note-form">
        <h2>{update ? "Update Note" : "Add Note"}</h2>
        <input type="text" name="title" value={note.title} placeholder="Note title" onChange={handleNote} />
        <textarea name="description" value={note.description} placeholder="Note description..." onChange={handleNote} />
        {update ? (
          <button className="btn update" onClick={handleUpdate}>
            Update
          </button>
        ) : (
          <>
          {error && <p className="errorMessage">{error}</p>}
          <button className="btn add" onClick={addNote}>
            Add Note
          </button>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="notes-filters">
        <span className="filters-label">Filter by:</span>
        <div className="filters-options">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => handleFilter("all")} >
            All
          </button>
          <button className={`filter-btn ${filter === "today" ? "active" : ""}`} onClick={() => handleFilter("today")} >
            Today
          </button>

          <button className={`filter-btn ${sortBy === "asc" ? "active" : ""}`} onClick={() => handleSort("asc")} >
            Z-a
          </button>
          <button className={`filter-btn ${sortBy === "desc" ? "active" : ""}`} onClick={() => handleSort("desc")} >
            A-z
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="notes-list">
        {data.length === 0 ? (
          <p className="empty-message">No notes available.</p>
        ) : (
          data.map((el, index) => (
            <div className="note-card" key={el.id}>
              <div className="note-header">
                <h3>{el.title}</h3>
                <span className="note-date">{el.created_at}</span>
              </div>
              <p className="note-desc">{el.description}</p>
              <div className="note-actions">
                <button className="btn edit" onClick={() => edit(index)}>
                  Edit
                </button>
                <button className="btn delete" onClick={() => remove(el.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        <div className="pagination">
          <button className="page-btn" disabled={!prevPage} onClick={() => getNotes(filter, pageNum - 1)} >
            Prev
          </button>

          <span className="page-num">{pageNum}</span>

          <button className="page-btn" disabled={!nextPage} onClick={() => getNotes(filter, pageNum + 1)} >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}


export default Notes
