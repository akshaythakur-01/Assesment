import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const [rollNo, setRollNo] = useState("")
  const [name, setName] = useState("")
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/sign-in"
    } else {
      fetch("http://localhost:2000/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "error") {
            alert(data.message)
            window.location.href = "/sign-in"
          } else {
            setRollNo(data.user.rollNo)
            setName(data.user.name)
          }
        })
    }
  })
  return (
    <div>
      
      <Link to="/"></Link>
    </div>
  )
}

export default Dashboard
