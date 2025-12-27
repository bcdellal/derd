import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";

const POSITIVE_KEY = "positive_vibes_posts";

/* ---------------- TYPES ---------------- */

interface ExplorePost {
  id: string;
  body: string;
  storyType: "experience" | "advice" | "motivation";
  likesCount: number;
}

/* ---------------- POST CARD ---------------- */

const PostCard = ({ post }: { post: ExplorePost }) => {
  const [vibed, setVibed] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const stored = await AsyncStorage.getItem(POSITIVE_KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      setVibed(list.includes(post.id));
    };
    loadState();
  }, [post.id]);

  const toggleVibe = async () => {
    const stored = await AsyncStorage.getItem(POSITIVE_KEY);
    let list: string[] = stored ? JSON.parse(stored) : [];

    if (vibed) {
      await updateDoc(doc(db, "exploreContent", post.id), {
        likesCount: increment(-1),
      });
      list = list.filter((id) => id !== post.id);
      setVibed(false);
    } else {
      await updateDoc(doc(db, "exploreContent", post.id), {
        likesCount: increment(1),
      });
      list.push(post.id);
      setVibed(true);
    }

    await AsyncStorage.setItem(POSITIVE_KEY, JSON.stringify(list));
  };

  const storyLabel =
    post.storyType === "experience"
      ? "🌱 Experience"
      : post.storyType === "advice"
      ? "💡 Advice"
      : "⚡ Motivation";

  return (
    <View style={styles.card}>
      <Text style={styles.author}>🫂 Anonymous Story</Text>
      <Text style={styles.storyType}>{storyLabel}</Text>

      <Text style={styles.body}>{post.body}</Text>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.reactionButton}
          onPress={toggleVibe}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="smile-o"
            size={18}
            color={vibed ? "#6A8564" : "#B0BDB5"}
          />
          <Text
            style={[
              styles.reactionText,
              vibed && { color: "#6A8564", fontWeight: "700" },
            ]}
          >
            {post.likesCount || 0} Positive Vibes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ---------------- MAIN SCREEN ---------------- */

export default function ExploreScreen() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [body, setBody] = useState("");
  const [storyType, setStoryType] = useState<
    "experience" | "advice" | "motivation"
  >("experience");

  useEffect(() => {
    const q = query(collection(db, "exploreContent"));

    const unsub = onSnapshot(q, (snap) => {
      const data: ExplorePost[] = [];
      snap.forEach((d) => {
        data.push({ ...(d.data() as ExplorePost), id: d.id });
      });
      setPosts(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleShare = async () => {
    if (!body.trim()) return;

    await addDoc(collection(db, "exploreContent"), {
      body,
      storyType,
      likesCount: 0,
      createdAt: serverTimestamp(),
    });

    setBody("");
    setStoryType("experience");
    setShowModal(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#6A8564" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/explore-bg.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.headerTitle}>Explore</Text>

        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Floating + Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Share Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Anonymous Share</Text>
            <Text style={styles.modalDesc}>
              Your identity is not visible to others.
            </Text>

            <View style={styles.typeRow}>
              {[
                { key: "experience", label: "🌱 Experience" },
                { key: "advice", label: "💡 Advice" },
                { key: "motivation", label: "⚡ Motivation" },
              ].map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.typeButton,
                    storyType === t.key && styles.typeActive,
                  ]}
                  onPress={() =>
                    setStoryType(
                      t.key as "experience" | "advice" | "motivation"
                    )
                  }
                >
                  <Text style={styles.typeText}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Write something that may help someone today…"
              multiline
              maxLength={500}
              value={body}
              onChangeText={setBody}
            />

            <TouchableOpacity style={styles.submit} onPress={handleShare}>
              <Text style={styles.submitText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  background: { flex: 1 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(205,227,207,0.45)",
  },

  container: { flex: 1 },

  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 10,
    color: "#3E5942",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  author: { fontSize: 13, color: "#6B7B6E", marginBottom: 4 },
  storyType: { fontSize: 13, marginBottom: 8 },
  body: { fontSize: 16, color: "#445C47", lineHeight: 22 },

  footer: { marginTop: 12 },
  reactionButton: { flexDirection: "row", alignItems: "center" },
  reactionText: { marginLeft: 8, color: "#6B7B6E" },

  fab: {
    position: "absolute",
    bottom: 110,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6A8564",
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "#FFF", fontSize: 32, marginTop: -2 },

  modalWrap: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modal: {
    backgroundColor: "#FFF",
    margin: 20,
    borderRadius: 24,
    padding: 20,
  },

  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  modalDesc: { fontSize: 13, color: "#777", marginBottom: 14 },

  typeRow: { flexDirection: "row", justifyContent: "space-between" },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#EEE",
  },
  typeActive: { backgroundColor: "#CDE3CF" },
  typeText: { fontSize: 13 },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    height: 120,
    textAlignVertical: "top",
  },

  submit: {
    backgroundColor: "rgba(106,133,100,0.9)",
    padding: 14,
    borderRadius: 22,
    marginTop: 18,
    alignItems: "center",
  },
  submitText: { color: "#FFF", fontWeight: "700" },

  cancel: {
    textAlign: "center",
    marginTop: 12,
    color: "#AAA",
    fontSize: 13,
  },
});
