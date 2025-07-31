"use client"

import React, { memo, useCallback, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Shield, Zap, Users, Globe } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes" 

// Import local images
import pathologyImage from "@/assets/images/slider/pathology.jpg"
import xrayImage from "@/assets/images/slider/x-ray.jpg"
import cardiacImage from "@/assets/images/slider/Cardiac.jpg"
import ccgImage from "@/assets/images/slider/CCG.jpg"

// Memoized Slider component for better performance
const Slider = memo(function Slider() {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  
  const slides = useMemo(() => [
    {
      title: "Welcome to Healthcare Management",
      subtitle: "Your comprehensive healthcare solution",
      bgColor: "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
      textColor: "text-blue-600",
      image: pathologyImage,
      accent: "from-blue-500 to-blue-600",
    },
    {
      title: "AI-Powered Diagnostics",
      subtitle: "Advanced technology for accurate results",
      bgColor: "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
      textColor: "text-purple-600",
      image: xrayImage,
      accent: "from-purple-500 to-purple-600",
    },
    {
      title: "Seamless Healthcare Management",
      subtitle: "Streamlined care coordination",
      bgColor: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
      textColor: "text-emerald-600",
      image: cardiacImage,
      accent: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Comprehensive Care",
      subtitle: "Complete healthcare solutions",
      bgColor: "bg-gradient-to-br from-orange-500/20 to-orange-600/10",
      textColor: "text-orange-600",
      image: ccgImage,
      accent: "from-orange-500 to-orange-600",
    },
  ], [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <div className="relative w-full h-[450px] overflow-hidden rounded-2xl shadow-2xl border border-border/50">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-out",
              currentSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40 z-10" />
              <img
                src={slide.image.src}
                alt={slide.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
                style={{ transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)' }}
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-center p-8">
                <div className={cn("max-w-2xl space-y-4", slide.textColor)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-1 h-8 rounded-full bg-gradient-to-b", slide.accent)} />
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <h2 className="text-5xl font-bold leading-tight">{slide.title}</h2>
                  <p className="text-xl font-medium opacity-90">{slide.subtitle}</p>
                  <Button 
                    className={cn(
                      "mt-6 bg-gradient-to-r text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300",
                      slide.accent
                    )}
                    size="lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-background/90 hover:bg-background text-foreground shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-border/50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-background/90 hover:bg-background text-foreground shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-border/50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 shadow-lg",
              currentSlide === index 
                ? "bg-primary scale-125 shadow-primary/50" 
                : "bg-primary/30 hover:bg-primary/50 hover:scale-110"
            )}
          />
        ))}
      </div>
    </div>
  )
})

// Enhanced Product Information component
const ProductInfo = memo(function ProductInfo() {
  const features = useMemo(() => [
    {
      title: "Healthcare Management",
      description: "Streamline your medical practice with our comprehensive solution.",
      icon: Shield,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/5"
    },
    {
      title: "AI-Powered Diagnostics",
      description: "Advanced technology for accurate medical diagnostics.",
      icon: Zap,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/5"
    },
    {
      title: "Secure Data Management",
      description: "Your healthcare data is protected with enterprise-grade security.",
      icon: Shield,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/5"
    },
    {
      title: "Seamless Integration",
      description: "Easily integrate with existing healthcare systems and devices.",
      icon: Globe,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/5"
    }
  ], [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className={cn(
            "group relative p-6 bg-gradient-to-br rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 ease-out overflow-hidden",
            feature.bgGradient
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-r shadow-lg",
              feature.gradient
            )}>
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
        </div>
      ))}
    </div>
  )
})

// Enhanced Newsletter component
const Newsletter = memo(function Newsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Newsletter subscription for:", email)
    setEmail("")
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-xl bg-gradient-to-br from-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-primary to-primary/60" />
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Stay Updated
        </h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Subscribe to our newsletter for the latest updates, features, and healthcare insights delivered directly to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Subscribe
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
})

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { theme } = useTheme()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("Searching for:", query)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Welcome to Healthcare Management
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your comprehensive healthcare solution designed for modern medical practices.
              {searchQuery && (
                <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="h-3 w-3" />
                  Searching for: "{searchQuery}"
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Hero Slider */}
        <div className="space-y-2">
          <Slider />
        </div>

        {/* Features Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the tools and capabilities that make our healthcare management platform the choice for modern medical practices.
            </p>
          </div>
          <ProductInfo />
        </div>
        
        {/* Newsletter Section */}
        <div className="space-y-6">
          <Newsletter />
        </div> 
      </div>
    </div>
  )
} 