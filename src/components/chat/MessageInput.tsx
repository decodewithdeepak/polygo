/**
 * MessageInput — The text input area for composing and sending messages.
 * Props: onSendMessage callback that receives the message content string.
 *
 * Handles the Enter/Shift+Enter keyboard behavior:
 *   - Enter = send message (most common action, should be fastest)
 *   - Shift+Enter = insert newline (for multi-line messages)
 * This matches the behavior users expect from Slack, Discord, and WhatsApp Web.
 *
 * TYPING INDICATOR INTEGRATION:
 * This component receives `notifyTyping` and `notifyStopped` callbacks from the
 * useTypingIndicator hook (injected by the parent page). It calls notifyTyping
 * on every keystroke and notifyStopped when a message is sent. The debounce
 * logic lives in the hook, NOT here — this keeps MessageInput focused on input.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const SURPRISE_MESSAGES: Record<string, string[]> = {
    en: ["Hey! How's your day going? 😊", "What's up! Hope you're having a great time! ✨", "Hi there! Anything fun happening today? 🎉", "Hope you're doing awesome! 💪", "Just wanted to say hello! 👋"],
    hi: ["अरे! कैसे हो? 😊", "नमस्ते! आज कैसा दिन चल रहा है? ✨", "क्या हाल है दोस्त? 🎉", "बस हैलो कहना था! 👋", "उम्मीद है सब बढ़िया है! 💪"],
    bn: ["হ্যালো! কেমন আছো? 😊", "কী খবর? আশা করি ভালো আছো! ✨", "আজ কেমন দিন যাচ্ছে? 🎉"],
    ta: ["வணக்கம்! எப்படி இருக்கீங்க? 😊", "என்ன விசேஷம்? ✨", "நல்லா இருக்கீங்களா? 🎉"],
    te: ["హాయ్! ఎలా ఉన్నారు? 😊", "ఏంటి విశేషం? ✨", "బాగున్నారా? 🎉"],
    mr: ["नमस्कार! कसे आहात? 😊", "काय चाललंय? ✨", "मजेत आहात ना? 🎉"],
    gu: ["હેલો! કેમ છો? 😊", "શું ચાલે છે? ✨", "મજામાં છો? 🎉"],
    kn: ["ಹಾಯ್! ಹೇಗಿದ್ದೀರಾ? 😊", "ಏನು ವಿಶೇಷ? ✨", "ಚೆನ್ನಾಗಿದ್ದೀರಾ? 🎉"],
    ml: ["ഹായ്! എങ്ങനെ ഉണ്ട്? 😊", "എന്താ വിശേഷം? ✨", "സുഖമാണോ? 🎉"],
    pa: ["ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਕਿਵੇਂ ਹੋ? 😊", "ਕੀ ਹਾਲ ਹੈ? ✨", "ਮਜ਼ੇ ਵਿੱਚ ਹੋ? 🎉"],
    ur: ["ہیلو! کیسے ہو? 😊", "کیا حال ہے? ✨", "سب خیریت? 🎉"],
    ja: ["やあ！元気？😊", "こんにちは！調子どう？✨", "今日はいい日？🎉"],
    es: ["¡Hola! ¿Cómo estás? 😊", "¿Qué tal? ¡Espero que bien! ✨", "¡Saludos amigo! 🎉"],
    fr: ["Salut ! Comment ça va ? 😊", "Coucou ! Quoi de neuf ? ✨", "Hello ! Bonne journée ? 🎉"],
    de: ["Hallo! Wie geht's? 😊", "Hey! Was gibt's Neues? ✨", "Na, alles klar? 🎉"],
    zh: ["嗨！你好吗？😊", "最近怎么样？✨", "今天过得好吗？🎉"],
    ko: ["안녕! 잘 지내? 😊", "오늘 어때? ✨", "좋은 하루 보내고 있어? 🎉"],
    pt: ["Olá! Como vai? 😊", "E aí! Tudo bem? ✨", "Oi! Como está o dia? 🎉"],
    ru: ["Привет! Как дела? 😊", "Что нового? ✨", "Как настроение? 🎉"],
    ar: ["مرحبا! كيف حالك؟ 😊", "أهلاً! شو أخبارك؟ ✨", "يومك كيف؟ 🎉"],
    it: ["Ciao! Come stai? 😊", "Ehi! Come va? ✨", "Tutto bene? 🎉"],
};

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    // Typing indicator callbacks — injected from the parent page's useTypingIndicator hook
    // These are optional so MessageInput can still work without typing indicators
    onTyping?: () => void;
    onStoppedTyping?: () => void;
}

export default function MessageInput({ onSendMessage, onTyping, onStoppedTyping }: MessageInputProps) {
    const [messageContent, setMessageContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const me = useQuery(api.users.getMe);

    const handleSurprise = () => {
        const lang = me?.preferredLanguage || "en";
        const messages = SURPRISE_MESSAGES[lang] || SURPRISE_MESSAGES.en;
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setMessageContent(randomMsg);
        textareaRef.current?.focus();
    };

    // Auto-resize the textarea as the user types more lines
    // This creates a smooth expanding effect instead of a fixed-height box
    // with an ugly scrollbar appearing after 1 line
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height first so it can shrink when text is deleted
            textarea.style.height = "auto";
            // Set height to match content (scrollHeight = actual content height)
            // Cap at 150px to prevent the input from taking over the screen
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    }, [messageContent]);

    /**
     * handleSendMessage — Validates and sends the message.
     *
     * We trim whitespace to prevent sending empty or whitespace-only messages.
     * The isSending flag prevents double-sends if the user spams Enter.
     * After sending, we call onStoppedTyping to immediately clear the typing
     * indicator — the other user should see the message, not "typing...".
     */
    const handleSendMessage = async () => {
        // Don't send empty messages or messages that are only whitespace
        const trimmedContent = messageContent.trim();
        if (!trimmedContent || isSending) return;

        // Disable the input while sending to prevent double-sends
        // This is important because network requests take time, and
        // users might hit Enter multiple times thinking it didn't work
        setIsSending(true);

        try {
            onSendMessage(trimmedContent);
            setMessageContent(""); // Clear the input after sending

            // Immediately clear the typing indicator — the message is now sent,
            // so the other user should see the message appear, not "typing..."
            onStoppedTyping?.();
        } finally {
            setIsSending(false);
        }
    };

    /**
     * handleKeyDown — Keyboard shortcut handler.
     *
     * WHY Enter = send (not Shift+Enter):
     * In chat apps, the most frequent action is sending a single-line message.
     * Making Enter the "send" shortcut reduces friction for the 90% case.
     * Multi-line messages are less common, so they get the modifier key (Shift).
     *
     * This is the same pattern used by Slack, Discord, WhatsApp Web, and Telegram.
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent adding a newline
            handleSendMessage();
        }
        // If Shift+Enter is pressed, the default behavior (newline) happens naturally
    };

    /**
     * handleChange — Updates the message content and notifies typing status.
     *
     * We call onTyping on every keystroke. The debounce logic is in the
     * useTypingIndicator hook — it handles resetting the 2-second timer
     * so we don't need to worry about it here.
     */
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageContent(e.target.value);

        // Notify the typing indicator hook — it handles debouncing internally
        onTyping?.();
    };

    return (
        <div className="border-t border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-end gap-3">
                {/* Expanding textarea for message composition */}
                <textarea
                    ref={textareaRef}
                    value={messageContent}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isSending}
                    rows={1}
                    className="flex-1 resize-none overflow-hidden rounded-md border border-zinc-700 bg-zinc-800/40 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
                // resize-none: prevents manual resize handle (we auto-resize instead)
                // rows={1}: starts as a single line, expands automatically
                />

                {/* Surprise button — generates a friendly message in selected language */}
                <button
                    onClick={handleSurprise}
                    disabled={isSending}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-zinc-800/60 text-zinc-400 transition-all hover:bg-purple-600/20 hover:text-purple-400 disabled:cursor-not-allowed disabled:opacity-50 border border-zinc-700/50"
                    title="Surprise! Generate a friendly message"
                >
                    <Sparkles className="h-4 w-4" />
                </button>

                {/* Send button — visual alternative to pressing Enter */}
                <button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || isSending}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-900 transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 border border-zinc-200"
                // disabled when: empty message OR currently sending
                // flex-shrink-0: prevents the button from shrinking when textarea expands
                >
                    <SendHorizontal className="h-5 w-5" />
                </button>
            </div>

            {/* Keyboard shortcut hint */}
            <p className="mt-2 text-[10px] text-zinc-600">
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
}
