"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

interface Slide {
  title: string
  subtitle: string
  cta: string
  link: string
  image: string
}

export function HeroSection() {
  const { data } = useSWR("/api/sliders", swrFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0
  })
  const apiSlides = data?.sliders || []
  
  const [currentSlide, setCurrentSlide] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % apiSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [apiSlides.length])
  
  const slides: Slide[] = apiSlides.map((slide: any) => ({
    title: slide.title,
    subtitle: slide.subtitle,
    cta: slide.cta,
    link: slide.link,
    image: slide.image,
  }))

  if (slides.length === 0) {
    return null // Don't show section if no sliders
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {slides.map((slide: Slide, index: number) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20 z-10" />
          <img 
            src={slide.image || "/placeholder-banner.jpg"} 
            alt={slide.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-banner.jpg"
            }}
          />
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-2xl">
                {user && (
                  <div className="mb-4">
                    <p className="text-lg text-foreground/90">
                      Welcome back, <span className="font-semibold text-primary">{user.first_name}</span>! 👋
                    </p>
                  </div>
                )}
                <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 mb-8 text-pretty">{slide.subtitle}</p>
                <Link href={slide.link}>
                  <Button size="lg" className="text-base px-8">
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-background/80 hover:bg-background p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_: Slide, index: number) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-foreground w-8" : "bg-foreground/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
