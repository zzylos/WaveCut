/**
 * Applies a fade-in effect to an audio buffer
 * @param audioBuffer The AudioBuffer to modify
 * @param duration The duration of the fade in seconds
 */
export const applyFadeIn = (audioBuffer: AudioBuffer, duration: number): void => {
  const fadeInSamples = Math.floor(duration * audioBuffer.sampleRate)
  
  // Apply fade in to each channel
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const data = audioBuffer.getChannelData(channel)
    
    for (let i = 0; i < Math.min(fadeInSamples, data.length); i++) {
      // Linear fade
      const gain = i / fadeInSamples
      data[i] = data[i] * gain
    }
  }
}

/**
 * Applies a fade-out effect to an audio buffer
 * @param audioBuffer The AudioBuffer to modify
 * @param duration The duration of the fade in seconds
 */
export const applyFadeOut = (audioBuffer: AudioBuffer, duration: number): void => {
  const fadeOutSamples = Math.floor(duration * audioBuffer.sampleRate)
  
  // Apply fade out to each channel
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const data = audioBuffer.getChannelData(channel)
    
    for (let i = 0; i < Math.min(fadeOutSamples, data.length); i++) {
      // Linear fade
      const gain = 1 - (i / fadeOutSamples)
      data[data.length - 1 - i] = data[data.length - 1 - i] * gain
    }
  }
}

/**
 * Applies gain (amplification) to an audio buffer
 * @param audioBuffer The AudioBuffer to modify
 * @param gain The gain factor (1.0 = unchanged)
 */
export const applyGain = (audioBuffer: AudioBuffer, gain: number): void => {
  // Apply gain to each channel
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const data = audioBuffer.getChannelData(channel)
    
    for (let i = 0; i < data.length; i++) {
      // Apply gain with clipping prevention
      data[i] = Math.max(-1, Math.min(1, data[i] * gain))
    }
  }
}

/**
 * Normalizes an audio buffer (maximizes volume without clipping)
 * @param audioBuffer The AudioBuffer to modify
 * @returns The gain factor that was applied
 */
export const normalizeAudio = (audioBuffer: AudioBuffer): number => {
  // Find the maximum amplitude across all channels
  let maxAmplitude = 0
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const data = audioBuffer.getChannelData(channel)
    
    for (let i = 0; i < data.length; i++) {
      const absValue = Math.abs(data[i])
      if (absValue > maxAmplitude) {
        maxAmplitude = absValue
      }
    }
  }
  
  // If audio is already normalized, return
  if (maxAmplitude >= 0.99) return 1.0
  
  // Calculate the gain needed to normalize
  const gain = 1.0 / maxAmplitude
  
  // Apply the gain to each channel
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const data = audioBuffer.getChannelData(channel)
    
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i] * gain
    }
  }
  
  return gain
}

/**
 * Creates a new AudioBuffer with only the selected portion of the original buffer
 * @param audioBuffer The source AudioBuffer
 * @param startTime Start time in seconds
 * @param endTime End time in seconds
 * @returns A new AudioBuffer containing only the selected portion
 */
export const trimAudio = (
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number,
  audioContext: AudioContext
): AudioBuffer => {
  const startSample = Math.floor(startTime * audioBuffer.sampleRate)
  const endSample = Math.floor(endTime * audioBuffer.sampleRate)
  const sampleCount = endSample - startSample
  
  // Create a new buffer for the trimmed audio
  const trimmedBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    sampleCount,
    audioBuffer.sampleRate
  )
  
  // Copy the selected portion of each channel
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel)
    const trimmedData = trimmedBuffer.getChannelData(channel)
    
    for (let i = 0; i < sampleCount; i++) {
      trimmedData[i] = sourceData[startSample + i]
    }
  }
  
  return trimmedBuffer
}

/**
 * Reverses an audio buffer
 * @param audioBuffer The AudioBuffer to reverse
 */
export const reverseAudio = (audioBuffer: AudioBuffer): void => {
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const data = audioBuffer.getChannelData(channel)
    data.reverse()
  }
}

/**
 * Applies a simple low-pass filter to an audio buffer
 * @param audioBuffer The AudioBuffer to filter
 * @param cutoffFrequency The cutoff frequency in Hz
 * @param audioContext The AudioContext for processing
 * @returns A Promise that resolves to the filtered AudioBuffer
 */
export const applyLowPassFilter = async (
  audioBuffer: AudioBuffer,
  cutoffFrequency: number,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  // Create an offline audio context for rendering
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  )
  
  // Create source node
  const source = offlineContext.createBufferSource()
  source.buffer = audioBuffer
  
  // Create filter
  const filter = offlineContext.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoffFrequency
  filter.Q.value = 1
  
  // Connect nodes
  source.connect(filter)
  filter.connect(offlineContext.destination)
  
  // Start source and render
  source.start(0)
  const renderedBuffer = await offlineContext.startRendering()
  
  return renderedBuffer
}

/**
 * Applies a simple high-pass filter to an audio buffer
 * @param audioBuffer The AudioBuffer to filter
 * @param cutoffFrequency The cutoff frequency in Hz
 * @param audioContext The AudioContext for processing
 * @returns A Promise that resolves to the filtered AudioBuffer
 */
export const applyHighPassFilter = async (
  audioBuffer: AudioBuffer,
  cutoffFrequency: number,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  // Create an offline audio context for rendering
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  )
  
  // Create source node
  const source = offlineContext.createBufferSource()
  source.buffer = audioBuffer
  
  // Create filter
  const filter = offlineContext.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = cutoffFrequency
  filter.Q.value = 1
  
  // Connect nodes
  source.connect(filter)
  filter.connect(offlineContext.destination)
  
  // Start source and render
  source.start(0)
  const renderedBuffer = await offlineContext.startRendering()
  
  return renderedBuffer
}

/**
 * Applies a 3-band equalizer to an audio buffer
 * @param audioBuffer The AudioBuffer to equalize
 * @param bassGain Gain for bass frequencies (dB)
 * @param midGain Gain for mid frequencies (dB)
 * @param trebleGain Gain for treble frequencies (dB)
 * @param audioContext The AudioContext for processing
 * @returns A Promise that resolves to the equalized AudioBuffer
 */
export const applyEQ = async (
  audioBuffer: AudioBuffer,
  bassGain: number,
  midGain: number,
  trebleGain: number,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  // Create an offline audio context for rendering
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  )
  
  // Create source node
  const source = offlineContext.createBufferSource()
  source.buffer = audioBuffer
  
  // Create filter nodes
  const bassFilter = offlineContext.createBiquadFilter()
  bassFilter.type = 'lowshelf'
  bassFilter.frequency.value = 200
  bassFilter.gain.value = bassGain
  
  const midFilter = offlineContext.createBiquadFilter()
  midFilter.type = 'peaking'
  midFilter.frequency.value = 1000
  midFilter.Q.value = 1
  midFilter.gain.value = midGain
  
  const trebleFilter = offlineContext.createBiquadFilter()
  trebleFilter.type = 'highshelf'
  trebleFilter.frequency.value = 3000
  trebleFilter.gain.value = trebleGain
  
  // Connect the nodes in series
  source.connect(bassFilter)
  bassFilter.connect(midFilter)
  midFilter.connect(trebleFilter)
  trebleFilter.connect(offlineContext.destination)
  
  // Start source and render
  source.start(0)
  const renderedBuffer = await offlineContext.startRendering()
  
  return renderedBuffer
}