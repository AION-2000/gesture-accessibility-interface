// Types related to accessibility features and settings

export type VerbosityLevel = 'minimal' | 'normal' | 'verbose';

export type KeyboardAction =
  | 'select'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'activate'
  | 'cancel'
  | 'next'
  | 'previous'
  | 'toggle-gesture'
  | 'help';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: KeyboardAction;
}

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  verbosity: VerbosityLevel;
  announceGestures: boolean;
  announceActions: boolean;
  announceHover: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
}

export interface FocusableElement {
  id: string;
  label: string;
  element: HTMLElement;
}