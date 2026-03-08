/**
 * google.ts — Translation engine using Google Gemini 2.0 Flash.
 * Used for high-reliability translations involving foreign languages (JA, ZH, FR, etc.)
 * were Sarvam's Indic-first model might struggle.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function translateWithGoogle(
  text: string,
  sourceLangName: string,
  targetLangName: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  /** 
   * Speed & Quota Optimization: 
   * 1. 3.1-flash-lite-preview: Experimental absolute fastest
   * 2. 3.1-flash-preview: High speed/quality preview
   * 3. 2.5-flash-lite: Fastest stable
   * 4. 2.5-flash: Stable workhouse
   */
  const models = [
    "gemini-3.1-flash-lite-preview",
    "gemini-3.1-flash-preview",
    "gemini-2.5-flash-lite", 
    "gemini-2.5-flash", 
    "gemini-2.0-flash-lite", 
    "gemini-2.0-flash"
  ];
  
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Translate this message from ${sourceLangName} to ${targetLangName}: "${text}".
    Reply with ONLY the translated text. Do not include any explanations, tone markers, or reasoning tags.`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 200,
              temperature: 0.1,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        return content.replace(/^["']+|["']+$/g, "").trim();
      }
      
      const errorText = await res.text();
      console.warn(`Gemini (${model}) failed: ${res.status}. Error: ${errorText}`);
      
      // If we got a 429 quota error, continue to the next model
      if (res.status === 429) continue;
      
    } catch (e) {
      console.error(`Error calling Gemini (${model}):`, e);
    }
  }

  throw new Error("All Gemini model fallback attempts failed.");
}

/**
 * generateWithGemini — General-purpose text generation via Gemini.
 * Used for AI reply suggestions, contextual replies, etc.
 */
export async function generateWithGemini(
  prompt: string,
  maxTokens = 120,
): Promise<string> {
  if (!GEMINI_API_KEY) return "";

  const models = [
    "gemini-3.1-flash-lite-preview",
    "gemini-3.1-flash-preview",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
  ];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        return (
          data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""
        );
      }
      if (res.status !== 429) break;
    } catch (e) {
      console.error(`generateWithGemini (${model}) error:`, e);
    }
  }
  return "";
}
