"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function BasicAdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Hardcoded admin credentials
      if (username === "pandit" && password === "pandit") {
        // Store admin session
        localStorage.setItem("admin_authenticated", "true")
        localStorage.setItem("admin_user", JSON.stringify({
          username: "pandit",
          role: "admin",
          loginTime: new Date().toISOString()
        }))
        
        alert("Login successful!")
        router.push("/admin")
      } else {
        alert("Invalid username or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{
        background: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "1.5rem", 
          fontSize: "1.5rem",
          fontWeight: "bold"
        }}>
          Admin Login
        </h1>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "1rem"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "1rem"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "#f3f4f6",
          borderRadius: "4px",
          fontSize: "0.875rem",
          textAlign: "center"
        }}>
          <p style={{ margin: "0", fontWeight: "bold" }}>Demo Credentials:</p>
          <p style={{ margin: "0.25rem 0 0 0" }}>Username: <code>pandit</code></p>
          <p style={{ margin: "0" }}>Password: <code>pandit</code></p>
        </div>
      </div>
    </div>
  )
}
