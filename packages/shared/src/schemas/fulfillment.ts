import { z } from 'zod';
import { SHIPMENT_STATUS, SHIPMENT_METHOD } from '../constants.js';

const shipmentStatusEnum = z.enum([
  SHIPMENT_STATUS.PENDING,
  SHIPMENT_STATUS.SHIPPED,
  SHIPMENT_STATUS.IN_TRANSIT,
  SHIPMENT_STATUS.DELIVERED,
  SHIPMENT_STATUS.FAILED,
]);

const shipmentMethodEnum = z.enum([
  SHIPMENT_METHOD.COURIER_TRACKING,
  SHIPMENT_METHOD.LOCAL_DELIVERY,
  SHIPMENT_METHOD.PICKUP,
  SHIPMENT_METHOD.MANUAL_DISPATCH,
]);

export const createShipmentBodySchema = z.object({
  courier_name: z.string().max(255).nullable().optional(),
  shipment_method: shipmentMethodEnum.optional(),
  tracking_number: z.string().max(255).nullable().optional(),
  tracking_url: z.string().max(2048).nullable().optional(),
  shipping_note: z.string().max(2000).nullable().optional(),
  shipped_at: z.string().datetime().nullable().optional(),
});

export const updateShipmentBodySchema = z.object({
  courier_name: z.string().max(255).nullable().optional(),
  shipment_method: shipmentMethodEnum.optional(),
  tracking_number: z.string().max(255).nullable().optional(),
  tracking_url: z.string().max(2048).nullable().optional(),
  shipping_note: z.string().max(2000).nullable().optional(),
  shipment_status: shipmentStatusEnum.optional(),
  shipped_at: z.string().datetime().nullable().optional(),
  delivered_at: z.string().datetime().nullable().optional(),
});

export type CreateShipmentBody = z.infer<typeof createShipmentBodySchema>;
export type UpdateShipmentBody = z.infer<typeof updateShipmentBodySchema>;
