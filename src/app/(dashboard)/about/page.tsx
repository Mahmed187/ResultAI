"use client"

import React, { memo } from 'react'
import { 
  Sparkles, 
  Users, 
  FileText, 
  Upload, 
  Zap, 
  Shield, 
  Globe, 
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  FileUp,
  FileDown,
  Search,
  Brain
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Innovation Features Component
const InnovationFeatures = memo(function InnovationFeatures() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms that analyze medical documents and extract key diagnostic information with unprecedented accuracy.",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/5"
    },
    {
      icon: FileUp,
      title: "Multi-Format Support",
      description: "Upload PDF, Word documents, scanned images, and any medical report format. Our system intelligently processes and standardizes the data.",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/5"
    },
    {
      icon: Search,
      title: "Smart Document Processing",
      description: "Automatically extract patient information, test results, and clinical findings from uploaded documents with intelligent parsing.",
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/5"
    },
    {
      icon: Zap,
      title: "Real-Time Results",
      description: "Instant processing and delivery of diagnostic results, reducing wait times from hours to minutes for critical patient care.",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/5"
    }
  ]

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
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
        </div>
      ))}
    </div>
  )
})

// Clinical Team Benefits Component
const ClinicalTeamBenefits = memo(function ClinicalTeamBenefits() {
  const benefits = [
    {
      icon: Clock,
      title: "Reduced Processing Time",
      description: "Cut down diagnosis result delivery time by 85% through automated document processing and intelligent data extraction.",
      metric: "85% Faster",
      color: "text-emerald-600"
    },
    {
      icon: CheckCircle,
      title: "Improved Accuracy",
      description: "AI-powered validation ensures 99.7% accuracy in result interpretation and reduces human error in data entry.",
      metric: "99.7% Accurate",
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Enhanced Collaboration",
      description: "Seamless sharing of results across clinical teams with real-time notifications and collaborative annotations.",
      metric: "Real-time",
      color: "text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Increased Efficiency",
      description: "Streamlined workflows allow clinicians to focus on patient care rather than administrative tasks.",
      metric: "3x More Efficient",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-6">
      {benefits.map((benefit, index) => (
        <div 
          key={index}
          className="group relative p-6 bg-gradient-to-r from-background to-muted/20 rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 ease-out overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex items-center gap-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <benefit.icon className={cn("h-8 w-8", benefit.color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {benefit.title}
                </h3>
                <Badge className={cn("text-xs font-bold", benefit.color, "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20")}>
                  {benefit.metric}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {benefit.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

// Document Upload Capabilities Component
const DocumentUploadCapabilities = memo(function DocumentUploadCapabilities() {
  const supportedFormats = [
    { name: "PDF Documents", icon: FileText, description: "Medical reports, lab results, and clinical documents" },
    { name: "Word Documents", icon: FileText, description: "Clinical notes, patient records, and medical correspondence" },
    { name: "Scanned Images", icon: Upload, description: "Handwritten notes, printed reports, and medical images" },
    { name: "Digital Images", icon: FileUp, description: "X-rays, MRIs, CT scans, and other medical imaging" },
    { name: "Excel Spreadsheets", icon: FileText, description: "Lab data, patient statistics, and clinical metrics" },
    { name: "Text Files", icon: FileText, description: "Clinical notes, research data, and medical literature" }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Universal Document Support
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
          Our platform accepts virtually any document format, automatically processing and extracting relevant medical information 
          to streamline your clinical workflow and improve patient care delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supportedFormats.map((format, index) => (
          <div 
            key={index}
            className="group p-4 bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 ease-out"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <format.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {format.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Secure & Compliant</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          All uploaded documents are processed with enterprise-grade security and full HIPAA compliance. 
          Your patient data is encrypted, secure, and protected throughout the entire processing pipeline.
        </p>
      </div>
    </div>
  )
})

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Lina
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl">
              Revolutionizing healthcare management through innovative technology and intelligent automation. 
              We're transforming how clinical teams process, analyze, and deliver diagnostic results to improve patient care outcomes.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
          <div className="flex items-center gap-4 mb-6">
            <Award className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            To empower healthcare professionals with cutting-edge technology that streamlines clinical workflows, 
            enhances diagnostic accuracy, and ultimately improves patient outcomes. We believe that by reducing 
            administrative burden and accelerating result delivery, clinicians can focus on what matters most: patient care.
          </p>
        </div>

        {/* Innovation Features */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Innovation at the Core
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              Our platform leverages the latest advancements in artificial intelligence and machine learning 
              to transform how medical documents are processed and diagnostic results are delivered.
            </p>
          </div>
          <InnovationFeatures />
        </div>

        {/* Clinical Team Benefits */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Empowering Clinical Teams
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              See how our innovative platform is transforming clinical workflows and improving 
              the way healthcare professionals deliver care to their patients.
            </p>
          </div>
          <ClinicalTeamBenefits />
        </div>

        {/* Document Upload Capabilities */}
        <div className="space-y-6">
          <DocumentUploadCapabilities />
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Clinical Workflow?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who are already using Lina to streamline 
            their diagnostic processes and improve patient care delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="border-primary/20 text-primary hover:bg-primary/10 transition-all duration-300"
              size="lg"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 