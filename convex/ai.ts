import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// Sarvam Translate API language codes (blazing fast, no LLM overhead)
const SARVAM_LANG_CODES: Record<string, string> = {
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

// For non-Indic languages, fall back to sarvam-m chat
const LANG_NAMES: Record<string, string> = {
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ko: "Korean",
  pt: "Portuguese",
  ru: "Russian",
  ar: "Arabic",
  it: "Italian",
};

async function translateFast(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  const srcCode = SARVAM_LANG_CODES[sourceLang];
  const tgtCode = SARVAM_LANG_CODES[targetLang];

  // Fast path: both languages supported by Sarvam Translate API (~100ms)
  if (srcCode && tgtCode) {
    const res = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: srcCode,
        target_language_code: tgtCode,
        mode: "modern-colloquial",
      }),
    });
    if (!res.ok) throw new Error(`Sarvam Translate error: ${res.status}`);
    const data = await res.json();
    return data.translated_text;
  }

  // Slow path: use sarvam-m chat for non-Indian languages (~1-2s)
  const targetName = LANG_NAMES[targetLang] || targetLang;
  const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "sarvam-m",
      messages: [
        { role: "user", content: `Translate to ${targetName}: "${text}"\nReply with ONLY the translation, nothing else.` },
      ],
      max_tokens: 150,
    }),
  });
  if (!res.ok) throw new Error(`Sarvam Chat error: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  // Strip <think> tags and quotes
  return content.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^["'\s]+|["'\s]+$/g, "").trim();
}

export const processMessageAI = action({
  args: {
    messageId: v.id("messages"),
    text: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
    if (!SARVAM_API_KEY) {
      console.error("SARVAM_API_KEY is missing. Skipping AI processing.");
      return;
    }

    try {
      const translation = await translateFast(
        args.text,
        args.sourceLang,
        args.targetLang,
        SARVAM_API_KEY
      );

      await ctx.runMutation((api as any).messages.updateAIResults, {
        messageId: args.messageId,
        translations: { [args.targetLang]: translation },
        nuanceFlags: { hasNuance: false, type: "none", explanation: "" },
      });
    } catch (error) {
      console.error("AI Translation failed:", error);
    }
  },
});
