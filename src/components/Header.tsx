import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import ExportOptions from './ExportOptions'
import { useAudio } from '../context/AudioContext'

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
`

const Logo = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`

const FileOperations = styled.div`
  display: flex;
  gap: 10px;
`

const Button = styled.button`
  padding: 8px 12px;
  background-color: var(--color-surface-light);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: var(--color-primary);
  }
  
  &:active {
    background-color: var(--color-primary-dark);
  }
`

const FileInput = styled.input`
  display: none;
`

const Header: React.FC = () => {
  const { loadFile, saveProject, loadProject } = useAudio()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const projectInputRef = useRef<HTMLInputElement>(null)
  
  const [showExportOptions, setShowExportOptions] = useState(false)
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await loadFile(files[0])
    }
    // Reset the input so the same file can be loaded again
    e.target.value = ''
  }
  
  const handleProjectSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const data = await files[0].arrayBuffer()
      await loadProject(data)
    }
    // Reset the input
    e.target.value = ''
  }
  
  const handleOpenClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleOpenProjectClick = () => {
    projectInputRef.current?.click()
  }
  
  const handleSaveProjectClick = async () => {
    try {
      const blob = await saveProject()
      const url = URL.createObjectURL(blob)
      
      // Create a download link and click it
      const a = document.createElement('a')
      a.href = url
      a.download = `wavecut_project_${new Date().toISOString().replace(/:/g, '-')}.wavecut`
      a.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }
  
  return (
    <HeaderContainer>
      <Logo>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12Z" fill="currentColor"/>
          <path d="M4 8L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        WaveCut
      </Logo>
      <FileOperations>
        <Button onClick={handleOpenClick} data-tooltip="Open audio file">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 21C4.45 21 3.979 20.804 3.588 20.413C3.196 20.021 3 19.55 3 19V5C3 4.45 3.196 3.979 3.588 3.588C3.979 3.196 4.45 3 5 3H12L14 5H19C19.55 5 20.021 5.196 20.413 5.588C20.804 5.979 21 6.45 21 7V19C21 19.55 20.804 20.021 20.413 20.413C20.021 20.804 19.55 21 19 21H5Z" fill="currentColor"/>
          </svg>
          Open
        </Button>
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept="audio/*"
        />
        
        <Button onClick={handleOpenProjectClick} data-tooltip="Open project">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 21C3.45 21 2.979 20.804 2.588 20.413C2.196 20.021 2 19.55 2 19V5C2 4.45 2.196 3.979 2.588 3.588C2.979 3.196 3.45 3 4 3H10L12 5H20C20.55 5 21.021 5.196 21.413 5.588C21.804 5.979 22 6.45 22 7H12L10 5H4V19L6.4 10H23.5L21.15 19.9C21.05 20.25 20.867 20.542 20.6 20.775C20.333 21.008 20.017 21.125 19.65 21.125H4Z" fill="currentColor"/>
          </svg>
          Project
        </Button>
        <FileInput 
          type="file" 
          ref={projectInputRef} 
          onChange={handleProjectSelect} 
          accept=".wavecut"
        />
        
        <Button onClick={handleSaveProjectClick} data-tooltip="Save project">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 21C4.45 21 3.979 20.804 3.588 20.413C3.196 20.021 3 19.55 3 19V5C3 4.45 3.196 3.979 3.588 3.588C3.979 3.196 4.45 3 5 3H17L21 7V19C21 19.55 20.804 20.021 20.413 20.413C20.021 20.804 19.55 21 19 21H5ZM12 19C12.85 19 13.563 18.688 14.138 18.062C14.712 17.438 15 16.7 15 15.85C15 15.017 14.712 14.292 14.138 13.675C13.563 13.058 12.85 12.75 12 12.75C11.15 12.75 10.438 13.058 9.863 13.675C9.288 14.292 9 15.017 9 15.85C9 16.7 9.288 17.438 9.863 18.062C10.438 18.688 11.15 19 12 19ZM7 10H15V7H7V10Z" fill="currentColor"/>
          </svg>
          Save
        </Button>
        
        <Button onClick={() => setShowExportOptions(true)} data-tooltip="Export audio">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20C4.45 20 3.979 19.804 3.588 19.413C3.196 19.021 3 18.55 3 18V6C3 5.45 3.196 4.979 3.588 4.588C3.979 4.196 4.45 4 5 4H9.175L12 6.825H19C19.55 6.825 20.021 7.021 20.413 7.413C20.804 7.804 21 8.275 21 8.825V18C21 18.55 20.804 19.021 20.413 19.413C20.021 19.804 19.55 20 19 20H5ZM12 17L16 13H13V9H11V13H8L12 17Z" fill="currentColor"/>
          </svg>
          Export
        </Button>
      </FileOperations>
      
      <ExportOptions 
        isOpen={showExportOptions} 
        onClose={() => setShowExportOptions(false)} 
      />
    </HeaderContainer>
  )
}

export default Header