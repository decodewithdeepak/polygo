# Polygo: Multilingual Chat App

> **Translate words, preserve meaning.**

Polygo is a real-time web chat application designed for global teams. It solves the critical bottleneck of language barriers in hybrid work by providing auto-translation that understands cultural nuances and context, rather than just literal word-for-word replacement.

## 🚀 The Problem

Global teams often struggle with communication overhead when members speak different native languages. Traditional translation tools often miss context, tone, or cultural specificities, leading to misunderstandings. Polygo bridges this gap with an AI-driven, real-time experience.

---

## ✨ Core Features & Use Cases

### 1. Hybrid AI Translation

Polygo uses a dual-routing strategy for maximum speed and accuracy:

- **Indic-to-Indic**: Uses **Sarvam AI** for blazing-fast, colloquial translations between Indian languages.
- **Foreign/Mixed**: Fallback to **Google Gemini** for high-reliability translations involving Japanese, Chinese, Spanish, etc.
- **Use Case**: A developer in Bangalore can chat in Hindi with a designer in Tokyo who sees everything in Japanese instantly.

### 2. Cultural Nuance & Learning Tips

The app doesn't just translate; it explains. Using LLMs, it detects cultural nuances, grammar patterns, or word origins.

- **Use Case**: When a user sends a greeting like "Namaste," the recipient might see a tip explaining the cultural significance or the literal meaning ("I bow to you"), helping build cross-cultural empathy.

### 3. Sentiment-Aware Text-to-Speech (TTS)

Powered by Sarvam's **Bulbul v3** model, the TTS engine adjusts its tone based on message content:

- **Excitement**: Faster pace and higher expressiveness for messages with "!" or "wow".
- **Seriousness/Empathy**: Slower, more deliberate pace for longer or sensitive messages.
- **Use Case**: Hearing a "Thank you!" with an enthusiastic tone makes the interaction feel more human and less robotic.

### 4. Real-time Engine (Zero Latency)

Built on **Convex**, the app uses WebSockets for instant message delivery without polling or manual refreshes.

- **Use Case**: Large team brainstorming sessions where messages need to flow as fast as a natural conversation.

### 5. Smart Typing Indicators & Presence

Tracks user status (offline/online) and active typing states with auto-expiring indicators.

- **Use Case**: Reduces "double-typing" (two people replying at once) by showing exactly when someone is composing a response.

---

## AceHack 5.0 Submission Details

Polygo was built for **AceHack 5.0** and *targets* the following tracks:

### 1. Best Use of Gemini API

We leveraged **Gemini 2.5 Flash** for high-reliability translations and context-aware cultural nuance detection. Gemini acts as our "Language Specialist," extracting pedagogical tips from conversations to help users learn as they chat.

### 2. Best Use of Auth0

Polygo uses **Auth0** for secure, enterprise-grade authentication. We implemented role-based mutation guards in Convex to ensure that only authorized participants can read or send messages in a conversation.

### 3. Best Hack Built with Google Antigravity

This project was developed entirely within the **Google Antigravity** environment. Antigravity served as a pair-programmer, handling:

- **Complex Architecture Design**: Mapping out the Convex-Sarvam-Google hybrid routing.
- **Natural Language Refactoring**: Generating utility hooks and complex UI components through speech and text commands.
- **Context-Aware Debugging**: Instantly identifying and fixing race conditions in the Convex live-subscription logic.
- **Rapid Documentation**: Generating this comprehensive README and product documentation based on the full codebase context.

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Lucide React
- **Auth**: Auth0 (Next.js Auth0 SDK)

### Backend & Infrastructure

- **Database/Backend**: [Convex](https://www.convex.dev/) (Real-time sync, WebSockets)
- **Deployment**: Vercel

### AI & Voice

- **Indic Translation/TTS**: [Sarvam AI](https://www.sarvam.ai/) (Translate API & Bulbul v3)
- **Global Translation/LLM**: [Google Gemini](https://ai.google.dev/)
- **Detection**: Heuristic language and sentiment detection

---

## ⚙️ Getting Started

1. **Clone the repository**:

   ```bash
   git clone <repo-url>
   cd chat-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file with:

   ```env
   # Convex
   CONVEX_DEPLOYMENT_KEY=...
   NEXT_PUBLIC_CONVEX_URL=...

   # Auth0
   AUTH0_SECRET=...
   AUTH0_BASE_URL=...
   AUTH0_ISSUER_BASE_URL=...
   AUTH0_CLIENT_ID=...
   AUTH0_CLIENT_SECRET=...

   # AI Keys (Server-side)
   SARVAM_API_KEY=...
   GOOGLE_GENERATIVE_AI_API_KEY=...
   ```

4. **Run Development Mode**:
   ```bash
   npm run dev
   # In another terminal:
   npx convex dev
   ```

---

## 🛡 Security

- **Server-side Validation**: Every message read/write is validated on the Convex backend to ensure participant IDs match.
- **Privacy**: Soft-deleting messages clears all AI-generated translations and metadata to prevent privacy leaks.
