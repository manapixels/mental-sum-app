/**
 * Audio Generator for Mental Sum App
 * Generates simple audio tones using Web Audio API as fallback sounds
 */

export interface ToneOptions {
  frequency: number; // Hz
  duration: number; // seconds
  volume: number; // 0-1
  type?: OscillatorType; // 'sine', 'square', 'sawtooth', 'triangle'
  fadeOut?: boolean; // Apply fade out to prevent clicks
}

class AudioGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeContext();
  }

  private initializeContext(): void {
    if (typeof window !== "undefined" && window.AudioContext) {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        console.warn("Could not create AudioContext:", error);
      }
    }
  }

  /**
   * Play a simple tone
   */
  async playTone(options: ToneOptions): Promise<void> {
    if (!this.audioContext) {
      console.warn("AudioContext not available");
      return;
    }

    try {
      // Resume context if suspended (common on mobile)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const {
        frequency,
        duration,
        volume,
        type = "sine",
        fadeOut = true,
      } = options;

      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillator
      oscillator.type = type;
      oscillator.frequency.value = frequency;

      // Configure gain (volume)
      gainNode.gain.value = volume;

      // Apply fade out to prevent clicks
      if (fadeOut) {
        const fadeStart = Math.max(0, duration - 0.1);
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(
          volume,
          this.audioContext.currentTime + fadeStart,
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          this.audioContext.currentTime + duration,
        );
      }

      // Start and stop
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn("Failed to play tone:", error);
    }
  }

  /**
   * Play a chord (multiple frequencies)
   */
  async playChord(
    frequencies: number[],
    duration: number,
    volume: number = 0.3,
  ): Promise<void> {
    const promises = frequencies.map((frequency) =>
      this.playTone({
        frequency,
        duration,
        volume: volume / frequencies.length, // Reduce volume to prevent clipping
        fadeOut: true,
      }),
    );

    await Promise.all(promises);
  }

  /**
   * Generate predefined sound effects
   */
  async playEffect(
    effectType: "success" | "error" | "warning" | "click" | "notification",
  ): Promise<void> {
    switch (effectType) {
      case "success":
        // Pleasant ascending chord
        await this.playChord([523.25, 659.25, 783.99], 0.4, 0.3); // C5, E5, G5
        break;

      case "error":
        // Lower, more subdued tone
        await this.playTone({
          frequency: 220,
          duration: 0.3,
          volume: 0.2,
          type: "triangle",
        });
        break;

      case "warning":
        // Quick double beep
        await this.playTone({
          frequency: 800,
          duration: 0.1,
          volume: 0.2,
        });
        setTimeout(() => {
          this.playTone({
            frequency: 800,
            duration: 0.1,
            volume: 0.2,
          });
        }, 150);
        break;

      case "click":
        // Very short, subtle click
        await this.playTone({
          frequency: 1000,
          duration: 0.05,
          volume: 0.1,
          type: "square",
          fadeOut: false,
        });
        break;

      case "notification":
        // Gentle notification sound
        await this.playTone({
          frequency: 440,
          duration: 0.2,
          volume: 0.25,
          type: "sine",
        });
        break;

      default:
        console.warn(`Unknown effect type: ${effectType}`);
    }
  }

  /**
   * Check if audio generation is supported
   */
  isSupported(): boolean {
    return this.audioContext !== null;
  }

  /**
   * Get the audio context state
   */
  getState(): AudioContextState | null {
    return this.audioContext?.state || null;
  }
}

// Create singleton instance
export const audioGenerator = new AudioGenerator();

// Export convenience functions
export const playTone = (options: ToneOptions) =>
  audioGenerator.playTone(options);
export const playChord = (
  frequencies: number[],
  duration: number,
  volume?: number,
) => audioGenerator.playChord(frequencies, duration, volume);
export const playEffect = (
  effectType: Parameters<typeof audioGenerator.playEffect>[0],
) => audioGenerator.playEffect(effectType);
export const isAudioGenerationSupported = () => audioGenerator.isSupported();
export const getAudioContextState = () => audioGenerator.getState();
