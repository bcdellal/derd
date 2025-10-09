import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
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
    backgroundColor: '#121212', // Koyu bir arkaplan
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF', // Beyaz yazı
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC', // Açık gri yazı
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});