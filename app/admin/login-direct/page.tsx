"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DirectLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username === "pandit" && password === "pandit") {
      localStorage.setItem("admin_authenticated", "true")
      localStorage.setItem("admin_user", JSON.stringify({
        username: "pandit",
        role: "admin",
        loginTime: new Date().toISOString()
      }))
      
      alert("Login successful! Redirecting to admin panel...")
      router.push("/admin")
    } else {
      alert("Invalid credentials! Use: pandit / pandit")
    }
  }

  const quickLogin = () => {
    localStorage.setItem("admin_authenticated", "true")
    localStorage.setItem("admin_user", JSON.stringify({
      username: "pandit",
      role: "admin",
      loginTime: new Date().toISOString()
    }))
    
    alert("Quick login successful! Redirecting...")
    router.push("/admin")
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "30px", 
          fontSize: "24px",
          fontWeight: "bold",
          color: "#333"
        }}>
          🔐 Admin Login
        </h1>
        
        <form onSubmit={handleLogin} style={{ marginBottom: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </form>

        <div style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "5px",
          border: "1px solid #dee2e6"
        }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold", color: "#495057" }}>
            Demo Credentials:
          </p>
          <p style={{ margin: "0", fontSize: "14px", color: "#6c757d" }}>
            Username: <strong>pandit</strong><br />
            Password: <strong>pandit</strong>
          </p>
        </div>

        <button
          onClick={quickLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🚀 Quick Login (Auto)
        </button>
      </div>
    </div>
  )
}
