import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
} from "react-native";
import { AudioPlayerProvider } from "../context/AudioPlayerContext";
import { auth } from "../firebaseConfig";

export default function RootLayout() {
  // Sayfa yönlendirmeleri için router
  const router = useRouter();

  // Şu an hangi route grubunda olduğumuzu anlamak için
  const segments = useSegments() as string[];

  // Firebase Authentication'dan gelen kullanıcı bilgisi
  const [user, setUser] = useState<User | null>(null);

  // Uygulama ilk açıldığında auth durumu kontrol edilirken true olur
  const [initializing, setInitializing] = useState(true);

  // Splash ekranının gösterilip gösterilmeyeceğini kontrol eder
  const [showSplash, setShowSplash] = useState(true);

  // Splash ekranındaki fade animasyonu için
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Splash ekranındaki logo büyüme animasyonu için
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Splash ekranı ilk açıldığında animasyonları başlatır
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // opacity 0'dan 1'e çıkar
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, // logo hafif büyüyerek yerine oturur
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Firebase Authentication dinleyicisi
  // Kullanıcı giriş yaptı mı çıkış mı yaptı buradan anlaşılır
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);

      // Eğer kullanıcı giriş yaptıysa
      if (firebaseUser) {
        // Tabs ekranında değilse ana uygulamaya yönlendir
        if (!segments.includes("(tabs)")) {
          router.replace("/(tabs)" as any);
        }
      } else {
        // Kullanıcı giriş yapmamışsa login ekranına gönder
        if (
          !segments.includes("login") &&
          !segments.includes("register")
        ) {
          router.replace("/login" as any);
        }
      }

      // Splash ekranı minimum 1 saniye gösterilir
      setTimeout(() => setShowSplash(false), 1000);
    });

    // Component unmount olunca auth listener temizlenir
    return unsubscribe;
  }, []);

  // Eğer auth kontrolü bitmediyse veya splash açıksa
  // Ana uygulama yerine splash ekranı gösterilir
  if (initializing || showSplash) {
    return (
      <LinearGradient colors={["#2c3e50", "#121212"]} style={styles.container}>
        <Animated.View
          style={[
            styles.center,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Derd</Text>
          <Text style={styles.subtitle}>
            Your journey to mental relaxation and mindfulness begins here...
          </Text>

          {/* Kullanıcı beklerken loading göstergesi */}
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 25 }} />
        </Animated.View>
      </LinearGradient>
    );
  }

  // Splash bittikten sonra uygulamanın asıl layout'u render edilir
  return (
    // AudioPlayerProvider sayesinde müzik/meditasyon sesi
    // tüm uygulamada ortak şekilde yönetilir
    <AudioPlayerProvider>
      {/* Uygulama arka plan gradyanı */}
      <LinearGradient
        colors={["#2c3e50", "#121212"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Expo Router stack yapısı */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        {/* Giriş sonrası ana tab yapısı */}
        <Stack.Screen name="(tabs)" />

        {/* Authentication ekranları */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </AudioPlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});
