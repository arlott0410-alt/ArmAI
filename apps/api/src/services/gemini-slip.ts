/**
 * Slip image extraction via Gemini 1.5 Flash.
 * Returns normalized SlipExtraction; does NOT set order to paid.
 */

import type { SlipExtraction } from '@armai/shared';

export async function extractSlipFromImage(
  imageBytes: ArrayBuffer,
  apiKey: string
): Promise<SlipExtraction> {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: 'Extract from this transfer slip image: amount (number), sender name, date/time, reference code. Reply with JSON only: {"amount": number or null, "sender_name": string or null, "datetime": ISO string or null, "reference_code": string or null, "confidence_score": 0-1}' },
              { inline_data: { mime_type: 'image/jpeg', data: base64 } },
            ],
          },
        ],
        generationConfig: { response_mime_type: 'application/json' },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  const amount = typeof parsed.amount === 'number' ? parsed.amount : null;
  const sender_name = typeof parsed.sender_name === 'string' ? parsed.sender_name : null;
  const datetime = typeof parsed.datetime === 'string' ? parsed.datetime : null;
  const reference_code = typeof parsed.reference_code === 'string' ? parsed.reference_code : null;
  const confidence_score = typeof parsed.confidence_score === 'number' ? parsed.confidence_score : 0;
  return {
    amount,
    sender_name,
    datetime,
    reference_code,
    confidence_score,
    raw_json: text,
  };
}
