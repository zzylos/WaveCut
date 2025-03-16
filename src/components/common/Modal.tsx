import React, { useEffect } from 'react'
import styled from 'styled-components'
import Button from './Button'

interface ModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  children: React.ReactNode
}

const Overlay = styled.div`
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

const ModalContainer = styled.div`
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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

const ModalContent = styled.div`
  margin-bottom: 20px;
`

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`

const Modal: React.FC<ModalProps> = ({
  title,
  isOpen,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <Button 
            variant="icon"
            size="small"
            tooltip="Close"
            onClick={onClose}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </ModalHeader>
        <ModalContent>
          {children}
        </ModalContent>
        <ModalFooter>
          <Button 
            variant="secondary"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              variant="primary"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          )}
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  )
}

export default Modal