// Performance monitoring utilities

export interface PerformanceMetrics {
  fps: number;
  processingTime: number;
  memoryUsage?: number;
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private processingTime = 0;
  private memoryUsage = 0;

  startFrame(): void {
    this.lastTime = performance.now();
  }

  endFrame(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.processingTime = delta;
    
    this.frameCount++;
    
    // Update FPS every second
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(1000 / delta);
    }
    
    // Update memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryUsage = memory.usedJSHeapSize / 1048576; // Convert to MB
    }
  }

  getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      processingTime: this.processingTime,
      memoryUsage: this.memoryUsage,
    };
  }

  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.processingTime = 0;
    this.memoryUsage = 0;
  }
}

export default new PerformanceMonitor();