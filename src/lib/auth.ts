/**
 * Authentication Helpers
 * 
 * Provides utilities for checking authentication state,
 * getting current user, and managing auth context
 */

import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getUser, getTenantByOwner } from "@/lib/db";
import type { User, Tenant } from "@/lib/types";

/**
 * Hook to get current authenticated user and tenant
 */
export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user document from Firestore
        const userData = await getUser(firebaseUser.uid);
        setUserDoc(userData);
        
        if (userData) {
          // Fetch tenant data
          const tenantData = await getTenantByOwner(firebaseUser.uid);
          setTenant(tenantData);
        } else {
          setTenant(null);
        }
      } else {
        setUserDoc(null);
        setTenant(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userDoc, tenant, loading };
}

/**
 * Get current user from Firebase Auth (synchronous check)
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}


