import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { FlipCameraAndroid } from '@mui/icons-material';

interface CameraFeedProps {
  onFrame: (imageData: ImageData) => void;
  isActive: boolean;
  className?: string;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onFrame, isActive, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // FINAL FIX: Capture the ref's current value at the start of the effect
    const videoElement = videoRef.current;

    if (!isActive) {
      // Stop the camera when not active
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
      setIsCameraReady(false);
      return;
    }

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        });

        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            setIsCameraReady(true);
          };
        }
      } catch (error) {
        console.error('Error setting up camera:', error);
      }
    };

    setupCamera();

    return () => {
      // Use the captured local variable in the cleanup function
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!isCameraReady || !isActive) return;

    const processFrame = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw the video frame to canvas
          context.save();
          if (isMirrored) {
            context.scale(-1, 1);
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          context.restore();

          // Get image data for gesture detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          onFrame(imageData);
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraReady, isActive, isMirrored, onFrame]);

  const toggleMirror = () => {
    setIsMirrored(!isMirrored);
  };

  return (
    <Box className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        aria-label="Camera feed for gesture detection"
      />
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover rounded-lg ${isMirrored ? 'transform scaleX-[-1]' : ''}`}
        aria-label="Processed camera feed with gesture detection"
      />
      <Tooltip title="Toggle camera mirror">
        <IconButton
          className="absolute bottom-2 right-2 bg-white bg-opacity-70 hover:bg-opacity-90"
          onClick={toggleMirror}
          aria-label="Toggle camera mirror"
        >
          <FlipCameraAndroid />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CameraFeed;