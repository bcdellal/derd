import { Audio } from "expo-av";
import React, { createContext, useContext, useRef, useState } from "react";

// Bir meditasyon veya ses oturumunun temel yapısı
// title: ekranda gösterilen isim
// audio: oynatılacak ses dosyası
type Session = {
  title: string;
  audio: any;
};

// Audio context'in dışarıya sunduğu fonksiyonlar ve state'ler
type AudioContextType = {
  activeSession: Session | null; // Şu anda çalan ses
  playing: boolean;              // Ses çalıyor mu duraklatıldı mı
  play: (session: Session) => Promise<void>;   // Yeni ses başlatır
  pause: () => Promise<void>;                  // Sesi duraklatır
  resume: () => Promise<void>;                 // Duraklatılan sesi devam ettirir
  stop: () => Promise<void>;                   // Sesi tamamen kapatır
};

// Global audio context oluşturulur
// null başlangıç değeri, provider dışında kullanım hatasını yakalamak için
const AudioPlayerContext = createContext<AudioContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  // Expo-av üzerinden oluşturulan ses nesnesini saklamak için ref
  // Ref kullanılmasının sebebi re-render'da kaybolmamasıdır
  const soundRef = useRef<Audio.Sound | null>(null);

  // Aktif olarak çalan oturum bilgisi
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  // Ses şu an çalıyor mu bilgisi
  const [playing, setPlaying] = useState(false);

  // Yeni bir ses başlatır
  const play = async (session: Session) => {
    // Eğer halihazırda çalan bir ses varsa önce durdurulur
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    // Yeni ses dosyası oluşturulur
    const { sound } = await Audio.Sound.createAsync(session.audio);

    // Ses hemen çalmaya başlar
    await sound.playAsync();

    // Ref güncellenir ve state'ler ayarlanır
    soundRef.current = sound;
    setActiveSession(session);
    setPlaying(true);
  };

  // Mevcut sesi duraklatır
  const pause = async () => {
    if (!soundRef.current) return;
    await soundRef.current.pauseAsync();
    setPlaying(false);
  };

  // Duraklatılmış sesi kaldığı yerden devam ettirir
  const resume = async () => {
    if (!soundRef.current) return;
    await soundRef.current.playAsync();
    setPlaying(true);
  };

  // Sesi tamamen kapatır ve hafızadan temizler
  const stop = async () => {
    if (!soundRef.current) return;

    await soundRef.current.stopAsync();
    await soundRef.current.unloadAsync();

    soundRef.current = null;
    setActiveSession(null);
    setPlaying(false);
  };

  // Tüm uygulama boyunca erişilebilir audio state ve fonksiyonlar
  return (
    <AudioPlayerContext.Provider
      value={{
        activeSession,
        playing,
        play,
        pause,
        resume,
        stop,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

// Context'i güvenli şekilde kullanmak için custom hook
export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);

  // Provider dışında kullanılırsa bilinçli olarak hata fırlatılır
  if (!ctx) {
    throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  }

  return ctx;
}
