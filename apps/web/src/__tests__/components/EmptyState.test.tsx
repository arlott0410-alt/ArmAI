import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../../components/ui/EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No orders yet" />)
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Create your first item to get started." />)
    expect(screen.getByText('Create your first item to get started.')).toBeInTheDocument()
  })

  it('does not render description when undefined', () => {
    render(<EmptyState title="Title only" />)
    expect(screen.queryByText(/get started/)).not.toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(<EmptyState title="No data" action={<button type="button">Add item</button>} />)
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument()
  })

  it('renders title, description, and action together', () => {
    render(
      <EmptyState
        title="No results"
        description="Try adjusting your filters."
        action={<a href="/search">Search</a>}
      />
    )
    expect(screen.getByText('No results')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Search' })).toBeInTheDocument()
  })
})
