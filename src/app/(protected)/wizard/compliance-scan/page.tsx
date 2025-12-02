"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { runComplianceScan } from "@/lib/ai/compliance";
import { createComplianceProfile } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedLayout from "@/components/protected-layout";
import { Shield, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

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

const BUSINESS_SIZES = ["Small (1-10 employees)", "Medium (11-50 employees)", "Large (50+ employees)"];

const COUNTRIES = [
  "Ghana",
  "Nigeria",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "Other",
];

export default function ComplianceScanPage() {
  const router = useRouter();
  const { tenant } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [industry, setIndustry] = useState("");
  const [businessSize, setBusinessSize] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [numEmployees, setNumEmployees] = useState("");
  const [handlesCustomerData, setHandlesCustomerData] = useState("");
  const [usesCCTV, setUsesCCTV] = useState("");
  const [hasRemoteWorkers, setHasRemoteWorkers] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Results
  const [results, setResults] = useState<{
    riskScore: number;
    summary: string;
    recommendedActions: string[];
    recommendedPolicies: string[];
  } | null>(null);

  const handleNext = () => {
    if (step === 1 && (!industry || !businessSize || !country)) {
      setError("Please fill in all required fields");
      return;
    }
    if (step === 2 && !numEmployees) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!tenant) {
      setError("No tenant found. Please create a workspace first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare profile data
      const profile = {
        tenantId: tenant.id,
        industry,
        businessSize: businessSize.split(" ")[0].toLowerCase(),
        country,
        answers: {
          numEmployees: parseInt(numEmployees) || 0,
          handlesCustomerData: handlesCustomerData === "yes",
          usesCCTV: usesCCTV === "yes",
          hasRemoteWorkers: hasRemoteWorkers === "yes",
          additionalInfo,
        },
      };

      // Run AI compliance scan
      const scanResults = await runComplianceScan(profile);
      setResults(scanResults);

      // Save to Firestore
      await createComplianceProfile({
        ...profile,
        riskScore: scanResults.riskScore,
        summary: scanResults.summary,
        recommendedActions: scanResults.recommendedActions,
        createdAt: new Date(),
      });

      setStep(4); // Show results
    } catch (err: any) {
      setError(err.message || "Failed to run compliance scan");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const riskScore = results?.riskScore || 0;
  const riskColor =
    riskScore < 30 ? "text-green-600" : riskScore < 70 ? "text-yellow-600" : "text-red-600";
  const riskBg =
    riskScore < 30 ? "bg-green-50 border-green-200" : riskScore < 70 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Compliance Scan</h1>
          <p className="text-muted-foreground">
            Answer a few questions to get an AI-powered compliance assessment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
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
                <Label htmlFor="businessSize">Business Size *</Label>
                <Select value={businessSize} onValueChange={setBusinessSize} required>
                  <SelectTrigger id="businessSize">
                    <SelectValue placeholder="Select business size" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
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

              <div className="flex justify-end gap-4">
                <Button onClick={handleNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Help us understand your operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numEmployees">Number of Employees *</Label>
                <Input
                  id="numEmployees"
                  type="number"
                  placeholder="e.g., 25"
                  value={numEmployees}
                  onChange={(e) => setNumEmployees(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handlesCustomerData">Do you handle customer personal data? *</Label>
                <Select value={handlesCustomerData} onValueChange={setHandlesCustomerData} required>
                  <SelectTrigger id="handlesCustomerData">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usesCCTV">Do you use CCTV or surveillance? *</Label>
                <Select value={usesCCTV} onValueChange={setUsesCCTV} required>
                  <SelectTrigger id="usesCCTV">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hasRemoteWorkers">Do you have remote workers? *</Label>
                <Select value={hasRemoteWorkers} onValueChange={setHasRemoteWorkers} required>
                  <SelectTrigger id="hasRemoteWorkers">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Additional Info */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Any other details you'd like to share (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Notes</Label>
                <textarea
                  id="additionalInfo"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us about any specific compliance concerns or requirements..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
              </div>

              <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Running Scan..." : "Run Compliance Scan"}
                  {!loading && <Shield className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {step === 4 && results && (
          <div className="space-y-6">
            <Card className={`${riskBg} border-2`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Compliance Risk Score
                    </CardTitle>
                    <CardDescription>Your AI-powered assessment results</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-5xl font-bold ${riskColor}`}>{results.riskScore}</div>
                    <div className="text-sm text-muted-foreground">/100</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{results.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Steps to improve your compliance posture</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {results.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Policies</CardTitle>
                <CardDescription>Policies you should generate to improve compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {results.recommendedPolicies.map((policy, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-md bg-muted">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{policy}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button onClick={() => router.push("/policies")}>
                Generate Policies <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}





