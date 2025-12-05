import React from 'react';
import { Typography, Paper } from '@mui/material'; // <-- FIX: Removed unused 'Box' import
import { GestureType } from '../../types/gesture';

interface GestureVisualizerProps {
  gesture: GestureType | null;
  className?: string;
}

const GestureVisualizer: React.FC<GestureVisualizerProps> = ({ gesture, className = '' }) => {
  const getGestureDetails = (g: GestureType) => {
    switch (g) {
      case 'fist':
        return { icon: '✊', name: 'Fist' };
      case 'open_palm':
        return { icon: '✋', name: 'Open Palm' };
      case 'pointing':
        return { icon: '👉', name: 'Pointing' };
      case 'thumbs_up':
        return { icon: '👍', name: 'Thumbs Up' };
      case 'thumbs_down':
        return { icon: '👎', name: 'Thumbs Down' };
      case 'swipe_left':
        return { icon: '👈', name: 'Swipe Left' };
      case 'swipe_right':
        return { icon: '👉', name: 'Swipe Right' };
      case 'swipe_up':
        return { icon: '👆', name: 'Swipe Up' };
      case 'swipe_down':
        return { icon: '👇', name: 'Swipe Down' };
      case 'pinch':
        return { icon: '🤏', name: 'Pinch' };
      default:
        return { icon: '❓', name: 'None' };
    }
  };

  const { icon, name } = getGestureDetails(gesture || 'none');

  return (
    <Paper
      elevation={3}
      className={`p-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}
    >
      <Typography variant="h4" component="div" className="mb-2">
        {icon}
      </Typography>
      <Typography variant="h6" component="div" className="text-center font-semibold">
        {name}
      </Typography>
      {gesture && gesture !== 'none' && (
        <Typography variant="caption" display="block" className="mt-2 text-gray-600">
          Currently Detected
        </Typography>
      )}
    </Paper>
  );
};

export default GestureVisualizer;