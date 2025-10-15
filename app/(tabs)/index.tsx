import { FontAwesome } from '@expo/vector-icons';
import { Audio, ResizeMode, Video } from 'expo-av'; // <<< ResizeMode EKLENDİ
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function HomeScreen() {
  const user = auth.currentUser;
  const displayName = user?.email?.split('@')[0] || 'Dostum';

  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  async function playPauseSound() {
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        console.log('Loading Sound from local asset');
        const { sound: newSound } = await Audio.Sound.createAsync(
           require('../../assets/audio/meditation-sound.mp3')
        );
        setSound(newSound);
        setIsPlaying(true);
        console.log('Playing Sound');
        await newSound.playAsync();
      }
    } catch (error) {
        console.error("Error with sound:", error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{paddingHorizontal: 20, paddingTop: 80}}
    >
      <Text style={styles.welcomeTitle}>Hoş Geldin, {displayName}</Text>
      <Text style={styles.welcomeSubtitle}>Günün önerisi aşağıda seni bekliyor.</Text>

      <View style={styles.widgetContainer}>
        <TouchableOpacity onPress={playPauseSound} activeOpacity={0.9}>
          
          {isPlaying ? (
            <Video
              source={require('../../assets/videos/forest-loop.mp4')}
              style={styles.widgetBackground}
              isMuted={true}
              isLooping={true}
              shouldPlay={true}
              resizeMode={ResizeMode.COVER} // <<< DEĞİŞİKLİK BURADA
            />
          ) : (
            <ImageBackground
              source={require('../../assets/images/forest-bg.jpg')}
              style={styles.widgetBackground}
              imageStyle={{ borderRadius: 20 }}
            />
          )}

          <View style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: 'hidden' }]}>
            <View style={styles.overlay} />
            <View style={styles.widgetContent}>
              <Text style={styles.widgetTitle}>5 Dakikalık Farkındalık</Text>
              <Text style={styles.widgetDescription}>Zihnini an'a getir ve nefesine odaklan.</Text>
              <View style={styles.playButton}>
                <FontAwesome name={isPlaying ? "pause" : "play"} size={24} color="#FFFFFF" />
              </View>
            </View>
          </View>

        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  widgetContainer: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  widgetBackground: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  widgetContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
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