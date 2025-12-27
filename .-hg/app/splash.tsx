import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";

export default function SplashScreen() {   //  bu satır önemli emmim
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      router.replace("/login" as any);
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient colors={["#C6E0C6", "#2E3D3A"]} style={styles.container}>
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
        <Text style={styles.text}>Derd</Text>
        <Text style={styles.subtext}>A calm mind begins here 🌿</Text>
      </Animated.View>
    </LinearGradient>
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
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 42,
    color: "#F5FFF5",
    fontWeight: "600",
    letterSpacing: 1,
  },
  subtext: {
    color: "#E3F0E3",
    fontSize: 16,
    marginTop: 10,
  },
});
