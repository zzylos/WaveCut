import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from './common/Modal'
import Slider from './common/Slider'
import { useAudio } from '../context/AudioContext'

interface ExportOptionsProps {
  isOpen: boolean
  onClose: () => void
}

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const OptionGroup = styled.div`
  margin-bottom: 8px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
`

const FormatSelector = styled.div`
  display: flex;
  gap: 12px;
`

const FormatButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-surface-light)'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-border)'};
  }
`

const QualityPresets = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`

const QualityButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-surface-light)'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-border)'};
  }
`

const InfoText = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin-top: 12px;
`

const ExportOptions: React.FC<ExportOptionsProps> = ({ isOpen, onClose }) => {
  const { exportAudio, currentFile } = useAudio()
  
  const [format, setFormat] = useState<string>('wav')
  const [quality, setQuality] = useState<number>(1.0)
  
  const handleExport = async () => {
    try {
      const blob = await exportAudio(format, quality)
      const url = URL.createObjectURL(blob)
      
      // Create file name from original file if available
      let fileName = 'export'
      if (currentFile) {
        // Get name without extension
        const nameParts = currentFile.name.split('.')
        if (nameParts.length > 1) {
          nameParts.pop() // Remove extension
        }
        fileName = nameParts.join('.')
      }
      
      // Add timestamp to make the file name unique
      fileName += `_${new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')}`
      
      // Add selected extension
      fileName += `.${format}`
      
      // Create download link and click it
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      
      URL.revokeObjectURL(url)
      onClose()
    } catch (error) {
      console.error('Error exporting audio:', error)
    }
  }
  
  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat)
    
    // Reset quality to appropriate default for the format
    switch (newFormat) {
      case 'mp3':
        setQuality(0.7) // Medium quality for MP3
        break
      case 'flac':
        setQuality(1.0) // Lossless for FLAC
        break
      default:
        setQuality(1.0) // Full quality for WAV
    }
  }
  
  const handleQualityPreset = (presetQuality: number) => {
    setQuality(presetQuality)
  }
  
  const getFormatInfo = () => {
    switch (format) {
      case 'mp3':
        return 'MP3 is widely compatible but uses lossy compression. Lower quality values reduce file size but may introduce compression artifacts.'
      case 'flac':
        return 'FLAC provides lossless compression, preserving audio quality while reducing file size by about 50-60% compared to WAV.'
      default:
        return 'WAV provides uncompressed audio with perfect quality. Files are larger but compatible with most audio software.'
    }
  }
  
  return (
    <Modal 
      title="Export Audio"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleExport}
      confirmText="Export"
    >
      <OptionsContainer>
        <OptionGroup>
          <Label>Format</Label>
          <FormatSelector>
            <FormatButton 
              active={format === 'wav'} 
              onClick={() => handleFormatChange('wav')}
            >
              WAV
            </FormatButton>
            <FormatButton 
              active={format === 'mp3'} 
              onClick={() => handleFormatChange('mp3')}
            >
              MP3
            </FormatButton>
            <FormatButton 
              active={format === 'flac'} 
              onClick={() => handleFormatChange('flac')}
            >
              FLAC
            </FormatButton>
          </FormatSelector>
          <InfoText>{getFormatInfo()}</InfoText>
        </OptionGroup>
        
        {format === 'mp3' && (
          <OptionGroup>
            <Label>Quality</Label>
            <Slider 
              value={quality} 
              min={0.1} 
              max={1.0} 
              step={0.05}
              onChange={setQuality}
            />
            <QualityPresets>
              <QualityButton 
                active={quality === 0.3} 
                onClick={() => handleQualityPreset(0.3)}
              >
                Low (64kbps)
              </QualityButton>
              <QualityButton 
                active={quality === 0.7} 
                onClick={() => handleQualityPreset(0.7)}
              >
                Medium (128kbps)
              </QualityButton>
              <QualityButton 
                active={quality === 1.0} 
                onClick={() => handleQualityPreset(1.0)}
              >
                High (320kbps)
              </QualityButton>
            </QualityPresets>
          </OptionGroup>
        )}
      </OptionsContainer>
    </Modal>
  )
}

export default ExportOptions