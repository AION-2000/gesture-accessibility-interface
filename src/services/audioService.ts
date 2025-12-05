// A centralized service for managing audio feedback

interface AudioFiles {
  [key: string]: HTMLAudioElement;
}

class AudioService {
  private audioFiles: AudioFiles = {};
  private isAudioEnabled: boolean = true;
  private masterVolume: number = 0.5;

  /**
   * Preloads audio files to ensure they play instantly when needed.
   * @param {string[]} audioUrls - An array of URLs to audio files.
   */
  public async loadAudioFiles(audioUrls: string[]): Promise<void> {
    const loadPromises = audioUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(url);
        
        audio.addEventListener('canplaythrough', () => {
          // Extract a key from the URL, e.g., '/audio/fist.mp3' -> 'fist'
          const key = url.split('/').pop()?.split('.')[0] || url;
          this.audioFiles[key] = audio;
          resolve();
        }, { once: true });

        audio.addEventListener('error', () => {
          console.error(`Failed to load audio file: ${url}`);
          // Resolve even on error to not block the entire app
          resolve();
        }, { once: true });
      });
    });

    await Promise.all(loadPromises);
    console.log('Audio files preloaded:', Object.keys(this.audioFiles));
  }

  /**
   * Plays a sound by its key.
   * @param {string} key - The key of the audio file to play.
   * @param {number} volume - Optional volume override (0.0 to 1.0).
   */
  public playSound(key: string, volume?: number): void {
    if (!this.isAudioEnabled) return;

    const audio = this.audioFiles[key];
    if (!audio) {
      console.warn(`Audio key not found: ${key}`);
      return;
    }

    // Clone the audio to allow overlapping sounds
    const sound = audio.cloneNode() as HTMLAudioElement;
    sound.volume = volume !== undefined ? volume : this.masterVolume;
    
    sound.play().catch(error => {
      console.error(`Error playing sound "${key}":`, error);
    });
  }

  /**
   * Sets the master volume for all sounds.
   * @param {number} volume - The volume level (0.0 to 1.0).
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Gets the current master volume.
   * @returns {number} The current volume level.
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Enables or disables all audio playback.
   * @param {boolean} enabled - Whether audio should be enabled.
   */
  public setAudioEnabled(enabled: boolean): void {
    this.isAudioEnabled = enabled;
  }

  /**
   * Checks if audio is currently enabled.
   * @returns {boolean} True if audio is enabled.
   */
  public isAudioEnabledStatus(): boolean {
    return this.isAudioEnabled;
  }
}

// Create and export a singleton instance of the AudioService
export default new AudioService();