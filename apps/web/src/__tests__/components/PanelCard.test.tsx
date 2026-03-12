import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanelCard } from '../../components/ui/PanelCard'

describe('PanelCard', () => {
  it('renders title', () => {
    render(<PanelCard title="Orders">Content</PanelCard>)
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <PanelCard title="Dashboard" subtitle="Last 7 days">
        Body
      </PanelCard>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(
      <PanelCard title="Settings" action={<button type="button">Edit</button>}>
        Settings content
      </PanelCard>
    )
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByText('Settings content')).toBeInTheDocument()
  })

  it('does not render subtitle when undefined', () => {
    render(<PanelCard title="Title only">Content</PanelCard>)
    expect(screen.queryByText(/Last 7/)).not.toBeInTheDocument()
  })

  it('renders children in body', () => {
    render(
      <PanelCard title="Card">
        <p>Paragraph</p>
        <span>Span</span>
      </PanelCard>
    )
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Span')).toBeInTheDocument()
  })
})
