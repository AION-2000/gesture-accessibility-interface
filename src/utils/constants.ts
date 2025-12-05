// Application-wide constants

// Gesture Recognition Defaults
export const DEFAULT_GESTURE_SETTINGS = {
  CONFIDENCE_THRESHOLD: 0.7,
  DEBOUNCE_TIME_MS: 100,
  SWIPE_COOLDOWN_MS: 1000,
  HISTORY_SIZE: 10,
  PINCH_THRESHOLD: 0.05,
} as const;

// UI Defaults
export const DEFAULT_UI_SETTINGS = {
  CAMERA_WIDTH: 640,
  CAMERA_HEIGHT: 480,
  AUDIO_VOLUME: 0.5,
  ANIMATION_DURATION_MS: 200,
} as const;

// MediaPipe Model URLs
export const MEDIAPIPE_MODEL_BASE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/';

// ARIA Live Region Politeness Levels
export const ARIA_LIVE_POLITENESS = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_GESTURE: 'g',
  HELP: 'h',
  SETTINGS: 's',
  TOGGLE_PERFORMANCE_MONITOR: 'p',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  GESTURE_SETTINGS: 'gesture-accessibility-settings',
  ACCESSIBILITY_SETTINGS: 'accessibility-settings',
} as const;

// Export an empty object to ensure the file is treated as a module,
// even if all other exports are unused in some parts of the app.
export {};