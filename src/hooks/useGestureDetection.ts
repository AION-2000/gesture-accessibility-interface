import { useState, useEffect, useCallback, useRef } from 'react';
import { Gesture } from '../types/gesture'; // <-- FIX: Removed unused 'GestureType' import
import gestureService from '../services/gestureService';

interface UseGestureDetectionOptions {
  onGestureDetected?: (gesture: Gesture) => void;
  minConfidence?: number;
  debounceMs?: number;
}

export const useGestureDetection = (options: UseGestureDetectionOptions = {}) => {
  const { onGestureDetected, minConfidence = 0.7, debounceMs = 100 } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<Gesture | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const lastProcessTime = useRef<number>(0);

  // Initialize the gesture service
  useEffect(() => {
    const initialize = async () => {
      try {
        await gestureService.initialize({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize gesture detection:', err);
        setError('Failed to initialize gesture detection');
      }
    };

    initialize();

    return () => {
      gestureService.cleanup();
    };
  }, []);

  // Process image data and detect gestures
  const processFrame = useCallback(async (imageData: ImageData) => {
    if (!isInitialized || !isDetecting) return;

    // Debounce processing to improve performance
    const now = Date.now();
    if (now - lastProcessTime.current < debounceMs) return;
    lastProcessTime.current = now;

    try {
      // The service now handles everything and returns a final Gesture object
      const gesture = await gestureService.detectGesture(imageData);
      
      // Update current gesture if confidence is above threshold
      if (gesture.confidence >= minConfidence) {
        setCurrentGesture(gesture);
        
        // Call the callback if provided
        if (onGestureDetected) {
          onGestureDetected(gesture);
        }
      } else {
        setCurrentGesture(null);
      }
    } catch (err) {
      console.error('Error processing frame:', err);
      setError('Error processing frame');
    }
  }, [isInitialized, isDetecting, minConfidence, onGestureDetected, debounceMs]);

  // Start gesture detection
  const startDetection = useCallback(() => {
    if (!isInitialized) {
      setError('Gesture service not initialized');
      return;
    }
    
    setIsDetecting(true);
    setError(null);
  }, [isInitialized]);

  // Stop gesture detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
  }, []);

  return {
    isInitialized,
    isDetecting,
    currentGesture,
    error,
    processFrame,
    startDetection,
    stopDetection,
  };
};

export default useGestureDetection;