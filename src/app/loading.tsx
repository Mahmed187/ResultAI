"use client"

import { Loader2, Brain, Sparkles } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-[spin_2s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <Brain className="w-10 h-10 text-primary animate-[pulse_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            ResultAI
            <div className="relative">
              <Sparkles className="w-7 h-7 text-primary animate-[pulse_1.5s_ease-in-out_infinite]" />
              <div className="absolute -inset-1 bg-primary/10 rounded-full animate-[ping_1.5s_ease-in-out_infinite]"></div>
            </div>
          </h2>
          <p className="text-muted-foreground text-lg">Loading your healthcare...</p>
        </div>
        <div className="flex items-center justify-center space-x-3 text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-[spin_1.5s_linear_infinite]" />
          <span className="text-base">AI-powered healthcare at your fingertips</span>
        </div>
      </div>
    </div>
  )
} 