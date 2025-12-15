import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

const CLOUD_NAME = "dk32tfnnz";
const UPLOAD_PRESET = "kfrtlndy";
const API_KEY = "234656893643222";

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Kullanıcı bilgilerini Firestoredan çekmece
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profilePictureURL) {
              setImage(data.profilePictureURL);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // 🔹 Profil fotoğrafı seçme için 
  const pickImage = async () => {
    if (!user) return;

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "You've refused to allow this app to access your photos!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const source = result.assets[0];
      const uri = source.uri;
      setImage(uri);

      const data = new FormData();
      data.append("file", {
        uri: uri,
        type: `image/${uri.split(".").pop()}`,
        name: `profile-${user.uid}.${uri.split(".").pop()}`,
      } as any);
      data.append("upload_preset", UPLOAD_PRESET);
      data.append("api_key", API_KEY);
      data.append("cloud_name", CLOUD_NAME);

      try {
        setLoading(true);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "post", body: data }
        );
        const json = await res.json();
        if (json.secure_url) {
          const imageUrl = json.secure_url;
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, { profilePictureURL: imageUrl }, { merge: true });
          Alert.alert("Success 🌿", "Profile picture updated!");
        } else {
          throw new Error("Cloudinary upload failed");
        }
      } catch (err: any) {
        console.error(err);
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // 🔹 Logout fonksiyonu burada dönüyo
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      setTimeout(() => router.replace("/login" as any), 300);
      Alert.alert("Çıkış yapıldı 🌿", "Yeniden görüşmek üzere!");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Logout Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A8CBA8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/pparka.jpg")}
        style={StyleSheet.absoluteFillObject}
        blurRadius={8}
      />
      <BlurView intensity={80} style={styles.blurContainer}>
        <ScrollView contentContainerStyle={styles.scrollInner}>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <FontAwesome name="user" size={60} color="#CFE1CF" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.changeText}>Change Picture</Text>
            </TouchableOpacity>

            {user && <Text style={styles.emailText}>{user.email}</Text>}
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Mind Balance</Text>
            <Text style={styles.statValue}>🌤 Calm</Text>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Your Journals</Text>
            <Text style={styles.statValue}>🪶 5 entries</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  scrollInner: { alignItems: "center", paddingBottom: 60 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B2B1B",
  },
  profileSection: { alignItems: "center", marginBottom: 30 },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#A8CBA8",
    marginBottom: 10,
  },
  profilePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  changeText: {
    color: "#D8EBD8",
    fontSize: 16,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  emailText: {
    color: "#CFE1CF",
    fontSize: 17,
  },
  statsSection: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#E0F3E0",
    fontSize: 18,
    fontWeight: "600",
  },
  statValue: {
    color: "#F0F6F0",
    fontSize: 22,
    fontWeight: "500",
    marginTop: 5,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#FF6B6B",
    borderRadius: 25,
    paddingVertical: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
