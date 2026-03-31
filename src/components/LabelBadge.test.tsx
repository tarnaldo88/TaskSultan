import React from 'react'
import { render, screen } from '@testing-library/react'
import { LabelBadge } from './LabelBadge'
import type { Label } from '../types/label'

describe('LabelBadge', () => {
  const mockLabel: Label = {
    id: '1',
    name: 'Urgent',
    color: '#ff0000',
    workspaceId: '1'
  }

  it('should render label name', () => {
    render(<LabelBadge label={mockLabel} />)
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('should apply correct styles based on label color', () => {
    const { container } = render(<LabelBadge label={mockLabel} />)
    const badge = container.querySelector('span')
    
    expect(badge).toHaveStyle({
      background: '#ff0000',
      color: '#fff',
      border: '1px solid #ff0000'
    })
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<LabelBadge label={mockLabel} />)
    const badge = container.querySelector('span')
    
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'px-2',
      'py-0.5',
      'rounded',
      'text-xs',
      'font-semibold',
      'mr-1'
    )
  })

  it('should set title attribute to label name', () => {
    render(<LabelBadge label={mockLabel} />)
    const badge = screen.getByText('Urgent')
    expect(badge).toHaveAttribute('title', 'Urgent')
  })

  it('should work with different label colors', () => {
    const blueLabel: Label = {
      id: '2',
      name: 'Feature',
      color: '#0000ff',
      workspaceId: '1'
    }

    const { container } = render(<LabelBadge label={blueLabel} />)
    const badge = container.querySelector('span')
    
    expect(badge).toHaveStyle({
      background: '#0000ff',
      color: '#fff',
      border: '1px solid #0000ff'
    })
  })
})
