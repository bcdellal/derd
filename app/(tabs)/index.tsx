import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.68;


const meditations = [
  {
    id: "1",
    title: "Forest Walk",
    description: "Calm your mind and reconnect with nature.",
    audio: require("../../assets/audio/meditation-sound.mp3"),
    video: require("../../assets/videos/forest-loop.mp4"),
    image: require("../../assets/images/forest-bg.jpg"),
    duration: "10 min · Relax",
  },
  {
    id: "2",
    title: "Ocean Calm",
    description: "Slow waves for deep relaxation.",
    audio: require("../../assets/audio/ocean-meditation.mp3"),
    video: require("../../assets/videos/oceanvideo1.mp4"),
    image: require("../../assets/images/ocean.jpg"),
    duration: "12 min · Sleep",
  },
  {
    id: "3",
    title: "Rain Focus",
    description: "Soft rain sounds to improve focus.",
    audio: require("../../assets/audio/rain-sound.mp3"),
    video: require("../../assets/videos/rainvideo1.mp4"),
    image: require("../../assets/images/rainy.jpg"),
    duration: "8 min · Focus",
  },
  {
    id: "4",
    title: "Sunlight",
    description: "Start your day with renewed energy.",
    audio: require("../../assets/audio/sunrise.mp3"),
    video: require("../../assets/videos/sunrise.mp4"),
    image: require("../../assets/images/sunrise.jpg"),
    duration: "6 min · Energy",
  },
];


function RecommendedCard({ item, onSelect }: any) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onSelect(item)}>
      <ImageBackground
        source={item.image}
        style={styles.recImage}
        imageStyle={{ borderRadius: 18 }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)"]}
          style={styles.recOverlay}
        >
          <Text style={styles.recTitle}>{item.title}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}


export default function HomeScreen() {
  const user = auth.currentUser;
  const name = user?.email?.split("@")[0] || "Friend";

  const [active, setActive] = useState(meditations[0]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  const player = useVideoPlayer(active.video, (p) => {
    p.loop = true;
    p.muted = true;
    p.volume =0;

    p.play();
  });

  const selectMeditation = async (item: any) => {
    setActive(item);
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setPlaying(false);
  };

  const playPause = async () => {
    if (sound && playing) {
      await sound.pauseAsync();
      setPlaying(false);
      return;
    }

    if (!sound) {
      const { sound: s } = await Audio.Sound.createAsync(active.audio);
      await s.playAsync();
      setSound(s);
      setPlaying(true);
    } else {
      await sound.playAsync();
      setPlaying(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* BACKGROUND VIDEO */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back, {name}</Text>
          <Text style={styles.subtitle}>
            Take a moment for yourself today.
          </Text>
        </View>

        {/* TODAY SESSION */}
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
          style={styles.todayCard}
        >
          <View style={styles.todayRow}>
            <Image source={active.image} style={styles.todayImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.todayTitle}>{active.title}</Text>
              <Text style={styles.todayDesc}>{active.description}</Text>
              <Text style={styles.todayMeta}>{active.duration}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={playPause}>
            <FontAwesome
              name={playing ? "pause" : "play"}
              size={16}
              color="#fff"
            />
            <Text style={styles.startText}>
              {playing ? "Pause Session" : "Start Session"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* RECOMMENDED */}
        <Text style={styles.sectionTitle}>Recommended Sessions</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={meditations}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingLeft: 20 }}
          renderItem={({ item }) => (
            <RecommendedCard item={item} onSelect={selectMeditation} />
          )}
        />

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF4EC" },

  header: { paddingTop: 70, paddingHorizontal: 20 },
  welcome: { fontSize: 26, fontWeight: "700", color: "#1B331D" },
  subtitle: { fontSize: 15, color: "#355E3B", marginTop: 6 },

  todayCard: { margin: 20, borderRadius: 24, padding: 20 },
  todayRow: { flexDirection: "row", gap: 14 },
  todayImage: { width: 64, height: 64, borderRadius: 14 },
  todayTitle: { fontSize: 18, fontWeight: "700", color: "#1C3024" },
  todayDesc: { fontSize: 14, color: "#2E3D3A" },
  todayMeta: { fontSize: 12, color: "#5E7C64", marginTop: 4 },

  startButton: {
    marginTop: 18,
    backgroundColor: "#7BAE7F",
    borderRadius: 28,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  startText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C3024",
    marginLeft: 20,
    marginBottom: 12,
  },

  recImage: {
    width: CARD_WIDTH,
    height: 160,
    marginRight: 16,
    borderRadius: 18,
    overflow: "hidden",
  },
  recOverlay: { flex: 1, justifyContent: "flex-end", padding: 14 },
  recTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
