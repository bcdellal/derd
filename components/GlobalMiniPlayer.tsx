import { FontAwesome } from "@expo/vector-icons";
import { useRef } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function GlobalMiniPlayer() {
  const { activeSession, playing, pause, resume, stop } = useAudioPlayer();

  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 5,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 60) {
          Animated.timing(translateY, {
            toValue: 120,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            stop();
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!activeSession) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.title} numberOfLines={1}>
        {activeSession.title}
      </Text>

      <TouchableOpacity onPress={playing ? pause : resume}>
        <FontAwesome
          name={playing ? "pause" : "play"}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 110,
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 24,
    backgroundColor: "#7BAE7F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 999,
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
});
