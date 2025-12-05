import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';
import CameraFeed from '../Camera/CameraFeed';
import HandLandmarks from './HandLandmarks';
import { useGestureDetection } from '../../hooks/useGestureDetection';
import { Gesture } from '../../types/gesture';

interface GestureDetectorProps {
  onGestureDetected: (gesture: Gesture) => void;
  isActive: boolean;
  className?: string;
}

const GestureDetector: React.FC<GestureDetectorProps> = ({
  onGestureDetected,
  isActive,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    isInitialized,
    isDetecting,
    currentGesture,
    error: gestureError,
    processFrame,
    startDetection,
    stopDetection,
  } = useGestureDetection({
    onGestureDetected,
    minConfidence: 0.7,
  });

  // Update dimensions when component mounts or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(640, window.innerWidth - 40);
      const height = Math.min(480, window.innerHeight - 200);
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Start/stop detection based on isActive prop
  useEffect(() => {
    if (isActive && isInitialized && !isDetecting) {
      startDetection();
    } else if (!isActive && isDetecting) {
      stopDetection();
    }
  }, [isActive, isInitialized, isDetecting, startDetection, stopDetection]);

  // Handle errors
  useEffect(() => {
    if (gestureError) {
      setError(gestureError);
    }
  }, [gestureError]);

  return (
    <Box className={`flex flex-col items-center ${className}`}>
      <Box className="relative w-full" style={{ maxWidth: dimensions.width }}>
        
        {/* --- DEBUGGING VISUALIZER --- */}
        {/* 
          TEMPORARILY show the raw video feed to see if the camera itself is working.
          This bypasses the CameraFeed component and its canvas processing.
          If you can see yourself here, the camera is fine.
          If not, it's a permissions or hardware issue.
        */}
        <video
          ref={(node) => {
            // We still need to set up the stream for the processFrame function
            if (node && isActive && isInitialized) {
              navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
              }).then(stream => {
                if (node) {
                  node.srcObject = stream;
                  node.play();
                }
              }).catch(err => console.error("Debug: getUserMedia failed", err));
            }
          }}
          autoPlay
          playsInline
          muted
          className="w-full h-full rounded-lg overflow-hidden shadow-lg"
          style={{ transform: showLandmarks ? 'scaleX(-1)' : 'scaleX(1)' }}
          aria-label="Raw camera feed for debugging"
        />

        {/* 
          COMMENT OUT THE NORMAL COMPONENTS TO ISOLATE THE VIDEO FEED.
        */}
        {/* <CameraFeed
          onFrame={processFrame}
          isActive={isActive && isInitialized}
          className="w-full rounded-lg overflow-hidden shadow-lg"
        /> */}
        
        {/* 
          COMMENT OUT THE LANDMARKS VISUALIZER TO REDUCE CLUTTER.
        */}
        {showLandmarks && currentGesture && (
          <HandLandmarks
            hands={[currentGesture.hand.landmarks as any]}
            width={dimensions.width}
            height={dimensions.height}
            canvasRef={canvasRef}
          />
        )}
      </Box>
      
      <Box className="mt-4 w-full flex flex-col items-center">
        <Typography variant="body2" color="textSecondary" className="mb-2">
          Current Gesture: {currentGesture?.type || 'none'} (Confidence: {currentGesture?.confidence.toFixed(2) || '0.00'})
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={showLandmarks}
              onChange={(e) => setShowLandmarks(e.target.checked)}
              color="primary"
            />
          }
          label="Show Hand Landmarks"
        />
        
        {error && (
          <Typography variant="body2" color="error" className="mt-2">
            Error: {error}
          </Typography>
        )}
        
        {!isInitialized && (
          <Box className="mt-4 flex flex-col items-center">
            <Typography variant="body2" color="textSecondary">
              Initializing gesture detection...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GestureDetector;