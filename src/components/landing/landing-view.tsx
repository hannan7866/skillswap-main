"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Users, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  TrendingUp, 
  Compass, 
  BookOpen, 
  Layers, 
  Repeat, 
  Award, 
  Star, 
  HeartHandshake, 
  Zap, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Code2,
  Palette,
  Globe2,
  Music,
  Briefcase,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { BrandLogo } from "@/components/ui/brand-logo";

const CATEGORIES = [
  { id: "all", label: "All Skills", icon: Layers },
  { id: "tech", label: "Code & Tech", icon: Code2 },
  { id: "design", label: "UI & Design", icon: Palette },
  { id: "languages", label: "Languages", icon: Globe2 },
  { id: "music", label: "Music & Audio", icon: Music },
  { id: "business", label: "Business & Mktg", icon: Briefcase },
  { id: "ai", label: "AI & Data", icon: Cpu },
];

const SAMPLE_LISTINGS = [
  {
    id: "1",
    title: "Next.js 15 & Full-Stack React Architecture",
    category: "tech",
    categoryLabel: "Code & Tech",
    type: "offered",
    author: "Alex Rivera",
    role: "Senior Full-Stack Dev",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 4.98,
    reviewsCount: 34,
    hoursCost: 1.0,
    tags: ["React", "Next.js", "TypeScript", "Tailwind"],
    description: "Learn production-grade App Router patterns, server actions, state management, and real-time Supabase integrations."
  },
  {
    id: "2",
    title: "Figma Design Systems & Modern Micro-Interactions",
    category: "design",
    categoryLabel: "UI & Design",
    type: "offered",
    author: "Maya Chen",
    role: "Staff Product Designer",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewsCount: 42,
    hoursCost: 1.0,
    tags: ["Figma", "Design Systems", "UX Research", "Prototyping"],
    description: "Master modern component tokens, auto-layout 5.0, dark mode architecture, and interactive animation handoff."
  },
  {
    id: "3",
    title: "Conversational Spanish & Business Fluency",
    category: "languages",
    categoryLabel: "Languages",
    type: "offered",
    author: "Mateo Silva",
    role: "Native Linguist & Coach",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 4.95,
    reviewsCount: 29,
    hoursCost: 1.0,
    tags: ["Spanish", "Pronunciation", "Business", "Grammar"],
    description: "Practical conversational drills, accent reduction, and real-life situational practice for career advancement."
  },
  {
    id: "4",
    title: "Acoustic Fingerstyle Guitar & Songwriting",
    category: "music",
    categoryLabel: "Music & Audio",
    type: "offered",
    author: "Elena Rostova",
    role: "Professional Musician",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    rating: 4.92,
    reviewsCount: 19,
    hoursCost: 1.0,
    tags: ["Guitar", "Acoustic", "Music Theory", "Songwriting"],
    description: "From basic chords to expressive percussive fingerstyle techniques and original song composition frameworks."
  },
  {
    id: "5",
    title: "LLM Prompt Engineering & Autonomous AI Agents",
    category: "ai",
    categoryLabel: "AI & Data",
    type: "offered",
    author: "David Vance",
    role: "AI Research Engineer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewsCount: 51,
    hoursCost: 1.0,
    tags: ["AI", "Prompting", "LangChain", "Python"],
    description: "Build robust AI workflows, system prompts, retrieval augmented generation (RAG), and agentic tool integrations."
  },
  {
    id: "6",
    title: "Product-Led Growth & B2B SaaS Marketing Strategy",
    category: "business",
    categoryLabel: "Business & Mktg",
    type: "offered",
    author: "Sarah Jenkins",
    role: "Growth Lead",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 4.88,
    reviewsCount: 22,
    hoursCost: 1.0,
    tags: ["Growth", "Funnel Optimization", "SEO", "Analytics"],
    description: "Actionable frameworks for user onboarding optimization, viral loops, retention metrics, and content engine setup."
  }
];

