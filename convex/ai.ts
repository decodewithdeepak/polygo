import { action } from "./_generated/server";
import { v } from "convex/values";
import * as deepl from "deepl-node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * processMessageAI — Orchestrates translation and nuance detection.
 *
 * This is a Convex Action, which runs in a Node.js environment.
 * It's called by the `messages:send` mutation after a message is successfully stored.
 */
export const processMessageAI = action({
    args: {
        messageId: v.id("messages"),
        text: v.string(),
        sourceLang: v.string(),
    },
    handler: async (ctx, args) => {
        if (!DEEPL_API_KEY || !GEMINI_API_KEY) {
            console.error("AI API keys are missing. Skipping processing.");
            return;
        }

        try {
            // ─── 1. Translation (DeepL) ──────────────────────────────────────
            const translator = new deepl.Translator(DEEPL_API_KEY);
            const targetLanguages: string[] = ["hi", "ja", "es", "fr", "de"];
            
            const translations: Record<string, string> = {};
            
            // Translate into each target language
            await Promise.all(
                targetLanguages.map(async (lang) => {
                    const result = await translator.translateText(args.text, null, lang as deepl.TargetLanguageCode);
                    translations[lang] = result.text;
                })
            );

            // ─── 2. Nuance Detection (Gemini) ──────────────────────────────
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Analyze the following message for cultural nuances, idioms, irony, sarcasm, or tone that might be lost in translation.
                Message: "${args.text}"
                
                Respond ONLY with a JSON object in this format:
                {
                    "hasNuance": boolean,
                    "type": "idiom" | "sarcasm" | "tone" | "none",
                    "explanation": "A short, simple explanation of the nuance for a non-native speaker."
                }
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Extract JSON from response (Gemini sometimes wraps it in markdown blocks)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const nuanceFlags = jsonMatch ? JSON.parse(jsonMatch[0]) : { hasNuance: false };

            // ─── 3. Save results back to the message ───────────────────────
            await ctx.runMutation((api as any).messages.updateAIResults, {
                messageId: args.messageId,
                translations,
                nuanceFlags,
            });

        } catch (error) {
            console.error("AI Processing failed:", error);
        }
    },
});
