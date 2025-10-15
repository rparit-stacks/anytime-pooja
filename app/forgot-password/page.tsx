"use client"

import type React from "react"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Forgot password request", { email })
    // TODO: trigger password reset email via auth provider
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg">
          <h1 className="font-serif text-4xl font-bold mb-6">Forgot password</h1>
          <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full rounded-xl">
              Send reset link
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            Remembered your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Go back to login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
