import React from 'react'
import styled, { css } from 'styled-components'

type ButtonVariant = 'primary' | 'secondary' | 'icon' | 'outline'
type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  disabled?: boolean
  tooltip?: string
  children?: React.ReactNode
  onClick?: () => void
}

const StyledButton = styled.button<{ 
  $variant: ButtonVariant 
  $size: ButtonSize
  $hasIcon: boolean
  $iconOnly: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  gap: 6px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => props.$size === 'small' && css`
    padding: ${props.$iconOnly ? '6px' : '6px 10px'};
    font-size: 12px;
  `}
  
  ${props => props.$size === 'medium' && css`
    padding: ${props.$iconOnly ? '8px' : '8px 12px'};
    font-size: 14px;
  `}
  
  ${props => props.$size === 'large' && css`
    padding: ${props.$iconOnly ? '10px' : '10px 16px'};
    font-size: 16px;
  `}
  
  ${props => props.$variant === 'primary' && css`
    background-color: var(--color-primary);
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary-light);
    }
    
    &:active:not(:disabled) {
      background-color: var(--color-primary-dark);
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background-color: var(--color-surface-light);
    color: var(--color-text);
    border: none;
    
    &:hover:not(:disabled) {
      background-color: var(--color-border);
    }
    
    &:active:not(:disabled) {
      background-color: var(--color-surface-light);
    }
  `}
  
  ${props => props.$variant === 'icon' && css`
    background-color: transparent;
    color: var(--color-text);
    border: none;
    
    &:hover:not(:disabled) {
      background-color: var(--color-surface-light);
    }
    
    &:active:not(:disabled) {
      background-color: var(--color-border);
    }
  `}
  
  ${props => props.$variant === 'outline' && css`
    background-color: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
    
    &:hover:not(:disabled) {
      background-color: var(--color-surface-light);
    }
    
    &:active:not(:disabled) {
      background-color: var(--color-border);
    }
  `}
`

const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'medium',
  icon,
  disabled = false,
  tooltip,
  children,
  onClick
}) => {
  const iconOnly = !children
  
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $hasIcon={!!icon}
      $iconOnly={iconOnly}
      disabled={disabled}
      onClick={onClick}
      data-tooltip={tooltip}
    >
      {icon}
      {children}
    </StyledButton>
  )
}

export default Button