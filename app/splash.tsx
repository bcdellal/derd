import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";

// Bu component uygulama ilk açıldığında görünen Splash Screen'dir
// Uygulamanın giriş animasyonunu ve ilk yönlendirmesini yönetir
export default function SplashScreen() {
  // Router ile splash sonrası hangi ekrana gidileceği kontrol edilir
  const router = useRouter();

  // Fade-in (şeffaflıktan görünür hale gelme) animasyonu için
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Logo için scale (küçükten büyüğe) animasyonu
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  // Component ekrana geldiği anda animasyonlar başlatılır
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // opacity 0'dan 1'e çıkar, ekran yumuşakça görünür
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, // logo normal boyutuna büyür
        friction: 4, // yay efekti, ne kadar sert yavaşlayacağını belirler
        useNativeDriver: true,
      }),
    ]).start();

    // Splash ekranı belirli bir süre gösterildikten sonra login ekranına geçilir
    const timeout = setTimeout(() => {
      router.replace("/login" as any);
    }, 2500);

    // Component unmount olursa timeout temizlenir
    return () => clearTimeout(timeout);
  }, []);

  // Splash ekranının UI yapısı
  return (
    <LinearGradient colors={["#C6E0C6", "#2E3D3A"]} style={styles.container}>
      <Animated.View
        style={[
          styles.center,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Uygulama logosu */}
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Uygulama adı */}
        <Text style={styles.text}>Derd</Text>

        {/* Alt slogan */}
        <Text style={styles.subtext}>A calm mind begins here 🌿</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Splash ekranının tamamını kaplayan container
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Logo ve yazıları ortalayan view
  center: {
    alignItems: "center",
  },

  // Logo boyutu
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },

  // Uygulama ismi stili
  text: {
    fontSize: 42,
    color: "#F5FFF5",
    fontWeight: "600",
    letterSpacing: 1,
  },

  // Alt metin stili
  subtext: {
    color: "#E3F0E3",
    fontSize: 16,
    marginTop: 10,
  },
});
