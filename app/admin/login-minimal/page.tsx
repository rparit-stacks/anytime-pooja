"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function MinimalAdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username === "pandit" && password === "pandit") {
      localStorage.setItem("admin_authenticated", "true")
      localStorage.setItem("admin_user", JSON.stringify({
        username: "pandit",
        role: "admin",
        loginTime: new Date().toISOString()
      }))
      router.push("/admin")
    } else {
      alert("Invalid credentials")
    }
  }

  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "#f5f5f5"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "300px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Admin Login</h2>
        
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }}
          />
        </div>
        
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Login
        </button>
        
        <p style={{ 
          fontSize: "0.8rem", 
          textAlign: "center", 
          marginTop: "1rem",
          color: "#666"
        }}>
          Username: pandit | Password: pandit
        </p>
      </form>
    </div>
  )
}


