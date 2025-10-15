"use client"

import type React from "react"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const onEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Email signup", { email, name })
    // TODO: integrate auth provider
  }
  const onGoogleSignup = () => {
    console.log("[v0] Google signup clicked")
    // TODO: integrate Google auth
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg">
          <h1 className="font-serif text-4xl font-bold mb-6">Create account</h1>

          <div className="space-y-4">
            <Button className="w-full rounded-xl" onClick={onGoogleSignup}>
              Continue with Google
            </Button>

            <div className="text-center text-sm text-muted-foreground">or</div>

            <form onSubmit={onEmailSignup} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">
                Create account
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
