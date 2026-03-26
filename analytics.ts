import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as fbLogEvent, setUserProperties, setUserId, Analytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, Firestore } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut as fbSignOut, onAuthStateChanged, Auth, User } from "firebase/auth";
import posthog from "posthog-js";

const firebaseConfig = {
  apiKey: "AIzaSyARXmL7UNm7CZVZFdxz80b4WQz7IIMCO3s",
  authDomain: "aibos-coach-689c9.firebaseapp.com",
  projectId: "aibos-coach-689c9",
  storageBucket: "aibos-coach-689c9.firebasestorage.app",
  messagingSenderId: "637256071082",
  appId: "1:637256071082:web:2d95f224999db585ae5dd3",
  measurementId: "G-3CW0MX1G3F"
};

let analytics: Analytics | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();

try {
  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  // May fail in some environments (localhost, ad blockers)
}

// PostHog
try {
  posthog.init("phc_c4rjrvJhCWxxzodcbMTY5vThx6CalbezuBpw4Aim78Q", {
    api_host: "https://us.i.posthog.com",
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: { recordCrossOriginIframes: true }
  });
} catch (e) {}

export function track(event: string, params?: Record<string, string | number | boolean>) {
  try { fbLogEvent(analytics!, event, params); } catch {}
  try { posthog.capture(event, params); } catch {}
}

// ─── AUTH ───

export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) return null;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    track("login", { method: "google" });

    // Set Analytics user
    if (user.email) {
      try { setUserId(analytics!, user.email); setUserProperties(analytics!, { email: user.email }); } catch {}
      try { posthog.identify(user.email, { email: user.email, name: user.displayName || "" }); } catch {}
    }

    // Create/update user in Firestore
    if (db && user.email) {
      const userRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || "",
          photo: user.photoURL || "",
          first_visit: new Date().toISOString(),
          last_visit: new Date().toISOString(),
          visits: 1,
          unlocked_bundles: ["free"],
          completed_frameworks: []
        });
      } else {
        await updateDoc(userRef, {
          last_visit: new Date().toISOString(),
          name: user.displayName || userDoc.data().name || "",
          visits: (userDoc.data().visits || 0) + 1
        });
      }
    }

    return user;
  } catch (e) {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  if (!auth) return null;
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    track("login", { method: "email" });

    if (user.email) {
      try { setUserId(analytics!, user.email); setUserProperties(analytics!, { email: user.email }); } catch {}
      try { posthog.identify(user.email, { email: user.email, name: user.displayName || "" }); } catch {}
    }

    if (db && user.email) {
      const userRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          last_visit: new Date().toISOString(),
          visits: (userDoc.data().visits || 0) + 1
        });
      }
    }

    return user;
  } catch (e: any) {
    throw new Error(e.code === "auth/invalid-credential" ? "Wrong email or password" : e.code === "auth/too-many-requests" ? "Too many attempts. Try again later" : e.message);
  }
}

export async function signUpWithEmail(email: string, password: string, name: string): Promise<User | null> {
  if (!auth) return null;
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    if (name) await updateProfile(user, { displayName: name });

    track("sign_up", { method: "email" });

    if (user.email) {
      try { setUserId(analytics!, user.email); setUserProperties(analytics!, { email: user.email }); } catch {}
      try { posthog.identify(user.email, { email: user.email, name: name || "" }); } catch {}
    }

    if (db && user.email) {
      await setDoc(doc(db, "users", user.email), {
        email: user.email,
        name: name || "",
        first_visit: new Date().toISOString(),
        last_visit: new Date().toISOString(),
        visits: 1,
        unlocked_bundles: ["free"],
        completed_frameworks: []
      });
    }

    return user;
  } catch (e: any) {
    throw new Error(e.code === "auth/email-already-in-use" ? "This email is already registered. Try signing in" : e.code === "auth/weak-password" ? "Password must be at least 6 characters" : e.message);
  }
}

