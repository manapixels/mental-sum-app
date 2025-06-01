# Audio Files Setup Guide

## Current Status

The app uses generated Web Audio API sounds as placeholders.

## To Add Real Audio Files:

### 1. Create the audio files and place them in `public/audio/`:

- `correct.mp3` - Pleasant success sound
- `incorrect.mp3` - Gentle error sound
- `timeout.mp3` - Warning sound
- `click.mp3` - Button click
- `tap.mp3` - Keypad tap
- `start.mp3` - Session start
- `warning.mp3` - Timer warning
- `critical.mp3` - Critical timer
- `achievement.mp3` - Achievement unlock
- `transition.mp3` - Page transition
- `perfect.mp3` - Perfect session

### 2. Enable file loading in `lib/audio.ts`:

- Uncomment the `preloadSounds()` call in `initialize()`
- Replace the `play()` method with the commented file-based version

### 3. Recommended Audio Specs:

- Format: MP3 (best browser support)
- Sample Rate: 44.1kHz
- Bit Rate: 128kbps (good quality, small size)
- Duration: 0.1-0.5 seconds for feedback sounds
- Volume: Normalized to prevent clipping

### 4. Free Audio Sources:

- **Freesound.org**: Large library with CC licenses
- **Zapsplat**: Professional sounds (free tier available)
- **BBC Sound Effects**: Public domain sounds
- **Adobe Audition**: Comes with free sound library

### 5. Testing:

After adding files, test with:

```javascript
// Check if files load properly
console.log("Audio ready:", isAudioReady());

// Test individual sounds
playSound("correct-answer");
```
