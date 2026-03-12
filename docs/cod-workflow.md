# COD (Cash on Delivery) Workflow

## Overview

ArmAI supports optional Cash on Delivery so merchants can let customers pay when the order is delivered. COD is configured per merchant and per product, and is kept separate from the prepaid (bank transfer / QR) flow.

## Business flow

1. **Merchant enables COD** in Settings → Payment methods — COD (enable, min/max amount, fee, required fields, manual confirmation).
2. **Products** can allow or disallow COD via "COD allowed" and "COD requires manual confirmation".
3. **Customer** can request COD during chat; the AI uses merchant and product settings to decide eligibility.
4. **Order** has one active payment method at a time: `prepaid_bank_transfer`, `prepaid_qr`, or `cod`.
5. **COD orders** collect shipping/contact details, then follow: pending confirmation → ready to ship → shipped → collected (or failed).
6. **Prepaid orders** are unchanged: payment target → slip → bank matching → paid.

## State separation

- **order_status**: legacy lifecycle (pending, slip_uploaded, paid, cancelled, etc.).
- **payment_method**: current active method (prepaid_bank_transfer | prepaid_qr | cod).
- **payment_status**: payment lifecycle (unpaid, pending_transfer, paid, cod_pending_confirmation, cod_ready_to_ship, cod_shipped, cod_collected, cod_failed, etc.).

COD orders do not use slip verification or bank matching. Prepaid orders do not use COD collection steps.

## Merchant UI

- **Settings**: COD card to enable/disable and set rules.
- **Products**: COD allowed and COD manual confirmation per product.
- **Orders**: Filter by payment method (prepaid / COD); open order detail for timeline and actions.
- **Order detail**: Payment method history (timeline), COD details, actions: Confirm COD, Mark shipped, Mark collected, Mark failed.

## Limitations and extension points

- COD status and shipping details are stored in `order_cod_details` and `order_shipping_details`; only one active COD detail row per order.
- Payment method switching is recorded in `order_payment_method_events`; switch policy is in `payment-method-switch` service (allowed / denied / requires_manual_confirmation).
- Future: more order_status values for awaiting_cod_details, ready_to_ship, shipped can be added without breaking existing enums.
