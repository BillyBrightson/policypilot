/**
 * Seed Trainer Profiles
 * 
 * Helper functions to seed default trainer profiles into Firestore
 */

import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TrainerProfile } from "@/lib/types";

const TRAINER_PROFILES: Omit<TrainerProfile, "id">[] = [
  {
    name: "Dr. Sarah Mensah",
    specialization: "Data Protection & Privacy",
    location: "Accra, Ghana",
    bio: "Experienced data protection consultant with 10+ years helping businesses comply with GDPR and local privacy laws. Certified Information Privacy Professional (CIPP).",
    contactEmail: "sarah.mensah@example.com",
    rating: 4.8,
    isActive: true,
  },
  {
    name: "James Osei",
    specialization: "Fire Safety & Workplace Safety",
    location: "Kumasi, Ghana",
    bio: "Fire safety expert and certified trainer with extensive experience in workplace safety compliance. Former fire officer with 15 years of field experience.",
    contactEmail: "james.osei@example.com",
    rating: 4.9,
    isActive: true,
  },
  {
    name: "Amina Hassan",
    specialization: "HR Compliance & Employment Law",
    location: "Lagos, Nigeria",
    bio: "HR consultant specializing in employment law compliance, workplace policies, and employee training. Helps SMEs navigate complex HR regulations.",
    contactEmail: "amina.hassan@example.com",
    rating: 4.7,
    isActive: true,
  },
  {
    name: "Michael Chen",
    specialization: "Cybersecurity & Information Security",
    location: "Nairobi, Kenya",
    bio: "Cybersecurity consultant with expertise in information security policies, incident response, and security awareness training for small businesses.",
    contactEmail: "michael.chen@example.com",
    rating: 4.9,
    isActive: true,
  },
  {
    name: "Grace Ofori",
    specialization: "Financial Compliance & Anti-Fraud",
    location: "Accra, Ghana",
    bio: "Financial compliance expert specializing in anti-fraud training, internal controls, and financial regulations for SMEs.",
    contactEmail: "grace.ofori@example.com",
    rating: 4.6,
    isActive: true,
  },
];

/**
 * Seed trainer profiles into Firestore
 * Call this function once to populate the database
 */
export async function seedTrainerProfiles(): Promise<void> {
  const batch = [];
  
  for (const trainer of TRAINER_PROFILES) {
    const trainerRef = doc(collection(db, "trainerProfiles"));
    batch.push(
      setDoc(trainerRef, {
        ...trainer,
        createdAt: Timestamp.now(),
      })
    );
  }

  await Promise.all(batch);
  console.log(`Seeded ${TRAINER_PROFILES.length} trainer profiles`);
}





