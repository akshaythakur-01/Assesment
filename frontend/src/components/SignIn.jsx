import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const SignIn = () => {
  const navigate = useNavigate()
  const [rollNo, setRollNo] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rollNo || !password) {
      alert("Please enter all fields")
      return
    }
    const res = await fetch("http://localhost:2000/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rollNo,
        password,
      }),
    })
    const data = await res.json()
    if (data.status === "error") {
      alert(data.message)
    } else {
      alert(data.message)
      localStorage.setItem("token", data.token)
      navigate("/")
    }
  }

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/")
    } else {
      navigate("/sign-in")
    }
  }, [])

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={rollNo}
          placeholder="Your roll number..."
          onChange={(e) => setRollNo(e.target.value)}
        />
        <input
          type="password"
          value={password}
          placeholder="Your password..."
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
      </form>
      <p>
        Don't have an account ? <Link to="/sign-up">Sign up</Link>
      </p>
      <p>
        <Link to="/">Back</Link>
      </p>
    </div>
  )
}

export default SignIn
