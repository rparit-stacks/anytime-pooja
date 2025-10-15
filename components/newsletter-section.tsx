"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribe:", email)
    setEmail("")
  }

  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-balance">Stay in the Loop</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 text-pretty">
            Subscribe to our newsletter for exclusive offers, new arrivals, and style inspiration
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-primary-foreground text-foreground border-0"
            />
            <Button type="submit" variant="secondary" size="lg" className="sm:w-auto">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
