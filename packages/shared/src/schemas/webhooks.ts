import { z } from 'zod';

/** Facebook webhook query (verification). */
export const facebookWebhookQuerySchema = z.object({
  'hub.mode': z.literal('subscribe').optional(),
  'hub.verify_token': z.string().optional(),
  'hub.challenge': z.string().optional(),
});

/** Facebook webhook body (events). */
export const facebookWebhookBodySchema = z.object({
  object: z.string().optional(),
  entry: z
    .array(
      z.object({
        id: z.string(),
        time: z.number().optional(),
        messaging: z
          .array(
            z.object({
              sender: z.object({ id: z.string() }),
              recipient: z.object({ id: z.string() }),
              timestamp: z.number(),
              message: z
                .object({
                  mid: z.string().optional(),
                  text: z.string().optional(),
                  attachments: z
                    .array(
                      z.object({
                        type: z.string(),
                        payload: z.object({ url: z.string().url().optional() }).passthrough(),
                      })
                    )
                    .optional(),
                })
                .passthrough()
                .optional(),
              postback: z.object({ payload: z.string() }).passthrough().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

export type FacebookWebhookBody = z.infer<typeof facebookWebhookBodySchema>;
