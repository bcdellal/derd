import { FontAwesome } from '@expo/vector-icons';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig'; // Firebase bağlantımızı import ediyoruz

// Firestore'daki bir dökümanın yapısını tanımlıyoruz
interface ExplorePost {
  id: string;
  author: string;
  title: string;
  body: string;
  tags: string[];
}

// Tek bir gönderi kartını temsil eden bileşen (içi aynı, sadece 'post' tipini değiştirdik)
const PostCard = ({ post }: { post: ExplorePost }) => {
  const [liked, setLiked] = useState(false);
  
  return (
    <View style={styles.card}>
      <Text style={styles.author}>{post.author}</Text>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      {post.tags && (
        <View style={styles.tagsContainer}>
          {post.tags.map(tag => (
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
          <FontAwesome name={liked ? "heart" : "heart-o"} size={20} color={liked ? "#E94B62" : "#444"} />
          <Text style={styles.reactionText}>Bana İyi Geldi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ExploreScreen() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true); // Yükleme durumunu tutmak için

  useEffect(() => {
    // 'exploreContent' koleksiyonunu dinlemeye başla
    const q = query(collection(db, "exploreContent")); // İstersen 'orderBy' ekleyebiliriz
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: ExplorePost[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({ id: doc.id, ...data } as ExplorePost);
      });
      setPosts(postsData);
      setLoading(false); // Veri geldiğinde yükleme durumunu kapat
    });

    return () => unsubscribe(); // Ekran kapandığında dinleyiciyi sonlandır
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#556B55" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts} // Artık sahte veriyi değil, Firebase'den gelen 'posts' dizisini kullanıyoruz
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}

// Stillerde bir değişiklik yok
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  tag: {
    backgroundColor: '#e0eafc',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4a69bd',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 15,
    paddingTop: 15,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
});