import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const Signup = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [rollNo, setRollNo] = useState("")
  const [gender, setGender] = useState("male")
  const [password, setPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !age || !rollNo || !password || !confirmPass) {
      alert("Please enter all fields")
      return
    }
    if (password !== confirmPass) {
      alert("Passwords do not match")
      return
    }
    const res = await fetch("http://localhost:2000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        age,
        gender,
        rollNo,
        password,
        confirmPass,
      }),
    })
    const data = await res.json()
    if (data.status === "error") {
      alert(data.message)
    } else {
      alert(data.message)
      navigate("/signin")
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name..."
        />
        <input
          type="number"
          value={age}
          placeholder="Your age..."
          onChange={(e) => setAge(e.target.value)}
        />
        <input
          type="text"
          value={rollNo}
          placeholder="Your roll number..."
          onChange={(e) => setRollNo(e.target.value)}
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          type="password"
          value={password}
          placeholder="Your password..."
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          value={confirmPass}
          placeholder="Confirm password..."
          onChange={(e) => setConfirmPass(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account ? <Link to="/sign-in">Sign In</Link>
      </p>
      <p>
        <Link to="/">Back</Link>
      </p>
    </div>
  )
}

export default Signup
