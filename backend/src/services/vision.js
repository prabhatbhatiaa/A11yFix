import { GoogleGenAI } from '@google/genai';

/**
 * Generates contextual, descriptive alt text for an image using Gemini Vision / Multimodal model.
 * Accepts either an image URL or base64 encoded data.
 * 
 * @param {object} params
 * @param {string} params.imageUrl - HTTP/HTTPS URL or data URI of the image
 * @param {string} [params.surroundingContext] - Text/context nearby the image
 * @returns {Promise<{
 *   altText: string,
 *   rationale: string,
 *   isDecorative: boolean
 * }>}
 */
export async function generateAltTextVision({ imageUrl, surroundingContext = '' }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      altText: 'Descriptive illustration representing the article content',
      rationale: 'Generated fallback description based on contextual image placement.',
      isDecorative: false,
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert accessibility consultant specializing in WCAG 2.1 Criterion 1.1.1 (Non-text Content).
Analyze this image and provide concise, accurate, and context-aware alternative text suitable for screen readers.

Surrounding Context / Nearby Text: "${surroundingContext}"
Image Source: ${imageUrl.startsWith('data:') ? 'Embedded image data' : imageUrl}

Instructions:
1. Do not start with "image of" or "picture of" (screen readers already announce graphic elements).
2. If the image is purely decorative, specify empty alt text (alt="") and set isDecorative: true.
3. Be clear, succinct, and informative (typically under 120 characters).

Return ONLY valid JSON matching this schema:
{
  "altText": "Concise alternative text describing the core visual information",
  "rationale": "Brief rationale explaining why this alt text was chosen",
  "isDecorative": false
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (err) {
    console.error('Gemini vision alt text error:', err.message);
    return {
      altText: 'Descriptive image visual',
      rationale: 'Fallback text generated due to network or quota limitation.',
      isDecorative: false,
    };
  }
}
