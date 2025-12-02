"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  getLatestComplianceProfile,
  getPoliciesByTenant,
  getTrainingCompletionsByUser,
  getTrainerBookingsByTenant,
  getSubscriptionByTenant,
} from "@/lib/db";
import type {
  ComplianceProfile,
  Policy,
  TrainingCompletion,
  TrainerBooking,
  Subscription,
} from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Shield,
  FileText,
  GraduationCap,
  Users,
  ArrowRight,
  Sparkles,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import ProtectedLayout from "@/components/protected-layout";
import { CircularProgress } from "@/components/ui/circular-progress";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActionList } from "@/components/dashboard/action-list";

export default function DashboardPage() {
  const router = useRouter();
  const { user, userDoc, tenant, loading: authLoading } = useAuth();
  const [complianceProfile, setComplianceProfile] = useState<ComplianceProfile | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
      return;
    }

    if (!authLoading && user && tenant) {
      loadDashboardData();
    }
  }, [user, tenant, authLoading, router]);

  const loadDashboardData = async () => {
    if (!tenant || !user) return;

    try {
      setLoading(true);

      // Load compliance profile
      const profile = await getLatestComplianceProfile(tenant.id);
      setComplianceProfile(profile);

      // Load policies
      const policiesList = await getPoliciesByTenant(tenant.id);
      setPolicies(policiesList);

      // Load training completions
      if (userDoc) {
        const trainingCompletions = await getTrainingCompletionsByUser(user.uid, tenant.id);
        setCompletions(trainingCompletions);
      }

      // Load bookings
      const trainerBookings = await getTrainerBookingsByTenant(tenant.id);
      setBookings(trainerBookings);

      // Load subscription
      const sub = await getSubscriptionByTenant(tenant.id);
      setSubscription(sub);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const riskScore = complianceProfile?.riskScore || 0;
  const firstName = userDoc?.name?.split(" ")[0] || "User";
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto w-full space-y-8 pb-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">{currentDate}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/wizard/compliance-scan">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                New Scan
              </Button>
            </Link>
          </div>
        </div>

        {/* Upgrade Banner */}
        {subscription && subscription.plan === "basic" && (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Unlock Pro Features</h3>
                <p className="text-xs text-muted-foreground">
                  Get unlimited scans, policies, and priority support.
                </p>
              </div>
            </div>
            <Button size="sm" variant="default">
              Upgrade to Pro
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Risk */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                title="Policies"
                value={policies.length}
                icon={<FileText className="h-5 w-5" />}
                actionHref="/policies"
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Training"
                value={completions.length}
                icon={<GraduationCap className="h-5 w-5" />}
                actionHref="/training"
                description="Modules completed"
              />
              <StatsCard
                title="Bookings"
                value={bookings.length}
                icon={<Users className="h-5 w-5" />}
                actionHref="/trainers/bookings"
                description="Active sessions"
              />
            </div>

            {/* Quick Actions Grid */}
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/wizard/compliance-scan" className="group">
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Run Compliance Scan</h3>
                      <p className="text-xs text-muted-foreground">
                        AI-powered risk assessment
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/policies" className="group">
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Generate Policy</h3>
                      <p className="text-xs text-muted-foreground">
                        Create new documents
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/training" className="group">
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Employee Training</h3>
                      <p className="text-xs text-muted-foreground">
                        View training modules
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/trainers" className="group">
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Book Expert</h3>
                      <p className="text-xs text-muted-foreground">
                        Consult with trainers
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Right Column - Risk Score & Actions */}
          <div className="space-y-6">
            {/* Risk Score Card */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Compliance Score</CardTitle>
                <CardDescription>Real-time risk assessment</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-6">
                <div className="my-4">
                  <CircularProgress
                    value={riskScore}
                    label="Risk Score"
                    sublabel={complianceProfile?.summary ? "Based on latest scan" : "No scan data"}
                    size={180}
                    strokeWidth={15}
                  />
                </div>
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low Risk</span>
                    <span>High Risk</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <Link href="/wizard/compliance-scan" className="w-full mt-6">
                  <Button variant="outline" className="w-full">
                    View Detailed Report
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recommended Actions */}
            <ActionList
              actions={complianceProfile?.recommendedActions || []}
              title="Priority Actions"
            />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}



