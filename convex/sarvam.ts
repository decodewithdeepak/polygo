import { action } from "./_generated/server";
import { v } from "convex/values";
import { SARVAM_LANG_CODES } from "./shared";

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

export async function translateWithSarvam(
  text: string,
  sourceLang: string,
  targetLang: string,
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
  tgtName: string,
  replyLangName?: string,
): Promise<string> {
  if (!SARVAM_API_KEY) return "";

  const outputLang = replyLangName || tgtName;

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

Give ONE short language learning tip (max 15 words) about this ${srcName} text — a grammar pattern, word origin, cultural nuance, or literal meaning that helps someone learn ${srcName}. Write the tip in ${outputLang}. Reply with ONLY the tip, no thinking, no intro.`,
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
      .replace(/<think>[\s\S]*?<\/think>/gi, "") // Remove closed <think>...</think> blocks
      .replace(/<\/?think>/gi, "") // Remove any remaining <think> or </think> tags
      .replace(/^["'\s\n]+|["'\s\n]+$/g, "") // Trim quotes and whitespace
      .trim();
    return cleaned;
  } catch {
    return "";
  }
}

/**
 * generateWithSarvam — General-purpose chat completion using sarvam-m.
 * Best for Indic languages; returns "" on failure so callers can fallback.
 */
export async function generateWithSarvam(
  prompt: string,
  maxTokens = 100,
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
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    return raw
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/<\/?think>/gi, "")
      .replace(/^["'\s\n]+|["'\s\n]+$/g, "")
      .trim();
  } catch {
    return "";
  }
}

/**
 * generateTTS — Converts text to speech using Sarvam's Bulbul v3 model.
 * Includes basic sentiment mapping for more "empathetic" speech.
 */
export const generateTTS = action({
  args: {
    text: v.string(),
    target_language_code: v.string(),
    speaker: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!SARVAM_API_KEY) {
      throw new Error("SARVAM_API_KEY is missing");
    }

    // Heuristic Sentiment Analysis (Simple for now)
    const text = args.text.toLowerCase();
    let pace = 1.0;
    let temperature = 0.6; // Expressiveness

    if (
      text.includes("!") ||
      text.includes("wow") ||
      text.includes("great") ||
      text.includes("happy")
    ) {
      pace = 1.15; // Faster for excitement
      temperature = 0.8;
    } else if (
      text.includes("sorry") ||
      text.includes("sad") ||
      text.includes("please") ||
      text.includes("...") ||
      text.length > 100
    ) {
      pace = 0.9; // Slower for serious/sad/long content
      temperature = 0.5;
    }

    try {
      const res = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": SARVAM_API_KEY,
        },
        body: JSON.stringify({
          text: args.text,
          target_language_code: args.target_language_code,
          speaker: args.speaker || "shubh", // "shubh" is default for v3
          model: "bulbul:v3",
          // audio_format: "WAV", // Removing for v3 as it might conflict with pace/temp
          pace: pace,
          temperature: temperature,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Sarvam TTS v3 Error:", res.status, errorText);
        throw new Error(`Sarvam TTS v3 failed: ${res.status}`);
      }

      const data = await res.json();
      return data.audios?.[0] || "";
    } catch (error) {
      console.error("TTS v3 action error:", error);
      throw error;
    }
  },
});
