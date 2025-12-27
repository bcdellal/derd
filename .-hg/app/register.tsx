import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animasyon başlatmaya kenks  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Kayıt işlemi burada  
  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Information", "Please enter your email and password.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      //  Firestoreda kullanıcı belgesi oluştuanzi
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        profilePictureURL: null,
      });

      Alert.alert("Success 🎉", "Your account has been created!");
      router.replace("/(tabs)" as any);
    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <LinearGradient colors={["#A8CBA8", "#2E3D3A"]} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
            {/* Logo */}
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Başlık */}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Begin your journey of calm and self-discovery 🌿
            </Text>

            {/* Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#4A5C4A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#4A5C4A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Register Button */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login" as any)}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// --- Stil ayarları ---
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  logo: {
    width: 180, 
    height: 180,
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    color: "#F0F6F0",
    fontWeight: "600",
    marginBottom: 10,
  },
  subtitle: {
    color: "#DCE7DC",
    fontSize: 15,
    marginBottom: 40,
    textAlign: "center",
  },
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
