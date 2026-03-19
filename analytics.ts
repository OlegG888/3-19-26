import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as fbLogEvent, Analytics } from "firebase/analytics";

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

try {
  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
} catch (e) {
  // Analytics may fail in some environments (localhost, ad blockers)
}

export function track(event: string, params?: Record<string, string | number | boolean>) {
  if (!analytics) return;
  try {
    fbLogEvent(analytics, event, params);
  } catch {}
}
