import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { VolumeUp, VolumeOff } from '@mui/icons-material';

interface SettingsPanelProps {
  onSettingsChange: (settings: SettingsState) => void;
  className?: string;
}

export interface SettingsState {
  gestureEnabled: boolean;
  audioEnabled: boolean;
  sensitivity: number;
  confidenceThreshold: number;
  debounceTime: number;
  selectedHand: 'left' | 'right' | 'both';
  showLandmarks: boolean;
  autoScroll: boolean;
  scrollSpeed: number;
}

const defaultSettings: SettingsState = {
  gestureEnabled: true,
  audioEnabled: true,
  sensitivity: 70,
  confidenceThreshold: 70,
  debounceTime: 100,
  selectedHand: 'right',
  showLandmarks: true,
  autoScroll: false,
  scrollSpeed: 50,
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onSettingsChange, className = '' }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  const handleChange = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  return (
    <Box className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <Typography variant="h6" gutterBottom>
        Gesture Control Settings
      </Typography>
      
      <Divider className="mb-4" />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.gestureEnabled}
            onChange={(e) => handleChange('gestureEnabled', e.target.checked)}
            color="primary"
          />
        }
        label="Enable Gesture Control"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.audioEnabled}
            onChange={(e) => handleChange('audioEnabled', e.target.checked)}
            color="primary"
            icon={<VolumeOff />}
            checkedIcon={<VolumeUp />}
          />
        }
        label="Audio Feedback"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.showLandmarks}
            onChange={(e) => handleChange('showLandmarks', e.target.checked)}
            color="primary"
          />
        }
        label="Show Hand Landmarks"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.autoScroll}
            onChange={(e) => handleChange('autoScroll', e.target.checked)}
            color="primary"
          />
        }
        label="Auto-scroll with gestures"
      />
      
      <Accordion className="mt-4">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails className="flex flex-col space-y-4">
          <Box>
            <Typography id="sensitivity-slider" gutterBottom>
              Gesture Sensitivity: {settings.sensitivity}%
            </Typography>
            <Slider
              value={settings.sensitivity}
              onChange={(_, value) => handleChange('sensitivity', value)}
              aria-labelledby="sensitivity-slider"
              min={10}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Box>
            <Typography id="confidence-slider" gutterBottom>
              Confidence Threshold: {settings.confidenceThreshold}%
            </Typography>
            <Slider
              value={settings.confidenceThreshold}
              onChange={(_, value) => handleChange('confidenceThreshold', value)}
              aria-labelledby="confidence-slider"
              min={10}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Box>
            <Typography id="debounce-slider" gutterBottom>
              Debounce Time: {settings.debounceTime}ms
            </Typography>
            <Slider
              value={settings.debounceTime}
              onChange={(_, value) => handleChange('debounceTime', value)}
              aria-labelledby="debounce-slider"
              min={0}
              max={500}
              step={50}
              valueLabelDisplay="auto"
            />
          </Box>
          
          {settings.autoScroll && (
            <Box>
              <Typography id="scroll-speed-slider" gutterBottom>
                Scroll Speed: {settings.scrollSpeed}%
              </Typography>
              <Slider
                value={settings.scrollSpeed}
                onChange={(_, value) => handleChange('scrollSpeed', value)}
                aria-labelledby="scroll-speed-slider"
                min={10}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
          )}
          
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="hand-select-label">Hand to Track</InputLabel>
            <Select
              labelId="hand-select-label"
              value={settings.selectedHand}
              onChange={(e) => handleChange('selectedHand', e.target.value)}
              label="Hand to Track"
            >
              <MenuItem value="right">Right Hand</MenuItem>
              <MenuItem value="left">Left Hand</MenuItem>
              <MenuItem value="both">Both Hands</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      
      <Box className="mt-4 flex justify-end">
        <Button variant="outlined" onClick={resetSettings}>
          Reset to Defaults
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPanel;