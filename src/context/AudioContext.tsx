import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline'

interface AudioContextType {
  wavesurfer: WaveSurfer | null
  isPlaying: boolean
  currentFile: File | null
  duration: number | null
  currentTime: number
  volume: number
  zoom: number
  selection: { start: number; end: number } | null
  loadFile: (file: File) => Promise<void>
  play: () => void
  pause: () => void
  stop: () => void
  setVolume: (volume: number) => void
  setZoom: (zoom: number) => void
  createSelection: (start: number, end: number) => void
  clearSelection: () => void
  cutSelection: () => void
  copySelection: () => void
  pasteSelection: (position: number) => void
  trimSelection: () => void
  fadeIn: (duration: number) => void
  fadeOut: (duration: number) => void
  amplify: (gain: number) => void
  normalize: () => void
  applyEQ: (bass: number, mid: number, treble: number) => void
  startRecording: () => Promise<void>
  stopRecording: () => void
  isRecording: boolean
  exportAudio: (format: string, quality: number) => Promise<Blob>
  saveProject: () => Promise<Blob>
  loadProject: (data: ArrayBuffer) => Promise<void>
}

const defaultContext: AudioContextType = {
  wavesurfer: null,
  isPlaying: false,
  currentFile: null,
  duration: null,
  currentTime: 0,
  volume: 1,
  zoom: 50,
  selection: null,
  loadFile: async () => {},
  play: () => {},
  pause: () => {},
  stop: () => {},
  setVolume: () => {},
  setZoom: () => {},
  createSelection: () => {},
  clearSelection: () => {},
  cutSelection: () => {},
  copySelection: () => {},
  pasteSelection: () => {},
  trimSelection: () => {},
  fadeIn: () => {},
  fadeOut: () => {},
  amplify: () => {},
  normalize: () => {},
  applyEQ: () => {},
  startRecording: async () => {},
  stopRecording: () => {},
  isRecording: false,
  exportAudio: async () => new Blob(),
  saveProject: async () => new Blob(),
  loadProject: async () => {}
}

const AudioContext = createContext<AudioContextType>(defaultContext)

