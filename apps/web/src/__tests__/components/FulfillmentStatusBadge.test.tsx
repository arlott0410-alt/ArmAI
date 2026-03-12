import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FulfillmentStatusBadge } from '../../components/ui/FulfillmentStatusBadge'

describe('FulfillmentStatusBadge', () => {
  it('renders known status with label', () => {
    render(<FulfillmentStatusBadge status="pending_fulfillment" />)
    expect(screen.getByText('Pending fulfillment')).toBeInTheDocument()
  })

  it('renders shipped status', () => {
    render(<FulfillmentStatusBadge status="shipped" />)
    expect(screen.getByText('Shipped')).toBeInTheDocument()
  })

  it('renders delivered status', () => {
    render(<FulfillmentStatusBadge status="delivered" />)
    expect(screen.getByText('Delivered')).toBeInTheDocument()
  })

  it('renders delivery_failed status', () => {
    render(<FulfillmentStatusBadge status="delivery_failed" />)
    expect(screen.getByText('Delivery failed')).toBeInTheDocument()
  })

  it('renders cancelled status', () => {
    render(<FulfillmentStatusBadge status="cancelled" />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('renders em dash for null status', () => {
    render(<FulfillmentStatusBadge status={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders em dash for undefined status', () => {
    render(<FulfillmentStatusBadge status={undefined} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders em dash for empty string', () => {
    render(<FulfillmentStatusBadge status="" />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders unknown status as raw value', () => {
    render(<FulfillmentStatusBadge status="custom_status" />)
    expect(screen.getByText('custom_status')).toBeInTheDocument()
  })
})
