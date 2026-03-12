import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../../components/ui/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders with default variant', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it('renders with success variant', () => {
    render(<Badge variant="success">Paid</Badge>)
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })

  it('renders with warning variant', () => {
    render(<Badge variant="warning">Pending</Badge>)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders with danger variant', () => {
    render(<Badge variant="danger">Failed</Badge>)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('renders with info variant', () => {
    render(<Badge variant="info">Info</Badge>)
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('renders with gold variant', () => {
    render(<Badge variant="gold">Premium</Badge>)
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('applies custom style when provided', () => {
    const { container } = render(<Badge style={{ marginLeft: 10 }}>Styled</Badge>)
    const span = container.firstChild as HTMLElement
    expect(span).toHaveStyle({ marginLeft: '10px' })
  })
})
