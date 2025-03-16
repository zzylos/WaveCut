/**
 * Converts an AudioBuffer to a WAV Blob
 * @param audioBuffer The AudioBuffer to convert
 * @returns A Blob containing the WAV data
 */
export const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const length = audioBuffer.length * numChannels * 2 // 2 bytes per sample (16-bit)
  const buffer = new ArrayBuffer(44 + length) // 44 bytes for WAV header
  const view = new DataView(buffer)
  
  // Write WAV header
  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + length, true)
  writeString(view, 8, 'WAVE')
  
  // fmt sub-chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true) // byte rate
  view.setUint16(32, numChannels * 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  
  // data sub-chunk
  writeString(view, 36, 'data')
  view.setUint32(40, length, true)
  
  // Write audio data
  let offset = 44
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i]
      // Convert float to 16-bit PCM
      const value = Math.max(-1, Math.min(1, sample)) * 0x7FFF
      view.setInt16(offset, value, true)
      offset += 2
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' })
}

/**
 * Writes a string to a DataView at a specified offset
 * @param view The DataView to write to
 * @param offset The offset to write at
 * @param string The string to write
 */
export const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

/**
 * Converts an AudioBuffer to a base64 string
 * @param audioBuffer The AudioBuffer to convert
 * @returns A Promise that resolves to a base64 string
 */
export const audioBufferToBase64 = async (audioBuffer: AudioBuffer): Promise<string> => {
  const wav = audioBufferToWav(audioBuffer)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result) {
        // Extract base64 data from the data URL
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
    }
    reader.readAsDataURL(wav)
  })
}

/**
 * Converts a base64 string to an AudioBuffer
 * @param base64 The base64 string to convert
 * @param audioContext The AudioContext to use for decoding
 * @returns A Promise that resolves to an AudioBuffer
 */
export const base64ToAudioBuffer = async (base64: string, audioContext: AudioContext): Promise<AudioBuffer> => {
  // Convert base64 to blob
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: 'audio/wav' })
  
  // Convert blob to array buffer
  const arrayBuffer = await blob.arrayBuffer()
  
  // Decode array buffer to audio buffer
  return audioContext.decodeAudioData(arrayBuffer)
}

/**
 * Formats a time value in seconds to MM:SS.ms format
 * @param seconds The time in seconds
 * @returns A formatted time string
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

/**
 * Formats a time value in seconds to MM:SS format (without milliseconds)
 * @param seconds The time in seconds
 * @returns A formatted time string
 */
export const formatTimeSimple = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculates audio levels (peak) for visualization
 * @param audioBuffer The AudioBuffer to analyze
 * @param numSegments Number of segments to divide the audio into
 * @returns An array of peak values (0-1) for each segment
 */
export const calculateAudioLevels = (audioBuffer: AudioBuffer, numSegments: number): number[] => {
  const levels: number[] = []
  const samplesPerSegment = Math.floor(audioBuffer.length / numSegments)
  
  for (let segment = 0; segment < numSegments; segment++) {
    const startSample = segment * samplesPerSegment
    const endSample = Math.min(startSample + samplesPerSegment, audioBuffer.length)
    
    let peakLevel = 0
    
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel)
      
      for (let i = startSample; i < endSample; i++) {
        const absValue = Math.abs(channelData[i])
        if (absValue > peakLevel) {
          peakLevel = absValue
        }
      }
    }
    
    levels.push(peakLevel)
  }
  
  return levels
}

/**
 * Detects silence in an audio buffer
 * @param audioBuffer The AudioBuffer to analyze
 * @param threshold The silence threshold (0-1)
 * @param minDuration Minimum silence duration in seconds
 * @returns An array of objects with start and end times of silence regions
 */
export const detectSilence = (
  audioBuffer: AudioBuffer, 
  threshold = 0.01, 
  minDuration = 0.5
): Array<{ start: number; end: number }> => {
  const silenceRegions: Array<{ start: number; end: number }> = []
  const minSamples = minDuration * audioBuffer.sampleRate
  
  let silenceStart: number | null = null
  let silenceCount = 0
  
  // Analyze each sample across all channels
  for (let i = 0; i < audioBuffer.length; i++) {
    let isSilent = true
    
    // Check all channels to see if this sample is silent
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const sample = Math.abs(audioBuffer.getChannelData(channel)[i])
      if (sample > threshold) {
        isSilent = false
        break
      }
    }
    
    if (isSilent) {
      // If this is the start of a silent region, mark the start time
      if (silenceStart === null) {
        silenceStart = i / audioBuffer.sampleRate
      }
      silenceCount++
    } else {
      // If this is the end of a silent region that's long enough, add it to the list
      if (silenceStart !== null && silenceCount >= minSamples) {
        silenceRegions.push({
          start: silenceStart,
          end: (i - 1) / audioBuffer.sampleRate
        })
      }
      
      // Reset the silence tracking
      silenceStart = null
      silenceCount = 0
    }
  }
  
  // Check if audio ends in silence
  if (silenceStart !== null && silenceCount >= minSamples) {
    silenceRegions.push({
      start: silenceStart,
      end: audioBuffer.length / audioBuffer.sampleRate
    })
  }
  
  return silenceRegions
}