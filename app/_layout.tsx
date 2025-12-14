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
  const router = useRouter();
  const segments = useSegments() as string[];
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);

      if (firebaseUser) {
        if (!segments.includes("(tabs)")) {
          router.replace("/(tabs)" as any);
        }
      } else {
        if (
          !segments.includes("login") &&
          !segments.includes("register")
        ) {
          router.replace("/login" as any);
        }
      }

      setTimeout(() => setShowSplash(false), 1000);
    });

    return unsubscribe;
  }, []);

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
            Zihinsel rahatlama ve farkındalık yolculuğun başlıyor...
          </Text>
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 25 }} />
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <AudioPlayerProvider>
      <LinearGradient
        colors={["#2c3e50", "#121212"]}
        style={StyleSheet.absoluteFill}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="(tabs)" />
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
