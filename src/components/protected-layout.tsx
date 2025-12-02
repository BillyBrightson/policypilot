"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LayoutDashboard, FileText, GraduationCap, Users, Shield, LogOut, Menu, Activity, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notification-bell";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userDoc, tenant, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  // Helper function to extract first and last name
  const getUserDisplayName = () => {
    // Try to get from userDoc.name first
    if (userDoc?.name) {
      const nameParts = userDoc.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        return { firstName: nameParts[0], lastName: nameParts.slice(1).join(" ") };
      }
      return { firstName: nameParts[0], lastName: "" };
    }

    // Try to get from user.displayName
    if (user?.displayName) {
      const nameParts = user.displayName.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        return { firstName: nameParts[0], lastName: nameParts.slice(1).join(" ") };
      }
      return { firstName: nameParts[0], lastName: "" };
    }

    // Fallback: extract from email
    if (user?.email) {
      const emailParts = user.email.split("@")[0].split(/[._-]/);
      if (emailParts.length >= 2) {
        return {
          firstName: emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1),
          lastName: emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1),
        };
      }
      return {
        firstName: emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1),
        lastName: "",
      };
    }

    return { firstName: "User", lastName: "" };
  };

  const { firstName, lastName } = getUserDisplayName();
  const displayName = lastName ? `${firstName} ${lastName}` : firstName;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Frameworks", href: "/frameworks", icon: ShieldCheck },
    { name: "Compliance Scan", href: "/wizard/compliance-scan", icon: Shield },
    { name: "Policies", href: "/policies", icon: FileText },
    { name: "Training", href: "/training", icon: GraduationCap },
    { name: "Trainers", href: "/trainers", icon: Users },
    { name: "Activity Logs", href: "/activity-logs", icon: Activity },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="border-b bg-background flex-shrink-0 z-40">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                PolicyPilot
              </Link>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <NotificationBell />
              {tenant && (
                <span className="hidden md:inline text-sm text-muted-foreground">
                  {tenant.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 border-r bg-background transition-transform duration-200 ease-in-out flex flex-col flex-shrink-0`}
        >
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section at bottom */}
          <div className="p-4 border-t flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="truncate">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}



