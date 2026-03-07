/**
 * Shared constants used by both backend (Convex) and frontend.
 */

export const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export const SUPPORTED_LANGUAGES = [
  // Indic
  "en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa",
  "ur", "or", "as", "mai", "ne", "sa", "kok", "doi", "sd", "sat",
  "ks", "mni", "brx",
  // Foreign
  "ja", "es", "fr", "de", "zh", "ko", "pt", "ru", "ar", "it",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
