import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import GlobalMiniPlayer from "../../components/GlobalMiniPlayer";

// karanlık moda göre tab-bar renklerini ve blur seviyesini belirleme
const getTheme = (isDark: boolean) => ({
  blur: isDark ? 80 : 60,
  active: "#7BAE7F",
  inactive: "#7A8F7C",
  highlight: "rgba(123,174,127,0.22)",
});

// Sekme ikonlarının  büyümesi burada olur 
function AnimatedTabIcon({ name, focused, color }: any) {
  // Animasyon değeri useRef ile saklanır, render yaparken sıfırlanmaz
  const scale = useRef(new Animated.Value(focused ? 1.15 : 1)).current;

  // Sekme aktifliğine göre ikon ölçeği güncellemesi
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.15 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={26} color={color} />
    </Animated.View>
  );
}

// Expo default tab bar’ı yerine özel tab bar 
function CustomTabBar({ state, navigation }: any) {
  // Cihazın tema durumunu alan yer burda
  const scheme = useColorScheme();
  const theme = getTheme(scheme === "dark");

  // Her sayfa için ikon lar yukarıdan çektik
  const iconMap: Record<string, any> = {
    index: "leaf-outline",
    diary: "journal-outline",
    explore: "sparkles-outline",
    profile: "person-circle-outline",
  };

  return (
    // BlurView arka plana ufaktan bir cam efekti yapar 
    <BlurView intensity={theme.blur} style={styles.blurContainer}>
      <View style={styles.tabRow}>
        {state.routes.map((route: any, index: number) => {
          // Hangi sekmenin aktif onun ayarı
          const focused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              // Tıklanan sekmeye yönlendirme 
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabButton}
            >
              {/* Aktif sekmenin arkasında highlight gösterilir */}
              {focused && (
                <View
                  style={[
                    styles.activeHighlight,
                    { backgroundColor: theme.highlight },
                  ]}
                />
              )}

              {/* Sekme ikonu animasyonlu şekilde render edilir */}
              <AnimatedTabIcon
                name={iconMap[route.name]}
                focused={focused}
                color={focused ? theme.active : theme.inactive}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
}

// Uygulamanın ana tab navigasyon yapısı burada 
export default function TabLayout() {
  return (
    <>
      <Tabs
        // Üst header iptali, çünkü özel tab bar var
        screenOptions={{ headerShown: false }}
        // özel barr burada tanımlanır
        tabBar={(p) => <CustomTabBar {...p} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="diary" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="profile" />
      </Tabs>

      {/* Mini player tüm sayfalarda görünür olması için burada render edilir */}
      <GlobalMiniPlayer />
    </>
  );
}

// Tab bar tasarımına ait stiller
const styles = StyleSheet.create({
  blurContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    borderRadius: 28,
    overflow: "hidden",
    zIndex: 10,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 72,
  },
  tabButton: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  activeHighlight: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
  },
});
