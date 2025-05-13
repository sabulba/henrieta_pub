// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDHeL7smBEn3hsZTvKZagmtBZaZ8yoCXRA",
  authDomain: "henrietta-edfdc.firebaseapp.com",
  projectId: "henrietta-edfdc",
  storageBucket: "henrietta-edfdc.firebasestorage.app",
  messagingSenderId: "391716509627",
  appId: "1:391716509627:web:34b93c647881e81a27569e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;