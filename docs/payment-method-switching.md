# Payment Method Switching

## Principle

For each order there is **only one active payment method** at a time. The system supports switching between:

- prepaid_bank_transfer  
- prepaid_qr  
- cod  

All prior payment intents are preserved as history and explicitly marked inactive or superseded.

## Model

- **orders.payment_method**: current active method.
- **orders.payment_status**: current payment lifecycle state.
- **orders.payment_switch_count**: number of switches (used for risk/confirmation rules).
- **orders.payment_method_locked_at**: set when payment is confirmed; no further switches.
- **order_payment_targets**: prepaid assignment; when switching away from prepaid, the active row is set `is_active = false`, `invalidated_at` and `invalidation_reason` set.
- **order_cod_details**: when switching away from COD, the active row is set `is_active = false`, `superseded_at` and `superseded_reason` set.
- **order_payment_method_events**: every switch attempt is recorded (from_method, to_method, switch_result, requested_by_type, reason).

## Switch policy

Implemented in `canSwitchPaymentMethod()` (see `apps/api/src/services/payment-method-switch.ts`).

**Switch is DENIED when:**

- Payment method is locked (e.g. payment already confirmed).
- Order is already paid.
- Payment status is paid or COD collected.
- Desired method is the same as current.

**Switch to COD is DENIED when:**

- Merchant has not enabled COD.
- Any order product has COD disallowed.
- Order amount is below merchant COD min or above max.

**Switch may REQUIRE MERCHANT CONFIRMATION when:**

- Switching to COD and (merchant or product) requires manual COD confirmation.
- Payment switch count ≥ threshold (e.g. 2).

**Switch is ALLOWED** when none of the above block it and confirmation is not required (or request is from merchant_admin).

## API

- `POST /merchant/orders/:orderId/payment-method/switch` with `{ desired_method, requested_by? }`. Returns `{ ok, order }` or 400/202 with reason.

## AI and runtime

- AI must not offer COD if merchant has disabled it or product/order is ineligible.
- AI must not send bank/QR instructions if the order has switched to COD.
- AI must not request COD shipping details if switch was denied.
- Decisions must use the result of `canSwitchPaymentMethod()` and actual order state, not the latest message alone.
