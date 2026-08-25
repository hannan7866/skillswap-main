"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  List, 
  PlusCircle, 
  ArrowRight, 
  Sparkles, 
  Repeat, 
  ShieldCheck, 
  TrendingUp, 
  User, 
  Compass, 
  CheckCircle2, 
  Search, 
  Calendar, 
  Layers, 
  ExternalLink,
  Tag as TagIcon,
  HelpCircle,
  Award,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { fetchUserProfile, updateAllZeroBalancesToDefault } from "@/lib/profile-service";
import { fetchUserExchanges, fetchUserLedger } from "@/lib/exchange-service";
import type { UserProfile, ExchangeRecord, TimeLedgerEntry, Listing } from "@/types/skillswap";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeListingsCount, setActiveListingsCount] = useState<number>(0);
  const [exchanges, setExchanges] = useState<ExchangeRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<TimeLedgerEntry[]>([]);
  const [recommendedListings, setRecommendedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadDashboardData() {
      setLoading(true);
      try {
        await updateAllZeroBalancesToDefault();

        const [
          profileData,
          listingsCountRes,
          exchangesRes,
          ledgerRes,
          recentListingsRes
        ] = await Promise.all([
          fetchUserProfile(user.id),
          supabase
            .from("listings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .neq("status", "deleted"),
          fetchUserExchanges(user.id),
          fetchUserLedger(user.id),
          supabase
            .from("listings")
            .select(`
              id,
              user_id,
              type,
              title,
              category,
              sub_category,
              skill_names,
              description,
              tags,
              created_at,
              status,
              profile:profiles!fk_user(name, avatar_url)
            `)
            .neq("user_id", user.id)
            .neq("status", "deleted")
            .order("created_at", { ascending: false })
            .limit(3)
        ]);

        setProfile(profileData);
        if (listingsCountRes.count !== null) {
          setActiveListingsCount(listingsCountRes.count);
        }
        setExchanges(exchangesRes.data || []);
        setLedgerEntries(ledgerRes.data || []);

        if (recentListingsRes.data) {
          const enriched = recentListingsRes.data.map((item: any) => {
            const liveProfile = Array.isArray(item.profile) ? item.profile[0] : item.profile;
            return {
              ...item,
              user_name: liveProfile?.name || "Community Member",
              user_avatar_url: liveProfile?.avatar_url || undefined,
            };
          });
          setRecommendedListings(enriched);
        }

      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Sign In Required</h2>
        <p className="text-muted-foreground max-w-md">
          Please sign in or create an account to view and manage your SkillSwap dashboard.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Sign In to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 border border-border/60 rounded-2xl bg-card space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const availableHours = profile?.availableHours ?? profile?.timeBalance ?? 12.0;
  const reservedHours = profile?.reservedHours ?? 0.0;
  const totalBalance = profile?.timeBalance ?? (availableHours + reservedHours);
  const activeExchangesCount = exchanges.filter(e => e.status === "requested" || e.status === "accepted").length;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  // Calculate profile completion percentage
  const hasBio = Boolean(profile?.bio?.trim());
  const hasAvatar = Boolean(profile?.avatarUrl);
  const hasOffered = (profile?.skillsOffered?.length || 0) > 0;
  const hasWanted = (profile?.skillsWanted?.length || 0) > 0;
  const hasTime = Boolean(profile?.timeAvailable?.trim());
  const profileSteps = [hasBio, hasAvatar, hasOffered, hasWanted, hasTime];
  const completedSteps = profileSteps.filter(Boolean).length;
  const profileCompletion = Math.round((completedSteps / profileSteps.length) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* ========================================================================= */}
      {/* 1. HERO WELCOME BANNER WITH GLASS GLOW */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-card via-card to-teal-500/10 border border-border/80 shadow-lg overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-teal-500/40 shadow-md">
              <AvatarImage src={profile?.avatarUrl || user?.user_metadata?.avatar_url} alt={profile?.name || "User"} />
              <AvatarFallback className="text-lg font-bold bg-primary/20 text-primary">
                {(profile?.name || user?.email || "U").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {greeting},
                </span>
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Active Swapper
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {profile?.name || user?.user_metadata?.full_name || "Community Member"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your multilateral time balance, review skill proposals, and collaborate with peers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" asChild className="rounded-xl font-medium">
              <Link href="/listings" className="flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-teal-500" />
                <span>Explore Catalog</span>
              </Link>
            </Button>
            <Button asChild className="rounded-xl font-semibold shadow-md shadow-teal-500/20 hover:shadow-teal-500/30">
              <Link href="/listings/create" className="flex items-center gap-1.5">
                <PlusCircle className="h-4 w-4" />
                <span>Post New Skill</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 LIVE KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Metric 1: Available Time Balance */}
        <Card className="border border-border/70 bg-card hover:border-teal-500/40 hover:shadow-md transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Available Balance
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">
                {availableHours.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">TB Hours</span>
            </div>
            <Progress value={(availableHours / 100) * 100} className="h-1.5 bg-muted" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Spendable for learning</span>
              <span className="font-mono">{availableHours.toFixed(0)}/100 Max</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Reserved / Escrowed Hours */}
        <Card className="border border-border/70 bg-card hover:border-cyan-500/40 hover:shadow-md transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In-Escrow (Reserved)
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {reservedHours.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">TB Hours</span>
            </div>
            <div className="text-[11px] text-muted-foreground pt-2">
              {reservedHours > 0 
                ? "Locked during ongoing sessions"
                : "No hours currently held in escrow"}
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Active Listings */}
        <Card className="border border-border/70 bg-card hover:border-amber-500/40 hover:shadow-md transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Active Listings
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <List className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground font-mono">
                  {activeListingsCount}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Active</span>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold p-0 text-primary">
                <Link href="/listings">View All &rarr;</Link>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Skills you offer or request in community
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Active Exchanges */}
        <Card className="border border-border/70 bg-card hover:border-purple-500/40 hover:shadow-md transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Exchanges
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Repeat className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground font-mono">
                  {activeExchangesCount}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Ongoing</span>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold p-0 text-primary">
                <Link href="/exchanges">Manage &rarr;</Link>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Proposals & scheduled learning sessions
            </p>
          </CardContent>
        </Card>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT GRID (2 COLUMNS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link 
              href="/listings/create" 
              className="p-4 rounded-2xl bg-card border border-border/70 hover:border-teal-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Post Skill</span>
              <span className="text-[11px] text-muted-foreground">Offer or Request</span>
            </Link>

            <Link 
              href="/listings" 
              className="p-4 rounded-2xl bg-card border border-border/70 hover:border-cyan-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Explore Skills</span>
              <span className="text-[11px] text-muted-foreground">Browse Catalog</span>
            </Link>

            <Link 
              href="/timebank" 
              className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Time Bank</span>
              <span className="text-[11px] text-muted-foreground">Ledger History</span>
            </Link>

            <Link 
              href="/profile" 
              className="p-4 rounded-2xl bg-card border border-border/70 hover:border-purple-500/50 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Skill Passport</span>
              <span className="text-[11px] text-muted-foreground">Edit Profile</span>
            </Link>
          </div>

          {/* Active Exchanges & Proposals Card */}
          <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-teal-500" />
                  Active Exchanges & Proposals
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Track ongoing swap negotiations and scheduled sessions
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/exchanges">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {exchanges.length > 0 ? (
                <div className="space-y-3">
                  {exchanges.slice(0, 3).map((exch) => (
                    <div 
                      key={exch.id} 
                      className="p-4 rounded-xl bg-muted/30 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{exch.skill_name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] capitalize ${
                              exch.status === "accepted" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                              exch.status === "requested" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {exch.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Partner: <strong className="text-foreground">{exch.requester_id === user.id ? exch.provider_name : exch.requester_name}</strong> • {exch.hours} hrs
                        </p>
                      </div>

                      <Button size="sm" variant="outline" asChild className="h-8 text-xs font-semibold">
                        <Link href="/exchanges">
                          View Details &rarr;
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                    <Repeat className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">No active exchange proposals yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Explore community listings to propose your first swap, or create a listing so others can find your skills.
                    </p>
                  </div>
                  <Button size="sm" asChild className="mt-2">
                    <Link href="/listings">Browse Community Listings</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Skills For You */}
          <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Recommended Skills To Explore
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Latest offerings from the global time-banking community
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/listings">Full Catalog</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {recommendedListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendedListings.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-xl bg-background border border-border/70 hover:border-teal-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          {item.category || "Skill"}
                        </Badge>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground truncate">
                          by {item.user_name}
                        </span>
                        <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-xs text-primary font-semibold">
                          <Link href={`/listings/${item.id}`}>
                            View <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No recommendations available at this time.</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity & Time Ledger */}
          <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
              <div>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-500" />
                  Recent Time Ledger Activity
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Immutable record of your time credits and grants
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/timebank">Open Ledger</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {ledgerEntries.length > 0 ? (
                <div className="space-y-3">
                  {ledgerEntries.slice(0, 4).map((entry) => (
                    <div 
                      key={entry.id} 
                      className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-foreground truncate">{entry.description}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-mono font-bold text-sm ${entry.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                          {entry.amount > 0 ? `+${entry.amount.toFixed(1)}` : entry.amount.toFixed(1)} hrs
                        </span>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Balance: {entry.balance_after.toFixed(1)} hrs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Welcome Time Bank Credit Grant</p>
                    <p className="text-[11px] text-muted-foreground">Initial balance initialized for your account</p>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    +{availableHours.toFixed(1)} hrs
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: SIDEBAR (1/3 width) */}
        <div className="space-y-6">
          
          {/* Skill Passport Summary */}
          <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-teal-500" />
                  Your Skill Passport
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold p-0 text-primary">
                  <Link href="/profile">Edit &rarr;</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* Profile Completion Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Profile Strength</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-1.5" />
              </div>

              {/* Skills Offered */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-emerald-500" />
                  Skills You Offer ({profile?.skillsOffered?.length || 0})
                </span>
                {profile?.skillsOffered && profile.skillsOffered.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skillsOffered.map((sk) => (
                      <Badge key={sk.id || sk.name} variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium">
                        {sk.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No skills listed yet. <Link href="/profile" className="text-primary underline">Add skills</Link>
                  </p>
                )}
              </div>

              {/* Skills Wanted */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Compass className="h-3 w-3 text-cyan-500" />
                  Skills You Want ({profile?.skillsWanted?.length || 0})
                </span>
                {profile?.skillsWanted && profile.skillsWanted.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skillsWanted.map((sk) => (
                      <Badge key={sk.id || sk.name} variant="outline" className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 font-medium">
                        {sk.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    None specified. <Link href="/profile" className="text-primary underline">Set learning goals</Link>
                  </p>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Time Bank Pro Tip Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-transparent border border-teal-500/30 space-y-3">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <span>Time Bank Tip</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every 1 hour you spend helping another member earn you exactly <strong className="text-foreground">+1.0 Time Credit</strong>. You can bank up to 100 hours to learn anything anytime!
            </p>
            <Button size="sm" variant="outline" asChild className="w-full text-xs font-semibold border-teal-500/30 bg-background/60">
              <Link href="/timebank">
                Explore Time Banking Rules &rarr;
              </Link>
            </Button>
          </div>

          {/* Popular Categories Fast-Access */}
          <Card className="border border-border/80 bg-card rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold text-foreground">
                Popular Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                { name: "Code & Tech", href: "/listings", count: "48 listings" },
                { name: "UI & Design", href: "/listings", count: "32 listings" },
                { name: "Languages", href: "/listings", count: "29 listings" },
                { name: "Music & Audio", href: "/listings", count: "18 listings" },
                { name: "AI & Prompting", href: "/listings", count: "24 listings" },
              ].map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.href}
                  className="p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border/60 transition-all flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-foreground">{cat.name}</span>
                  <span className="text-muted-foreground">{cat.count}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
