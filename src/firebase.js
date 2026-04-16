import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Set these in Vercel Dashboard → Settings → Environment Variables
// (or in a local .env file for development)
const cfg = {
  apiKey:            import.meta.env.VITE_FB_API_KEY,
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER_ID,
  appId:             import.meta.env.VITE_FB_APP_ID,
};

// fbReady = true  → real Firebase (shared data across all users)
// fbReady = false → demo mode (localStorage, current device only)
export const fbReady = !!(cfg.apiKey && cfg.apiKey !== "undefined");

const app = fbReady
  ? (getApps().length ? getApps()[0] : initializeApp(cfg))
  : null;

export const db = fbReady ? getFirestore(app) : null;
