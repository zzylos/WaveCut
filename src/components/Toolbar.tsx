import React, { useState } from 'react'
import styled from 'styled-components'
import { useAudio } from '../context/AudioContext'

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  gap: 16px;
`

const ToolGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-right: 1px solid var(--color-border);
  
  &:last-child {
    border-right: none;
  }
`

const ToolButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background-color: ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  
  &:hover {
    background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-surface-light)'};
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background-color: transparent;
  }
`

const RecordButton = styled(ToolButton)<{ recording: boolean }>`
  color: ${props => props.recording ? 'white' : 'var(--color-accent)'};
  background-color: ${props => props.recording ? 'var(--color-accent)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.recording ? 'var(--color-accent)' : 'var(--color-surface-light)'};
  }
`

// Modal dialog for effect settings
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  width: 360px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
`

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`

const ModalCloseButton = styled.button`
  font-size: 18px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  
  &:hover {
    color: var(--color-text);
  }
`

const SettingsGroup = styled.div`
  margin-bottom: 16px;
`

const SettingLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
`

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Slider = styled.input`
  flex: 1;
`

const SliderValue = styled.span`
  font-size: 14px;
  width: 40px;
  text-align: right;
`

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`

const ModalButton = styled.button`
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;

  &.cancel {
    background-color: var(--color-surface-light);
    
    &:hover {
      background-color: var(--color-border);
    }
  }
  
  &.apply {
    background-color: var(--color-primary);
    color: white;
    
    &:hover {
      background-color: var(--color-primary-dark);
    }
  }
