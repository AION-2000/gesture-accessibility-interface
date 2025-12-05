import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel, Button } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface ScreenReaderHelperProps {
  onSettingsChange: (settings: ScreenReaderSettings) => void;
  className?: string;
}

export interface ScreenReaderSettings {
  enabled: boolean;
  verbosity: 'minimal' | 'normal' | 'verbose';
  announceGestures: boolean;
  announceActions: boolean;
  announceHover: boolean;
}

const defaultSettings: ScreenReaderSettings = {
  enabled: true,
  verbosity: 'normal',
  announceGestures: true,
  announceActions: true,
  announceHover: false,
};

const ScreenReaderHelper: React.FC<ScreenReaderHelperProps> = ({
  onSettingsChange,
  className = '',
}) => {
  const [settings, setSettings] = useState<ScreenReaderSettings>(defaultSettings);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  // Check if screen reader is active
  useEffect(() => {
    // Simple detection - in a real app, you might use more sophisticated methods
    const checkScreenReader = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const isVoiceOver = /Mac|iPod|iPhone|iPad/.test(userAgent) && /Apple/.test(userAgent);
      const isNVDA = /NVDA/.test(userAgent);
      const isJAWS = /JAWS/.test(userAgent);
      
      setIsScreenReaderActive(isVoiceOver || isNVDA || isJAWS);
    };

    checkScreenReader();
    
    // Re-check periodically in case the user turns on their screen reader
    const intervalId = setInterval(checkScreenReader, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (key: keyof ScreenReaderSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Box className={`p-4 bg-blue-50 rounded-lg ${className}`}>
      <Typography variant="h6" gutterBottom className="flex items-center">
        {isScreenReaderActive ? (
          <VolumeUpIcon className="mr-2" color="primary" />
        ) : (
          <VolumeOffIcon className="mr-2" color="disabled" />
        )}
        Screen Reader Settings
      </Typography>
      
      {isScreenReaderActive ? (
        <Typography variant="body2" color="success.main" className="mb-4">
          Screen reader detected
        </Typography>
      ) : (
        <Typography variant="body2" color="textSecondary" className="mb-4">
          No screen reader detected
        </Typography>
      )}
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            color="primary"
          />
        }
        label="Enable screen reader support"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.announceGestures}
            onChange={(e) => handleChange('announceGestures', e.target.checked)}
            color="primary"
            disabled={!settings.enabled}
          />
        }
        label="Announce detected gestures"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.announceActions}
            onChange={(e) => handleChange('announceActions', e.target.checked)}
            color="primary"
            disabled={!settings.enabled}
          />
        }
        label="Announce actions"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={settings.announceHover}
            onChange={(e) => handleChange('announceHover', e.target.checked)}
            color="primary"
            disabled={!settings.enabled}
          />
        }
        label="Announce hover states"
      />
      
      <Box className="mt-4">
        <Typography id="verbosity-label" gutterBottom>
          Verbosity Level
        </Typography>
        <div className="flex flex-col space-y-2">
          {(['minimal', 'normal', 'verbose'] as const).map((level) => (
            <Button
              key={level}
              variant={settings.verbosity === level ? 'contained' : 'outlined'}
              onClick={() => handleChange('verbosity', level)}
              disabled={!settings.enabled}
              className="justify-start"
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </Box>
    </Box>
  );
};

export default ScreenReaderHelper;