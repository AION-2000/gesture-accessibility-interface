import React, { useEffect, useCallback } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

interface KeyboardControlsProps {
  onAction: (action: string) => void;
  className?: string;
}

interface KeyboardShortcut {
  key: string;
  description: string;
  action: string;
}

const shortcuts: KeyboardShortcut[] = [
  { key: 'Space', description: 'Select/Click', action: 'select' },
  { key: 'Arrow Up', description: 'Move Up', action: 'up' },
  { key: 'Arrow Down', description: 'Move Down', action: 'down' },
  { key: 'Arrow Left', description: 'Move Left', action: 'left' },
  { key: 'Arrow Right', description: 'Move Right', action: 'right' },
  { key: 'Enter', description: 'Activate', action: 'activate' },
  { key: 'Escape', description: 'Cancel/Go Back', action: 'cancel' },
  { key: 'Tab', description: 'Navigate to next element', action: 'next' },
  { key: 'Shift + Tab', description: 'Navigate to previous element', action: 'previous' },
  { key: 'g', description: 'Toggle gesture control', action: 'toggle-gesture' },
  { key: 'h', description: 'Show help', action: 'help' },
];

const KeyboardControls: React.FC<KeyboardControlsProps> = ({ onAction, className = '' }) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check for modifier keys
      const hasShift = event.shiftKey;
      const hasCtrl = event.ctrlKey;
      const hasAlt = event.altKey;
      
      // Get the key name
      let key = event.key;
      if (key === ' ') key = 'Space';
      
      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        if (shortcut.key.includes('+')) {
          // Handle combinations like "Shift + Tab"
          const parts = shortcut.key.split('+').map(p => p.trim());
          const requiredShift = parts.includes('Shift');
          const requiredCtrl = parts.includes('Ctrl');
          const requiredAlt = parts.includes('Alt');
          const mainKey = parts.find(p => !['Shift', 'Ctrl', 'Alt'].includes(p));
          
          return (
            hasShift === requiredShift &&
            hasCtrl === requiredCtrl &&
            hasAlt === requiredAlt &&
            key === mainKey
          );
        } else {
          return key === shortcut.key;
        }
      });
      
      if (matchingShortcut) {
        event.preventDefault();
        onAction(matchingShortcut.action);
      }
    },
    [onAction]
  );

  useEffect(() => {
    // Add event listener for keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      // Clean up event listener
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Box className={`p-4 bg-gray-100 rounded-lg ${className}`}>
      <Typography variant="h6" gutterBottom>
        Keyboard Shortcuts
      </Typography>
      <List dense>
        {shortcuts.map((shortcut, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={
                <span>
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                    {shortcut.key}
                  </span>
                  <span className="ml-2">{shortcut.description}</span>
                </span>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default KeyboardControls;