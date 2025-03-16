import React, { useRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAudio } from '../context/AudioContext'

const WaveformContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-top: 20px;
  min-height: 160px;
`

const WaveformContent = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const WaveformElement = styled.div`
  width: 100%;
  flex: 1;
  position: relative;
  background-color: var(--color-surface);
`

const NoFileMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-text-secondary);
  background-color: var(--color-surface);
  
  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: normal;
  }
  
  p {
    max-width: 400px;
    font-size: 14px;
    line-height: 1.5;
  }
`

const TimeGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 2;
`

const GridLine = styled.div<{ position: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${props => props.position};
  width: 1px;
  background-color: var(--color-grid);
`

const GridLabel = styled.div<{ position: string }>`
  position: absolute;
  top: 5px;
  left: ${props => props.position};
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--color-text-secondary);
  user-select: none;
`

const SelectionInfo = styled.div`
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-tooltip);
  color: var(--color-text);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  z-index: 10;
  pointer-events: none;
  opacity: 0.9;
`

const Waveform: React.FC = () => {
  const { 
    wavesurfer, 
    currentFile, 
    duration, 
    createSelection, 
    selection, 
    zoom 
  } = useAudio()
  
  const waveformRef = useRef<HTMLDivElement>(null)
  const isMouseDownRef = useRef(false)
  const selectionStartRef = useRef<number | null>(null)
  
  const [gridLines, setGridLines] = useState<number[]>([])
  const [showSelectionInfo, setShowSelectionInfo] = useState(false)
  
  // Update grid lines when zoom changes
  useEffect(() => {
    if (!duration) {
      setGridLines([])
      return
    }
    
    // Calculate grid spacing based on zoom level
    const spacing = Math.max(1, Math.floor(15 / (zoom / 100 * 2 + 1)))
    const numLines = Math.ceil(duration / spacing)
    const lines = Array.from({ length: numLines }, (_, i) => i * spacing)
    
    setGridLines(lines)
  }, [duration, zoom])
  
  // Handle mouse events for selection
  useEffect(() => {
    const waveformElement = waveformRef.current
    if (!waveformElement || !wavesurfer) return
    
    const handleMouseDown = (e: MouseEvent) => {
      if (!wavesurfer) return
      
      isMouseDownRef.current = true
      
      // Calculate the clicked time position
      const rect = waveformElement.getBoundingClientRect()
      const clickPosition = (e.clientX - rect.left) / rect.width
      const clickTime = clickPosition * (duration || 0)
      
      selectionStartRef.current = clickTime
      setShowSelectionInfo(true)
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || selectionStartRef.current === null || !wavesurfer) return
      
      // Calculate the current time position
      const rect = waveformElement.getBoundingClientRect()
      const currentPosition = (e.clientX - rect.left) / rect.width
      const currentTime = currentPosition * (duration || 0)
      
      // Create the selection region
      const start = Math.min(selectionStartRef.current, currentTime)
      const end = Math.max(selectionStartRef.current, currentTime)
      
      createSelection(start, end)
    }
    
    const handleMouseUp = () => {
      isMouseDownRef.current = false
      selectionStartRef.current = null
      
      // Hide selection info after a short delay
      setTimeout(() => {
        setShowSelectionInfo(false)
      }, 2000)
    }
    
    waveformElement.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      waveformElement.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [wavesurfer, duration, createSelection])
  
  // Format a time value in seconds to MM:SS.ms format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }
  
  const formatSelectionInfo = () => {
    if (!selection) return ''
    
    const { start, end } = selection
    const duration = end - start
    return `Selection: ${formatTime(start)} - ${formatTime(end)} (${formatTime(duration)})`
  }
  
  return (
    <WaveformContainer>
      <WaveformContent>
        <WaveformElement ref={waveformRef}>
          {!currentFile && (
            <NoFileMessage>
              <h3>No audio file loaded</h3>
              <p>
                Open an audio file using the Open button in the header,
                or start recording using the record button in the toolbar.
              </p>
            </NoFileMessage>
          )}
          
          {duration && (
            <TimeGrid>
              {gridLines.map((time, index) => (
                <React.Fragment key={index}>
                  <GridLine position={`${(time / duration) * 100}%`} />
                  <GridLabel position={`${(time / duration) * 100}%`}>
                    {formatTime(time)}
                  </GridLabel>
                </React.Fragment>
              ))}
            </TimeGrid>
          )}
          
          {selection && showSelectionInfo && (
            <SelectionInfo>
              {formatSelectionInfo()}
            </SelectionInfo>
          )}
        </WaveformElement>
      </WaveformContent>
    </WaveformContainer>
  )
}

export default Waveform