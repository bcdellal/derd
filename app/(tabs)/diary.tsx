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
import { auth, db } from "../../firebaseConfig";

/* -------------------- TYPES -------------------- */
// Günlük verileri için tip tanım
interface DiaryEntry {
  id?: string;
  title: string;
  content: string;
  mood: string;
  createdAt: Date | null;
  userId?: string;
  temp?: boolean;
}

const MOODS = [
  { key: "happy", label: "happy", emoji: "😊" },
  { key: "calm", label: "calm", emoji: "😌" },
  { key: "sad", label: "sad", emoji: "😔" },
  { key: "tense", label: "tense", emoji: "😠" },
  { key: "tired", label: "tired", emoji: "😴" },
];
// Modlara göre ilgili mood objesini bulan yer
const getMoodByKey = (key: string) =>
  MOODS.find((m) => m.key === key);

/* -------------------- SCREEN -------------------- */
export default function DiaryScreen() {
  // Kullanıcının günlük kayıtları 
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  // Form alanları
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  // Güncelleme modunda hangi kayıt düzenleniyorsa onun kontrol 
  const [editingId, setEditingId] = useState<string | null>(null);
  // İnternet bağlantı kontrolü
  const [isConnected, setIsConnected] = useState(true);

  /* ----------- NETWORK ----------- */
  // Cihazın online offline  durumunu dinler
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsub();
  }, []);

  /* ----------- FIRESTORE LISTENER ----------- */
  // Kullanıcı günlüklerini Firestoredan gerçek zamanlı çeken yer
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
// Sadece giriş yapan kullanıcıya ait günlükler çekilir
    const q = query(
      collection(db, "diaries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
// onSnapshot sayesinde veriler anlık güncellenir
    const unsub = onSnapshot(q, (snap) => {
      const data: DiaryEntry[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.createdAt) {
          data.push({
            id: docSnap.id,
            title: d.title,
            content: d.content,
            mood: d.mood,
            createdAt: d.createdAt.toDate(),
          });
        }
      });
      setEntries(data);
    });

    return () => unsub();
  }, []);

  /* ----------- OFFLINE SYNC ----------- */
  // Offline kaydedilen günlükleri online olunca Firestore gönderir
  useEffect(() => {
    const syncOffline = async () => {
      if (!isConnected || !auth.currentUser) return;

      const stored = await AsyncStorage.getItem("offlineEntries");
      if (!stored) return;

      const parsed: DiaryEntry[] = JSON.parse(stored);
      for (const e of parsed) {
        await addDoc(collection(db, "diaries"), {
          title: e.title,
          content: e.content,
          mood: e.mood,
          createdAt: serverTimestamp(),
          userId: auth.currentUser.uid,
        });
      }
      // Senkronizasyon sonrası local kayıtlar silinir
      await AsyncStorage.removeItem("offlineEntries");
    };
    syncOffline();
  }, [isConnected]);

  /* ----------- SAVE ----------- */
  // Yeni kayıt ekleme güncelleme 
  const handleSave = async () => {
    //mod yazdı mı içerik başlık yazdı mı uyarmaca 
    if (!title.trim() || !content.trim()) {
      Alert.alert("Warning", "Title and content cannot be empty.");
      return;
    }
    if (!selectedMood) {
      Alert.alert("Hey", "Please select your mood.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      // kayıt Offlinesa locale alır
      if (!isConnected) {
        const local: DiaryEntry = {
          title,
          content,
          mood: selectedMood,
          createdAt: new Date(),
          temp: true,
        };
        const stored = await AsyncStorage.getItem("offlineEntries");
        const updated = stored ? [...JSON.parse(stored), local] : [local];
        await AsyncStorage.setItem("offlineEntries", JSON.stringify(updated));
        Alert.alert("Offline", "Record saved on device.");
      } else if (editingId) {
        // Güncelleme modu
        await updateDoc(doc(db, "diaries", editingId), {
          title,
          content,
          mood: selectedMood,
        });
        Alert.alert("Success", "Daily updated.");
      } 
      // Yeni günlük ekleme
      else {
        await addDoc(collection(db, "diaries"), {
          title,
          content,
          mood: selectedMood,
          createdAt: serverTimestamp(),
          userId: user.uid,
        });
        // Kullanıcının son günlük tarihi güncellenir
        await updateDoc(doc(db, "users", user.uid), {
          lastJournalAt: serverTimestamp(),
        });

        Alert.alert("Success", "Recorded daily.");
      }

      setTitle("");
      setContent("");
      setSelectedMood(null);
      setEditingId(null);
      Keyboard.dismiss();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", " Registration failed..");
    }
  };
// olan günlüğü düzenleme moduna alma
  const handleEdit = (e: DiaryEntry) => {
    setEditingId(e.id!);
    setTitle(e.title);
    setContent(e.content);
    setSelectedMood(e.mood);
  };

  /* -------------------- UI -------------------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
    {/* Klavye dışına tıklanınca klavye kapanır */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>How Are You Feeling Today?</Text>
           {/* Mood seçimi */}
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.moodItem,
                  selectedMood === m.key && styles.moodActive,
                ]}
                onPress={() => setSelectedMood(m.key)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
           {/* Günlük başlığı */}
          <TextInput
            style={styles.inputTitle}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          {/* Günlük içeriği */}
          <TextInput
            style={styles.inputContent}
            placeholder="Write your thoughts..."
            multiline
            value={content}
            onChangeText={setContent}
          />
          {/* Kaydet  güncelle buton */}
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <FontAwesome
              name={editingId ? "save" : "check"}
              size={20}
              color="#fff"
            />
            <Text style={styles.buttonText}>
              {editingId ? "Update Entry" : "Save Entry"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          {/* Günlük listesi */}
          {entries.map((e) => {
            const mood = getMoodByKey(e.mood);
            return (
              <View key={e.id} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {mood?.emoji} {e.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleEdit(e)}>
                    <FontAwesome name="pencil" size={18} color="#556B55" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.entryDate}>
                  {e.createdAt?.toLocaleDateString()}
                </Text>
                <Text style={styles.entryContent}>{e.content}</Text>
              </View>
            );
          })}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#a9c2a9" },

  scrollContent: {
    paddingBottom: 240,
  },

  header: {
    fontSize: 28,
    fontWeight: "300",
    color: "#2F4F4F",
    textAlign: "center",
    marginBottom: 20,
    paddingTop: 60,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  moodItem: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.4)",
    width: 65,
  },
  moodActive: {
    backgroundColor: "#7BAE7F",
  },
  moodEmoji: { fontSize: 22 },

  inputTitle: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  inputContent: {
    height: 140,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#556B55",
    padding: 15,
    borderRadius: 25,
    justifyContent: "center",
    marginHorizontal: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 10 },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginVertical: 25,
    marginHorizontal: 20,
  },
  entryContainer: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  entryTitle: { fontSize: 18, fontWeight: "bold" },
  entryDate: { fontSize: 12, color: "#556B55", marginBottom: 6 },
  entryContent: { fontSize: 15 },
});
