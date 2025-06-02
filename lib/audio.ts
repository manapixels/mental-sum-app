/**
 * Audio System for Mental Sum App
 * Handles sound effects, volume control, and mobile optimization
 */

export interface AudioSettings {
  masterVolume: number; // 0-1
  soundEnabled: boolean;
  feedbackSoundsEnabled: boolean;
  interfaceSoundsEnabled: boolean;
  timerSoundsEnabled: boolean;
}

export interface SoundEffect {
  id: string;
  src: string;
  category: "feedback" | "interface" | "timer" | "achievement";
  volume?: number; // Override default volume (0-1)
  loop?: boolean;
}

export type SoundId =
  | "correct-answer"
  | "incorrect-answer"
  | "button-click"
  | "keypad-tap"
  | "session-start"
  | "timer-warning"
  | "timer-critical"
  | "achievement-unlock"
  | "settings-toggle";

class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundId, HTMLAudioElement> = new Map();
  private settings: AudioSettings = {
    masterVolume: 0.7,
    soundEnabled: true,
    feedbackSoundsEnabled: true,
    interfaceSoundsEnabled: true,
    timerSoundsEnabled: true,
  };
  private isInitialized = false;
  private isSupported = true;

  // Sound effect definitions
  private soundEffects: Record<SoundId, SoundEffect> = {
    "correct-answer": {
      id: "correct-answer",
      src: "/audio/correct.mp3",
      category: "feedback",
      volume: 0.8,
    },
    "incorrect-answer": {
      id: "incorrect-answer",
      src: "/audio/incorrect.mp3",
      category: "feedback",
      volume: 0.6,
    },
    "button-click": {
      id: "button-click",
      src: "/audio/click.mp3",
      category: "interface",
      volume: 0.4,
    },
    "keypad-tap": {
      id: "keypad-tap",
      src: "/audio/tap.mp3",
      category: "interface",
      volume: 0.3,
    },
    "session-start": {
      id: "session-start",
      src: "/audio/start.mp3",
      category: "interface",
      volume: 0.7,
    },
    "timer-warning": {
      id: "timer-warning",
      src: "/audio/warning.mp3",
      category: "timer",
      volume: 0.6,
    },
    "timer-critical": {
      id: "timer-critical",
      src: "/audio/critical.mp3",
      category: "timer",
      volume: 0.7,
    },
    "achievement-unlock": {
      id: "achievement-unlock",
      src: "/audio/achievement.mp3",
      category: "achievement",
      volume: 0.8,
    },
    "settings-toggle": {
      id: "settings-toggle",
      src: "/audio/click.mp3", // Reuse click sound for now
      category: "interface",
      volume: 0.3,
    },
  };

  constructor() {
    this.loadSettings();
    this.checkAudioSupport();
  }

  /**
   * Initialize the audio system (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.isSupported) return;

    try {
      // Don't create AudioContext immediately - wait until first sound play
      // This avoids the "AudioContext was not allowed to start" warning

      // Preload actual audio files (these don't require AudioContext)
      await this.preloadSounds();

      this.isInitialized = true;
      console.log(
        "Audio system initialized successfully (using real audio files)",
      );
    } catch (error) {
      console.warn("Failed to initialize audio system:", error);
      this.isSupported = false;
    }
  }

  /**
   * Create and resume AudioContext when needed (after user gesture)
   */
  private async ensureAudioContext(): Promise<void> {
    if (
      !this.audioContext &&
      typeof window !== "undefined" &&
      window.AudioContext
    ) {
      try {
        this.audioContext = new AudioContext();

        // If AudioContext is suspended, try to resume it
        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }

        // Check for silent mode on mobile devices
        this.checkSilentMode();

        console.debug("AudioContext created and resumed");
      } catch (error) {
        console.warn("Failed to create or resume AudioContext:", error);
      }
    } else if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
        console.debug("AudioContext resumed");
      } catch (error) {
        console.debug("Failed to resume AudioContext:", error);
      }
    }
  }

  /**
   * Check if device is in silent mode (mobile devices)
   */
  private checkSilentMode(): void {
    if (!this.audioContext || typeof window === "undefined") return;

    try {
      // Method 1: Check AudioContext state
      if (this.audioContext.state === "suspended") {
        console.info("Audio context suspended - device may be in silent mode");
        return; // Don't create test oscillator if suspended
      }

      // Method 2: Create a very short, silent audio test
      // This is a non-intrusive way to detect silent mode on iOS
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set volume to nearly silent to avoid any audible sound
      gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);

      // Very short duration test
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.01);

      // On iOS, if the device is in silent mode, this won't play
      // We can't directly detect this, but it respects the silent mode
    } catch (error) {
      console.debug("Silent mode detection not available:", error);
    }
  }

  /**
   * Check if we should respect device silent mode
   */
  private shouldRespectSilentMode(): boolean {
    if (!this.audioContext) return false;

    // If AudioContext is suspended, likely in silent mode
    return this.audioContext.state === "suspended";
  }

  /**
   * Preload all sound effects for instant playback
   */
  private async preloadSounds(): Promise<void> {
    const loadPromises = Object.values(this.soundEffects).map((effect) =>
      this.loadSound(effect),
    );

    try {
      await Promise.all(loadPromises);
      console.log("All sound effects preloaded");
    } catch (error) {
      console.warn("Some sound effects failed to load:", error);
    }
  }

  /**
   * Load a single sound effect
   */
  private loadSound(effect: SoundEffect): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(effect.src);

      audio.preload = "auto";
      audio.volume = this.calculateVolume(effect);

      audio.addEventListener("loadeddata", () => {
        this.sounds.set(effect.id as SoundId, audio);
        resolve();
      });

      audio.addEventListener("error", (e) => {
        console.warn(`Failed to load sound: ${effect.src}`, e);
        resolve(); // Don't reject to avoid breaking the entire preload
      });

      // Set a timeout to avoid hanging
      setTimeout(() => {
        if (!this.sounds.has(effect.id as SoundId)) {
          console.warn(`Sound load timeout: ${effect.src}`);
          resolve();
        }
      }, 5000);
    });
  }

  /**
   * Play a sound effect
   */
  async play(soundId: SoundId): Promise<void> {
    if (!this.shouldPlaySound(soundId)) return;

    // Ensure AudioContext is created and resumed (user gesture requirement)
    await this.ensureAudioContext();

    // Respect device silent mode
    if (this.shouldRespectSilentMode()) {
      console.debug(
        `Skipping sound ${soundId} - device appears to be in silent mode`,
      );
      return;
    }

    const audio = this.sounds.get(soundId);
    if (!audio) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }

    try {
      // Reset the audio to the beginning
      audio.currentTime = 0;

      // Update volume in case settings changed
      const effect = this.soundEffects[soundId];
      audio.volume = this.calculateVolume(effect);

      await audio.play();
    } catch (error) {
      // Ignore play failures (common on mobile without user interaction)
      console.debug(`Failed to play sound ${soundId}:`, error);
    }
  }

  /**
   * Stop a currently playing sound
   */
  stop(soundId: SoundId): void {
    const audio = this.sounds.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    this.sounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.updateAllVolumes();
  }

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Check if audio is supported and enabled
   */
  isAudioSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if audio system is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.isSupported;
  }

  /**
   * Determine if a sound should play based on settings
   */
  private shouldPlaySound(soundId: SoundId): boolean {
    if (!this.settings.soundEnabled || !this.isSupported) return false;

    const effect = this.soundEffects[soundId];
    switch (effect.category) {
      case "feedback":
        return this.settings.feedbackSoundsEnabled;
      case "interface":
        return this.settings.interfaceSoundsEnabled;
      case "timer":
        return this.settings.timerSoundsEnabled;
      case "achievement":
        return this.settings.feedbackSoundsEnabled; // Group with feedback
      default:
        return true;
    }
  }

  /**
   * Calculate the final volume for a sound effect
   */
  private calculateVolume(effect: SoundEffect): number {
    const baseVolume = effect.volume ?? 1.0;
    return baseVolume * this.settings.masterVolume;
  }

  /**
   * Update volumes for all loaded sounds
   */
  private updateAllVolumes(): void {
    this.sounds.forEach((audio, soundId) => {
      const effect = this.soundEffects[soundId];
      audio.volume = this.calculateVolume(effect);
    });
  }

  /**
   * Check if audio is supported in this browser/device
   */
  private checkAudioSupport(): void {
    if (typeof window === "undefined") {
      this.isSupported = false;
      return;
    }

    try {
      const audio = new Audio();
      this.isSupported = !!(
        audio.canPlayType && audio.canPlayType("audio/mpeg")
      );
    } catch {
      this.isSupported = false;
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("mental-sum-audio-settings");
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn("Failed to load audio settings:", error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "mental-sum-audio-settings",
        JSON.stringify(this.settings),
      );
    } catch (error) {
      console.warn("Failed to save audio settings:", error);
    }
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Export convenience functions
export const playSound = (soundId: SoundId) => audioManager.play(soundId);
export const stopSound = (soundId: SoundId) => audioManager.stop(soundId);
export const stopAllSounds = () => audioManager.stopAll();
export const initializeAudio = () => audioManager.initialize();
export const getAudioSettings = () => audioManager.getSettings();
export const updateAudioSettings = (settings: Partial<AudioSettings>) =>
  audioManager.updateSettings(settings);
export const isAudioReady = () => audioManager.isReady();
export const isAudioSupported = () => audioManager.isAudioSupported();