export const useAudio = () => useContext(AudioContext)

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const regionsRef = useRef<RegionsPlugin | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const clipboardRef = useRef<{ buffer: AudioBuffer | null, start: number, end: number } | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [zoom, setZoomState] = useState(50)
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)
  const [isRecording, setIsRecording] = useState(false)

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return

    // Create audio context for processing
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

    const timelinePlugin = TimelinePlugin.create({
      container: '#timeline',
      primaryColor: 'var(--color-text-secondary)',
      secondaryColor: 'var(--color-text-secondary)',
      primaryFontColor: 'var(--color-text-secondary)',
      secondaryFontColor: 'var(--color-text-secondary)',
      timeInterval: 1,
      primaryLabelInterval: 10,
      secondaryLabelInterval: 5,
    })

    const regions = RegionsPlugin.create()

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'var(--color-waveform)',
      progressColor: 'var(--color-waveform-progress)',
      cursorColor: 'var(--color-accent)',
      cursorWidth: 2,
      height: 160,
      minPxPerSec: 50,
      plugins: [regions, timelinePlugin],
      normalize: true,
      splitChannels: false,
      autoCenter: true,
      hideScrollbar: false,
    })

    wavesurferRef.current = wavesurfer
    regionsRef.current = regions

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration())
      // Extract audio buffer for processing
      audioBufferRef.current = wavesurfer.getDecodedData()
    })

    wavesurfer.on('play', () => setIsPlaying(true))
    wavesurfer.on('pause', () => setIsPlaying(false))
    wavesurfer.on('timeupdate', (currentTime) => setCurrentTime(currentTime))

    // Handle selection regions
    regions.on('region-created', (region) => {
      // Remove any existing regions before adding a new one
      regions.getRegions().forEach(r => {
        if (r !== region) {
          r.remove()
        }
      })
      setSelection({ start: region.start, end: region.end })
    })

    regions.on('region-updated', (region) => {
      setSelection({ start: region.start, end: region.end })
    })

    return () => {
      wavesurfer.destroy()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Load audio file
  const loadFile = async (file: File) => {
    if (!wavesurferRef.current) return

    setCurrentFile(file)
    const arrayBuffer = await file.arrayBuffer()
    wavesurferRef.current.loadArrayBuffer(arrayBuffer)
  }

  // Playback controls
  const play = () => {
    wavesurferRef.current?.play()
  }

  const pause = () => {
    wavesurferRef.current?.pause()
  }

  const stop = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.pause()
      wavesurferRef.current.setTime(0)
    }
  }

  const setVolume = (value: number) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(value)
      setVolumeState(value)
    }
  }

  const setZoom = (value: number) => {
    if (wavesurferRef.current) {
      // Convert zoom percentage to pixels per second (from 20 to 500)
      const minPxPerSec = 20 + (value / 100) * 480
      wavesurferRef.current.zoom(minPxPerSec)
      setZoomState(value)
    }
  }

  // Selection management
  const createSelection = (start: number, end: number) => {
    if (!regionsRef.current) return

    // Clear existing regions
    regionsRef.current.getRegions().forEach(region => region.remove())

    // Create new region
    regionsRef.current.addRegion({
      start,
      end,
      color: 'var(--color-selection)',
      drag: true,
      resize: true,
    })

    setSelection({ start, end })
  }

  const clearSelection = () => {
    if (!regionsRef.current) return

    regionsRef.current.getRegions().forEach(region => region.remove())
    setSelection(null)
  }

  // Audio editing operations
  const cutSelection = () => {
    if (!selection || !audioBufferRef.current || !wavesurferRef.current || !audioContextRef.current) return

    // First copy the selection to clipboard
    const { start, end } = selection
    const sourceDuration = audioBufferRef.current.duration
    const selectionDuration = end - start
    
    // Create a buffer for the clipboard
    const clipboardBuffer = audioContextRef.current.createBuffer(
      audioBufferRef.current.numberOfChannels,
      audioBufferRef.current.sampleRate * selectionDuration,
      audioBufferRef.current.sampleRate
    )

    // Copy selection data to clipboard
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const sourceData = audioBufferRef.current.getChannelData(channel)
      const clipboardData = clipboardBuffer.getChannelData(channel)
      
      const startOffset = Math.floor(start * audioBufferRef.current.sampleRate)
      const endOffset = Math.floor(end * audioBufferRef.current.sampleRate)
      
      for (let i = 0; i < endOffset - startOffset; i++) {
        clipboardData[i] = sourceData[startOffset + i]
      }
    }
    
    clipboardRef.current = {
      buffer: clipboardBuffer,
      start,
      end
    }

    // Now create a new buffer without the selection
    const newBuffer = audioContextRef.current.createBuffer(
      audioBufferRef.current.numberOfChannels,
      audioBufferRef.current.sampleRate * (sourceDuration - selectionDuration),
      audioBufferRef.current.sampleRate
    )

    // Copy data before and after selection
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const sourceData = audioBufferRef.current.getChannelData(channel)
      const newData = newBuffer.getChannelData(channel)
      
      const startOffset = Math.floor(start * audioBufferRef.current.sampleRate)
      const endOffset = Math.floor(end * audioBufferRef.current.sampleRate)
      
      // Copy data before selection
      for (let i = 0; i < startOffset; i++) {
        newData[i] = sourceData[i]
      }
      
      // Copy data after selection
      for (let i = endOffset; i < audioBufferRef.current.length; i++) {
        newData[i - endOffset + startOffset] = sourceData[i]
      }
    }

    // Update the audio buffer
    audioBufferRef.current = newBuffer
    
    // Load the new buffer into wavesurfer
    const blob = audioBufferToWav(newBuffer)
    const url = URL.createObjectURL(blob)
    wavesurferRef.current.load(url)
    
    // Clear selection
    clearSelection()
  }

  const copySelection = () => {
    if (!selection || !audioBufferRef.current || !audioContextRef.current) return

    const { start, end } = selection
    const selectionDuration = end - start
    
    // Create a buffer for the clipboard
    const clipboardBuffer = audioContextRef.current.createBuffer(
      audioBufferRef.current.numberOfChannels,
      audioBufferRef.current.sampleRate * selectionDuration,
      audioBufferRef.current.sampleRate
    )

    // Copy selection data to clipboard
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const sourceData = audioBufferRef.current.getChannelData(channel)
      const clipboardData = clipboardBuffer.getChannelData(channel)
      
      const startOffset = Math.floor(start * audioBufferRef.current.sampleRate)
      const endOffset = Math.floor(end * audioBufferRef.current.sampleRate)
      
      for (let i = 0; i < endOffset - startOffset; i++) {
        clipboardData[i] = sourceData[startOffset + i]
      }
    }
    
    clipboardRef.current = {
      buffer: clipboardBuffer,
      start,
      end
    }
  }

  const pasteSelection = (position: number) => {
    if (!clipboardRef.current?.buffer || !audioBufferRef.current || !wavesurferRef.current || !audioContextRef.current) return

    const clipboardBuffer = clipboardRef.current.buffer
    const clipboardDuration = clipboardBuffer.duration
    const sourceDuration = audioBufferRef.current.duration
    
    // Create a new buffer with space for the pasted content
    const newBuffer = audioContextRef.current.createBuffer(
      audioBufferRef.current.numberOfChannels,
      audioBufferRef.current.sampleRate * (sourceDuration + clipboardDuration),
      audioBufferRef.current.sampleRate
    )

    // Paste data by copying before position, then clipboard data, then after position
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const sourceData = audioBufferRef.current.getChannelData(channel)
      const clipboardData = clipboardBuffer.getChannelData(channel)
      const newData = newBuffer.getChannelData(channel)
      
      const positionOffset = Math.floor(position * audioBufferRef.current.sampleRate)
      
      // Copy data before paste position
      for (let i = 0; i < positionOffset; i++) {
        newData[i] = sourceData[i]
      }
      
      // Copy clipboard data
      for (let i = 0; i < clipboardBuffer.length; i++) {
        newData[positionOffset + i] = clipboardData[i]
      }
      
      // Copy data after paste position
      for (let i = positionOffset; i < audioBufferRef.current.length; i++) {
        newData[i + clipboardBuffer.length] = sourceData[i]
      }
    }

    // Update the audio buffer
    audioBufferRef.current = newBuffer
    
    // Load the new buffer into wavesurfer
    const blob = audioBufferToWav(newBuffer)
    const url = URL.createObjectURL(blob)
    wavesurferRef.current.load(url)
  }

  const trimSelection = () => {
    if (!selection || !audioBufferRef.current || !wavesurferRef.current || !audioContextRef.current) return

    const { start, end } = selection
    const selectionDuration = end - start
    
    // Create a new buffer with just the selection
    const newBuffer = audioContextRef.current.createBuffer(
      audioBufferRef.current.numberOfChannels,
      audioBufferRef.current.sampleRate * selectionDuration,
      audioBufferRef.current.sampleRate
    )

    // Copy only the selection data
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const sourceData = audioBufferRef.current.getChannelData(channel)
      const newData = newBuffer.getChannelData(channel)
      
      const startOffset = Math.floor(start * audioBufferRef.current.sampleRate)
      const endOffset = Math.floor(end * audioBufferRef.current.sampleRate)
      
      for (let i = 0; i < endOffset - startOffset; i++) {
        newData[i] = sourceData[startOffset + i]
      }
    }

    // Update the audio buffer
    audioBufferRef.current = newBuffer
    
    // Load the new buffer into wavesurfer
    const blob = audioBufferToWav(newBuffer)
    const url = URL.createObjectURL(blob)
    wavesurferRef.current.load(url)
    
    // Clear selection
    clearSelection()
  }

  const fadeIn = (duration: number) => {
    if (!audioBufferRef.current || !wavesurferRef.current || !audioContextRef.current) return

    const fadeInSamples = Math.floor(duration * audioBufferRef.current.sampleRate)
    
    // Apply fade in to each channel
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const data = audioBufferRef.current.getChannelData(channel)
      
      for (let i = 0; i < Math.min(fadeInSamples, data.length); i++) {
        // Linear fade
        const gain = i / fadeInSamples
        data[i] = data[i] * gain
      }
    }
    
    // Load the modified buffer into wavesurfer
    const blob = audioBufferToWav(audioBufferRef.current)
    const url = URL.createObjectURL(blob)
    wavesurferRef.current.load(url)
  }

  const fadeOut = (duration: number) => {
    if (!audioBufferRef.current || !wavesurferRef.current || !audioContextRef.current) return

    const fadeOutSamples = Math.floor(duration * audioBufferRef.current.sampleRate)
    
    // Apply fade out to each channel
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const data = audioBufferRef.current.getChannelData(channel)
      
      for (let i = 0; i < Math.min(fadeOutSamples, data.length); i++) {
        // Linear fade
        const gain = 1 - (i / fadeOutSamples)
        data[data.length - 1 - i] = data[data.length - 1 - i] * gain
      }
    }
    
    // Load the modified buffer into wavesurfer
    const blob = audioBufferToWav(audioBufferRef.current)
    const url = URL.createObjectURL(blob)
    wavesurferRef.current.load(url)
  }

  const amplify = (gain: number) => {
    if (!audioBufferRef.current || !wavesurferRef.current) return

    // Apply gain to each channel
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const data = audioBufferRef.current.getChannelData(channel)
      
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.max(-1, Math.min(1, data[i] * gain))
      }
    }
    
    // Load the modified buffer into wavesurfer
    const blob = audioBufferToWav(audioBufferRef.current)
    const url = URL.createObjectURL(blob)
    wavesurferRef.current.load(url)
  }

  const normalize = () => {
    if (!audioBufferRef.current || !wavesurferRef.current) return

    // Find the maximum amplitude across all channels
    let maxAmplitude = 0
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const data = audioBufferRef.current.getChannelData(channel)
      
      for (let i = 0; i < data.length; i++) {
        const absValue = Math.abs(data[i])
        if (absValue > maxAmplitude) {
          maxAmplitude = absValue
        }
      }
    }
    
    // If audio is already normalized, return
    if (maxAmplitude >= 0.99) return
    
    // Calculate the gain needed to normalize
    const gain = 1.0 / maxAmplitude
    
    // Apply the gain to each channel
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const data = audioBufferRef.current.getChannelData(channel)
      
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i] * gain
      }
    }
    
    // Load the modified buffer into wavesurfer
    const blob = audioBufferToWav(audioBufferRef.current)
    const url = URL.createObjectURL(blob)
    wavesurferRef.current.load(url)
  }

  const applyEQ = (bass: number, mid: number, treble: number) => {
    if (!audioBufferRef.current || !wavesurferRef.current || !audioContextRef.current) return

    // Create temporary audio context for processing
    const tempContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create a new buffer for the processed audio
    const newBuffer = tempContext.createBuffer(
      audioBufferRef.current.numberOfChannels,
      audioBufferRef.current.length,
      audioBufferRef.current.sampleRate
    )
    
    // Copy the original audio to the new buffer
    for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
      const sourceData = audioBufferRef.current.getChannelData(channel)
      const newData = newBuffer.getChannelData(channel)
      
      for (let i = 0; i < sourceData.length; i++) {
        newData[i] = sourceData[i]
      }
    }
    
    // Create a buffer source node
    const sourceNode = tempContext.createBufferSource()
    sourceNode.buffer = newBuffer
    
    // Create EQ filters
    const bassFilter = tempContext.createBiquadFilter()
    bassFilter.type = 'lowshelf'
    bassFilter.frequency.value = 200
    bassFilter.gain.value = bass
    
    const midFilter = tempContext.createBiquadFilter()
    midFilter.type = 'peaking'
    midFilter.frequency.value = 1000
    midFilter.Q.value = 1
    midFilter.gain.value = mid
    
    const trebleFilter = tempContext.createBiquadFilter()
    trebleFilter.type = 'highshelf'
    trebleFilter.frequency.value = 3000
    trebleFilter.gain.value = treble
    
    // Create offline context for rendering
    const offlineContext = new OfflineAudioContext(
      newBuffer.numberOfChannels,
      newBuffer.length,
      newBuffer.sampleRate
    )
    
    // Create source node for offline context
    const offlineSource = offlineContext.createBufferSource()
    offlineSource.buffer = newBuffer
    
    // Create the same filters in the offline context
    const offlineBassFilter = offlineContext.createBiquadFilter()
    offlineBassFilter.type = 'lowshelf'
    offlineBassFilter.frequency.value = 200
    offlineBassFilter.gain.value = bass
    
    const offlineMidFilter = offlineContext.createBiquadFilter()
    offlineMidFilter.type = 'peaking'
    offlineMidFilter.frequency.value = 1000
    offlineMidFilter.Q.value = 1
    offlineMidFilter.gain.value = mid
    
    const offlineTrebleFilter = offlineContext.createBiquadFilter()
    offlineTrebleFilter.type = 'highshelf'
    offlineTrebleFilter.frequency.value = 3000
    offlineTrebleFilter.gain.value = treble
    
    // Connect the graph
    offlineSource.connect(offlineBassFilter)
    offlineBassFilter.connect(offlineMidFilter)
    offlineMidFilter.connect(offlineTrebleFilter)
    offlineTrebleFilter.connect(offlineContext.destination)
    
    // Render audio
    offlineSource.start()
    offlineContext.startRendering().then(renderedBuffer => {
      // Update the audio buffer
      audioBufferRef.current = renderedBuffer
      
      // Load the rendered buffer into wavesurfer
      const blob = audioBufferToWav(renderedBuffer)
      const url = URL.createObjectURL(blob)
      wavesurferRef.current?.load(url)
      
      // Close the temporary contexts
      tempContext.close()
    }).catch(err => {
      console.error("Rendering failed: ", err)
      tempContext.close()
    })
  }

  // Recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Initialize media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      recordedChunksRef.current = []
      
      // Set up data handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        // Create blob from recorded chunks
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        
        // Load into wavesurfer
        wavesurferRef.current?.load(url)
        
        // Convert to File object
        const fileName = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`
        const file = new File([blob], fileName, { type: 'audio/webm' })
        setCurrentFile(file)
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop())
        
        setIsRecording(false)
      }
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  // Export functionality
  const exportAudio = async (format: string, quality: number) => {
    if (!audioBufferRef.current) {
      throw new Error('No audio loaded')
    }
    
    let blob: Blob
    
    switch (format.toLowerCase()) {
      case 'wav':
        blob = audioBufferToWav(audioBufferRef.current)
        break
        
      case 'mp3':
        // MP3 encoding would require additional libraries
        // For simplicity we'll just use WAV here
        blob = audioBufferToWav(audioBufferRef.current)
        break
        
      case 'flac':
        // FLAC encoding would require additional libraries
        // For simplicity we'll just use WAV here
        blob = audioBufferToWav(audioBufferRef.current)
        break
        
      default:
        blob = audioBufferToWav(audioBufferRef.current)
    }
    
    return blob
  }

  // Project saving/loading
  const saveProject = async () => {
    if (!audioBufferRef.current) {
      throw new Error('No audio loaded')
    }
    
    // Create a simple project format
    const project = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      audio: await audioBufferToBase64(audioBufferRef.current),
      selection: selection,
      zoom: zoom,
      currentTime: currentTime
    }
    
    // Convert to JSON and then to Blob
    const json = JSON.stringify(project)
    const blob = new Blob([json], { type: 'application/json' })
    
    return blob
  }

  const loadProject = async (data: ArrayBuffer) => {
    try {
      // Parse project data
      const json = new TextDecoder().decode(data)
      const project = JSON.parse(json)
      
      // Load audio from base64
      const audioBuffer = await base64ToAudioBuffer(project.audio)
      audioBufferRef.current = audioBuffer
      
      // Load into wavesurfer
      const blob = audioBufferToWav(audioBuffer)
      const url = URL.createObjectURL(blob)
      wavesurferRef.current?.load(url)
      
      // Restore selection if present
      if (project.selection) {
        createSelection(project.selection.start, project.selection.end)
      }
      
      // Restore zoom
      setZoom(project.zoom || 50)
      
      // Restore playback position
      if (project.currentTime && wavesurferRef.current) {
        wavesurferRef.current.setTime(project.currentTime)
      }
    } catch (error) {
      console.error('Error loading project:', error)
      throw error
    }
  }

  // Utility functions
  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
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

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const audioBufferToBase64 = async (audioBuffer: AudioBuffer): Promise<string> => {
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

  const base64ToAudioBuffer = async (base64: string): Promise<AudioBuffer> => {
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
    return audioContextRef.current!.decodeAudioData(arrayBuffer)
  }

  const contextValue: AudioContextType = {
    wavesurfer: wavesurferRef.current,
    isPlaying,
    currentFile,
    duration,
    currentTime,
    volume,
    zoom,
    selection,
    loadFile,
    play,
    pause,
    stop,
    setVolume,
    setZoom,
    createSelection,
    clearSelection,
    cutSelection,
    copySelection,
    pasteSelection,
    trimSelection,
    fadeIn,
    fadeOut,
    amplify,
    normalize,
    applyEQ,
    startRecording,
    stopRecording,
    isRecording,
    exportAudio,
    saveProject,
    loadProject
  }

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <div id="waveform-container" ref={containerRef} style={{ display: 'none' }} />
      <div id="timeline" style={{ display: 'none' }} />
    </AudioContext.Provider>
  )
}