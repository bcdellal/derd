import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { auth } from "../firebaseConfig";

export default function LoginScreen() {
  // Sayfa yönlendirmeleri için Expo Router
  const router = useRouter();

  // Kullanıcıdan alınan email ve şifre
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Ekran açılırken kullanılan fade animasyonu
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Logo için scale (büyüme) animasyonu
  const logoAnim = useRef(new Animated.Value(0)).current;

  // Sayfa ilk render edildiğinde animasyonlar başlatılır
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // ekran yavaşça görünür
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(logoAnim, {
        toValue: 1, // logo küçükten normale büyür
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Login butonuna basıldığında çalışan fonksiyon
  const handleLogin = async () => {
    // Email veya şifre boşsa girişe izin verilmez
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Info", "Please enter both email and password.");
      return;
    }

    try {
      // Firebase Authentication ile email-şifre doğrulaması
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Giriş yapan kullanıcı bilgisi
      const user = userCredential.user;

      // Başarılı giriş mesajı
      Alert.alert(
        "Welcome Back 🌿",
        `Glad to see you again, ${user.email}`
      );

      // Giriş başarılıysa ana uygulama (tabs) ekranına yönlendirilir
      router.replace("/(tabs)" as any);
    } catch (error: any) {
      // Hatalı giriş durumunda Firebase'den gelen hata gösterilir
      Alert.alert("Login Error", error.message);
    }
  };

  // Login ekranının UI yapısı
  return (
    <LinearGradient colors={["#BFD8BF", "#3C5247"]} style={styles.background}>
      <KeyboardAvoidingView
        // iOS ve Android klavye davranış farkı burada yönetilir
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Klavyeye basılınca kapanması için */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
            {/* Logo animasyonlu şekilde gösterilir */}
            <Animated.Image
              source={require("../assets/images/logo.png")}
              style={[styles.logo, { transform: [{ scale: logoAnim }] }]}
              resizeMode="contain"
            />

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your journey of peace and growth
            </Text>

            {/* Email input */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#4A5C4A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password input */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#4A5C4A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Login butonu */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* Register ekranına yönlendiren footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/register" as any)}
              >
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },

  // İçeriği ortalayan ana wrapper
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  // Logo boyutu ve konumu
  logo: {
    width: 200,
    height: 200,
    marginBottom: 35,
  },

  title: {
    fontSize: 34,
    color: "#F0F6F0",
    fontWeight: "600",
    marginBottom: 10,
  },

  subtitle: {
    color: "#E6F1E6",
    fontSize: 15,
    marginBottom: 40,
    textAlign: "center",
  },

  // Email ve password input stilleri
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 18,
    padding: 14,
    color: "#fff",
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // Login butonu
  button: {
    width: "100%",
    backgroundColor: "#7BAE7F",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#7BAE7F",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  // Alt kısım (register yönlendirmesi)
  footer: {
    flexDirection: "row",
    marginTop: 25,
  },

  footerText: {
    color: "#CFE1CF",
  },

  linkText: {
    color: "#E0F3E0",
    fontWeight: "bold",
  },
});


