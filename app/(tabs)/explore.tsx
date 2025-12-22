import { FontAwesome } from "@expo/vector-icons";
import { collection, onSnapshot, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";

interface ExplorePost {
  id: string;
  author: string;
  title: string;
  body: string;
  tags: string[];
}

const PostCard = ({ post }: { post: ExplorePost }) => {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.author}>{post.author}</Text>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>

      {post.tags && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.reactionButton}
          onPress={() => setLiked(!liked)}
        >
          <FontAwesome
            name={liked ? "heart" : "heart-o"}
            size={20}
            color={liked ? "#E86F73" : "#6B7B6E"}
          />
          <Text
            style={[
              styles.reactionText,
              liked && { color: "#E86F73", fontWeight: "700" },
            ]}
          >
            Positive Vibes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ExploreScreen() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "exploreContent"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: ExplorePost[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({ id: doc.id, ...data } as ExplorePost);
      });
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.headerTitle}>Explore</Text>
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#3E5942",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  author: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B927D",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3E5942",
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: "#445C47",
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
  },
  tag: {
    backgroundColor: "#CDE3CF",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#3E5942",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E0EAE0",
    marginTop: 15,
    paddingTop: 12,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7B6E",
  },
});
