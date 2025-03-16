import React from 'react'
import styled from 'styled-components'
import { useAudio } from '../context/AudioContext'

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  margin-top: 10px;
`

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const VolumeControl = styled(ControlGroup)`
  flex: 0 0 160px;
`

const ZoomControl = styled(ControlGroup)`
  flex: 0 0 160px;
`

const SliderContainer = styled.div`
  flex: 1;
  height: 24px;
  display: flex;
  align-items: center;
`

const SliderLabel = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  width: 50px;
`

const VolumeButton = styled.button<{ muted?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: ${props => props.muted ? 'var(--color-accent)' : 'var(--color-text)'};
  
  &:hover {
    background-color: var(--color-surface-light);
  }
`

const MeterContainer = styled.div`
  flex: 1;
  height: 8px;
  background-color: var(--color-surface-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
`

const MeterFill = styled.div<{ level: number }>`
  height: 100%;
  width: ${props => props.level * 100}%;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  transition: width 0.1s ease;
`

const TimelineControls: React.FC = () => {
  const { 
    volume, 
    setVolume, 
    zoom, 
    setZoom,
    currentFile
  } = useAudio()
  
  const [isMuted, setIsMuted] = React.useState(false)
  const [prevVolume, setPrevVolume] = React.useState(1)
  
  // Mock audio level for visualization (would be real-time in a full implementation)
  const [audioLevel, setAudioLevel] = React.useState(0)
  
  React.useEffect(() => {
    if (!currentFile) {
      setAudioLevel(0)
      return
    }
    
    // Simulate audio meters by randomly fluctuating levels
    const interval = setInterval(() => {
      const randomLevel = Math.random() * 0.7 * volume
      setAudioLevel(randomLevel)
    }, 100)
    
    return () => clearInterval(interval)
  }, [currentFile, volume])
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }
  
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value))
  }
  
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      setVolume(prevVolume)
    } else {
      setPrevVolume(volume)
      setIsMuted(true)
      setVolume(0)
    }
  }
  
  return (
    <ControlsContainer>
      <VolumeControl>
        <VolumeButton onClick={toggleMute} muted={isMuted} data-tooltip={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 12H7.5L12 7.5V16.5L7.5 12H4.5V12Z" fill="currentColor"/>
              <path d="M16 9.5L21 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 9.5L16 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 12H7.5L12 7.5V16.5L7.5 12H4.5V12Z" fill="currentColor"/>
              <path d="M16 9C17.66 10.13 17.66 13.87 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 7C22 9.49 22 14.51 19 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </VolumeButton>
        <SliderContainer>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </SliderContainer>
        <SliderLabel>{Math.round(volume * 100)}%</SliderLabel>
      </VolumeControl>
      
      <ZoomControl>
        <SliderLabel>Zoom:</SliderLabel>
        <SliderContainer>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={zoom}
            onChange={handleZoomChange}
          />
        </SliderContainer>
        <SliderLabel>{zoom}%</SliderLabel>
      </ZoomControl>
      
      <MeterContainer>
        <MeterFill level={audioLevel} />
      </MeterContainer>
    </ControlsContainer>
  )
}

export default TimelineControls