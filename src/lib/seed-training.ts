/**
 * Seed Training Modules
 * 
 * Helper functions to seed default training modules into Firestore
 * These modules are global and available to all tenants
 */

import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TrainingModule } from "@/lib/types";

const TRAINING_MODULES: Omit<TrainingModule, "id">[] = [
  {
    tenantId: null,
    title: "Introduction to Data Protection",
    category: "Data Protection",
    description: "Learn the fundamentals of data protection, privacy laws, and best practices for handling personal information.",
    estimatedMinutes: 15,
    videoUrl: null, // Placeholder - can be replaced with actual video URL
    isGlobal: true,
    quizQuestions: [
      {
        id: "1",
        question: "What is the main purpose of data protection laws?",
        options: [
          "To protect personal information from misuse",
          "To sell user data legally",
          "To reduce storage costs",
          "To simplify data management"
        ],
        correctAnswerIndex: 0,
        explanation: "Data protection laws are designed to protect personal information from misuse and ensure individuals' privacy rights."
      },
      {
        id: "2",
        question: "Which of the following is considered personal data?",
        options: [
          "Company revenue numbers",
          "An individual's email address",
          "Publicly available weather data",
          "General marketing statistics"
        ],
        correctAnswerIndex: 1,
        explanation: "An email address is personal data because it can identify a specific individual."
      },
      {
        id: "3",
        question: "What should you do if you suspect a data breach?",
        options: [
          "Ignore it if it's small",
          "Report it immediately to your supervisor and data protection officer",
          "Wait a few days to see if it resolves",
          "Only report if customers complain"
        ],
        correctAnswerIndex: 1,
        explanation: "Data breaches must be reported immediately to allow for proper incident response and compliance with legal obligations."
      },
      {
        id: "4",
        question: "What is the principle of data minimization?",
        options: [
          "Collect as much data as possible",
          "Only collect data that is necessary for the purpose",
          "Store data forever",
          "Share data with everyone"
        ],
        correctAnswerIndex: 1,
        explanation: "Data minimization means only collecting and processing data that is strictly necessary for the intended purpose."
      },
      {
        id: "5",
        question: "Who is responsible for data protection in an organization?",
        options: [
          "Only the IT department",
          "Only the legal team",
          "Everyone in the organization",
          "Only senior management"
        ],
        correctAnswerIndex: 2,
        explanation: "Data protection is everyone's responsibility. All staff must handle data appropriately."
      }
    ]
  },
  {
    tenantId: null,
    title: "Workplace Safety Basics",
    category: "Workplace Safety",
    description: "Essential workplace safety practices, hazard identification, and emergency procedures.",
    estimatedMinutes: 20,
    videoUrl: null,
    isGlobal: true,
    quizQuestions: [
      {
        id: "1",
        question: "What should you do first if you notice a workplace hazard?",
        options: [
          "Ignore it",
          "Report it immediately to your supervisor",
          "Fix it yourself without telling anyone",
          "Wait for someone else to notice"
        ],
        correctAnswerIndex: 1,
        explanation: "Workplace hazards should be reported immediately to supervisors to ensure proper safety protocols are followed."
      },
      {
        id: "2",
        question: "When should you wear personal protective equipment (PPE)?",
        options: [
          "Only when it's convenient",
          "When required by safety regulations for the task",
          "Never",
          "Only during inspections"
        ],
        correctAnswerIndex: 1,
        explanation: "PPE must be worn whenever safety regulations require it for the specific task being performed."
      },
      {
        id: "3",
        question: "What is the purpose of a fire evacuation plan?",
        options: [
          "To create delays",
          "To ensure everyone knows how to exit safely in an emergency",
          "To complicate procedures",
          "To save money"
        ],
        correctAnswerIndex: 1,
        explanation: "Evacuation plans are designed to ensure everyone can exit the building safely and efficiently during an emergency."
      },
      {
        id: "4",
        question: "What should you do if someone is injured at work?",
        options: [
          "Leave them alone",
          "Provide first aid if trained, and call for medical help",
          "Wait for a doctor",
          "Move them immediately"
        ],
        correctAnswerIndex: 1,
        explanation: "Provide first aid only if you're trained, then call for professional medical help immediately."
      },
      {
        id: "5",
        question: "How often should safety equipment be inspected?",
        options: [
          "Never",
          "According to manufacturer recommendations and company policy",
          "Once a year",
          "Only when broken"
        ],
        correctAnswerIndex: 1,
        explanation: "Safety equipment must be inspected according to both manufacturer recommendations and company safety policies."
      }
    ]
  },
  {
    tenantId: null,
    title: "Anti-Fraud Awareness",
    category: "Security",
    description: "Recognize common fraud schemes, protect sensitive information, and respond to suspicious activity.",
    estimatedMinutes: 18,
    videoUrl: null,
    isGlobal: true,
    quizQuestions: [
      {
        id: "1",
        question: "What is a common red flag for phishing emails?",
        options: [
          "Professional formatting",
          "Urgent requests for sensitive information or money transfers",
          "Clear sender information",
          "Spelling and grammar check"
        ],
        correctAnswerIndex: 1,
        explanation: "Phishing emails often create urgency and request sensitive information or money transfers."
      },
      {
        id: "2",
        question: "What should you do if you receive a suspicious email requesting payment?",
        options: [
          "Respond immediately",
          "Verify the request through an independent channel before acting",
          "Forward it to everyone",
          "Ignore it completely"
        ],
        correctAnswerIndex: 1,
        explanation: "Always verify payment requests through an independent channel (e.g., phone call) before processing."
      },
      {
        id: "3",
        question: "What is identity theft?",
        options: [
          "Borrowing someone's car",
          "Using someone's personal information without authorization",
          "Sharing a social media post",
          "Forgetting a password"
        ],
        correctAnswerIndex: 1,
        explanation: "Identity theft occurs when someone uses another person's personal information without authorization."
      },
      {
        id: "4",
        question: "How can you protect yourself from fraud?",
        options: [
          "Share passwords with colleagues",
          "Keep personal and financial information confidential and secure",
          "Click all email links",
          "Ignore security policies"
        ],
        correctAnswerIndex: 1,
        explanation: "Keeping personal and financial information confidential and secure is essential for fraud prevention."
      },
      {
        id: "5",
        question: "What should you do if you suspect fraud?",
        options: [
          "Keep it to yourself",
          "Report it immediately to your supervisor or security team",
          "Discuss it on social media",
          "Try to handle it yourself"
        ],
        correctAnswerIndex: 1,
        explanation: "Suspected fraud should be reported immediately through proper channels to enable investigation and prevention."
      }
    ]
  }
];

/**
 * Seed training modules into Firestore
 * Call this function once to populate the database
 */
export async function seedTrainingModules(): Promise<void> {
  const batch = [];
  
  for (const module of TRAINING_MODULES) {
    const moduleRef = doc(collection(db, "trainingModules"));
    batch.push(
      setDoc(moduleRef, {
        ...module,
        createdAt: Timestamp.now(),
      })
    );
  }

  await Promise.all(batch);
  console.log(`Seeded ${TRAINING_MODULES.length} training modules`);
}





