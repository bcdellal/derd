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

const getTheme = (isDark: boolean) => ({
  blur: isDark ? 80 : 60,
  active: "#7BAE7F",
  inactive: "#7A8F7C",
  highlight: "rgba(123,174,127,0.22)",
});

function AnimatedTabIcon({ name, focused, color }: any) {
  const scale = useRef(new Animated.Value(focused ? 1.15 : 1)).current;

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

function CustomTabBar({ state, navigation }: any) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === "dark");

  const iconMap: Record<string, any> = {
    index: "leaf-outline",
    diary: "journal-outline",
    explore: "sparkles-outline",
    profile: "person-circle-outline",
  };

  return (
    <BlurView intensity={theme.blur} style={styles.blurContainer}>
      <View style={styles.tabRow}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabButton}
            >
              {focused && (
                <View
                  style={[
                    styles.activeHighlight,
                    { backgroundColor: theme.highlight },
                  ]}
                />
              )}

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

export default function TabLayout() {
  return (
    <>
      <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <CustomTabBar {...p} />}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="diary" />
        <Tabs.Screen name="explore" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <GlobalMiniPlayer />
    </>
  );
}

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
