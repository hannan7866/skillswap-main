"use client";

import Link from "next/link";
import { Zap, LayoutDashboard, User, List, Clock, LogOut, Settings, Menu, MessageSquare, Repeat, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchUserProfile } from "@/lib/profile-service";
import type { UserProfile } from "@/types/skillswap";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { BrandLogo } from "@/components/ui/brand-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/listings", label: "Listings", icon: List },
  { href: "/exchanges", label: "Exchanges", icon: Repeat },
  { href: "/timebank", label: "Time Bank", icon: Clock },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
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

  const loadProfileData = async (userId: string) => {
    try {
      const p = await fetchUserProfile(userId);
      setUserProfile(p);
    } catch (err) {
      console.error("Error loading header profile:", err);
    }
  };

  const checkUnreadMessages = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .is("read_at", null);

      if (!error && typeof count === "number") {
        setHasUnreadMessages(count > 0);
      }
    } catch (err) {
      console.error("Error checking unread messages:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        loadProfileData(data.user.id);
        checkUnreadMessages(data.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfileData(currentUser.id);
        checkUnreadMessages(currentUser.id);
      } else {
        setUserProfile(null);
        setHasUnreadMessages(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Re-fetch profile and unread messages whenever user navigates
  useEffect(() => {
    if (user?.id) {
      loadProfileData(user.id);
      checkUnreadMessages(user.id);
    }
  }, [pathname, user?.id]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const NavLink = ({ href, label, icon: Icon }: typeof navItems[0]) => (
    <Button
      variant="ghost"
      asChild
      className={cn(
        "justify-start text-base font-medium rounded-xl h-11 px-3 transition-all",
        pathname === href
          ? "bg-primary/15 text-[#2BBBD7] font-semibold border border-[#2BBBD7]/30"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Link href={href} className="flex items-center gap-2.5">
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    </Button>
  );

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-300">
      <div className="glass-float rounded-2xl px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between transition-all">
        {/* Left Side: Brand Logo & Desktop Nav */}
        <div className="flex items-center space-x-2 sm:space-x-6 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-xl p-1 transition-transform hover:scale-[1.02]"
          >
            <BrandLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-xl font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-[#2BBBD7] font-semibold shadow-[0_0_12px_rgba(43,187,215,0.25)] border border-[#2BBBD7]/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Theme Toggle, Messages, Profile Avatar, Mobile Menu Trigger */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-[#FFD758]" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">Toggle Theme</span>
          </Button>

          {/* Messages Quick Access Button */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            title="Direct Messages"
            className={cn(
              "relative h-9 w-9 rounded-xl hover:bg-white/5",
              pathname === "/messages" && "bg-primary/15 text-[#2BBBD7] border border-[#2BBBD7]/30 shadow-[0_0_10px_rgba(43,187,215,0.2)]"
            )}
          >
            <Link href="/messages">
              <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              {hasUnreadMessages && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FFD758] shadow-[0_0_8px_#FFD758] animate-pulse" />
              )}
              <span className="sr-only">Messages</span>
            </Link>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0 hover:ring-2 hover:ring-[#2BBBD7]/50 transition-all">
                <Avatar className="h-8 w-8 rounded-xl border border-white/15">
                  <AvatarImage src={userProfile?.avatarUrl || user?.user_metadata?.avatar_url || undefined} alt={userProfile?.name || "User Avatar"} />
                  <AvatarFallback className="rounded-xl bg-primary/20 text-[#2BBBD7] font-semibold text-xs">
                    {(userProfile?.name || user?.user_metadata?.full_name || user?.email || "User").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass-panel rounded-2xl border-white/10 mt-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground font-heading">{userProfile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {userProfile?.email || user?.email || "No email"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/messages" className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-[#2BBBD7]" />
                    <span>Messages</span>
                  </div>
                  {hasUnreadMessages && (
                    <span className="h-2 w-2 rounded-full bg-[#FFD758] shadow-[0_0_6px_#FFD758]" />
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-[#2BBBD7]" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4 text-[#2BBBD7]" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer text-destructive focus:text-destructive rounded-lg">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Navigation Sheet Trigger */}
          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-white/5">
                  <Menu className="h-5 w-5" />
                  {hasUnreadMessages && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FFD758] shadow-[0_0_6px_#FFD758]" />
                  )}
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 glass-panel border-l border-white/10 bg-background/95 backdrop-blur-2xl">
                <div className="p-5 border-b border-white/10">
                  <Link href="/dashboard" className="flex items-center p-1 rounded-md focus:outline-none" onClick={() => setIsMobileMenuOpen(false)}>
                    <BrandLogo size="md" />
                  </Link>
                </div>
                <nav className="flex flex-col space-y-1.5 p-4">
                  {navItems.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "justify-start text-base font-medium rounded-xl h-11 px-3",
                      pathname === "/messages"
                        ? "bg-primary/15 text-[#2BBBD7] font-semibold border border-[#2BBBD7]/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/messages" className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="h-5 w-5" />
                        <span>Messages</span>
                      </div>
                      {hasUnreadMessages && (
                        <span className="h-2 w-2 rounded-full bg-[#FFD758] shadow-[0_0_8px_#FFD758]" />
                      )}
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

