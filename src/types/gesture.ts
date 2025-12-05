// This file defines our application's internal types for gestures.
// These are abstractions and are NOT the same as the types exported by @mediapipe/hands.

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface Hand {
  landmarks: HandLandmark[];
  handedness: string; // 'Left' or 'Right'
}

export type GestureType = 'fist' | 'open_palm' | 'pointing' | 'thumbs_up' | 'thumbs_down' | 'swipe_left' | 'swipe_right' | 'swipe_up' | 'swipe_down' | 'pinch' | 'none';

export interface Gesture {
  type: GestureType;
  confidence: number;
  hand: Hand;
  timestamp: number;
}

export interface GestureDetectorOptions {
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  maxNumHands?: number;
  // FIX: MediaPipe requires modelComplexity to be specifically 0 or 1.
  modelComplexity?: 0 | 1;
}