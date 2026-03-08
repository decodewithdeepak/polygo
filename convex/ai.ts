import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { translateWithGoogle } from "./google";
import { translateWithSarvam, generateTipWithSarvam } from "./sarvam";
import { SARVAM_LANG_CODES } from "./shared";

// All language names for tip generation and routing
const ALL_LANG_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  ur: "Urdu",
  or: "Odia",
  as: "Assamese",
  mai: "Maithili",
  ne: "Nepali",
  sa: "Sanskrit",
  kok: "Konkani",
  doi: "Dogri",
  sd: "Sindhi",
  sat: "Santali",
  ks: "Kashmiri",
  mni: "Manipuri",
  brx: "Bodo",
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

/**
 * Routes translation based on language type:
 * - Indic <-> Indic uses Sarvam (Fastest)
 * - Anything involving Foreign (JA, ZH, etc.) uses Google Gemini (Reliable)
 */
async function translateFast(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const srcName = ALL_LANG_NAMES[sourceLang] || sourceLang;
  const tgtName = ALL_LANG_NAMES[targetLang] || targetLang;

  // 1. Try Sarvam (Indic Path)
  const sarvamTranslation = await translateWithSarvam(
    text,
    sourceLang,
    targetLang,
  );
  if (sarvamTranslation) return sarvamTranslation;

  // 2. Fallback to Google (Foreign/Mixed Path)
  // This handles characters that Sarvam is "blind" to (Japanese, etc.)
  return translateWithGoogle(text, srcName, tgtName);
}

/**
 * Generates a relevant language learning tip
 */
async function generateLearningTip(
  originalText: string,
  translatedText: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const srcName = ALL_LANG_NAMES[sourceLang] || sourceLang;
  const tgtName = ALL_LANG_NAMES[targetLang] || targetLang;

  // Use Google for foreign language tips as Sarvam struggles with non-Indic text
  const isForeign = !SARVAM_LANG_CODES[sourceLang];

  if (isForeign) {
    try {
      return await translateWithGoogle(
        `Original (${srcName}): "${originalText}"
Translation (${tgtName}): "${translatedText}"`,
        "Language Learning Assistant",
        `Short language tip (max 15 words) about the ${srcName} text (grammar/culture/nuance). Only the tip text.`,
      );
    } catch (e) {
      console.error("Google tip error:", e);
    }
  }

  // Use Sarvam's LLM for Indic language tips
  return generateTipWithSarvam(originalText, translatedText, srcName, tgtName);
}

export const processMessageAI = action({
  args: {
    messageId: v.id("messages"),
    text: v.string(),
    senderLang: v.string(),
    receiverLang: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Step 1: Check if translation is even needed (Auto-Detection)
      let translation = "";

      // Heuristic: if settings match, detect if we should translate anyway (e.g., Hindi chars in an English room)
      const hasHindi = /[\u0900-\u097F]/.test(args.text);
      const isEnglishOnly =
        args.senderLang === "en" && args.receiverLang === "en";

      let effectiveSourceLang = args.senderLang;
      if (isEnglishOnly && hasHindi) effectiveSourceLang = "hi";

      let shouldTranslate = effectiveSourceLang !== args.receiverLang;

      if (shouldTranslate) {
        translation = await translateFast(
          args.text,
          effectiveSourceLang,
          args.receiverLang,
        );
      }

      // Step 2: Save translation (if any)
      if (translation) {
        await ctx.runMutation((api as any).messages.updateAIResults, {
          messageId: args.messageId,
          translations: { [args.receiverLang]: translation },
          nuanceFlags: { hasNuance: false, type: "none", explanation: "" },
        });
      }

      // Step 3: Generate learning tip (async) using the best available model
      const tip = await generateLearningTip(
        args.text,
        translation || args.text,
        args.senderLang,
        args.receiverLang,
      );

      if (tip) {
        await ctx.runMutation((api as any).messages.updateAIResults, {
          messageId: args.messageId,
          translations: translation ? { [args.receiverLang]: translation } : {},
          nuanceFlags: { hasNuance: true, type: "learn", explanation: tip },
        });
      }
    } catch (error) {
      console.error("AI processing error:", error);
    }
  },
});
