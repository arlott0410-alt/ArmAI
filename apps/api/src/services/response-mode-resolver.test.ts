import { describe, it, expect } from 'vitest'
import { resolveLowCostResponse, getFaqAnswerForQuery } from './response-mode-resolver'
import type { ResolverInput } from './response-mode-resolver'

function baseInput(overrides: Partial<ResolverInput> = {}): ResolverInput {
  return {
    routeCategory: 'generic_small_talk',
    responseMode: 'ai',
    builtContext: null,
    trackingNumber: null,
    codEnabled: false,
    faqAnswer: null,
    greetingTemplate: null,
    ...overrides,
  }
}

describe('resolveLowCostResponse', () => {
  it('returns escalation message when responseMode is escalation', () => {
    const result = resolveLowCostResponse(baseInput({ responseMode: 'escalation' }))
    expect(result).toEqual({
      mode: 'escalation',
      text: 'We will connect you with a team member shortly. Please wait.',
    })
  })

  it('returns greeting template when templateHint is greeting', () => {
    const result = resolveLowCostResponse(
      baseInput({
        responseMode: 'template',
        templateHint: 'greeting',
        greetingTemplate: 'Hi! Welcome to our store.',
      })
    )
    expect(result).toEqual({
      mode: 'template',
      text: 'Hi! Welcome to our store.',
    })
  })

  it('returns default greeting when templateHint is greeting and no greetingTemplate', () => {
    const result = resolveLowCostResponse(
      baseInput({
        responseMode: 'template',
        templateHint: 'greeting',
        greetingTemplate: null,
      })
    )
    expect(result).toEqual({
      mode: 'template',
      text: 'Hello! How can we help you today?',
    })
  })

  it('returns ack template when templateHint is ack', () => {
    const result = resolveLowCostResponse(
      baseInput({ responseMode: 'template', templateHint: 'ack' })
    )
    expect(result).toEqual({
      mode: 'template',
      text: 'Got it. Anything else?',
    })
  })

  it('returns FAQ answer when retrieval + faq_knowledge_question + faqAnswer', () => {
    const result = resolveLowCostResponse(
      baseInput({
        routeCategory: 'faq_knowledge_question',
        responseMode: 'retrieval',
        faqAnswer: 'We ship within 2-3 business days.',
      })
    )
    expect(result).toEqual({
      mode: 'retrieval',
      text: 'We ship within 2-3 business days.',
      needAi: false,
    })
  })

  it('returns tracking message when retrieval + shipping_question + tracking_lookup + trackingNumber', () => {
    const result = resolveLowCostResponse(
      baseInput({
        routeCategory: 'shipping_question',
        responseMode: 'retrieval',
        templateHint: 'tracking_lookup',
        trackingNumber: 'TRK123',
      })
    )
    expect(result).toEqual({
      mode: 'retrieval',
      text: 'Your tracking number is: TRK123. You can track your parcel with the courier.',
      needAi: false,
    })
  })

  it('returns slip instructions when retrieval + payment_slip_related + send_slip_instructions', () => {
    const result = resolveLowCostResponse(
      baseInput({
        routeCategory: 'payment_slip_related',
        responseMode: 'retrieval',
        templateHint: 'send_slip_instructions',
      })
    )
    expect(result).toEqual({
      mode: 'retrieval',
      text: 'Please send your payment slip/transfer proof so we can confirm your order.',
      needAi: false,
    })
  })

  it('returns COD available when retrieval + switch_to_cod + codEnabled true', () => {
    const result = resolveLowCostResponse(
      baseInput({
        routeCategory: 'switch_to_cod',
        responseMode: 'retrieval',
        codEnabled: true,
      })
    )
    expect(result).toEqual({
      mode: 'retrieval',
      text: 'COD is available. We can switch your order to pay on delivery.',
      needAi: false,
    })
  })

  it('returns COD not available when retrieval + switch_to_cod + codEnabled false', () => {
    const result = resolveLowCostResponse(
      baseInput({
        routeCategory: 'switch_to_cod',
        responseMode: 'retrieval',
        codEnabled: false,
      })
    )
    expect(result).toEqual({
      mode: 'retrieval',
      text: 'COD is not available for this order.',
      needAi: false,
    })
  })

  it('returns switch to prepaid message when retrieval + switch_to_prepaid', () => {
    const result = resolveLowCostResponse(
      baseInput({
        routeCategory: 'switch_to_prepaid',
        responseMode: 'retrieval',
      })
    )
    expect(result).toEqual({
      mode: 'retrieval',
      text: 'You can pay by transfer. Please use the payment details we sent and submit your slip after payment.',
      needAi: false,
    })
  })

  it('returns needAi true when retrieval but no matching branch', () => {
    const result = resolveLowCostResponse(
      baseInput({
        routeCategory: 'product_inquiry',
        responseMode: 'retrieval',
      })
    )
    expect(result).toEqual({
      mode: 'retrieval',
      text: null,
      needAi: true,
    })
  })

  it('returns ai needAi when responseMode is ai', () => {
    const result = resolveLowCostResponse(baseInput({ responseMode: 'ai' }))
    expect(result).toEqual({ mode: 'ai', needAi: true })
  })
})

describe('getFaqAnswerForQuery', () => {
  const faqs = [
    { question: 'How do I track my order?', answer: 'Use the link we sent by SMS.' },
    { question: 'What is your return policy?', answer: '30 days return.' },
  ]

  it('returns answer when query matches question (contains)', () => {
    expect(getFaqAnswerForQuery('track my order', faqs)).toBe('Use the link we sent by SMS.')
  })

  it('returns answer when query is substring of question', () => {
    expect(getFaqAnswerForQuery('return policy', faqs)).toBe('30 days return.')
  })

  it('returns answer when query contains full question (question is substring of query)', () => {
    // Implementation: q.includes(faq.question.trim().toLowerCase()) — query must contain the full question text
    expect(getFaqAnswerForQuery('How do I track my order?', faqs)).toBe(
      'Use the link we sent by SMS.'
    )
  })

  it('is case insensitive', () => {
    expect(getFaqAnswerForQuery('TRACK MY ORDER', faqs)).toBe('Use the link we sent by SMS.')
  })

  it('trims query', () => {
    expect(getFaqAnswerForQuery('  track my order  ', faqs)).toBe('Use the link we sent by SMS.')
  })

  it('returns null when no match', () => {
    expect(getFaqAnswerForQuery('refund', faqs)).toBeNull()
  })

  it('returns null for empty faqs', () => {
    expect(getFaqAnswerForQuery('track', [])).toBeNull()
  })
})
