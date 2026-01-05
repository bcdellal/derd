import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  // Bu ekran Expo Router üzerinden modal olarak açılan bir ekrandır
  // Genelde bilgilendirme veya geçici içerikler için kullanılır
  return (
    <ThemedView style={styles.container}>
      {/* Modal başlığı */}
      <ThemedText type="title">This is a modal</ThemedText>

      {/* Ana ekrana geri dönmeyi sağlayan link */}
      {/* dismissTo sayesinde modal stack'ten kapatılır */}
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Modal içeriğini ekranın ortasına yerleştirir
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  // Link için boşluk ve tıklanabilir alan
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
