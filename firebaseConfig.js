import { initializeApp } from "firebase/app";
// --- ESKİ `getAuth` SİLİNDİ, YENİLERİ EKLENDİ ---
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyC3Fw0oic63hcHmusZGVrkyZLQc-BHgqMs",
  authDomain: "derd-app.firebaseapp.com",
  projectId: "derd-app",
  storageBucket: "derd-app.firebasestorage.app",
  messagingSenderId: "685613780247",
  appId: "1:685613780247:web:2bfefb5ff0b11cda9ebb52",
  measurementId: "G-2263S50WNG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Diğer dosyalarda kullanmak üzere servisleri dışa aktar (export et)
export const db = getFirestore(app);

// --- ESKİ `getAuth` YERİNE GÜNCELLENMİŞ KOD ---
// Bu kod, kullanıcının giriş durumunu telefonun hafızasında (AsyncStorage) saklar.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});