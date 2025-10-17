"use client"

import { useRouter } from "next/navigation"

export default function QuickLoginPage() {
  const router = useRouter()

  const quickLogin = () => {
    // Direct login without form
    localStorage.setItem("admin_authenticated", "true")
    localStorage.setItem("admin_user", JSON.stringify({
      username: "pandit",
      role: "admin",
      loginTime: new Date().toISOString()
    }))
    
    alert("Logged in successfully!")
    router.push("/admin")
  }

  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "#f0f0f0"
    }}>
      <div style={{
        background: "white",
        padding: "3rem",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "400px"
      }}>
        <h1 style={{ marginBottom: "1rem", color: "#333" }}>Quick Admin Login</h1>
        <p style={{ marginBottom: "2rem", color: "#666" }}>
          Click the button below to login directly as admin
        </p>
        
        <button
          onClick={quickLogin}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "1rem 2rem",
            borderRadius: "5px",
            fontSize: "1.1rem",
            cursor: "pointer",
            width: "100%"
          }}
        >
          Login as Admin
        </button>
        
        <p style={{ 
          marginTop: "1rem", 
          fontSize: "0.9rem", 
          color: "#888" 
        }}>
          This will automatically login with admin credentials
        </p>
      </div>
    </div>
  )
}


