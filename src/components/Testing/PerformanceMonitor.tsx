import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import performanceMonitor, { PerformanceMetrics } from '../../utils/performance';

const PerformanceMonitorComponent: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    processingTime: 0,
    memoryUsage: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+P to toggle performance monitor
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Box className="fixed bottom-4 right-4">
        <Typography variant="caption" color="textSecondary">
          Press Ctrl+Shift+P for performance monitor
        </Typography>
      </Box>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-64 z-50">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Monitor
        </Typography>
        <Typography variant="body2">
          FPS: {metrics.fps}
        </Typography>
        <Typography variant="body2">
          Processing Time: {metrics.processingTime.toFixed(2)}ms
        </Typography>
        {metrics.memoryUsage !== undefined && (
          <Typography variant="body2">
            Memory Usage: {metrics.memoryUsage.toFixed(2)}MB
          </Typography>
        )}
        <Typography variant="caption" display="block" className="mt-2">
          Press Ctrl+Shift+P to hide
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitorComponent;