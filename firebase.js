// firebase.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// ✅ Correct Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAgGpjdIWo44V4WbdICaM7mbqemzZ7HFkk",
  authDomain: "test-cc2c6.firebaseapp.com",
  projectId: "test-cc2c6",
  storageBucket: "test-cc2c6.appspot.com",
  messagingSenderId: "61997366864",
  appId: "1:61997366864:web:375e2112b51bdc95799b55",
};

const app = initializeApp(firebaseConfig);

// ✅ Use React Native persistence so Auth works offline
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Firestore always after app init
export const db = getFirestore(app);