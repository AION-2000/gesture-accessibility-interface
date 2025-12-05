import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { GestureType } from '../../types/gesture';

interface FeedbackIndicatorProps {
  gesture: GestureType | null;
  isActive: boolean;
  processingTime?: number;
}

const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({
  gesture,
  isActive,
  processingTime = 0,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGesture, setFeedbackGesture] = useState<GestureType | null>(null);

  useEffect(() => {
    if (gesture && gesture !== 'none' && isActive) {
      setFeedbackGesture(gesture);
      setShowFeedback(true);
      
      // Hide feedback after a short delay
      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gesture, isActive]);

  const getGestureLabel = (g: GestureType): string => {
    switch (g) {
      case 'fist':
        return 'Fist';
      case 'open_palm':
        return 'Open Palm';
      case 'pointing':
        return 'Pointing';
      case 'thumbs_up':
        return 'Thumbs Up';
      case 'thumbs_down':
        return 'Thumbs Down';
      case 'swipe_left':
        return 'Swipe Left';
      case 'swipe_right':
        return 'Swipe Right';
      case 'swipe_up':
        return 'Swipe Up';
      case 'swipe_down':
        return 'Swipe Down';
      case 'pinch':
        return 'Pinch';
      default:
        return 'Unknown';
    }
  };

  const getGestureIcon = (g: GestureType): string => {
    switch (g) {
      case 'fist':
        return '✊';
      case 'open_palm':
        return '✋';
      case 'pointing':
        return '👉';
      case 'thumbs_up':
        return '👍';
      case 'thumbs_down':
        return '👎';
      case 'swipe_left':
        return '👈';
      case 'swipe_right':
        return '👉';
      case 'swipe_up':
        return '👆';
      case 'swipe_down':
        return '👇';
      case 'pinch':
        return '🤏';
      default:
        return '❓';
    }
  };

  return (
    <Box className="fixed top-4 right-4 z-50">
      {showFeedback && feedbackGesture && (
        <Box className="bg-white bg-opacity-90 rounded-lg shadow-lg p-4 flex flex-col items-center">
          <Typography variant="h4" className="mb-2">
            {getGestureIcon(feedbackGesture)}
          </Typography>
          <Typography variant="body1" className="font-medium">
            {getGestureLabel(feedbackGesture)}
          </Typography>
          {processingTime > 0 && (
            <Typography variant="caption" color="textSecondary">
              {processingTime.toFixed(0)}ms
            </Typography>
          )}
        </Box>
      )}
      
      {isActive && (
        <Box className="mt-2 flex items-center">
          <CircularProgress size={16} className="mr-2" />
          <Typography variant="caption" color="textSecondary">
            Detecting...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FeedbackIndicator;