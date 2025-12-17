import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXgZe6FPfSyKoz8m3Uqrixcz-M0Fejz58",
  authDomain: "nexura-a5e21.firebaseapp.com",
  projectId: "nexura-a5e21",
  storageBucket: "nexura-a5e21.appspot.com",
  messagingSenderId: "45885832487",
  appId: "1:45885832487:web:30126eb365cfb894c83d02",
  measurementId: "G-HPNVD370MK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const provider = new GoogleAuthProvider();

// Export necessary Firestore methods if needed
export { doc, setDoc };

export default app;