export async function signOut(): Promise<void> {
  if (!auth) return;
  try {
    await fbSignOut(auth);
    track("logout");
    try { posthog.reset(); } catch {}
  } catch {}
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

// ─── FIRESTORE: USER DATA ───

// Load user's unlocked bundles from Firestore
export async function loadUserBundles(email: string): Promise<string[]> {
  if (!db || !email) return ["free"];
  try {
    const userRef = doc(db, "users", email);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const bundles = userDoc.data().unlocked_bundles || ["free"];
      return [...new Set(["free", ...bundles])];
    }
  } catch {}
  return ["free"];
}

// Load user's completed frameworks + responses from Firestore
export async function loadUserProgress(email: string): Promise<{ completedFrameworks: string[], userResponses: Record<string, Record<string, string>>, commitments: any[] }> {
  if (!db || !email) return { completedFrameworks: [], userResponses: {}, commitments: [] };
  try {
    const userRef = doc(db, "users", email);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        completedFrameworks: data.completed_frameworks || [],
        userResponses: data.user_responses || {},
        commitments: data.commitments || []
      };
    }
  } catch {}
  return { completedFrameworks: [], userResponses: {}, commitments: [] };
}

// Save full state to Firestore for logged-in user
export async function saveUserState(email: string, state: { unlockedBundles: string[], completedFrameworks: string[], userResponses: Record<string, Record<string, string>>, commitments: any[] }) {
  if (!db || !email) return;
  try {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, {
      unlocked_bundles: state.unlockedBundles,
      completed_frameworks: state.completedFrameworks,
      user_responses: state.userResponses,
      commitments: state.commitments,
      last_activity: new Date().toISOString()
    });
  } catch {}
}

// ─── UTM CAPTURE ───

export async function captureUser(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const urlEmail = params.get("email");
  const utmSource = params.get("utm_source") || "";
  const utmMedium = params.get("utm_medium") || "";
  const utmCampaign = params.get("utm_campaign") || "";

  const savedEmail = localStorage.getItem("aibos-email");
  const email = urlEmail || savedEmail;

  if (!email) return null;

  localStorage.setItem("aibos-email", email);

  if (urlEmail && window.history.replaceState) {
    params.delete("email");
    const cleanUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  }

  try {
    setUserId(analytics!, email);
    setUserProperties(analytics!, {
      email,
      utm_source: utmSource || "(direct)",
      utm_medium: utmMedium || "(none)",
      utm_campaign: utmCampaign || "(none)"
    });
  } catch {}
  try { posthog.identify(email, { email, utm_source: utmSource, utm_medium: utmMedium, utm_campaign: utmCampaign }); } catch {}

  if (db && urlEmail) {
    try {
      const userRef = doc(db, "users", email);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          first_visit: new Date().toISOString(),
          last_visit: new Date().toISOString(),
          visits: 1,
          unlocked_bundles: ["free"],
          completed_frameworks: []
        });
        track("new_user", { email, utm_source: utmSource });
      } else {
        await updateDoc(userRef, {
          last_visit: new Date().toISOString(),
          visits: (userDoc.data().visits || 0) + 1
        });
      }
    } catch {}
  }

  return email;
}

// ─── WAITLIST ───

export async function saveWaitlist(email: string, type: "coach_chat" | "bundle_purchase", bundleId?: string, bundleName?: string) {
  if (!db || !email) return;
  try {
    await addDoc(collection(db, "waitlist"), {
      email,
      type,
      bundle_id: bundleId || null,
      bundle_name: bundleName || null,
      created_at: new Date().toISOString()
    });
    track("waitlist_signup", { email, type, bundle_id: bundleId || "", bundle_name: bundleName || "" });
  } catch {}
}

// ─── PROGRESS (legacy, used by non-logged-in users) ───

export async function saveUserProgress(email: string, frameworkId: string, frameworkName: string) {
  if (!db || !email) return;
  try {
    const userRef = doc(db, "users", email);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      const completed: string[] = data.completed_frameworks || [];
      if (!completed.includes(frameworkId)) {
        await updateDoc(userRef, {
          completed_frameworks: [...completed, frameworkId],
          last_framework: frameworkName,
          last_activity: new Date().toISOString()
        });
      }
    }
  } catch {}
}
