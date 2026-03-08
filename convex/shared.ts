/**
 * Shared constants used by both backend (Convex) and frontend.
 */

export const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export const SUPPORTED_LANGUAGES = [
  // Indic
  "en",
  "hi",
  "bn",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
  "ur",
  "or",
  "as",
  "mai",
  "ne",
  "sa",
  "kok",
  "doi",
  "sd",
  "sat",
  "ks",
  "mni",
  "brx",
  // Foreign
  "ja",
  "es",
  "fr",
  "de",
  "zh",
  "ko",
  "pt",
  "ru",
  "ar",
  "it",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

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
