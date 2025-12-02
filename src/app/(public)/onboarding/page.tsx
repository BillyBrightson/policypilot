"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createTenant, createUser, createSubscription, updateUserTenantId } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INDUSTRIES = [
  "Restaurant",
  "School",
  "Hotel",
  "Retail",
  "Healthcare",
  "Finance",
  "Technology",
  "Manufacturing",
  "General SME",
];

const COUNTRIES = [
  "Ghana",
  "Nigeria",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userDoc, loading: authLoading } = useAuth();
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already has tenant
  useEffect(() => {
    if (!authLoading && user && userDoc && userDoc.tenantId) {
      router.push("/dashboard");
    }
  }, [user, userDoc, authLoading, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!workspaceName || !industry || !country) {
      setError("Please fill in all fields");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a workspace");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create tenant
      const tenantId = await createTenant({
        name: workspaceName,
        industry,
        country,
        ownerUserId: user.uid,
        createdAt: new Date(),
      });

      // Create user document if it doesn't exist
      if (!userDoc) {
        await createUser({
          id: user.uid,
          email: user.email || "",
          name: user.displayName || "",
          role: "owner",
          tenantId,
          createdAt: new Date(),
        });
      } else {
        // Update existing user with tenantId
        await updateUserTenantId(user.uid, tenantId);
      }

      // Create default subscription (basic plan)
      await createSubscription({
        tenantId,
        plan: "basic",
        status: "active",
        billingProvider: null,
        createdAt: new Date(),
        renewsAt: null,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      
      // Provide more helpful error messages
      if (err.code === "permission-denied" || err.message?.includes("permission")) {
        setError("Permission denied. Please check your Firestore security rules in Firebase Console.");
      } else if (err.code === "unavailable" || err.message?.includes("network")) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "Failed to create workspace. Please try again.");
      }
      
      setLoading(false);
    }
  };

  if (authLoading) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to PolicyPilot</CardTitle>
          <CardDescription className="text-center">
            Let's set up your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace Name</Label>
              <Input
                id="workspaceName"
                type="text"
                placeholder="Your Business Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry} required>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry} required>
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating workspace..." : "Create Workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

