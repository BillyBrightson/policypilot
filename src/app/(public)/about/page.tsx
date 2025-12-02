import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">PolicyPilot</Link>
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">About PolicyPilot</h1>
        
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-xl text-muted-foreground mb-6">
            PolicyPilot was born from a simple observation: compliance shouldn't be complicated, expensive, or overwhelming—especially for small and medium-sized businesses.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p className="mb-6">
            We believe every business, regardless of size, deserves access to world-class compliance tools. That's why we've built PolicyPilot to democratize compliance management through AI-powered automation, making it affordable, accessible, and easy to use.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-6 my-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Automate Compliance</h3>
              <p className="text-sm text-muted-foreground">
                Use AI to scan your business and identify compliance gaps
              </p>
            </div>
            <div className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Generate Policies</h3>
              <p className="text-sm text-muted-foreground">
                Create professional policies tailored to your business needs
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Train Your Team</h3>
              <p className="text-sm text-muted-foreground">
                Equip your employees with compliance knowledge through interactive training
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
          <ul className="list-disc list-inside space-y-2 mb-6">
            <li><strong>Simplicity:</strong> Complex compliance made simple</li>
            <li><strong>Accessibility:</strong> Affordable tools for businesses of all sizes</li>
            <li><strong>Innovation:</strong> Leveraging AI to solve real-world problems</li>
            <li><strong>Transparency:</strong> Clear pricing, clear processes, clear communication</li>
          </ul>

          <div className="bg-muted p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold mb-2">Get in Touch</h3>
            <p className="mb-4">
              Have questions? We'd love to hear from you. Reach out to us at{" "}
              <a href="mailto:contact@policypilot.com" className="text-primary hover:underline">
                contact@policypilot.com
              </a>
            </p>
            <Link href="/auth/signup">
              <Button>Start Your Free Trial</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}





