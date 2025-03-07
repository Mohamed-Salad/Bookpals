import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATTFybPKv0B9ROrMX_BwPzs67D9dfoH04",
  authDomain: "fapp-9770f.firebaseapp.com",
  projectId: "fapp-9770f",
  storageBucket: "fapp-9770f.firebasestorage.app",
  messagingSenderId: "919697466785",
  appId: "1:919697466785:web:04421b0f69822c0b0bd7e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app; 