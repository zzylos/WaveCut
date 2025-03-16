import React, { useState } from 'react'
import styled from 'styled-components'
import Header from './components/Header'
import Waveform from './components/Waveform'
import Toolbar from './components/Toolbar'
import TimelineControls from './components/TimelineControls'
import SplashScreen from './components/SplashScreen'
import { useAudio } from './context/AudioContext'
import { formatTimeSimple } from './utils/audioUtils'

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  overflow: hidden;
`

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 20px;
`

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  font-size: 12px;
`

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    opacity: 0.7;
  }
`

function App() {
  const { currentFile, duration, currentTime } = useAudio()
  const [showSplash, setShowSplash] = useState(true)
  
  // Handle file info display
  const getFileTypeInfo = () => {
    if (!currentFile) return ''
    
    const fileType = currentFile.type.split('/')[1].toUpperCase()
    const fileSize = Math.round(currentFile.size / 1024)
    
    return `${fileType} • ${fileSize} KB`
  }
  
  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      <AppContainer>
        <Header />
        <Toolbar />
        <MainContent>
          <Waveform />
          <TimelineControls />
        </MainContent>
        <StatusBar>
          <StatusItem>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 4H18L12 10L6 4H11C14.3 4 17 6.7 17 10C17 11.1 16.7 12.1 16.2 13H13.8C14.6 12 15 10.9 15 10C15 7.8 13.2 6 11 6H9.5L13 9.5L7 15.5L3 11.5L9 5.5L13 9.5L9.5 6H11.1C12.3 6.2 13.1 7 13.2 8H10.5L14 11.5L12.5 13H14.8C14.2 13.5 13.6 14 13 14.3C11.6 14.8 10.3 14.8 9 14.3V16.4C10.6 17.1 12.4 17.0 13.9 16.4C16.4 15.5 18 13 18 10.1C18 10 18 10 18 10C18 7.2 16.3 4.8 13.7 4.1C13.5 4.1 13.2 4 13 4Z" fill="currentColor"/>
            </svg>
            {currentFile ? currentFile.name : 'No file loaded'}
          </StatusItem>
          
          <StatusItem>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 20C9.2 20 6.2 19 4 17V20H2V14H8V16H6.8C8.7 17.5 10.8 18 12 18C16.4 18 20 14.4 20 10C20 5.6 16.4 2 12 2C9.6 2 7.5 3 5.9 4.6L4.5 3.2C6.4 1.3 9.1 0 12 0C17.5 0 22 4.5 22 10C22 15.5 17.5 20 12 20ZM11 5H13V11H17V13H11V5Z" fill="currentColor"/>
            </svg>
            {formatTimeSimple(currentTime)} / {formatTimeSimple(duration || 0)}
          </StatusItem>
          
          <StatusItem>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4H16V6H8V4ZM4 8V18H20V8H4ZM2 8C2 6.9 2.9 6 4 6H20C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8Z" fill="currentColor"/>
            </svg>
            {getFileTypeInfo()}
          </StatusItem>
        </StatusBar>
      </AppContainer>
    </>
  )
}

export default App