import React from 'react'
import styled from 'styled-components'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  label?: string
  unit?: string
  onChange: (value: number) => void
}

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 6px;
`

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SliderLabel = styled.label`
  font-size: 12px;
  color: var(--color-text-secondary);
`

const SliderValue = styled.span`
  font-size: 12px;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
`

const SliderInput = styled.input`
  width: 100%;
  appearance: none;
  height: 4px;
  background: var(--color-surface-light);
  border-radius: var(--radius-sm);
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    border: none;
  }
  
  &:focus {
    outline: none;
  }
  
  &:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
  
  &:focus::-moz-range-thumb {
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
`

const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit = '',
  onChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }
  
  // Format the value based on the step
  const formatValue = (value: number) => {
    if (step < 1) {
      const decimalPlaces = step.toString().split('.')[1]?.length || 0
      return value.toFixed(decimalPlaces)
    }
    return value.toString()
  }
  
  return (
    <SliderContainer>
      <SliderHeader>
        {label && <SliderLabel>{label}</SliderLabel>}
        <SliderValue>{formatValue(value)}{unit}</SliderValue>
      </SliderHeader>
      <SliderInput
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
    </SliderContainer>
  )
}

export default Slider