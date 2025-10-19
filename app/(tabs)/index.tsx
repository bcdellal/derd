import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
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
  View
} from "react-native";
import { auth } from "../../firebaseConfig";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.72;
const SPACING = 16;

// 🌿 Meditasyon verileri
const meditations = [
  {
    id: "1",
    title: "Orman Yürüyüşü",
    description: "Zihnini an'a getir, doğayla bütünleş.",
    audio: require("../../assets/audio/meditation-sound.mp3"),
    video: require("../../assets/videos/forest-loop.mp4"),
    image: require("../../assets/images/forest-bg.jpg"),
    tags: ["relax", "focus", "balance"],
  },
  {
    id: "2",
    title: "Okyanus Sakinliği",
    description: "Dalgaların ritmiyle rahatla.",
    audio: require("../../assets/audio/ocean-meditation.mp3"),
    video: require("../../assets/videos/oceanvideo1.mp4"),
    image: require("../../assets/images/ocean.jpg"),
    tags: ["relax", "sleep"],
  },
  {
    id: "3",
    title: "Yağmur Huzuru",
    description: "Yağmur damlalarının sesinde huzuru bul.",
    audio: require("../../assets/audio/rain-sound.mp3"),
    video: require("../../assets/videos/rainvideo1.mp4"),
    image: require("../../assets/images/rainy.jpg"),
    tags: ["sleep", "balance"],
  },
  {
    id: "4",
    title: "Güneş Işığı",
    description: "Yeni güne enerjiyle başla.",
    audio: require("../../assets/audio/sunrise.mp3"),
    video: require("../../assets/videos/sunrise.mp4"),
    image: require("../../assets/images/sunrise.jpg"),
    tags: ["motivation", "focus"],
  },
];

// 💬 Günün Sözleri
const dailyQuotes = [
  "“Kendine nazik ol, çünkü sen de büyüyorsun.” 🌱",
  "“Huzur, dışarıda değil — içinde başlar.” ☁️",
  "“Bugün biraz daha yavaşla. Her şey yetişecek.” 🌿",
  "“Nefes al. Ve bırak. Hepsi olması gerektiği gibi.” 💫",
  "“Zihnin sakinleştiğinde, dünya da sakinleşir.” 🌊",
];

// 🎧 Meditasyon Kartı
const MeditationCard = ({ item, onSelect }: any) => (
  <TouchableOpacity
    onPress={() => onSelect(item)}
    activeOpacity={0.9}
    style={styles.cardContainer}
  >
    <ImageBackground
      source={item.image}
      style={styles.cardImage}
      imageStyle={{ borderRadius: 20 }}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
        style={styles.cardOverlay}
      >
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </LinearGradient>
    </ImageBackground>
  </TouchableOpacity>
);

