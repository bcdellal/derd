import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <LinearGradient
        colors={['#2c3e50', '#121212']} // Koyu tema gradient
        style={StyleSheet.absoluteFill}
      />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </>
  );
}