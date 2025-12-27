import { Audio } from "expo-av";
import React, { createContext, useContext, useRef, useState } from "react";

type Session = {
  title: string;
  audio: any;
};

type AudioContextType = {
  activeSession: Session | null;
  playing: boolean;
  play: (session: Session) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
};

const AudioPlayerContext = createContext<AudioContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = async (session: Session) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    const { sound } = await Audio.Sound.createAsync(session.audio);
    await sound.playAsync();

    soundRef.current = sound;
    setActiveSession(session);
    setPlaying(true);
  };

  const pause = async () => {
    if (!soundRef.current) return;
    await soundRef.current.pauseAsync();
    setPlaying(false);
  };

  const resume = async () => {
    if (!soundRef.current) return;
    await soundRef.current.playAsync();
    setPlaying(true);
  };

  return (
    <AudioPlayerContext.Provider
      value={{ activeSession, playing, play, pause, resume }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return ctx;
}
