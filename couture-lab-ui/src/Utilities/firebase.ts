// Needs to be firebase/compat/app to remove Module not found: Error: Package path . is not exported from package
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = ({
    apiKey: process.env.FIREBASE_API_KEY || 'mock_key', // ask me for key if app doesn't run
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
})

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const FirebaseAuth = getAuth(app);
const storage = getStorage(app);

export default app;
export { FirebaseAuth, storage, db };