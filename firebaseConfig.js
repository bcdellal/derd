import { initializeApp } from "firebase/app";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase projesine ait temel yapılandırma bilgileri
// Bu bilgiler Firebase Console üzerinden oluşturulur
const firebaseConfig = {
  apiKey: "AIzaSyC3Fw0oic63hcHmusZGVrkyZLQc-BHgqMs",
  authDomain: "derd-app.firebaseapp.com",
  projectId: "derd-app",
  storageBucket: "derd-app.firebasestorage.app",
  messagingSenderId: "685613780247",
  appId: "1:685613780247:web:2bfefb5ff0b11cda9ebb52",
  measurementId: "G-2263S50WNG"
};

// Firebase uygulaması bu satırda başlatılır
// Bu işlem tüm Firebase servislerinin temelidir
const app = initializeApp(firebaseConfig);

// Firestore veritabanı servisi oluşturulur
// Uygulama genelinde veri okuma/yazma işlemleri buradan yapılır
export const db = getFirestore(app);

// Firebase Authentication servisi initialize edilir
// React Native ortamında oturumun kalıcı olması için
// AsyncStorage tabanlı persistence kullanılır
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
