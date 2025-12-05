import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebcamOptions {
  videoConstraints?: MediaStreamConstraints['video'];
}

/**
 * Custom hook for managing webcam access and stream.
 */
export const useWebcam = (options: UseWebcamOptions = {}) => {
  const { videoConstraints = { facingMode: 'user' } } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startWebcam = useCallback(async () => {
    // Prevent multiple streams from being started
    if (streamRef.current) {
      return streamRef.current;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false, // We only need video
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsLoading(false);
      return mediaStream;
    } catch (err: any) {
      console.error('Error accessing webcam:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access.'
          : 'Failed to access camera. Please check your device and browser.'
      );
      setIsLoading(false);
      return null;
    }
  }, [videoConstraints]);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // Ensure the webcam is stopped when the component using this hook unmounts
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    stream,
    error,
    isLoading,
    startWebcam,
    stopWebcam,
  };
};

export default useWebcam; // This export makes the file a module