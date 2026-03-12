import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '../../components/ui/StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Revenue" value="฿12,500" />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('฿12,500')).toBeInTheDocument()
  })

  it('renders numeric value', () => {
    render(<StatCard label="Orders" value={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<StatCard label="Total" value="100" sub="vs 80 last week" />)
    expect(screen.getByText('vs 80 last week')).toBeInTheDocument()
  })

  it('does not render sub when undefined', () => {
    render(<StatCard label="Count" value="0" />)
    expect(screen.queryByText(/vs/)).not.toBeInTheDocument()
  })

  it('renders with accent without throwing', () => {
    render(<StatCard label="Highlight" value="Active" accent />)
    expect(screen.getByText('Highlight')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('handles empty string label and value without throwing', () => {
    expect(() => render(<StatCard label="" value="" />)).not.toThrow()
  })
})
