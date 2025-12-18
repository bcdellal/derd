import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { auth } from "../../firebaseConfig";

import {
  requestNotificationPermission,
  scheduleDemoNotification
} from "../../lib/notifications";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.68;
const SQUARE_SIZE = (width - 60) / 2;

/* -------------------- DATA -------------------- */
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

const BREATHING_MODES = {
  calm: { label: "Calm", inhale: 4, hold: 0, exhale: 4 },
  relax: { label: "Relax", inhale: 4, hold: 0, exhale: 6 },
  focus: { label: "Focus", inhale: 4, hold: 4, exhale: 4 },
};

type Phase = "Inhale" | "Hold" | "Exhale" | "Done";
const TOTAL_CYCLES = 3;

/* -------------------- CARD -------------------- */
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

/* -------------------- SCREEN -------------------- */
export default function HomeScreen() {
  const user = auth.currentUser;
  const name = user?.email?.split("@")[0] || "Friend";

  const [active, setActive] = useState(meditations[0]);
  const { play, pause, playing, activeSession } = useAudioPlayer();

  const player = useVideoPlayer(active.video, (p) => {
    p.loop = true;
    p.muted = true;
    p.volume = 0;
    p.play();
  });

  /*3dk sonra bildirimi göstermece*/
  useEffect(() => {
    const runDemoNotification = async () => {
      const granted = await requestNotificationPermission();
      if (!granted) return;

      await scheduleDemoNotification(180);
    };

    runDemoNotification();
  }, []);

  /* nefes egzersizi*/
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<number | null>(null);

  const [breathing, setBreathing] = useState(false);
  const [mode, setMode] = useState<keyof typeof BREATHING_MODES>("calm");
  const [phase, setPhase] = useState<Phase>("Inhale");
  const [seconds, setSeconds] = useState(0);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const runPhase = (p: Phase, duration: number, scale: number) => {
    clearTimer();
    setPhase(p);
    setSeconds(duration);

    Animated.timing(scaleAnim, {
      toValue: scale,
      duration: duration * 1000,
      useNativeDriver: true,
    }).start();

    timerRef.current = setInterval(() => {
      setSeconds((s) => (s > 1 ? s - 1 : 0));
    }, 1000);
  };

  useEffect(() => {
    if (!breathing) return;

    const { inhale, hold, exhale } = BREATHING_MODES[mode];
    let cancelled = false;

    const run = async () => {
      for (let i = 0; i < TOTAL_CYCLES; i++) {
        if (cancelled) return;

        runPhase("Inhale", inhale, 1.15);
        await wait(inhale);

        if (hold > 0) {
          runPhase("Hold", hold, 1.15);
          await wait(hold);
        }

        runPhase("Exhale", exhale, 1);
        await wait(exhale);
      }

      clearTimer();
      scaleAnim.setValue(1);
      setPhase("Done");
      setBreathing(false);
    };

    run();

    return () => {
      cancelled = true;
      clearTimer();
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
    };
  }, [breathing, mode]);

  const wait = (s: number) =>
    new Promise((res) => setTimeout(res, s * 1000));

  const handlePlayPause = async () => {
    if (
      activeSession &&
      activeSession.title === active.title &&
      playing
    ) {
      await pause();
    } else {
      await play({ title: active.title, audio: active.audio });
    }
  };

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back, {name}</Text>
          <Text style={styles.subtitle}>
            Take a moment for yourself today.
          </Text>
        </View>

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

          <TouchableOpacity
            style={styles.startButton}
            onPress={handlePlayPause}
          >
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

        <Text style={styles.sectionTitle}>Recommended Sessions</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={meditations}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingLeft: 20 }}
          renderItem={({ item }) => (
            <RecommendedCard item={item} onSelect={setActive} />
          )}
        />

        <View style={styles.widgetRow}>
          <View style={styles.squareCard}>
            <Text style={styles.squareTitle}>Breathing Exercise</Text>

            <View style={styles.modeRow}>
              {Object.keys(BREATHING_MODES).map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() =>
                    setMode(key as keyof typeof BREATHING_MODES)
                  }
                >
                  <Text
                    style={[
                      styles.modeText,
                      mode === key && styles.modeActive,
                    ]}
                  >
                    {
                      BREATHING_MODES[
                        key as keyof typeof BREATHING_MODES
                      ].label
                    }
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Animated.View
              style={[
                styles.squareCircle,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View style={styles.circleContent}>
                {phase === "Done" ? (
                  <Text style={styles.doneText}>Well Done!</Text>
                ) : (
                  <>
                    <Text style={styles.phaseText}>{phase}</Text>
                    <Text style={styles.secondsText}>{seconds}s</Text>
                  </>
                )}
              </View>
            </Animated.View>

            <TouchableOpacity
              style={styles.squareButton}
              onPress={() => setBreathing((b) => !b)}
            >
              <Text style={styles.squareButtonText}>
                {breathing ? "Stop" : "Start"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.squareCard}>
            <Text style={styles.squareTitle}>Daily Insight</Text>
            <Text style={styles.insightText}>
              Consistency matters more than intensity.
            </Text>
          </View>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>
    </View>
  );
}

/* stiller */
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
  startText: { color: "#fff", fontWeight: "600" },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C3024",
    marginLeft: 20,
    marginBottom: 12,
  },

  widgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 12,
  },

  squareCard: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },

  squareTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1C3024",
  },

  modeRow: { flexDirection: "row", gap: 6 },

  modeText: { fontSize: 11, color: "#355E3B", fontWeight: "600" },
  modeActive: { color: "#1B331D" },

  squareCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#7BAE7F",
    justifyContent: "center",
    alignItems: "center",
  },

  circleContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  phaseText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  secondsText: { color: "#fff", fontSize: 11 },

  doneText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 13,
    textAlign: "center",
  },

  squareButton: {
    backgroundColor: "#556B55",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  squareButtonText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  insightText: {
    textAlign: "center",
    color: "#355E3B",
    fontSize: 12,
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
