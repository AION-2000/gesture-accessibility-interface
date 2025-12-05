import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import { Settings, Help, AccessibilityNew } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import CameraPermissions from './components/Camera/CameraPermissions';
import GestureDetector from './components/GestureRecognition/GestureDetector';
import GestureVisualizer from './components/GestureRecognition/GestureVisualizer';
import FeedbackIndicator from './components/UI/FeedbackIndicator';
import SettingsPanel, { SettingsState as GestureSettings } from './components/UI/SettingsPanel';
import KeyboardControls from './components/Accessibility/KeyboardControls';
import AriaAnnouncer from './components/Accessibility/AriaAnnouncer';
import ScreenReaderHelper, { ScreenReaderSettings } from './components/Accessibility/ScreenReaderHelper';
import { useAudioFeedback } from './hooks/useAudioFeedback';
import { Gesture, GestureType } from './types/gesture';

// Create a Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Helper component for TabPanel to ensure accessibility
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`main-tabpanel-${index}`}
      aria-labelledby={`main-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `main-tab-${index}`,
    'aria-controls': `main-tabpanel-${index}`,
  };
}

const App: React.FC = () => {
  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [gestureDetectionActive, setGestureDetectionActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<Gesture | null>(null);
  const [ariaMessage, setAriaMessage] = useState('');
  const [processingTime, setProcessingTime] = useState(0);

  // Settings State
  const [gestureSettings, setGestureSettings] = useState<GestureSettings>({
    gestureEnabled: true,
    audioEnabled: true,
    sensitivity: 70,
    confidenceThreshold: 70,
    debounceTime: 100,
    selectedHand: 'right',
    showLandmarks: true,
    autoScroll: false,
    scrollSpeed: 50,
  });
  const [screenReaderSettings, setScreenReaderSettings] = useState<ScreenReaderSettings>({
    enabled: true,
    verbosity: 'normal',
    announceGestures: true,
    announceActions: true,
    announceHover: false,
  });

  // Refs and Hooks
  const gestureStartTime = useRef<number>(Date.now());
  const { playSound } = useAudioFeedback({ enabled: gestureSettings.audioEnabled });

  // Event Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCameraPermissionGranted = () => {
    setCameraPermission('granted');
    setAriaMessage('Camera permission granted. You can now start gesture detection.');
  };

  const handleCameraPermissionDenied = () => {
    setCameraPermission('denied');
    setAriaMessage('Camera permission was denied. Please enable it in your browser settings to use this feature.');
  };

  const handleGestureDetected = (gesture: Gesture) => {
    // Calculate processing time for performance feedback
    const now = Date.now();
    setProcessingTime(now - gestureStartTime.current);
    gestureStartTime.current = now;

    // Update current gesture state
    setCurrentGesture(gesture);

    // Play audio feedback if enabled and gesture is meaningful
    if (gestureSettings.audioEnabled && gesture.type !== 'none') {
      playSound(gesture.type);
    }

    // Announce to screen reader if enabled
    if (screenReaderSettings.enabled && screenReaderSettings.announceGestures && gesture.type !== 'none') {
      const gestureName = gesture.type.replace('_', ' ');
      setAriaMessage(`Gesture detected: ${gestureName}`);
    }

    // Trigger actions based on the gesture
    handleGestureAction(gesture.type);
  };

  const handleGestureAction = (gestureType: GestureType) => {
    if (!gestureSettings.gestureEnabled || gestureType === 'none') return;

    // This is where you would map gestures to specific UI actions
    // For example: scrolling, clicking, navigating, etc.
    console.log(`Action triggered by gesture: ${gestureType}`);

    // Announce action to screen reader
    if (screenReaderSettings.enabled && screenReaderSettings.announceActions) {
      setAriaMessage(`Action performed for ${gestureType.replace('_', ' ')} gesture`);
    }
  };

  const handleKeyboardAction = (action: string) => {
    switch (action) {
      case 'toggle-gesture':
        setGestureDetectionActive(!gestureDetectionActive);
        setAriaMessage(`Gesture control ${!gestureDetectionActive ? 'enabled' : 'disabled'}`);
        break;
      case 'help':
        setTabValue(2);
        setAriaMessage('Help tab opened');
        break;
      default:
        // Handle other keyboard actions as needed
        break;
    }
  };

  const handleGestureSettingsChange = (newSettings: GestureSettings) => {
    setGestureSettings(newSettings);
  };

  const handleScreenReaderSettingsChange = (newSettings: ScreenReaderSettings) => {
    setScreenReaderSettings(newSettings);
  };

  // Initialize gesture start time on component mount
  useEffect(() => {
    gestureStartTime.current = Date.now();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-gray-50">
        <AppBar position="static">
          <Toolbar>
            <AccessibilityNew className="mr-2" />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Gesture Accessibility Interface
            </Typography>
            <Tooltip title="Settings">
              <IconButton
                color="inherit"
                onClick={() => setTabValue(1)}
                aria-label="Open Settings"
              >
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Help">
              <IconButton
                color="inherit"
                onClick={() => setTabValue(2)}
                aria-label="Open Help"
              >
                <Help />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" className="py-8">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Main navigation tabs">
              <Tab label="Gesture Control" {...a11yProps(0)} />
              <Tab label="Settings" {...a11yProps(1)} />
              <Tab label="Help" {...a11yProps(2)} />
            </Tabs>
          </Box>

          {/* Tab Panel 1: Gesture Control */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h4" component="h1" gutterBottom>
              Gesture Control
            </Typography>

            {cameraPermission === 'prompt' && (
              <CameraPermissions
                onPermissionGranted={handleCameraPermissionGranted}
                onPermissionDenied={handleCameraPermissionDenied}
              />
            )}

            {cameraPermission === 'denied' && (
              <Box className="p-6 bg-red-50 rounded-lg">
                <Typography variant="h6" color="error" gutterBottom>
                  Camera Access Denied
                </Typography>
                <Typography variant="body1">
                  Camera access is required for gesture control. Please enable camera access in your browser settings and refresh the page.
                </Typography>
              </Box>
            )}

            {cameraPermission === 'granted' && (
              <Box className="space-y-6">
                <Box className="flex justify-center">
                  <button
                    onClick={() => setGestureDetectionActive(!gestureDetectionActive)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      gestureDetectionActive
                        ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
                        : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
                    }`}
                    aria-label={gestureDetectionActive ? 'Stop gesture detection' : 'Start gesture detection'}
                  >
                    {gestureDetectionActive ? 'Stop Detection' : 'Start Detection'}
                  </button>
                </Box>

                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <GestureDetector
                      onGestureDetected={handleGestureDetected}
                      isActive={gestureDetectionActive}
                      className="w-full"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <GestureVisualizer gesture={currentGesture?.type || null} />
                  </Grid>
                </Grid>

                <FeedbackIndicator
                  gesture={currentGesture?.type || null}
                  isActive={gestureDetectionActive}
                  processingTime={processingTime}
                />
              </Box>
            )}
          </TabPanel>

          {/* Tab Panel 2: Settings */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h4" component="h1" gutterBottom>
              Settings
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <SettingsPanel
                  onSettingsChange={handleGestureSettingsChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <ScreenReaderHelper
                  onSettingsChange={handleScreenReaderSettingsChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Panel 3: Help */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h4" component="h1" gutterBottom>
              Help & Accessibility
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <KeyboardControls onAction={handleKeyboardAction} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="p-4 bg-gray-100 rounded-lg">
                  <Typography variant="h6" gutterBottom>
                    Supported Gestures
                  </Typography>
                  <ul className="space-y-2">
                    <li className="flex items-center"><span className="mr-2 text-2xl">✊</span><span>Fist - Click or select</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">✋</span><span>Open Palm - Stop or cancel</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">👉</span><span>Pointing - Hover or navigate</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">👈</span><span>Swipe Left - Navigate left</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">👉</span><span>Swipe Right - Navigate right</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">👆</span><span>Swipe Up - Scroll up</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">👇</span><span>Swipe Down - Scroll down</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">🤏</span><span>Pinch - Zoom or precise selection</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">👍</span><span>Thumbs Up - Confirm</span></li>
                    <li className="flex items-center"><span className="mr-2 text-2xl">👎</span><span>Thumbs Down - Cancel</span></li>
                  </ul>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </Container>

        {/* Screen reader announcer for dynamic content */}
        <AriaAnnouncer message={ariaMessage} politeness="polite" />
      </div>
    </ThemeProvider>
  );
};

export default App;