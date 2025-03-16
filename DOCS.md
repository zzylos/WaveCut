# WaveCut User Guide

WaveCut is a minimalist browser-based waveform audio editor designed for simplicity and ease of use, while still providing essential audio editing functionality.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Features

### File Operations

- **Open**: Load audio files (WAV, MP3, FLAC, and other browser-supported formats)
- **Project**: Open saved WaveCut project files (.wavecut)
- **Save**: Save your current project for later editing
- **Export**: Export your audio in different formats (WAV, MP3, FLAC) with quality options

### Playback Controls

- **Play/Pause**: Start or pause audio playback
- **Stop**: Stop playback and return to the beginning
- **Record**: Record audio from your microphone

### Editing Tools

- **Cut**: Remove the selected portion of audio and copy it to clipboard
- **Copy**: Copy the selected portion to clipboard without removing it
- **Paste**: Insert clipboard audio at the current playback position
- **Trim**: Keep only the selected portion and remove everything else

### Effects

- **Fade In**: Apply a gradual increase in volume from silence
- **Fade Out**: Apply a gradual decrease in volume to silence
- **Amplify**: Increase or decrease the volume of the audio
- **Normalize**: Maximize the volume without clipping
- **Equalizer**: Adjust bass, mid, and treble frequencies

### Waveform Display

- **Selection**: Click and drag on the waveform to select a portion of audio
- **Zoom**: Use the zoom slider to zoom in/out of the waveform
- **Volume**: Adjust playback volume with the volume slider

## Keyboard Shortcuts

- **Space**: Play/Pause
- **Escape**: Stop playback
- **Ctrl+Z**: Undo (coming soon)
- **Ctrl+Shift+Z**: Redo (coming soon)
- **Ctrl+X**: Cut selection
- **Ctrl+C**: Copy selection
- **Ctrl+V**: Paste at current position

## Tips for Better Results

1. **Zoom in for precise editing**: Use the zoom slider to get a closer view when making fine adjustments.

2. **Use selections efficiently**: The editor is selection-based, so many operations depend on having a proper selection made.

3. **Save your project regularly**: Use the Save feature to preserve your work in progress, especially before applying destructive effects.

4. **Choose the right export format**:
   - WAV: Uncompressed, highest quality, larger file size
   - FLAC: Lossless compression, high quality, medium file size
   - MP3: Lossy compression, smaller file size, variable quality

5. **Use effects in sequence**: For the best results, consider the order of effects. For example, normalize after amplifying, or apply EQ before normalization.

## Troubleshooting

- **No audio playback**: Check your system's audio settings and make sure your browser has permission to play audio.
- **Cannot record**: Make sure your browser has microphone permissions enabled.
- **Audio glitches**: Try refreshing the page; browser audio processing can sometimes become unstable after long sessions.

## Future Features

- Multi-track editing
- More audio effects (reverb, delay, compression)
- Spectrum analysis
- Audio restoration tools
- Plugin support