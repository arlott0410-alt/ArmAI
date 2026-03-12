import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderSummaryCard } from '../../components/ui/OrderSummaryCard'

describe('OrderSummaryCard', () => {
  it('renders total and item count', () => {
    render(<OrderSummaryCard total={1500} itemCount={2} />)
    expect(screen.getByText('2 items')).toBeInTheDocument()
    expect(screen.getByText('฿1,500')).toBeInTheDocument()
  })

  it('renders singular item', () => {
    render(<OrderSummaryCard total={99} itemCount={1} />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
    expect(screen.getByText('฿99')).toBeInTheDocument()
  })

  it('renders status badge when provided', () => {
    render(<OrderSummaryCard total={500} itemCount={1} status="paid" />)
    expect(screen.getByText('paid')).toBeInTheDocument()
  })

  it('renders reference code when provided', () => {
    render(<OrderSummaryCard total={300} itemCount={1} referenceCode="ORD-001" />)
    expect(screen.getByText(/Ref: ORD-001/)).toBeInTheDocument()
  })

  it('formats total with default THB', () => {
    render(<OrderSummaryCard total={12500} itemCount={3} />)
    expect(screen.getByText('฿12,500')).toBeInTheDocument()
  })

  it('uses custom currency when provided', () => {
    render(<OrderSummaryCard total={50} itemCount={1} currency="USD" />)
    expect(screen.getByText('USD 50')).toBeInTheDocument()
  })

  it('when status is empty string, card still shows total and item count without badge', () => {
    render(<OrderSummaryCard total={100} itemCount={1} status="" />)
    expect(screen.getByText('1 item')).toBeInTheDocument()
    expect(screen.getByText('฿100')).toBeInTheDocument()
    expect(screen.queryByText('paid')).not.toBeInTheDocument()
  })

  it('does not render reference when null', () => {
    render(<OrderSummaryCard total={100} itemCount={1} referenceCode={null} />)
    expect(screen.queryByText(/Ref:/)).not.toBeInTheDocument()
  })
})
