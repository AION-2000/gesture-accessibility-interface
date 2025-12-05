import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { Camera, NoPhotography } from '@mui/icons-material'; // <-- CHANGE: Replaced CameraOff with NoPhotography

interface CameraPermissionsProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

const CameraPermissions: React.FC<CameraPermissionsProps> = ({
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('prompt');
  const [error, setError] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    setPermissionStatus('checking');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // We got permission, close the stream immediately
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      onPermissionGranted();
    } catch (err) {
      console.error('Camera permission error:', err);
      setPermissionStatus('denied');
      setError('Camera access was denied. Please allow camera access to use gesture controls.');
      onPermissionDenied();
    }
  };

  useEffect(() => {
    // Check if we already have permission
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'granted') {
          setPermissionStatus('granted');
          onPermissionGranted();
        } else if (result.state === 'denied') {
          setPermissionStatus('denied');
          setError('Camera access is denied. Please enable camera access in your browser settings.');
          onPermissionDenied();
        }
      } catch (err) {
        // Some browsers don't support permissions.query for camera
        console.log('Permission query not supported, will prompt on request');
      }
    };

    checkPermission();
  }, [onPermissionGranted, onPermissionDenied]);

  return (
    <Box className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg">
      {permissionStatus === 'checking' ? (
        <div className="flex flex-col items-center">
          <CircularProgress size={40} />
          <Typography variant="body1" className="mt-4">
            Checking camera permissions...
          </Typography>
        </div>
      ) : (
        <>
          <div className="mb-4">
            {permissionStatus === 'denied' ? <NoPhotography fontSize="large" color="error" /> : <Camera fontSize="large" />} {/* <-- CHANGE: Replaced CameraOff with NoPhotography */}
          </div>
          <Typography variant="h6" gutterBottom>
            Camera Access Required
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" className="mb-4">
            This application needs access to your camera to detect hand gestures for navigation.
          </Typography>
          {error && (
            <Alert severity="error" className="mb-4 w-full">
              {error}
            </Alert>
          )}
          {permissionStatus !== 'granted' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Camera />}
              onClick={requestCameraPermission}
              aria-label="Request camera permission"
            >
              Enable Camera
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default CameraPermissions;