// 🪴 Bağımlılıkla Mücadele
const HabitRecoveryCard = () => {
  const [streak, setStreak] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const storedDate = await AsyncStorage.getItem("habit_lastDate");
      const storedStreak = await AsyncStorage.getItem("habit_streak");
      if (storedDate === today) setTodayCompleted(true);
      if (storedStreak) setStreak(parseInt(storedStreak));
    })();
  }, []);

  const completeToday = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem("habit_lastDate", today);
    const newStreak = streak + 1;
    setStreak(newStreak);
    await AsyncStorage.setItem("habit_streak", newStreak.toString());
    setTodayCompleted(true);
  };

  return (
    <LinearGradient colors={["#B6D7B9", "#9FC8A3"]} style={styles.habitContainer}>
      <Text style={styles.habitTitle}>🪴 Bağımlılıkla Mücadele</Text>
      <Text style={styles.habitSubtitle}>
        {todayCompleted ? "Bugün de başardın 🌿" : "Bugün küçük bir adım at 🍃"}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${(streak % 7) * (100 / 7)}%` }]}
        />
      </View>
      <TouchableOpacity
        style={styles.habitButton}
        onPress={todayCompleted ? async () => {
          await AsyncStorage.multiRemove(["habit_lastDate", "habit_streak"]);
          setStreak(0);
          setTodayCompleted(false);
        } : completeToday}
      >
        <Text style={styles.habitButtonText}>
          {todayCompleted ? "Sıfırla" : "Bugün Başladım"}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

// 🌿 Ana Sayfa
export default function HomeScreen() {
  const user = auth.currentUser;
  const displayName = user?.email?.split("@")[0] || "Dostum";

  const [activeMeditation, setActiveMeditation] = useState(meditations[0]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [dailyQuote, setDailyQuote] = useState("");
  const [selectedMood, setSelectedMood] = useState("all");
  const miniBarAnim = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(activeMeditation.video, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const moods = [
    { key: "all", label: "Hepsi 🌍" },
    { key: "relax", label: "Rahatlamak 😌" },
    { key: "sleep", label: "Uyumak 🌙" },
    { key: "focus", label: "Odaklanmak 🧘" },
    { key: "balance", label: "Denge ❤️" },
    { key: "motivation", label: "Motivasyon 🌅" },
  ];

  const filteredMeditations =
    selectedMood === "all"
      ? meditations
      : meditations.filter((m) => m.tags.includes(selectedMood));

  useEffect(() => {
    setDailyQuote(
      dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]
    );
  }, []);

  useEffect(() => {
    Animated.timing(miniBarAnim, {
      toValue: isPlaying ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isPlaying]);

  const handleSelectMeditation = async (item: any) => {
    setActiveMeditation(item);
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
  };

  const playPause = async () => {
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        activeMeditation.audio
      );
      setSound(newSound);
      await newSound.setVolumeAsync(volume);
      await newSound.playAsync();
      setIsPlaying(true);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const changeVolume = async (v: number) => {
    setVolume(v);
    if (sound) await sound.setVolumeAsync(v);
  };

  return (
    <View style={styles.container}>
      {/* 🎬 Arka Plan Video */}
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" />
      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>DERD’e Hoş Geldin, {displayName} 🌿</Text>
          <Text style={styles.welcomeSubtitle}>Bugün biraz huzur seninle olsun.</Text>
        </View>

        {/* 🎭 Ruh Hali Filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodContainer}
        >
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.key}
              onPress={() => setSelectedMood(mood.key)}
              style={[
                styles.moodChip,
                selectedMood === mood.key && styles.moodChipActive,
              ]}
            >
              <Text
                style={[
                  styles.moodText,
                  selectedMood === mood.key && styles.moodTextActive,
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🎧 Aktif Meditasyon */}
        <LinearGradient
          colors={["rgba(255,255,255,0.7)", "rgba(255,255,255,0.4)"]}
          style={styles.activePlayer}
        >
          <Text style={styles.activeTitle}>{activeMeditation.title}</Text>
          <Text style={styles.activeDesc}>{activeMeditation.description}</Text>

          <View style={styles.activeControls}>
            <TouchableOpacity onPress={playPause} style={styles.playButton}>
              <FontAwesome name={isPlaying ? "pause" : "play"} size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.volumeRow}>
              <FontAwesome name="volume-down" size={16} color="#fff" />
              <Slider
                style={{ width: 100 }}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={changeVolume}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="#999"
              />
              <FontAwesome name="volume-up" size={16} color="#fff" />
            </View>
          </View>
        </LinearGradient>

        {/* 🎧 Meditasyon Kartları */}
        <Text style={styles.sectionTitle}>🎧 Önerilen Meditasyonlar</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredMeditations}
          renderItem={({ item }) => (
            <MeditationCard item={item} onSelect={handleSelectMeditation} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />

        <HabitRecoveryCard />

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>{dailyQuote}</Text>
        </View>
      </ScrollView>

      {/* 🎵 Mini Bar */}
      <Animated.View
        style={[
          styles.miniBar,
          {
            transform: [
              {
                translateY: miniBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: miniBarAnim,
          },
        ]}
      >
        <LinearGradient colors={["#A8CBA8", "#8DBE91"]} style={styles.miniInner}>
          <Text style={styles.miniTitle}>{activeMeditation.title}</Text>
          <View style={styles.miniControls}>
            <TouchableOpacity onPress={playPause}>
              <FontAwesome name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
            </TouchableOpacity>
            <Slider
              style={{ width: 100 }}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={changeVolume}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#ccc"
            />
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CFE8D3" },
  headerContainer: { paddingTop: 70, paddingHorizontal: 20 },
  welcomeTitle: { fontSize: 24, fontWeight: "bold", color: "#1B331D" },
  welcomeSubtitle: { fontSize: 15, color: "#355E3B", marginBottom: 25 },
  moodContainer: { paddingHorizontal: 20, marginBottom: 10 },
  moodChip: {
    backgroundColor: "rgba(255,255,255,0.4)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  moodChipActive: { backgroundColor: "#7BAE7F" },
  moodText: { color: "#2E3D3A", fontWeight: "600" },
  moodTextActive: { color: "#fff" },
  activePlayer: { margin: 20, borderRadius: 20, padding: 20, alignItems: "center" },
  activeTitle: { fontSize: 22, fontWeight: "bold", color: "#1C3024" },
  activeDesc: { fontSize: 15, color: "#2E3D3A", marginTop: 5 },
  activeControls: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  playButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 25,
    padding: 10,
    marginRight: 15,
  },
  volumeRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#1C3024", marginLeft: 20, marginVertical: 10 },
  cardContainer: { width: CARD_WIDTH, height: 180, marginRight: SPACING },
  cardImage: { flex: 1, borderRadius: 20, overflow: "hidden" },
  cardOverlay: { flex: 1, justifyContent: "flex-end", padding: 15, borderRadius: 20 },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cardDesc: { color: "#ddd", fontSize: 13, marginTop: 3 },
  habitContainer: { marginHorizontal: 20, marginTop: 25, borderRadius: 20, padding: 20, alignItems: "center" },
  habitTitle: { fontSize: 20, fontWeight: "bold", color: "#2E3D3A" },
  habitSubtitle: { fontSize: 15, color: "#3D4F3D", marginVertical: 10 },
  progressBar: { width: "100%", height: 10, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.4)", marginVertical: 10 },
  progressFill: { height: "100%", backgroundColor: "#6DAF73", borderRadius: 10 },
  habitButton: { backgroundColor: "#7BAE7F", paddingVertical: 10, paddingHorizontal: 35, borderRadius: 25 },
  habitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  quoteBox: { backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 16, padding: 18, margin: 20 },
  quoteText: { fontSize: 15, color: "#3D4F3D", fontStyle: "italic", textAlign: "center" },
  miniBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: 70 },
  miniInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  miniTitle: { color: "#fff", fontWeight: "600" },
  miniControls: { flexDirection: "row", alignItems: "center", gap: 8 },
});

