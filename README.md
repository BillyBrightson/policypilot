# PolicyPilot

**Your business. Fully compliant.**

PolicyPilot is a production-ready, subscription-based SaaS application for Compliance & Policy Automation for SMEs. It helps businesses run AI-powered compliance scans, generate required policies and documents, monitor compliance on a dashboard, deliver employee micro-training with quizzes and certificates, and connect with external trainers/consultants.

## Features

- 🔐 **Authentication**: Firebase Auth with email/password and Google sign-in
- 🏢 **Multi-tenant**: Full multi-tenant support with workspace isolation
- 🤖 **AI Compliance Scan**: Automated risk assessment and compliance gap analysis
- 📄 **AI Policy Generator**: Generate customized compliance policies
- 🎓 **Employee Training**: Interactive training modules with quizzes and certificates
- 👥 **Trainer Marketplace**: Connect with compliance experts and trainers
- 💳 **Subscription Management**: Plan-based access control (Basic, Pro, Enterprise)
- 📊 **Dashboard**: Real-time compliance monitoring and recommendations

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Backend**: Firebase (Authentication + Firestore)
- **Icons**: Lucide React
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Firebase Admin SDK credentials (for server-side operations)

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env.local` file in the root directory:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI API Keys (Optional - for future integration)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

4. **Configure Firebase**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Copy your Firebase config to `.env.local`

5. **Run the development server**:
```bash
npm run dev
```

6. **Seed initial data** (optional):
You can seed training modules and trainer profiles by creating a temporary script or running:
```bash
# Create a file: scripts/seed.ts and import the seed functions
npm run seed
```

For now, training modules and trainers can be added manually through the Firebase Console or by creating them programmatically.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
PolicyPilot/
├── app/
│   ├── (public)/           # Public routes (landing, pricing, auth)
│   │   ├── page.tsx        # Landing page
│   │   ├── pricing/
│   │   ├── about/
│   │   └── auth/           # Sign in/up pages
│   ├── (protected)/        # Protected routes (require auth)
│   │   ├── dashboard/
│   │   ├── wizard/         # Compliance scan wizard
│   │   ├── policies/
│   │   ├── training/
│   │   └── trainers/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── protected-layout.tsx
├── lib/
│   ├── ai/                 # AI integration (currently mocked)
│   │   └── compliance.ts
│   ├── auth.ts             # Auth helpers
│   ├── db.ts               # Firestore helpers
│   ├── firebase.ts         # Firebase config
│   ├── types.ts            # Shared TypeScript types
│   ├── utils.ts            # Utility functions
│   ├── seed-training.ts    # Training modules seeder
│   └── seed-trainers.ts    # Trainer profiles seeder
└── package.json
```

## Key Features Explained

### 1. Authentication & Onboarding
- Users sign up with email/password or Google
- First-time users create a workspace (tenant)
- User role is set to "owner" for the tenant

### 2. Compliance Scan Wizard
- Multi-step form to capture business details
- AI-powered analysis (currently mocked)
- Generates risk score, summary, recommended actions, and policies
- Results saved to Firestore

### 3. Policy Generator
- Select policy type
- AI generates customized policy content (currently mocked)
- Policies saved as draft or final
- Download as text (PDF/DOCX export can be added)

### 4. Training Modules
- Pre-seeded global training modules
- Each module has a video placeholder and quiz
- Passing score (70%) earns a certificate
- Completion tracked in Firestore

### 5. Trainer Marketplace
- List of available trainers with specializations
- Request training sessions with topics and dates
- Bookings tracked with status (pending, confirmed, completed, cancelled)

### 6. Subscription Management
- Each tenant gets a default "basic" subscription
- Plan-based feature gating (prepared for Stripe/Paystack integration)
- Upgrade prompts in dashboard

## AI Integration

Currently, AI functions are **mocked** for development. To integrate real AI:

1. Update `lib/ai/compliance.ts`:
   - Replace `runComplianceScan()` with OpenAI/Claude API calls
   - Replace `generatePolicy()` with AI generation
   - Use environment variables for API keys

2. Add proper error handling and rate limiting

3. Consider cost tracking for AI usage

## Database Schema

### Collections

- `tenants`: Business workspaces
- `users`: User accounts with tenant association
- `complianceProfiles`: Compliance scan results
- `policies`: Generated policy documents
- `trainingModules`: Training content (global or tenant-specific)
- `trainingCompletions`: User training results
- `trainerProfiles`: Available trainers
- `trainerBookings`: Training session requests
- `subscriptions`: Tenant subscription plans

## Future Enhancements

- [ ] Real AI API integration (OpenAI/Claude)
- [ ] PDF/DOCX export for policies
- [ ] Stripe/Paystack payment integration
- [ ] Email notifications
- [ ] Certificate generation (visual PDF certificates)
- [ ] Trainer dashboard for managing bookings
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Mobile app

## License

ISC

## Support

For questions or issues, please contact support at contact@policypilot.com





