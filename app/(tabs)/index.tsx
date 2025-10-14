import { FontAwesome } from '@expo/vector-icons';
import { Alert, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function HomeScreen() {
  const user = auth.currentUser;
  const displayName = user?.email?.split('@')[0] || 'Dostum';

  const handlePlayPress = () => {
    Alert.alert('Yakında', 'Meditasyon özelliği yakında eklenecektir.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcomeTitle}>Hoş Geldin, {displayName}</Text>
      <Text style={styles.welcomeSubtitle}>Günün önerisi aşağıda seni bekliyor.</Text>

      <View style={styles.widgetContainer}>
        <TouchableOpacity onPress={handlePlayPress} activeOpacity={0.8}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto.format&fit=crop' }}
            style={styles.widgetBackground}
            imageStyle={{ borderRadius: 20 }}
          >
            <View style={styles.overlay} />
            <View style={styles.widgetContent}>
              <Text style={styles.widgetTitle}>5 Dakikalık Farkındalık</Text>
              <Text style={styles.widgetDescription}>Zihnini an'a getir ve nefesine odaklan.</Text>
              <View style={styles.playButton}>
                <FontAwesome name="play" size={24} color="#FFFFFF" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#57a257ff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#367236ff',
    marginBottom: 30,
  },
  widgetContainer: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  widgetBackground: {
    width: '100%', // <<< HATA BURADAYDI, 'hundred_percent' YERİNE '100%' OLARAK DÜZELTİLDİ
    height: 200,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  widgetContent: {
    padding: 20,
  },
  widgetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  widgetDescription: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  playButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
});