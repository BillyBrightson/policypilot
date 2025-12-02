/**
 * Firestore Database Helpers
 * 
 * Provides typed CRUD operations for all Firestore collections
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Tenant,
  User,
  ComplianceProfile,
  Policy,
  PolicyVersion,
  TrainingModule,
  TrainingCompletion,
  TrainerProfile,
  TrainerBooking,
  Subscription,
  Notification,
} from "@/lib/types";

// Helper to convert Firestore timestamps to dates
const convertTimestamp = (timestamp: any): Date | string => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === "string") {
    return timestamp;
  }
  return new Date();
};

// TENANTS
export async function createTenant(data: Omit<Tenant, "id">): Promise<string> {
  const tenantRef = doc(collection(db, "tenants"));
  await setDoc(tenantRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return tenantRef.id;
}

export async function getTenant(id: string): Promise<Tenant | null> {
  const docRef = doc(db, "tenants", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data(), createdAt: convertTimestamp(docSnap.data().createdAt) } as Tenant;
}

export async function getTenantByOwner(ownerUserId: string): Promise<Tenant | null> {
  const q = query(collection(db, "tenants"), where("ownerUserId", "==", ownerUserId), firestoreLimit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data(), createdAt: convertTimestamp(doc.data().createdAt) } as Tenant;
}

// USERS
export async function createUser(data: User): Promise<string> {
  const userRef = doc(collection(db, "users"), data.id); // Use Firebase Auth UID as doc ID
  await setDoc(userRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return userRef.id;
}

export async function getUser(id: string): Promise<User | null> {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data(), createdAt: convertTimestamp(docSnap.data().createdAt) } as User;
}

// Helper to update user tenantId
export async function updateUserTenantId(userId: string, tenantId: string): Promise<void> {
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, { tenantId });
}

export async function getUsersByTenant(tenantId: string): Promise<User[]> {
  const q = query(collection(db, "users"), where("tenantId", "==", tenantId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: convertTimestamp(doc.data().createdAt),
  })) as User[];
}

// COMPLIANCE PROFILES
export async function createComplianceProfile(data: Omit<ComplianceProfile, "id">): Promise<string> {
  const profileRef = doc(collection(db, "complianceProfiles"));
  await setDoc(profileRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return profileRef.id;
}

export async function getComplianceProfile(id: string): Promise<ComplianceProfile | null> {
  const docRef = doc(db, "complianceProfiles", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: convertTimestamp(docSnap.data().createdAt),
  } as ComplianceProfile;
}

export async function getLatestComplianceProfile(tenantId: string): Promise<ComplianceProfile | null> {
  const q = query(
    collection(db, "complianceProfiles"),
    where("tenantId", "==", tenantId),
    orderBy("createdAt", "desc"),
    firestoreLimit(1)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: convertTimestamp(doc.data().createdAt),
  } as ComplianceProfile;
}

// POLICIES
export async function createPolicy(data: Omit<Policy, "id">): Promise<string> {
  const policyRef = doc(collection(db, "policies"));
  await setDoc(policyRef, {
    ...data,
    lastGeneratedAt: data.lastGeneratedAt ? Timestamp.fromDate(new Date(data.lastGeneratedAt)) : null,
    currentVersionId: data.currentVersionId || null,
    controlCoverage: data.controlCoverage || null,
  });
  return policyRef.id;
}

export async function getPolicy(id: string): Promise<Policy | null> {
  const docRef = doc(db, "policies", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    lastGeneratedAt: data.lastGeneratedAt ? convertTimestamp(data.lastGeneratedAt) : null,
    currentVersionId: data.currentVersionId || null,
    controlCoverage: data.controlCoverage || null,
  } as Policy;
}

export async function getPoliciesByTenant(tenantId: string): Promise<Policy[]> {
  const q = query(collection(db, "policies"), where("tenantId", "==", tenantId), orderBy("lastGeneratedAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      lastGeneratedAt: data.lastGeneratedAt ? convertTimestamp(data.lastGeneratedAt) : null,
      currentVersionId: data.currentVersionId || null,
      controlCoverage: data.controlCoverage || null,
    };
  }) as Policy[];
}

export async function updatePolicyStatus(id: string, status: Policy["status"]): Promise<void> {
  const docRef = doc(db, "policies", id);
  await updateDoc(docRef, { status });
}

export async function updatePolicyContent(id: string, content: string): Promise<void> {
  const docRef = doc(db, "policies", id);
  await updateDoc(docRef, {
    content,
    lastGeneratedAt: Timestamp.now(),
  });
}

export async function updatePolicyCurrentVersion(
  policyId: string,
  versionId: string,
  summary: string,
  controlCoverage: Policy["controlCoverage"] = null
): Promise<void> {
  const docRef = doc(db, "policies", policyId);
  await updateDoc(docRef, {
    currentVersionId: versionId,
    summary,
    controlCoverage: controlCoverage || null,
    lastGeneratedAt: Timestamp.now(),
  });
}

export async function createPolicyVersion(
  data: Omit<PolicyVersion, "id" | "createdAt">
): Promise<string> {
  const versionRef = doc(collection(db, "policyVersions"));
  await setDoc(versionRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return versionRef.id;
}

export async function getLatestPolicyVersion(policyId: string): Promise<PolicyVersion | null> {
  const q = query(
    collection(db, "policyVersions"),
    where("policyId", "==", policyId),
    orderBy("createdAt", "desc"),
    firestoreLimit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
  } as PolicyVersion;
}

export async function getPolicyVersions(policyId: string, limitCount: number = 5): Promise<PolicyVersion[]> {
  const q = query(
    collection(db, "policyVersions"),
    where("policyId", "==", policyId),
    orderBy("createdAt", "desc"),
    firestoreLimit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
    } as PolicyVersion;
  });
}

// TRAINING MODULES
export async function getTrainingModules(tenantId?: string): Promise<TrainingModule[]> {
  let q;
  if (tenantId) {
    // Get global modules or tenant-specific modules
    q = query(
      collection(db, "trainingModules"),
      where("isGlobal", "==", true)
    );
  } else {
    q = query(collection(db, "trainingModules"));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TrainingModule[];
}

export async function getTrainingModule(id: string): Promise<TrainingModule | null> {
  const docRef = doc(db, "trainingModules", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as TrainingModule;
}

// TRAINING COMPLETIONS
export async function createTrainingCompletion(data: Omit<TrainingCompletion, "id">): Promise<string> {
  const completionRef = doc(collection(db, "trainingCompletions"));
  await setDoc(completionRef, {
    ...data,
    completedAt: Timestamp.now(),
  });
  return completionRef.id;
}

export async function getTrainingCompletionsByUser(userId: string, tenantId: string): Promise<TrainingCompletion[]> {
  const q = query(
    collection(db, "trainingCompletions"),
    where("userId", "==", userId),
    where("tenantId", "==", tenantId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    completedAt: convertTimestamp(doc.data().completedAt),
  })) as TrainingCompletion[];
}

// TRAINER PROFILES
export async function getTrainerProfiles(activeOnly: boolean = true): Promise<TrainerProfile[]> {
  let q;
  if (activeOnly) {
    q = query(collection(db, "trainerProfiles"), where("isActive", "==", true));
  } else {
    q = query(collection(db, "trainerProfiles"));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TrainerProfile[];
}

export async function getTrainerProfile(id: string): Promise<TrainerProfile | null> {
  const docRef = doc(db, "trainerProfiles", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as TrainerProfile;
}

// TRAINER BOOKINGS
export async function createTrainerBooking(data: Omit<TrainerBooking, "id" | "createdAt">): Promise<string> {
  const bookingRef = doc(collection(db, "trainerBookings"));
  await setDoc(bookingRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return bookingRef.id;
}

export async function getTrainerBookingsByTenant(tenantId: string): Promise<TrainerBooking[]> {
  const q = query(
    collection(db, "trainerBookings"),
    where("tenantId", "==", tenantId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: convertTimestamp(doc.data().createdAt),
  })) as TrainerBooking[];
}

// SUBSCRIPTIONS
export async function createSubscription(data: Omit<Subscription, "id">): Promise<string> {
  const subRef = doc(collection(db, "subscriptions"));
  await setDoc(subRef, {
    ...data,
    createdAt: Timestamp.now(),
    renewsAt: data.renewsAt ? Timestamp.fromDate(new Date(data.renewsAt)) : null,
  });
  return subRef.id;
}

export async function getSubscriptionByTenant(tenantId: string): Promise<Subscription | null> {
  const q = query(
    collection(db, "subscriptions"),
    where("tenantId", "==", tenantId),
    orderBy("createdAt", "desc"),
    firestoreLimit(1)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    renewsAt: data.renewsAt ? convertTimestamp(data.renewsAt) : null,
  } as Subscription;
}

// NOTIFICATIONS
export async function createNotification(data: Omit<Notification, "id">): Promise<string> {
  const notificationRef = doc(collection(db, "notifications"));
  await setDoc(notificationRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return notificationRef.id;
}

export async function getNotificationsByUser(userId: string, tenantId: string, limitCount: number = 10): Promise<Notification[]> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("tenantId", "==", tenantId),
    orderBy("createdAt", "desc"),
    firestoreLimit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: convertTimestamp(doc.data().createdAt),
  })) as Notification[];
}

export async function getAllNotificationsByTenant(tenantId: string, limitCount: number = 100): Promise<Notification[]> {
  const q = query(
    collection(db, "notifications"),
    where("tenantId", "==", tenantId),
    orderBy("createdAt", "desc"),
    firestoreLimit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: convertTimestamp(doc.data().createdAt),
  })) as Notification[];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const docRef = doc(db, "notifications", notificationId);
  await updateDoc(docRef, { read: true });
}

export async function markAllNotificationsAsRead(userId: string, tenantId: string): Promise<void> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("tenantId", "==", tenantId),
    where("read", "==", false)
  );
  const querySnapshot = await getDocs(q);
  const updatePromises = querySnapshot.docs.map((doc) =>
    updateDoc(doc.ref, { read: true })
  );
  await Promise.all(updatePromises);
}

export async function getUnreadNotificationCount(userId: string, tenantId: string): Promise<number> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("tenantId", "==", tenantId),
    where("read", "==", false)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
}

