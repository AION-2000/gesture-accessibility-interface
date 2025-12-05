import { Hands, Results, NormalizedLandmark } from '@mediapipe/hands';
import { Hand, HandLandmark, GestureDetectorOptions, Gesture, GestureType } from '../types/gesture';

class GestureService {
  private hands: Hands | null = null;
  private lastGesture: Gesture | null = null;
  private gestureHistory: GestureType[] = [];
  private historySize = 10;
  private lastSwipeTime = 0;
  private swipeCooldown = 1000; // 1 second cooldown between swipes

  // Create canvas and context once to avoid performance issues and memory leaks.
  private canvas: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  // A queue to manage promises and resolve them in the correct order.
  private resultQueue: Array<(results: Results) => void> = [];

  /**
   * Initialize MediaPipe Hands and the reusable canvas.
   */
  async initialize(options: GestureDetectorOptions = {}): Promise<void> {
    const {
      maxNumHands = 1,
      modelComplexity = 1,
      minDetectionConfidence = 0.5,
      minTrackingConfidence = 0.5,
    } = options;

    // Create canvas elements once during initialization.
    this.canvas = document.createElement('canvas');
    this.canvasCtx = this.canvas.getContext('2d');
    if (!this.canvasCtx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands,
      modelComplexity,
      minDetectionConfidence,
      minTrackingConfidence,
    });

    // Set a single, permanent onResults handler that manages the queue.
    this.hands.onResults(this.handleResults);

    console.log('MediaPipe Hands initialized');
  }

  /**
   * The single, permanent handler for MediaPipe results.
   * It processes the queue FIFO, ensuring each call gets its correct result.
   */
  private handleResults = (results: Results) => {
    // Get the first resolver from the queue.
    const resolve = this.resultQueue.shift();
    if (resolve) {
      resolve(results);
    }
  };

  /**
   * Process a frame and detect a gesture.
   * This method now adds a resolver to the queue and waits for its turn.
   */
  async detectGesture(imageData: ImageData): Promise<Gesture> {
    if (!this.hands || !this.canvas || !this.canvasCtx) {
      throw new Error('GestureService not initialized');
    }

    // Set canvas dimensions from the image data.
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;

    // Draw the image data to the canvas.
    this.canvasCtx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      // Add the resolver function to the queue.
      this.resultQueue.push((results: Results) => {
        // Convert MediaPipe's NormalizedLandmark[][] to our custom Hand[].
        const hands: Hand[] = (results.multiHandLandmarks || []).map((landmarks: NormalizedLandmark[], index: number) => ({
          landmarks: landmarks.map(({ x, y, z }) => ({ x, y, z })),
          handedness: results.multiHandedness?.[index]?.label || `Unknown_${index}`,
        }));

        // Recognize the gesture from our custom Hand[] type.
        const gesture = this.recognizeGesture(hands);
        resolve(gesture);
      });

      // Assign the canvas to a local constant to satisfy TypeScript's type checker.
      const canvas = this.canvas;
      if (!canvas) {
        // This should theoretically never be reached due to the initial check,
        // but it fully satisfies the type checker.
        return;
      }

      // Send the image to MediaPipe. The handleResults method will pick it up.
      this.hands!.send({ image: canvas });
    });
  }

  /**
   * Recognize a gesture from our custom Hand landmarks.
   */
  private recognizeGesture(hands: Hand[]): Gesture {
    if (hands.length === 0) {
      return this.createEmptyGesture();
    }

    const hand = hands[0];
    const gestureType = this.detectGestureType(hand.landmarks);
    const confidence = this.calculateConfidence(hand.landmarks, gestureType);

    const gesture: Gesture = {
      type: gestureType,
      confidence,
      hand: hand,
      timestamp: Date.now(),
    };

    this.updateGestureHistory(gestureType);
    this.lastGesture = gesture;
    return gesture;
  }

  private createEmptyGesture(): Gesture {
    return {
      type: 'none',
      confidence: 0,
      hand: { landmarks: [], handedness: '' },
      timestamp: Date.now(),
    };
  }

  /**
   * Detect the type of gesture from hand landmarks using more robust logic.
   */
  private detectGestureType(landmarks: HandLandmark[]): GestureType {
    // --- DEBUGGING: Log the raw landmark data for analysis ---
    console.log('Analyzing Landmarks:', landmarks.map(l => ({ x: l.x.toFixed(3), y: l.y.toFixed(3), z: l.z.toFixed(3) })));

    // Define key landmarks for clarity.
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const wrist = landmarks[0];

    // --- ROBUST FINGER EXTENSION LOGIC ---
    // A finger is considered extended if its tip is further away from the wrist than its PIP joint.
    // This is more reliable than just checking tip.y < wrist.y.
    const isThumbExtended = thumbTip.y < thumbIP.y;
    const isIndexExtended = indexTip.y < indexPIP.y;
    const isMiddleExtended = middleTip.y < middlePIP.y;
    const isRingExtended = ringTip.y < ringPIP.y;
    const isPinkyExtended = pinkyTip.y < pinkyPIP.y;

    const extendedFingers = [
      isThumbExtended,
      isIndexExtended,
      isMiddleExtended,
      isRingExtended,
      isPinkyExtended,
    ].filter(Boolean).length;

    // --- DEBUGGING: Log the results of our finger extension logic ---
    console.log('Finger Extension Analysis:', {
      isThumbExtended,
      isIndexExtended,
      isMiddleExtended,
      isRingExtended,
      isPinkyExtended,
      extendedFingers,
    });

    // Detect specific gestures based on the robust analysis.
    if (extendedFingers === 0) return 'fist';
    if (extendedFingers === 5) return 'open_palm';
    if (extendedFingers === 1 && isIndexExtended) return 'pointing';

    // Pinch: thumb and index finger close together.
    const thumbIndexDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
    );
    if (thumbIndexDistance < 0.05) return 'pinch';

    // Swipes are complex and require history, simplified here.
    if (this.gestureHistory.length >= this.historySize / 2) {
      const now = Date.now();
      if (now - this.lastSwipeTime > this.swipeCooldown) {
        // A more robust implementation would track hand position over time.
        // For now, we'll just detect pointing as a potential swipe trigger.
        if (isIndexExtended) {
          // Placeholder for actual swipe detection logic.
          // if (handMovedLeft) return 'swipe_left';
          // if (handMovedRight) return 'swipe_right';
        }
      }
    }

    // --- DEBUGGING: Log the final decision ---
    console.log('Final Decision: Returning "none"');
    return 'none';
  }

  private calculateConfidence(landmarks: HandLandmark[], gestureType: GestureType): number {
    // This is a simplified confidence calculation.
    switch (gestureType) {
      case 'fist':
      case 'open_palm':
      case 'pointing':
        return 0.9;
      case 'pinch':
        return 0.8;
      default:
        return 0.5;
    }
  }

  private updateGestureHistory(gestureType: GestureType): void {
    this.gestureHistory.push(gestureType);
    if (this.gestureHistory.length > this.historySize) {
      this.gestureHistory.shift();
    }
  }

  getLastGesture(): Gesture | null {
    return this.lastGesture;
  }

  cleanup(): void {
    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }
    // Clean up canvas references.
    this.canvas = null;
    this.canvasCtx = null;
    // Clear the queue on cleanup.
    this.resultQueue = [];
  }
}

// Assign the instance to a variable before exporting it as a module default.
const gestureServiceInstance = new GestureService();

export default gestureServiceInstance;