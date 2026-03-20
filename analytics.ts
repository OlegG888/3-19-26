import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as fbLogEvent, setUserProperties, setUserId, Analytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc, updateDoc, Firestore } from "firebase/firestore";

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

try {
  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  db = getFirestore(app);
} catch (e) {
  // May fail in some environments (localhost, ad blockers)
}

export function track(event: string, params?: Record<string, string | number | boolean>) {
  if (!analytics) return;
  try {
    fbLogEvent(analytics, event, params);
  } catch {}
}

// Extract email & UTM from URL, save to localStorage + Firestore + Analytics
export async function captureUser(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const urlEmail = params.get("email");
  const utmSource = params.get("utm_source") || "";
  const utmMedium = params.get("utm_medium") || "";
  const utmCampaign = params.get("utm_campaign") || "";

  // Priority: URL email > localStorage email
  const savedEmail = localStorage.getItem("aibos-email");
  const email = urlEmail || savedEmail;

  if (!email) return null;

  // Save to localStorage
  localStorage.setItem("aibos-email", email);

  // Clean URL (remove email param for privacy)
  if (urlEmail && window.history.replaceState) {
    params.delete("email");
    const cleanUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  }

  // Set Analytics user properties
  if (analytics) {
    try {
      setUserId(analytics, email);
      setUserProperties(analytics, {
        email,
        utm_source: utmSource || "(direct)",
        utm_medium: utmMedium || "(none)",
        utm_campaign: utmCampaign || "(none)"
      });
    } catch {}
  }

  // Save/update user in Firestore
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
          visits: 1
        });
        track("new_user", { email, utm_source: utmSource });
      } else {
        await updateDoc(userRef, {
          last_visit: new Date().toISOString(),
          visits: (userDoc.data().visits || 0) + 1
        });
      }
    } catch {}
  } else if (db && savedEmail) {
    // Returning user without URL email -- just update last_visit
    try {
      const userRef = doc(db, "users", savedEmail);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          last_visit: new Date().toISOString(),
          visits: (userDoc.data().visits || 0) + 1
        });
      }
    } catch {}
  }

  return email;
}

// Save framework completion to user's Firestore record
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
