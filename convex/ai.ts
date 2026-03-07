import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * processMessageAI — Unified AI Action using Gemini 1.5 Flash.
 * Performs both translation (into multiple languages) and nuance detection.
 */
export const processMessageAI = action({
    args: {
        messageId: v.id("messages"),
        text: v.string(),
        sourceLang: v.string(),
    },
    handler: async (ctx, args) => {
        if (!GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing. Skipping AI processing.");
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // We ask Gemini to handle everything in one shot for speed and lower token usage.
            const prompt = `
                Perform translation and nuance analysis for the following text.
                Text: "${args.text}"
                Source Language: ${args.sourceLang}
                
                1. Translate into these languages: hi (Hindi), ja (Japanese), es (Spanish), fr (French), de (German).
                2. Analyze for cultural nuances, idioms, irony, sarcasm, or tone.
                
                Respond ONLY with a JSON object in this format:
                {
                    "translations": {
                        "hi": "translation here",
                        "ja": "translation here",
                        "es": "translation here",
                        "fr": "translation here",
                        "de": "translation here"
                    },
                    "nuanceFlags": {
                        "hasNuance": boolean,
                        "type": "idiom" | "sarcasm" | "tone" | "none",
                        "explanation": "Brief explanation of any nuance detected."
                    }
                }
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Invalid AI response format");
            
            const data = JSON.parse(jsonMatch[0]);

            // Save results back to the message via a mutation
            await ctx.runMutation((api as any).messages.updateAIResults, {
                messageId: args.messageId,
                translations: data.translations,
                nuanceFlags: data.nuanceFlags,
            });

        } catch (error) {
            console.error("Unified AI Processing failed:", error);
        }
    },
});