`

const Toolbar: React.FC = () => {
  const { 
    isPlaying, 
    currentFile, 
    play, 
    pause, 
    stop, 
    selection,
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
    currentTime
  } = useAudio()
  
  const [modalType, setModalType] = useState<string | null>(null)
  
  // Effect settings
  const [fadeInDuration, setFadeInDuration] = useState(2.0)
  const [fadeOutDuration, setFadeOutDuration] = useState(2.0)
  const [gain, setGain] = useState(1.0)
  const [eqBass, setEqBass] = useState(0)
  const [eqMid, setEqMid] = useState(0)
  const [eqTreble, setEqTreble] = useState(0)
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }
  
  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }
  
  const handlePaste = () => {
    pasteSelection(currentTime)
  }
  
  const openModal = (type: string) => {
    setModalType(type)
  }
  
  const closeModal = () => {
    setModalType(null)
  }
  
  const handleApplyEffect = () => {
    switch (modalType) {
      case 'fadeIn':
        fadeIn(fadeInDuration)
        break
      case 'fadeOut':
        fadeOut(fadeOutDuration)
        break
      case 'amplify':
        amplify(gain)
        break
      case 'eq':
        applyEQ(eqBass, eqMid, eqTreble)
        break
    }
    closeModal()
  }
  
  const renderModal = () => {
    if (!modalType) return null
    
    let modalContent
    
    switch (modalType) {
      case 'fadeIn':
        modalContent = (
          <>
            <ModalHeader>
              <ModalTitle>Fade In</ModalTitle>
              <ModalCloseButton onClick={closeModal}>×</ModalCloseButton>
            </ModalHeader>
            <SettingsGroup>
              <SettingLabel>Duration (seconds)</SettingLabel>
              <SliderContainer>
                <Slider 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.1" 
                  value={fadeInDuration}
                  onChange={(e) => setFadeInDuration(parseFloat(e.target.value))}
                />
                <SliderValue>{fadeInDuration.toFixed(1)}</SliderValue>
              </SliderContainer>
            </SettingsGroup>
          </>
        )
        break
        
      case 'fadeOut':
        modalContent = (
          <>
            <ModalHeader>
              <ModalTitle>Fade Out</ModalTitle>
              <ModalCloseButton onClick={closeModal}>×</ModalCloseButton>
            </ModalHeader>
            <SettingsGroup>
              <SettingLabel>Duration (seconds)</SettingLabel>
              <SliderContainer>
                <Slider 
                  type="range" 
                  min="0.1" 
                  max="10" 
                  step="0.1" 
                  value={fadeOutDuration}
                  onChange={(e) => setFadeOutDuration(parseFloat(e.target.value))}
                />
                <SliderValue>{fadeOutDuration.toFixed(1)}</SliderValue>
              </SliderContainer>
            </SettingsGroup>
          </>
        )
        break
        
      case 'amplify':
        modalContent = (
          <>
            <ModalHeader>
              <ModalTitle>Amplify</ModalTitle>
              <ModalCloseButton onClick={closeModal}>×</ModalCloseButton>
            </ModalHeader>
            <SettingsGroup>
              <SettingLabel>Gain</SettingLabel>
              <SliderContainer>
                <Slider 
                  type="range" 
                  min="0.1" 
                  max="3" 
                  step="0.1" 
                  value={gain}
                  onChange={(e) => setGain(parseFloat(e.target.value))}
                />
                <SliderValue>{gain.toFixed(1)}x</SliderValue>
              </SliderContainer>
            </SettingsGroup>
          </>
        )
        break
        
      case 'eq':
        modalContent = (
          <>
            <ModalHeader>
              <ModalTitle>Equalizer</ModalTitle>
              <ModalCloseButton onClick={closeModal}>×</ModalCloseButton>
            </ModalHeader>
            <SettingsGroup>
              <SettingLabel>Bass (dB)</SettingLabel>
              <SliderContainer>
                <Slider 
                  type="range" 
                  min="-12" 
                  max="12" 
                  step="1" 
                  value={eqBass}
                  onChange={(e) => setEqBass(parseInt(e.target.value))}
                />
                <SliderValue>{eqBass > 0 ? `+${eqBass}` : eqBass}</SliderValue>
              </SliderContainer>
            </SettingsGroup>
            <SettingsGroup>
              <SettingLabel>Mid (dB)</SettingLabel>
              <SliderContainer>
                <Slider 
                  type="range" 
                  min="-12" 
                  max="12" 
                  step="1" 
                  value={eqMid}
                  onChange={(e) => setEqMid(parseInt(e.target.value))}
                />
                <SliderValue>{eqMid > 0 ? `+${eqMid}` : eqMid}</SliderValue>
              </SliderContainer>
            </SettingsGroup>
            <SettingsGroup>
              <SettingLabel>Treble (dB)</SettingLabel>
              <SliderContainer>
                <Slider 
                  type="range" 
                  min="-12" 
                  max="12" 
                  step="1" 
                  value={eqTreble}
                  onChange={(e) => setEqTreble(parseInt(e.target.value))}
                />
                <SliderValue>{eqTreble > 0 ? `+${eqTreble}` : eqTreble}</SliderValue>
              </SliderContainer>
            </SettingsGroup>
          </>
        )
        break
        
      default:
        modalContent = null
    }
    
    return (
      <ModalOverlay>
        <ModalContent>
          {modalContent}
          <ModalButtons>
            <ModalButton className="cancel" onClick={closeModal}>Cancel</ModalButton>
            <ModalButton className="apply" onClick={handleApplyEffect}>Apply</ModalButton>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    )
  }
  
  return (
    <ToolbarContainer>
      {/* Playback controls */}
      <ToolGroup>
        <ToolButton 
          onClick={handlePlayPause} 
          disabled={!currentFile} 
          data-tooltip={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19M16 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5L19 12L8 19V5Z" fill="currentColor"/>
            </svg>
          )}
        </ToolButton>
        
        <ToolButton onClick={stop} disabled={!currentFile} data-tooltip="Stop">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="6" width="12" height="12" fill="currentColor"/>
          </svg>
        </ToolButton>
        
        <RecordButton
          onClick={handleRecordToggle}
          recording={isRecording}
          data-tooltip={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="6" fill="currentColor"/>
          </svg>
        </RecordButton>
      </ToolGroup>
      
      {/* Edit controls */}
      <ToolGroup>
        <ToolButton
          onClick={cutSelection}
          disabled={!selection}
          data-tooltip="Cut"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 7C4.89543 7 4 7.89543 4 9C4 10.1046 4.89543 11 6 11C7.10457 11 8 10.1046 8 9C8 7.89543 7.10457 7 6 7Z" fill="currentColor"/>
            <path d="M6 14C4.89543 14 4 14.8954 4 16C4 17.1046 4.89543 18 6 18C7.10457 18 8 17.1046 8 16C8 14.8954 7.10457 14 6 14Z" fill="currentColor"/>
            <path d="M15 15.5C15 15.5 13.5 15.5 10 15.5C9.99999 13.5 9.99999 11.5 10 9.5C13.5 9.50001 15 9.5 15 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19 9L15 13M19 13L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolButton>
        
        <ToolButton
          onClick={copySelection}
          disabled={!selection}
          data-tooltip="Copy"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V17C17 17.5523 16.5523 18 16 18H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 6H16V18H8V6Z" fill="currentColor"/>
          </svg>
        </ToolButton>
        
        <ToolButton
          onClick={handlePaste}
          disabled={!currentFile}
          data-tooltip="Paste"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 7H5C4.44772 7 4 7.44772 4 8V19C4 19.5523 4.44772 20 5 20H16C16.5523 20 17 19.5523 17 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M13 5V3M15 9H17H19M19 9V7M19 9L13 3M13 3H15M13 3L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolButton>
        
        <ToolButton
          onClick={trimSelection}
          disabled={!selection}
          data-tooltip="Trim to Selection"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="7" width="14" height="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 17V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M15 17V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolButton>
      </ToolGroup>
      
      {/* Effect controls */}
      <ToolGroup>
        <ToolButton
          onClick={() => openModal('fadeIn')}
          disabled={!currentFile}
          data-tooltip="Fade In"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 18L8 13L12 17L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 8H21V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolButton>
        
        <ToolButton
          onClick={() => openModal('fadeOut')}
          disabled={!currentFile}
          data-tooltip="Fade Out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8L8 13L12 9L21 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 18H21V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolButton>
        
        <ToolButton
          onClick={() => openModal('amplify')}
          disabled={!currentFile}
          data-tooltip="Amplify"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolButton>
        
        <ToolButton
          onClick={normalize}
          disabled={!currentFile}
          data-tooltip="Normalize"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </ToolButton>
        
        <ToolButton
          onClick={() => openModal('eq')}
          disabled={!currentFile}
          data-tooltip="Equalizer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19H5.5L6 17.5H9L9.5 19H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 5H14.5L15 6.5H18L18.5 5H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 12H5.5L6 13.5H9L9.5 12H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 12H14.5L15 10.5H18L18.5 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolButton>
      </ToolGroup>
      
      {renderModal()}
    </ToolbarContainer>
  )
}

export default Toolbar