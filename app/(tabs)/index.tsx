import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";

const meditations = [
  {
    id: "1",
    title: "5 Dakikalık Orman Yürüyüşü",
    description: "Zihnini an'a getir.",
    audio: require("../../assets/audio/meditation-sound.mp3"),
    video: require("../../assets/videos/forest-loop.mp4"),
    image: require("../../assets/images/forest-bg.jpg"),
  },
  {
    id: "2",
    title: "Okyanus Sakinliği",
    description: "Dalgaların ritmiyle rahatla.",
    audio: require("../../assets/audio/meditation-sound.mp3"),
    video: require("../../assets/videos/forest-loop.mp4"),
    image: require("../../assets/images/forest-bg.jpg"),
  },
  {
    id: "3",
    title: "Yağmur Huzuru",
    description: "Yağmur damlalarını dinle.",
    audio: require("../../assets/audio/meditation-sound.mp3"),
    video: require("../../assets/videos/forest-loop.mp4"),
    image: require("../../assets/images/forest-bg.jpg"),
  },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const SPACING = 16;

const MeditationCard = ({
  item,
  isPlaying,
  onPlayPause,
}: {
  item: any;
  isPlaying: boolean;
  onPlayPause: (id: string) => void;
}) => {
  const player = useVideoPlayer(item.video, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (isPlaying) player.play();
    else player.pause();
  }, [isPlaying]);

  return (
    <TouchableOpacity
      onPress={() => onPlayPause(item.id)}
      activeOpacity={0.9}
      style={styles.cardContainer}
    >
      <View style={styles.widgetBackground}>
        {isPlaying ? (
          <VideoView player={player} style={{ flex: 1 }} />
        ) : (
          <ImageBackground
            source={item.image}
            style={{ flex: 1 }}
            imageStyle={{ borderRadius: 20 }}
          />
        )}

        <View style={styles.overlay}>
          <View style={styles.widgetContent}>
            <Text style={styles.widgetTitle}>{item.title}</Text>
            <Text style={styles.widgetDescription}>{item.description}</Text>
          </View>

          <TouchableOpacity
            onPress={() => onPlayPause(item.id)}
            style={styles.playButton}
          >
            <FontAwesome
              name={isPlaying ? "pause" : "play"}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const user = auth.currentUser;
  const displayName = user?.email?.split("@")[0] || "Dostum";

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  async function playPauseSound(itemId: string) {
    try {
      if (sound && playingId === itemId) {
        await sound.pauseAsync();
        setPlayingId(null);
        return;
      }

      // varsa önceki sesi kapat
      if (sound) await sound.unloadAsync();

      const currentItem = meditations.find((m) => m.id === itemId);
      if (!currentItem) return;

      const { sound: newSound } = await Audio.Sound.createAsync(
        currentItem.audio
      );
      setSound(newSound);
      setPlayingId(itemId);
      await newSound.playAsync();
    } catch (err) {
      console.error("Sound error:", err);
    }
  }

  // 🔧 Cleanup (Promise dönmeden)
  useEffect(() => {
    return () => {
      if (sound) {
        // Fire & forget (Promise beklenmez)
        sound.unloadAsync().catch((e) =>
          console.warn("Sound unload failed:", e)
        );
      }
    };
  }, [sound]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeTitle}>Hoş Geldin, {displayName}</Text>
        <Text style={styles.welcomeSubtitle}>
          Günün önerisi aşağıda seni bekliyor.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Ruhunu Dinlendir</Text>

      <FlatList
        data={meditations}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING}
        contentContainerStyle={{
          paddingHorizontal: (width - CARD_WIDTH) / 2,
        }}
        renderItem={({ item }) => (
          <MeditationCard
            item={item}
            isPlaying={playingId === item.id}
            onPlayPause={playPauseSound}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 220,
    marginRight: SPACING,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  widgetBackground: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
    padding: 20,
  },
  widgetContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  widgetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  widgetDescription: {
    fontSize: 14,
    color: "#ddd",
  },
  playButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});