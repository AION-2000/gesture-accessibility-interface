// Utility functions for optimization and performance

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit how often a function can be called
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if the device is low-end based on hardware concurrency and memory
 */
export function isLowEndDevice(): boolean {
  // Check hardware concurrency (number of CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check device memory if available
  const memory = (navigator as any).deviceMemory || 4;
  
  // Consider device low-end if it has less than 4 cores or less than 4GB memory
  return cores < 4 || memory < 4;
}

/**
 * Get optimized settings based on device capabilities
 */
export function getOptimizedSettings() {
  const isLowEnd = isLowEndDevice();
  
  return {
    // Lower resolution for low-end devices
    videoWidth: isLowEnd ? 320 : 640,
    videoHeight: isLowEnd ? 240 : 480,
    
    // Lower model complexity for low-end devices
    modelComplexity: isLowEnd ? 0 : 1,
    
    // Reduce processing frequency for low-end devices
    processingInterval: isLowEnd ? 200 : 100,
    
    // Lower confidence threshold for low-end devices
    confidenceThreshold: isLowEnd ? 0.5 : 0.7,
  };
}

/**
 * Check if the browser supports required features
 */
export function checkBrowserSupport() {
  const features = {
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    webGL: !!document.createElement('canvas').getContext('webgl'),
    webWorkers: typeof Worker !== 'undefined',
    requestAnimationFrame: !!window.requestAnimationFrame,
  };
  
  return {
    ...features,
    fullySupported: Object.values(features).every(Boolean),
  };
}