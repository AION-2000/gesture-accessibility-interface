import { useCallback, useRef } from 'react';
import { GestureType } from '../types/gesture';

interface UseAudioFeedbackOptions {
  enabled: boolean;
  volume?: number;
}

// CHANGE: Use 'type' instead of 'interface' for a mapped type
type AudioFiles = {
  [key in GestureType]?: string;
};

// Default audio files - in a real app, these would be actual audio files
const defaultAudioFiles: AudioFiles = {
  fist: '/audio/fist.mp3',
  open_palm: '/audio/open_palm.mp3',
  pointing: '/audio/pointing.mp3',
  thumbs_up: '/audio/thumbs_up.mp3',
  thumbs_down: '/audio/thumbs_down.mp3',
  swipe_left: '/audio/swipe_left.mp3',
  swipe_right: '/audio/swipe_right.mp3',
  swipe_up: '/audio/swipe_up.mp3',
  swipe_down: '/audio/swipe_down.mp3',
  pinch: '/audio/pinch.mp3',
};

export const useAudioFeedback = (options: UseAudioFeedbackOptions) => {
  const { enabled, volume = 0.5 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedRef = useRef<GestureType | null>(null);
  const cooldownRef = useRef<number>(0);
  const cooldownTime = 500; // 500ms cooldown between playing the same sound

  const playSound = useCallback(
    async (gestureType: GestureType) => {
      if (!enabled) return;

      // Check cooldown to prevent playing the same sound too frequently
      const now = Date.now();
      if (
        lastPlayedRef.current === gestureType &&
        now - cooldownRef.current < cooldownTime
      ) {
        return;
      }

      try {
        // Get the audio file for the gesture
        const audioFile = defaultAudioFiles[gestureType];
        if (!audioFile) return;

        // Create a new audio element
        const audio = new Audio(audioFile);
        audio.volume = volume;
        
        // Play the sound
        await audio.play();
        
        // Update refs
        audioRef.current = audio;
        lastPlayedRef.current = gestureType;
        cooldownRef.current = now;
      } catch (error) {
        console.error('Error playing audio feedback:', error);
      }
    },
    [enabled, volume]
  );

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { playSound, stopSound };
};

export default useAudioFeedback;