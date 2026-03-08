// Sarvam-specific translation and learning tip logic
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// Sarvam Translate API language codes (blazing fast, no LLM overhead)
export const SARVAM_LANG_CODES: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  ur: "ur-IN",
  or: "od-IN",
  as: "as-IN",
  mai: "mai-IN",
  ne: "ne-IN",
  sa: "sa-IN",
  kok: "kok-IN",
  doi: "doi-IN",
  sd: "sd-IN",
  sat: "sat-IN",
  ks: "ks-IN",
  mni: "mni-IN",
  brx: "brx-IN",
};

export async function translateWithSarvam(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  const srcCode = SARVAM_LANG_CODES[sourceLang];
  const tgtCode = SARVAM_LANG_CODES[targetLang];

  if (!srcCode || !tgtCode || !SARVAM_API_KEY) return null;

  try {
    const res = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: srcCode,
        target_language_code: tgtCode,
        mode: "modern-colloquial",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.translated_text;
    }
  } catch (e) {
    console.error("Sarvam translate error:", e);
  }
  return null;
}

export async function generateTipWithSarvam(
  originalText: string,
  translatedText: string,
  srcName: string,
  tgtName: string
): Promise<string> {
  if (!SARVAM_API_KEY) return "";

  try {
    const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY,
        Authorization: `Bearer ${SARVAM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [
          {
            role: "user",
            content: `Original (${srcName}): "${originalText}"
Translation (${tgtName}): "${translatedText}"

Give ONE short language learning tip (max 15 words) about this ${srcName} text — a grammar pattern, word origin, cultural nuance, or literal meaning that helps someone learn ${srcName}. Reply with ONLY the tip, no thinking, no intro.`,
          },
        ],
        max_tokens: 60,
      }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    // The sarvam-m model often wraps the ENTIRE response in an unclosed <think> tag.
    // Strategy: strip the tags themselves but KEEP the content inside.
    const cleaned = raw
      .replace(/<think>[\s\S]*?<\/think>/gi, "")  // Remove closed <think>...</think> blocks
      .replace(/<\/?think>/gi, "")                 // Remove any remaining <think> or </think> tags
      .replace(/^["'\s\n]+|["'\s\n]+$/g, "")       // Trim quotes and whitespace
      .trim();
    return cleaned;
  } catch {
    return "";
  }
}
