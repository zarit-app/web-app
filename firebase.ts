import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/functions";
import "firebase/analytics";

const loadFirebase = () => {
  try {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    firebase.initializeApp(config);
  } catch (error) {
    if (!/already exist/.test(error.message)) {
      console.error("Firebase initialization error", error.stack);
    }
  }
  return firebase;
};

const app = loadFirebase();

export const auth = app.auth();
export const firestore = app.firestore();
export const storage = app.storage();
export default app;
