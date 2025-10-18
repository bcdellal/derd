import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";

// --- 🪷 Meditasyon Verileri ---
const meditations = [
  {
    id: "1",
    title: "Orman Yürüyüşü",
    description: "Zihnini an'a getir, doğayla bütünleş.",
    audio: require("../../assets/audio/meditation-sound.mp3"),
    video: require("../../assets/videos/forest-loop.mp4"),
    image: require("../../assets/images/forest-bg.jpg"),
  },
  {
    id: "2",
    title: "Okyanus Sakinliği",
    description: "Dalgaların ritmiyle rahatla.",
    audio: require("../../assets/audio/ocean-meditation.mp3"),
    video: require("../../assets/videos/oceanvideo1.mp4"),
    image: require("../../assets/images/ocean.jpg"),
  },
  {
    id: "3",
    title: "Yağmur Huzuru",
    description: "Yağmur damlalarının sesinde huzuru bul.",
    audio: require("../../assets/audio/rain-sound.mp3"),
    video: require("../../assets/videos/rainvideo1.mp4"),
    image: require("../../assets/images/rainy.jpg"),
  },
];

// --- 💬 Günün Sözleri ---
const dailyQuotes = [
  "“Kendine nazik ol, çünkü sen de büyüyorsun.” 🌱",
  "“Huzur, dışarıda değil — içinde başlar.” ☁️",
  "“Bugün biraz daha yavaşla. Her şey yetişecek.” 🌿",
  "“Nefes al. Ve bırak. Hepsi olması gerektiği gibi.” 💫",
  "“Zihnin sakinleştiğinde, dünya da sakinleşir.” 🌊",
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const SPACING = 16;

// 🎧 Meditasyon Kartı
const MeditationCard = ({ item, isPlaying, onPlayPause }: any) => {
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
      <ImageBackground
        source={item.image}
        style={{ flex: 1 }}
        imageStyle={{ borderRadius: 20 }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          style={styles.overlay}
        >
          <Text style={styles.widgetTitle}>{item.title}</Text>
          <Text style={styles.widgetDescription}>{item.description}</Text>

          <TouchableOpacity
            onPress={() => onPlayPause(item.id)}
            style={styles.playButton}
          >
            <FontAwesome
              name={isPlaying ? "pause" : "play"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

// 🧘 Nefes Egzersizi
const BreathExercise = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState("Hazırsan başlayalım 🌿");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const startCycle = () => {
    setStarted(true);
    setFinished(false);

    let cycleCount = 0;
    const breathe = () => {
      if (cycleCount >= 4) {
        setPhase("Harika iş çıkardın 🍃");
        setFinished(true);
        return;
      }

      setPhase("Nefes al...");
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        setPhase("Tut...");
        setTimeout(() => {
          setPhase("Ver...");
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }).start(() => {
            cycleCount++;
            breathe();
          });
        }, 3000);
      });
    };
    breathe();
  };

  return (
    <LinearGradient colors={["#BFD8C3", "#A8CBA8", "#9BB89F"]} style={styles.breathContainer}>
      <Text style={styles.breathTitle}>🫧 1 Dakikalık Nefes Egzersizi</Text>
      <Text style={styles.breathSubtitle}>Zihnini sakinleştirmek için nefesine odaklan.</Text>

      <View style={styles.breathCircleContainer}>
        <Animated.View style={[styles.breathCircle, { transform: [{ scale: scaleAnim }] }]} />
        <Text style={styles.breathPhase}>{phase}</Text>
      </View>

      {!started && (
        <TouchableOpacity style={styles.breathButton} onPress={startCycle}>
          <Text style={styles.breathButtonText}>Başla</Text>
        </TouchableOpacity>
      )}

      {finished && (
        <TouchableOpacity
          style={[styles.breathButton, { backgroundColor: "#6DAF73" }]}
          onPress={() => {
            setStarted(false);
            setPhase("Hazırsan başlayalım 🌿");
            setFinished(false);
          }}
        >
          <Text style={styles.breathButtonText}>Tekrarla</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

// 🌿 Ana Sayfa
export default function HomeScreen() {
  const user = auth.currentUser;
  const displayName = user?.email?.split("@")[0] || "Dostum";

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [dailyMeditation, setDailyMeditation] = useState<any | null>(null);
  const [liked, setLiked] = useState(false);
  const [dailyQuote, setDailyQuote] = useState("");
  const [moodMessage, setMoodMessage] = useState("");

  const heartAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setMoodMessage("Sabah huzuru seninle 🌅");
    else if (hour < 18) setMoodMessage("Öğleden sonra sakinliği 🌤️");
    else setMoodMessage("Akşam dinginliği 🌙");

    const randomQuote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];
    setDailyQuote(randomQuote);

    Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, []);

  const animateHeart = () => {
    setLiked(!liked);
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(heartAnim, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const animateRefresh = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
  };

  const loadDailyMeditation = async (forceNew = false) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storedDate = await AsyncStorage.getItem("dailyMeditationDate");
    const storedMeditation = await AsyncStorage.getItem("dailyMeditation");

    if (!forceNew && storedDate === todayKey && storedMeditation) {
      const parsed = JSON.parse(storedMeditation);
      if (parsed.image && parsed.audio && parsed.video) {
        setDailyMeditation(parsed);
        return;
      }
    }
    const randomMeditation = meditations[Math.floor(Math.random() * meditations.length)];
    setDailyMeditation(randomMeditation);
    await AsyncStorage.setItem("dailyMeditation", JSON.stringify(randomMeditation));
    await AsyncStorage.setItem("dailyMeditationDate", todayKey);
  };

  useEffect(() => {
    loadDailyMeditation();
  }, []);

  async function playPauseSound(itemId: string) {
    try {
      if (sound && playingId === itemId) {
        await sound.pauseAsync();
        setPlayingId(null);
        return;
      }
      if (sound) await sound.unloadAsync();

      const currentItem = meditations.find((m) => m.id === itemId);
      if (!currentItem) return;

      const { sound: newSound } = await Audio.Sound.createAsync(currentItem.audio);
      setSound(newSound);
      setPlayingId(itemId);
      await newSound.playAsync();
    } catch (err) {
      console.error("Sound error:", err);
    }
  }

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient colors={["#CFE8D3", "#B4D7B9", "#9FC49F"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Üst Karşılama */}
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Hoş Geldin, {displayName}</Text>
          <Text style={styles.welcomeSubtitle}>Bugün doğa senin yanında 🌿</Text>
        </View>

        {/* 🌞 Günün Meditasyonu */}
        {dailyMeditation && (
          <View style={styles.dailyContainer}>
            <View style={styles.dailyHeader}>
              <Text style={styles.dailyTitle}>🌞 Günün Meditasyonu</Text>
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <TouchableOpacity onPress={() => { animateRefresh(); loadDailyMeditation(true); }}>
                  <FontAwesome name="refresh" size={22} color="#2E3D3A" />
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.dailyCard}>
              <ImageBackground source={dailyMeditation.image} style={styles.dailyImage} imageStyle={{ borderRadius: 20 }}>
                <View style={styles.dailyOverlay}>
                  <Text style={styles.dailyText}>{dailyMeditation.title}</Text>
                  <Text style={styles.dailyDesc}>{dailyMeditation.description}</Text>

                  <View style={styles.dailyButtons}>
                    <TouchableOpacity onPress={() => playPauseSound(dailyMeditation.id)} style={styles.dailyButton}>
                      <FontAwesome
                        name={playingId === dailyMeditation.id ? "pause" : "play"}
                        size={22}
                        color="#fff"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={animateHeart}>
                      <Animated.View style={{
                        transform: [{
                          scale: heartAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }),
                        }],
                      }}>
                        <FontAwesome
                          name={liked ? "heart" : "heart-o"}
                          size={24}
                          color={liked ? "#E94B62" : "#fff"}
                          style={{ marginLeft: 14 }}
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </View>
          </View>
        )}

        {/* 🪷 Günün Sözü */}
        <Animated.View style={[styles.quoteBox, { opacity: fadeAnim }]}>
          <Text style={styles.moodTitle}>{moodMessage}</Text>
          <Text style={styles.quoteText}>{dailyQuote}</Text>
        </Animated.View>

        {/* 🌿 Diğer meditasyonlar */}
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

        {/* 🧘 1 Dakikalık Nefes Egzersizi */}
        <BreathExercise />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 20, paddingTop: 70 },
  welcomeTitle: { fontSize: 26, fontWeight: "bold", color: "#1B331D" },
  welcomeSubtitle: { fontSize: 15, color: "#355E3B", marginTop: 5, marginBottom: 25 },
  dailyContainer: { paddingHorizontal: 20 },
  dailyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  dailyTitle: { fontSize: 22, fontWeight: "bold", color: "#2E3D3A" },
  dailyCard: { borderRadius: 20, overflow: "hidden", height: 210, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  dailyImage: { flex: 1, justifyContent: "flex-end" },
  dailyOverlay: { backgroundColor: "rgba(0,0,0,0.4)", padding: 18, borderRadius: 20 },
  dailyText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  dailyDesc: { color: "#ddd", fontSize: 14, marginTop: 4 },
  dailyButtons: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  dailyButton: { backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 20, width: 45, height: 45, justifyContent: "center", alignItems: "center" },
  quoteBox: { backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 16, padding: 18, marginHorizontal: 20, marginVertical: 25 },
  moodTitle: { fontSize: 18, fontWeight: "bold", color: "#2E3D3A", marginBottom: 6 },
  quoteText: { fontSize: 15, color: "#3D4F3D", fontStyle: "italic" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#1C3024", paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  cardContainer: { width: CARD_WIDTH, height: 220, marginRight: SPACING, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, backgroundColor: "#000", overflow: "hidden" },
  overlay: { flex: 1, justifyContent: "flex-end", borderRadius: 20, padding: 20 },
  widgetTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  widgetDescription: { fontSize: 14, color: "#ddd", marginTop: 4 },
  playButton: { position: "absolute", top: 15, right: 15, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  // 🧘 Nefes Stilleri
  breathContainer: { marginHorizontal: 20, marginTop: 35, borderRadius: 25, padding: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  breathTitle: { fontSize: 22, fontWeight: "bold", color: "#2E3D3A", marginBottom: 6 },
  breathSubtitle: { fontSize: 15, color: "#3D4F3D", marginBottom: 25, textAlign: "center" },
  breathCircleContainer: { justifyContent: "center", alignItems: "center", height: 220 },
  breathCircle: { width: 100, height: 100, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.3)" },
  breathPhase: { position: "absolute", fontSize: 20, fontWeight: "600", color: "#2E3D3A" },
  breathButton: { backgroundColor: "#7BAE7F", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, marginTop: 15 },
  breathButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
