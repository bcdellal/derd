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
  // Global audio context üzerinden aktif oturum ve kontrol fonksiyonları alınır
  const { activeSession, playing, pause, resume, stop } = useAudioPlayer();

  // Mini player’ın yukarı-aşağı hareketi için kullanılan animasyon değeri
  const translateY = useRef(new Animated.Value(0)).current;

  // Kullanıcının parmağıyla sürükleme hareketini algılamak için PanResponder
  const panResponder = useRef(
    PanResponder.create({
      // Dikey hareket belli bir eşiği geçince sürükleme başlatılır
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 5,

      // Kullanıcı aşağı doğru sürüklerse mini player aşağı hareket eder
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },

      // Parmak bırakıldığında ne olacağı burada belirlenir
      onPanResponderRelease: (_, gesture) => {
        // Eğer yeterince aşağı sürüklenmişse mini player kapatılır
        if (gesture.dy > 60) {
          Animated.timing(translateY, {
            toValue: 120, // ekranın altına doğru kaydırılır
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // Animasyon bittikten sonra ses tamamen durdurulur
            stop();

            // Bir sonraki açılış için animasyon değeri sıfırlanır
            translateY.setValue(0);
          });
        } else {
          // Eşik aşılmadıysa mini player eski yerine geri döner
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Eğer aktif bir ses oturumu yoksa mini player hiç render edilmez
  if (!activeSession) return null;

  // Mini player UI
  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
      // PanResponder eventleri bu view’a bağlanır
      {...panResponder.panHandlers}
    >
      {/* Çalınan sesin başlığı */}
      <Text style={styles.title} numberOfLines={1}>
        {activeSession.title}
      </Text>

      {/* Play / Pause butonu */}
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
  // Mini player ekranın altına sabitlenmiştir
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
    zIndex: 999, // Diğer UI elemanlarının üstünde görünmesi için
  },

  // Başlık metni
  title: {
    color: "#fff",
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
});
