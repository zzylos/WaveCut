# WaveCut

A browser-based waveform audio editor with a clean, minimalist interface inspired by Audacity but significantly simplified.

![WaveCut Screenshot](https://via.placeholder.com/800x450.png?text=WaveCut+Audio+Editor)

## Features

- Central waveform display with intuitive zoom and scroll functionality
- Basic editing tools: cut, copy, paste, trim, and fade in/out
- Essential effects: amplify, normalize, and EQ with visual feedback
- Simple recording capability with microphone input
- Support for common audio formats (WAV, MP3, FLAC)
- Clear, uncluttered UI with high contrast waveform visualization
- Responsive design that works well on both desktop and tablet
- Streamlined toolbar with only the most essential functions visible
- Project saving and export with various quality settings

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/zzylos/wavecut.git
   cd wavecut
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```
npm run build
```

This will create a production-ready build in the `dist` folder that you can deploy to any static hosting service.

## Technologies

- React for UI components
- WaveSurfer.js for waveform visualization and audio processing
- Tone.js for advanced audio effects
- TypeScript for type safety
- Styled-components for styling

## Usage Guide

For detailed usage instructions, see the [Documentation](./DOCUMENTATION.md).

Quick tips:
- Use the toolbar buttons for common operations
- Click and drag on the waveform to create selections
- Use the zoom slider to adjust the waveform zoom level
- Record audio using the record button (red circle)
- Save your project to continue editing later
- Export your audio in various formats when finished

## Project Structure

```
src/
  ├── components/       # UI components 
  ├── context/          # React context for audio state
  ├── utils/            # Utility functions
  └── styles/           # Global styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Audacity and other waveform editors
- Uses WaveSurfer.js for waveform visualization
- Built with React and modern web technologies
