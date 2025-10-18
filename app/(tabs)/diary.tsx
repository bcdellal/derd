import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig"; // initializeFirestore + persistentLocalCache aktif olmalı

interface DiaryEntry {
  id?: string;
  title: string;
  content: string;
  createdAt: Date | null;
  userId?: string;
  temp?: boolean; // offline entry’ler için işaret
}

export default function DiaryScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // 🔌 Ağ bağlantısını dinle
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // 🔁 Firestore + Offline senkronizasyon
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "diaries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: DiaryEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.createdAt) {
          entriesData.push({
            id: docSnap.id,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt.toDate(),
          });
        }
      });
      setEntries(entriesData);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  // 🧭 Uygulama açıldığında offline entry’leri Firestore’a yükle
  useEffect(() => {
    const syncOfflineEntries = async () => {
      const stored = await AsyncStorage.getItem("offlineEntries");
      if (stored && auth.currentUser && isConnected) {
        const entries = JSON.parse(stored) as DiaryEntry[];
        for (const e of entries) {
          await addDoc(collection(db, "diaries"), {
            title: e.title,
            content: e.content,
            createdAt: serverTimestamp(),
            userId: auth.currentUser.uid,
          });
        }
        await AsyncStorage.removeItem("offlineEntries");
        console.log("✅ Offline kayıtlar senkronize edildi.");
      }
    };
    syncOfflineEntries();
  }, [isConnected]);

  // 💾 Günlük kaydet
  const handleSave = async () => {
    if (title.trim().length === 0 || content.trim().length === 0) {
      Alert.alert("Error", "Please fill in both title and content.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save an entry.");
      return;
    }

    try {
      if (!isConnected) {
        // 🌙 OFFLINE MOD
        const localEntry: DiaryEntry = {
          title,
          content,
          createdAt: new Date(),
          temp: true,
        };
        const stored = await AsyncStorage.getItem("offlineEntries");
        const updated = stored
          ? [...JSON.parse(stored), localEntry]
          : [localEntry];
        await AsyncStorage.setItem("offlineEntries", JSON.stringify(updated));
        Alert.alert(
          "Offline Mode",
          "Entry saved locally. It will sync when you're online."
        );
      } else if (editingId) {
        // ✏️ DÜZENLEME
        const entryRef = doc(db, "diaries", editingId);
        await updateDoc(entryRef, { title, content });
        Alert.alert("Success", "Entry updated successfully!");
      } else {
        // 🌐 ONLINE YENİ ENTRY
        await addDoc(collection(db, "diaries"), {
          title,
          content,
          createdAt: serverTimestamp(),
          userId: user.uid,
        });
        Alert.alert("Success", "Entry saved successfully!");
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      Keyboard.dismiss();
    } catch (error: any) {
      console.error("Error saving document: ", error);
      if (error.code === "permission-denied") {
        Alert.alert("Access Denied", "You can only modify your own diary entries.");
      } else {
        Alert.alert("Error", "Could not save the entry.");
      }
    }
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id!);
    setTitle(entry.title);
    setContent(entry.content);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <Text style={styles.header}>
            {editingId ? "Edit Your Entry" : "How Are You Feeling Today?"}
          </Text>
          <TextInput
            style={styles.inputTitle}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.inputContent}
            placeholder="Write your thoughts here..."
            multiline={true}
            value={content}
            onChangeText={setContent}
          />
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <FontAwesome
              name={editingId ? "save" : "check"}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.buttonText}>
              {editingId ? "Update Entry" : "Save Entry"}
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          {entries.map((entry) => (
            <View key={entry.id || entry.title} style={styles.entryContainer}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <TouchableOpacity onPress={() => handleEdit(entry)}>
                  <FontAwesome name="pencil" size={20} color="#556B55" />
                </TouchableOpacity>
              </View>
              <Text style={styles.entryDate}>
                {entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Pending..."}
              </Text>
              <Text style={styles.entryContent}>{entry.content}</Text>
            </View>
          ))}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#a9c2a9" },
  header: {
    fontSize: 28,
    fontWeight: "300",
    color: "#2F4F4F",
    textAlign: "center",
    marginBottom: 25,
    paddingTop: 60,
  },
  inputTitle: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 15,
    padding: 15,
    color: "#2F4F4F",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    marginHorizontal: 20,
  },
  inputContent: {
    height: 150,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 15,
    padding: 15,
    color: "#2F4F4F",
    fontSize: 16,
    textAlignVertical: "top",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#556B55",
    padding: 15,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginVertical: 30,
    marginHorizontal: 20,
  },
  entryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  entryTitle: { fontSize: 20, fontWeight: "bold", color: "#2F4F4F" },
  entryDate: { fontSize: 12, color: "#556B55", marginBottom: 10 },
  entryContent: { fontSize: 16, color: "#333333" },
});
