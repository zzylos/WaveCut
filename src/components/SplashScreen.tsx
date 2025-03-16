import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

interface SplashScreenProps {
  onComplete: () => void
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`

const Container = styled.div<{ isFadingOut: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  z-index: 1000;
  animation: ${props => props.isFadingOut ? fadeOut : fadeIn} 0.8s ease-in-out;
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 42px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 24px;
  
  svg {
    margin-right: 16px;
    width: 60px;
    height: 60px;
  }
`

const LoadingBar = styled.div`
  width: 300px;
  height: 4px;
  background-color: var(--color-surface-light);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 16px;
`

const Progress = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: var(--color-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
`

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)
  
  useEffect(() => {
    // Simulate loading with progress
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          // Start fade out animation
          setIsFadingOut(true)
          // Wait for animation to complete before unmounting
          setTimeout(onComplete, 800)
          return 100
        }
        return newProgress
      })
    }, 200)
    
    return () => clearInterval(interval)
  }, [onComplete])
  
  return (
    <Container isFadingOut={isFadingOut}>
      <Logo>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="4"/>
          <circle cx="30" cy="30" r="10" fill="currentColor"/>
          <path d="M8 20L52 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          <path d="M8 40L52 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        WaveCut
      </Logo>
      <div>Minimalist Audio Editor</div>
      <LoadingBar>
        <Progress progress={progress} />
      </LoadingBar>
    </Container>
  )
}

export default SplashScreen