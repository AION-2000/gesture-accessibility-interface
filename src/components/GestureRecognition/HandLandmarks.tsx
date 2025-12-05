import React from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS, NormalizedLandmark } from '@mediapipe/hands'; // <-- CHANGE: Import NormalizedLandmark
import { Box } from '@mui/material';

interface HandLandmarksProps {
  hands: NormalizedLandmark[][]; // <-- CHANGE: Use the correct MediaPipe type
  width: number;
  height: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const HandLandmarks: React.FC<HandLandmarksProps> = ({ hands, width, height, canvasRef }) => {
  React.useEffect(() => {
    if (!canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);

    // Draw hand landmarks and connections for each detected hand
    for (const landmarks of hands) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2,
      });

      drawLandmarks(canvasCtx, landmarks, {
        color: '#FF0000',
        lineWidth: 1,
        radius: 3,
      });
    }

    canvasCtx.restore();
  }, [hands, width, height, canvasRef]);

  return (
    <Box className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
        aria-label="Hand landmarks visualization"
      />
    </Box>
  );
};

export default HandLandmarks;