const SIMULATOR_DEMOS = [
  {
    giver: {
      name: "Maya Chen",
      role: "Product Designer",
      skill: "Figma Design Systems",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
    receiver: {
      name: "Alex Rivera",
      role: "Full-Stack Dev",
      skill: "Next.js 15 & API Routes",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    duration: "1.5 hrs",
    credits: "+1.5 TB Credits",
    topic: "Building production UI tokens and syncing with Tailwind config",
    status: "Exchange Completed & Verified"
  },
  {
    giver: {
      name: "Mateo Silva",
      role: "Spanish Coach",
      skill: "Conversational Spanish",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    receiver: {
      name: "Elena Rostova",
      role: "Guitarist",
      skill: "Acoustic Fingerstyle",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    },
    duration: "1.0 hr",
    credits: "+1.0 TB Credit",
    topic: "Pronunciation fluency & guitar rhythm coordination",
    status: "Session Scheduled"
  },
  {
    giver: {
      name: "David Vance",
      role: "AI Engineer",
      skill: "Autonomous Agents",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    receiver: {
      name: "Sarah Jenkins",
      role: "Growth Lead",
      skill: "SaaS Marketing Strategy",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    duration: "2.0 hrs",
    credits: "+2.0 TB Credits",
    topic: "Automating marketing funnel analytics with AI pipelines",
    status: "Exchange In Progress"
  }
];

const FAQS = [
  {
    question: "How does the SkillSwap Time Bank work?",
    answer: "Every hour you spend teaching, mentoring, or collaborating with another member earns you exactly 1 Time Credit. You can then use that credit to learn any skill from any other member in the community. No fiat money changes hands."
  },
  {
    question: "Do I have to swap directly 1-on-1 with the same person?",
    answer: "No! SkillSwap is a multilateral time bank. You can teach Graphic Design to Jordan, earn 2 credits, and spend those credits learning Japanese from Sakura or Python from Liam. You have total freedom."
  },
  {
    question: "Is SkillSwap really 100% free to use?",
    answer: "Yes. SkillSwap operates on the principle of equal human time. 1 hour of your time is valued equally with 1 hour of anyone else's time, making education and skill mastery accessible to everyone."
  },
  {
    question: "What if I am a beginner and not sure what I can teach?",
    answer: "Everyone has valuable knowledge! Whether it's conversational practice in your native language, basic software tools, cooking, high school math, organizing, gaming, or fitness—there are always people eager to learn from your experience."
  },
  {
    question: "How are sessions held and verified?",
    answer: "You and your swap partner can schedule sessions directly inside SkillSwap. Sessions take place via your preferred video link (Google Meet, Zoom, Discord). Once completed, both participants confirm to instantly transfer time credits and leave reviews."
  }
];

export function LandingView() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [teachingHours, setTeachingHours] = useState<number[]>([3]);
  const [activeSimulatorIndex, setActiveSimulatorIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("skillswap-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("skillswap-theme", "light");
    }
  };

  const filteredListings = SAMPLE_LISTINGS.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hoursPerWeek = teachingHours[0];
  const monthlyCredits = hoursPerWeek * 4;
  const yearlyCredits = hoursPerWeek * 52;
  const estimatedSavings = yearlyCredits * 45; // ~$45/hr tutor average

  const activeDemo = SIMULATOR_DEMOS[activeSimulatorIndex];

  return (
    <div className="flex flex-col min-h-screen selection:bg-teal-500/20 selection:text-teal-600 dark:selection:text-teal-300">
      
      {/* ========================================================================= */}
      {/* 1. ULTRA-POLISHED STICKY FROSTED HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <a href="#how-it-works" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
              How It Works
            </a>
            <a href="#skills-catalog" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
              Explore Skills
            </a>
            <a href="#time-calculator" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
              Time Bank
            </a>
            <a href="#testimonials" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
              Community
            </a>
            <a href="#faq" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live active members indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>1,240 Online</span>
            </div>

            {/* Theme Switcher Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" asChild className="text-sm font-medium">
              <Link href="/login">Login</Link>
            </Button>

            <Button asChild className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all font-medium">
              <Link href="/register" className="flex items-center gap-1.5">
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            {/* Mobile Menu Trigger */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3">
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
            >
              How It Works
            </a>
            <a 
              href="#skills-catalog" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
            >
              Explore Skills
            </a>
            <a 
              href="#time-calculator" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
            >
              Time Bank Calculator
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
            >
              Community Stories
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-md"
            >
              FAQ
            </a>
          </div>
        )}
      </header>

      <main className="flex-1">
        
        {/* ========================================================================= */}
        {/* 2. HERO SECTION WITH AMBIENT MESH GLOW & LIVE DEMO SIMULATOR */}
        {/* ========================================================================= */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 mesh-glow pointer-events-none -z-10" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              
              {/* Feature Announcement Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 border border-teal-500/30 text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-300 shadow-sm hover:border-teal-500/50 transition-all cursor-default">
                <Sparkles className="h-3.5 w-3.5 text-teal-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Next-Gen Peer-to-Peer Time Banking • 100% Free & Open</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Unlock Your Potential. <br />
                <span className="gradient-text">Exchange Skills, Bank Pure Time.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                SkillSwap is a collaborative time-banking community where <strong className="text-foreground">1 hour of your knowledge</strong> unlocks 1 hour of learning anything in the world. No fees, no paywalls—just real human exchange.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" asChild className="h-12 px-8 text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all font-semibold w-full sm:w-auto">
                  <Link href="/register" className="flex items-center justify-center gap-2">
                    <span>Start Swapping Free</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base border-border/80 hover:bg-muted font-medium w-full sm:w-auto">
                  <a href="#skills-catalog" className="flex items-center justify-center gap-2">
                    <Compass className="h-5 w-5 text-teal-500" />
                    <span>Browse 180+ Skills</span>
                  </a>
                </Button>
              </div>

              {/* Key Trust Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-border/50 max-w-3xl mx-auto">
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">15,400+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-teal-500" /> Hours Banked
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">3,800+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Users className="h-3.5 w-3.5 text-teal-500" /> Active Swappers
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">180+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-teal-500" /> Skill Disciplines
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">4.95 / 5</p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Member Satisfaction
                  </p>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* HERO INTERACTIVE SHOWCASE CARD: LIVE SKILL SWAP SIMULATOR */}
            {/* ========================================================================= */}
            <div className="mt-14 max-w-4xl mx-auto">
              <div className="relative rounded-2xl p-1 bg-gradient-to-b from-teal-500/30 via-cyan-500/10 to-transparent shadow-2xl">
                <div className="rounded-[15px] bg-card border border-border/80 p-6 sm:p-8 backdrop-blur-xl">
                  
                  {/* Card Header with Demo Selector */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="ml-2 text-xs font-mono font-medium text-muted-foreground">
                        LIVE EXCHANGE SIMULATOR & TRANSACTION LEDGER
                      </span>
                    </div>

                    {/* Selector Buttons */}
                    <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg">
                      {SIMULATOR_DEMOS.map((demo, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSimulatorIndex(idx)}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                            activeSimulatorIndex === idx 
                              ? "bg-background text-foreground shadow-sm" 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Demo {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Exchange Visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center py-6">
                    
                    {/* Member A */}
                    <div className="md:col-span-5 p-5 rounded-xl bg-background border border-border/80 shadow-sm space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-teal-500/40">
                          <AvatarImage src={activeDemo.giver.avatar} alt={activeDemo.giver.name} />
                          <AvatarFallback>{activeDemo.giver.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">{activeDemo.giver.name}</p>
                          <p className="text-xs text-muted-foreground">{activeDemo.giver.role}</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                          Teaching & Sharing:
                        </span>
                        <p className="text-base font-bold text-foreground mt-0.5">{activeDemo.giver.skill}</p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30">
                        ⚡ Time Balance: +3.0 TB Hours
                      </Badge>
                    </div>

                    {/* Middle Exchange Indicator */}
                    <div className="md:col-span-1 flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500 shadow-inner">
                        <Repeat className="h-5 w-5 animate-pulse" />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase">{activeDemo.duration}</span>
                    </div>

                    {/* Member B */}
                    <div className="md:col-span-5 p-5 rounded-xl bg-background border border-border/80 shadow-sm space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-cyan-500/40">
                          <AvatarImage src={activeDemo.receiver.avatar} alt={activeDemo.receiver.name} />
                          <AvatarFallback>{activeDemo.receiver.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">{activeDemo.receiver.name}</p>
                          <p className="text-xs text-muted-foreground">{activeDemo.receiver.role}</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                          Teaching & Sharing:
                        </span>
                        <p className="text-base font-bold text-foreground mt-0.5">{activeDemo.receiver.skill}</p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30">
                        ⚡ Time Balance: +2.5 TB Hours
                      </Badge>
                    </div>

                  </div>

                  {/* Simulator Footer Status */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span><strong>Session Topic:</strong> {activeDemo.topic}</span>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[11px] text-foreground">
                      {activeDemo.credits} Transfer
                    </Badge>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. 3-STEP "HOW TIME BANKING WORKS" INTERACTIVE PROCESS */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10">
                Simple & Transparent Flow
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                How SkillSwap Time Banking Works
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                No credit cards. No hourly rates based on seniority. 1 hour is 1 hour, everywhere.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Step 1 */}
              <div className="relative group p-8 rounded-2xl bg-card border border-border/70 hover:border-teal-500/40 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500 font-extrabold text-xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  01
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Offer Your Craft</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Create quick listings for skills you enjoy sharing—whether coding, conversational Japanese, piano, UI design, or career coaching.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400">
                  <CheckCircle2 className="h-4 w-4" /> 60-second quick setup
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group p-8 rounded-2xl bg-card border border-border/70 hover:border-teal-500/40 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 font-extrabold text-xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  02
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Teach & Bank Time</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Host live 1-on-1 virtual sessions or collaborate on real projects. Every hour taught automatically credits 1 Time Bank hour to your profile.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                  <CheckCircle2 className="h-4 w-4" /> 1 Hour Taught = 1 Credit Banked
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group p-8 rounded-2xl bg-card border border-border/70 hover:border-teal-500/40 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-extrabold text-xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  03
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Learn Anything for Free</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Redeem your banked credits to learn any skill from any member globally. No money required, zero subscription fees forever.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <CheckCircle2 className="h-4 w-4" /> Universal exchange across all categories
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LIVE INTERACTIVE SKILL EXPLORER & CATALOG PREVIEW */}
        {/* ========================================================================= */}
        <section id="skills-catalog" className="py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="space-y-2">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10">
                  Interactive Catalog
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Explore Community Skills
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Search live listings or filter by domain to find your next learning exchange partner.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search skills (e.g. Next.js, Figma)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md shadow-teal-500/20 font-semibold"
                        : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="flex flex-col h-full border border-border/70 bg-card hover:border-teal-500/40 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5">
                        <Sparkles className="h-3 w-3 mr-1" /> Offering Skill
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {listing.categoryLabel}
                      </Badge>
                    </div>

                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {listing.title}
                    </CardTitle>

                    <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {listing.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {listing.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-border">
                          <AvatarImage src={listing.avatar} alt={listing.author} />
                          <AvatarFallback>{listing.author.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-foreground">{listing.author}</p>
                          <p className="text-[11px] text-muted-foreground">{listing.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{listing.rating}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">({listing.reviewsCount})</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-0 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-teal-500" />
                      <span>{listing.hoursCost} Credit / Session</span>
                    </div>
                    <Button size="sm" asChild variant="outline" className="h-8 text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <Link href="/register">
                        Request Swap <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center pt-10">
              <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold">
                <Link href="/listings">
                  View All Available Skills in Catalog <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE TIME BANK VALUE CALCULATOR */}
        {/* ========================================================================= */}
        <section id="time-calculator" className="py-20 bg-muted/30 border-y border-border/50 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 bg-card border border-border/80 shadow-2xl space-y-8">
              
              <div className="text-center space-y-3">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10">
                  Interactive Simulator
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                  Calculate Your Learning Potential
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                  Slide below to estimate how many free hours of 1-on-1 tutoring you can bank simply by sharing what you already know.
                </p>
              </div>

              {/* Slider Control */}
              <div className="space-y-4 p-6 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex items-center justify-between">
                  <label htmlFor="hours-slider" className="text-sm font-bold text-foreground">
                    Hours you can share per week:
                  </label>
                  <span className="text-2xl font-black text-primary font-mono">
                    {hoursPerWeek} {hoursPerWeek === 1 ? "Hour" : "Hours"} / week
                  </span>
                </div>
                <Slider
                  id="hours-slider"
                  value={teachingHours}
                  onValueChange={setTeachingHours}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>1 hr/wk (Casual)</span>
                  <span>5 hrs/wk (Dedicated)</span>
                  <span>10 hrs/wk (Master Mentor)</span>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="p-5 rounded-2xl bg-background border border-border/80 shadow-sm space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Banked</p>
                  <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">+{monthlyCredits} hrs</p>
                  <p className="text-xs text-muted-foreground">Free 1-on-1 sessions per month</p>
                </div>
                <div className="p-5 rounded-2xl bg-background border border-border/80 shadow-sm space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Annual Learning</p>
                  <p className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">+{yearlyCredits} hrs</p>
                  <p className="text-xs text-muted-foreground">Master 3+ entirely new disciplines</p>
                </div>
                <div className="p-5 rounded-2xl bg-background border border-border/80 shadow-sm space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equivalent Value</p>
                  <p className="text-3xl font-extrabold text-amber-500 font-mono">${estimatedSavings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Saved in private tutoring fees</p>
                </div>
              </div>

              <div className="text-center pt-2">
                <Button asChild size="lg" className="rounded-xl font-bold px-8 shadow-lg shadow-teal-500/20">
                  <Link href="/register">
                    Claim Your First Welcome Time Credit <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. BENTO GRID: WHY SKILLSWAP IS REVOLUTIONARY */}
        {/* ========================================================================= */}
        <section className="py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10">
                Core Advantages
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Engineered for Fair, Limitless Growth
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Everything you need to exchange knowledge seamlessly, safely, and transparently.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-card border border-border/80 hover:border-teal-500/40 hover:shadow-xl transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Equal Currency System</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Time is humanity&apos;s universal constant. 1 hour of beginner guitar is treated with equal dignity and exchange power as 1 hour of machine learning.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-card border border-border/80 hover:border-teal-500/40 hover:shadow-xl transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Repeat className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Multilateral Swapping</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Never get stuck looking for a perfect 2-way match. Teach Sarah today, and spend the credits with Liam or Chloe tomorrow whenever you choose.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-card border border-border/80 hover:border-teal-500/40 hover:shadow-xl transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Integrated Scheduling & Chat</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Coordinate availability, agree on learning goals, exchange meeting links, and receive automated credit settlements instantly upon session confirmation.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. REAL COMMUNITY STORIES / TESTIMONIALS */}
        {/* ========================================================================= */}
        <section id="testimonials" className="py-20 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10">
                Member Testimonials
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Loved by Passionate Learners Worldwide
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Discover how members use SkillSwap to launch careers, master hobbies, and build lifelong connections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Testimonial 1 */}
              <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    &quot;I taught 6 hours of Python scripting to junior developers, and used my banked credits to get personal guitar coaching. In 2 months, I wrote my first song!&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Sarah Lin" />
                    <AvatarFallback>SL</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">Sarah Lin</p>
                    <p className="text-xs text-muted-foreground">Software Engineer • 24 hrs Banked</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    &quot;As a freelance UX designer, private business consulting was too expensive. With SkillSwap, I swapped Figma feedback for growth marketing coaching and doubled my agency client base.&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" alt="Marcus Gomez" />
                    <AvatarFallback>MG</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">Marcus Gomez</p>
                    <p className="text-xs text-muted-foreground">UI/UX Consultant • 48 hrs Banked</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    &quot;I helped Japanese students practice conversational English, and used those hours to learn professional video editing. The community is supportive and deeply kind.&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" alt="Emily Davis" />
                    <AvatarFallback>ED</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">Emily Davis</p>
                    <p className="text-xs text-muted-foreground">Content Creator • 31 hrs Banked</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. INTERACTIVE FAQ ACCORDION */}
        {/* ========================================================================= */}
        <section id="faq" className="py-20">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10">
                Got Questions?
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-border/80 rounded-2xl bg-card overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-foreground hover:text-primary transition-colors"
                    >
                      <span className="text-base sm:text-lg">{faq.question}</span>
                      <ChevronRight className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed border-t border-border/40 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. HIGH-CONVERTING FINAL CTA BANNER */}
        {/* ========================================================================= */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white shadow-2xl overflow-hidden text-center space-y-6">
              
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/20 blur-3xl pointer-events-none" />

              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1 font-semibold text-xs inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Start With 1 Free Bonus Credit
              </Badge>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ready to Bank Your Time and Learn Without Limits?
              </h2>

              <p className="text-teal-100 max-w-2xl mx-auto text-base sm:text-lg">
                Join thousands of creators, engineers, musicians, and learners sharing their passions every day.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" asChild className="h-12 px-8 text-base bg-white text-teal-900 hover:bg-teal-50 hover:scale-[1.02] shadow-xl font-bold w-full sm:w-auto">
                  <Link href="/register">
                    Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10 font-medium w-full sm:w-auto">
                  <Link href="/listings">
                    Explore Listings Catalog
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-teal-200/80 pt-2">
                ✓ No credit card required • Instant access • Multilateral Time Banking
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 10. COMPREHENSIVE GLOBAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-border/60 bg-card py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <BrandLogo size="md" />
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                The global peer-to-peer time banking community. Share your knowledge, earn time credits, and master any skill for free.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Core Systems Operational</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/listings" className="hover:text-foreground transition-colors">Skill Listings</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/timebank" className="hover:text-foreground transition-colors">Time Bank Ledger</Link></li>
                <li><Link href="/exchanges" className="hover:text-foreground transition-colors">Exchange Manager</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Resources</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#time-calculator" className="hover:text-foreground transition-colors">Time Calculator</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ & Support</a></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Member Sign In</Link></li>
              </ul>
            </div>

            {/* Community & Legal */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Community</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Member Stories</a></li>
                <li><span className="text-muted-foreground/60">Community Guidelines</span></li>
                <li><span className="text-muted-foreground/60">Privacy Policy</span></li>
                <li><span className="text-muted-foreground/60">Terms of Exchange</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SkillSwap Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <HeartHandshake className="h-3.5 w-3.5 text-teal-500" /> for lifelong learners worldwide.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
