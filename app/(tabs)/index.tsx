import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  // Logout ile ilgili tüm kodlar buradan kaldırıldı.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Derd</Text>
      <Text style={styles.subtitle}>Zihinsel rahatlama ve farkındalık yolculuğun burada başlıyor.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});