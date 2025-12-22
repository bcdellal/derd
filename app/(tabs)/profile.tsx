import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

/* -------------------- CLOUDINARY -------------------- */
const CLOUD_NAME = "dk32tfnnz";
const UPLOAD_PRESET = "kfrtlndy";
const API_KEY = "234656893643222";

const REMINDER_KEY = "daily_reminder_enabled";

/* -------------------- SCREEN -------------------- */
export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [journalCount, setJournalCount] = useState(0);
  const [mindBalance, setMindBalance] = useState("Balanced");
  const [reminderEnabled, setReminderEnabled] = useState(false);

  /* -------- LOAD PROFILE -------- */
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (userData?.profilePictureURL) {
          setImage(userData.profilePictureURL);
        }

        const qCount = query(
          collection(db, "diaries"),
          where("userId", "==", user.uid)
        );
        const countSnap = await getDocs(qCount);
        setJournalCount(countSnap.size);

        const qLast = query(
          collection(db, "diaries"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const lastSnap = await getDocs(qLast);
        const lastDiary = lastSnap.docs[0]?.data();

        let balance = "Balanced";
        if (!lastDiary) balance = "Unstable";
        if (lastDiary?.mood === "calm" || lastDiary?.mood === "happy") {
          balance = "Calm";
        }
        setMindBalance(balance);

        const storedReminder = await AsyncStorage.getItem(REMINDER_KEY);
        setReminderEnabled(storedReminder === "true");
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  /* -------- DAILY REMINDER -------- */
  const toggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    await AsyncStorage.setItem(REMINDER_KEY, value ? "true" : "false");

    if (value) {
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Notifications are disabled.");
        setReminderEnabled(false);
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Take a moment 🌿",
          body: "A few calm minutes can change your whole day.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  /* -------- PICK IMAGE -------- */
  const pickImage = async () => {
    if (!user) return;

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Denied", "Photo library access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setImage(uri);

    const data = new FormData();
    data.append("file", {
      uri,
      type: `image/${uri.split(".").pop()}`,
      name: `profile-${user.uid}`,
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

      if (!json.secure_url) throw new Error("Upload failed");

      await setDoc(
        doc(db, "users", user.uid),
        { profilePictureURL: json.secure_url },
        { merge: true }
      );
    } catch (e: any) {
      Alert.alert("Upload Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------- LOGOUT -------- */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      setTimeout(() => router.replace("/login" as any), 300);
    } catch (e: any) {
      Alert.alert("Logout Error", e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#A8CBA8" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/forprofile.png")}
      style={styles.background}
    >
      <BlurView intensity={80} style={styles.blur}>
        <ScrollView contentContainerStyle={styles.scrollCenter}>
          <View style={styles.profile}>
            <TouchableOpacity onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <FontAwesome name="user" size={60} color="#CFE1CF" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.changePhoto}>Change profile photo</Text>
            </TouchableOpacity>

            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Mind Balance</Text>
            <Text style={styles.value}>🌿 {mindBalance}</Text>

            <Text style={[styles.title, { marginTop: 18 }]}>
              Your Journals
            </Text>
            <Text style={styles.value}>🪶 {journalCount} entries</Text>

            <View style={styles.reminderRow}>
              <Text style={styles.reminderText}>🔔 Daily Reminder</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={toggleReminder}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logout} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </BlurView>
    </ImageBackground>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  background: { flex: 1 },
  blur: { flex: 1 },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B2B1B",
  },

  scrollCenter: {
    paddingTop: 60,
    alignItems: "center",
  },

  profile: {
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#A8CBA8",
    marginBottom: 10,
  },

  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  changePhoto: {
    color: "#D8EBD8",
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 6,
  },

  email: {
    color: "#CFE1CF",
    fontSize: 15,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 22,
    width: "85%",
    alignItems: "center",
    marginBottom: 26,
  },

  title: {
    color: "#E0F3E0",
    fontSize: 18,
    fontWeight: "600",
  },

  value: {
    color: "#F0F6F0",
    fontSize: 22,
    marginTop: 6,
  },

  reminderRow: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reminderText: {
    color: "#F0F6F0",
    fontSize: 16,
  },

  logout: {
    backgroundColor: "#FF6B6B",
    borderRadius: 25,
    paddingVertical: 14,
    width: "70%",
    alignItems: "center",
  },

  logoutText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
