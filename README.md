# Polygo: Real-Time Multilingual Chat & Group Collaboration

> **Translate words, preserve meaning, build community.**

Polygo is an AI-powered real-time chat platform that breaks down language barriers for global teams and communities. By combining **Sarvam AI's** lightning-fast Indic translations with **Google Gemini's** global reach and cultural intelligence, Polygo ensures that nothing is lost in translation—not even sarcasm, idioms, or cultural nuances.

## The Vision

Traditional translation tools are "copy-paste" obstacles. Polygo is an **invisible layer** of understanding. In a Polygo group, 10 people can speak 10 different languages, and every single one of them sees the conversation in their native tongue as if it were written that way.

---

## Core Features

### WhatsApp-Style Group Chat
Communicate with dozens of people simultaneously across language boundaries.
- **Instant Group Creation**: Start a group, add members, and set a common purpose.
- **Multicast Translation**: A single message sent in Spanish is instantly broadcasted as Hindi to one member, Japanese to another, and Bengali to a third—all in parallel.
- **Admin Controls**: Creator-led group management with intuitive "Admin" labeling.

### Dual-Core AI Routing
We don't settle for one-size-fits-all AI. Polygo intelligently routes your messages:
- **The Indic Fast-Path**: Uses **Sarvam AI (Modern Colloquial)** for blazing-fast translations between English and 22 Indian languages (Hindi, Bengali, Tamil, etc.). 
- **The Global Specialist**: Routes foreign and complex mixed-language messages to **Google Gemini Flash** for high-fidelity global translation (Japanese, Spanish, French, etc.).

### Learn as You Chat (AI Insights)
Every translated message is an opportunity to learn. Our AI detects:
- **Cultural Nuances**: Explanations of honorifics, idioms, or local context.
- **Grammar Tips**: Short, 15-word insights in your native language about the original text.
- **Contextual Awareness**: The AI understands the full group conversation context to give accurate advice.

### Sentiment-Aware Voice (TTS)
Listen to your messages with human-like emotion using Sarvam's **Bulbul v3**.
- **Dynamic Pacing**: High-energy messages (e.g., "Great job!") are spoken faster; empathetic or serious messages are slowed down for impact.
- **6 Voice Personas**: High-quality regional voices that sound natural and engaging.

### Smart AI Assistant & Reply
- **Surprise Me**: Stuck for words? Generate a random, culturally appropriate greeting in your native language.
- **Contextual AI Reply**: One-click smart replies that analyze the last 6 messages (and who said them) to suggest a perfect response.

---

## AceHack 5.0 Submission Details

Polygo was built for **AceHack 5.0** and *targets* the following tracks:

### 1. Best Use of Gemini API

We leveraged **Gemini Flash Models** for high-reliability translations and context-aware cultural nuance detection. Gemini acts as our "Language Specialist," extracting pedagogical tips from conversations to help users learn as they chat.

### 2. Best Use of Auth0

Polygo uses **Auth0** for secure, enterprise-grade authentication. We implemented role-based mutation guards in Convex to ensure that only authorized participants can read or send messages in a conversation.

### 3. Best Hack Built with Google Antigravity

This project was developed entirely within the **Google Antigravity** environment. Antigravity served as a pair-programmer, handling:

- **Complex Architecture Design**: Mapping out the Convex-Sarvam-Google hybrid routing.
- **Natural Language Refactoring**: Generating utility hooks and complex UI components through speech and text commands.
- **Context-Aware Debugging**: Instantly identifying and fixing race conditions in the Convex live-subscription logic.
- **Rapid Documentation**: Generating this comprehensive README and product documentation based on the full codebase context.

---

## Future Roadmap: Polygo for Enterprise & Developers

Polygo is evolving from a standalone chat application into a powerful translation infrastructure.

### 1. Polygo API (B2B SaaS)
We are building a Unified Translation API that goes beyond literal text replacement. 
- **Developer Integration**: Integrate our dual-core (Sarvam + Gemini) routing into existing enterprise apps like Slack, Microsoft Teams, or custom internal dashboards.
- **Context-Aware Middle-ware**: An API that doesn't just return a string, but also returns the cultural context and grammatical tips as metadata.

### 2. Third-Party Chat Integration
- **Social & Support**: Plugins for Zendesk, Intercom, and WhatsApp Business to help customer support agents communicate with global users in their native tongue without hiring multilingual teams.
- **Enterprise Use Case (BPO/Support)**: A support agent in India can communicate with a customer in the USA seamlessly. The agent types in Hindi/English, and the customer sees fluent Spanish/French/Japanese, enabling "Virtual Global Operations" without language barriers.
- **SDKs**: Lightweight UI components (React/Mobile) for developers to drop "Polygo-enabled" chat boxes into their own products.

### 3. Monetization & Costs
Our SaaS model focuses on usage-based pricing with tiered subscriptions:
- **Starter**: Free for small teams up to 1000 messages/month.
- **Pro**: $0.005 per word (minimum $0.05 per message). Includes Nuance Detection and Sentiment-Aware TTS.
- **Enterprise**: Custom volume pricing ($0.002 - $0.003 per word) with dedicated infrastructure and fine-tuned models for industry-specific jargon.

### 4. Infrastructure Cost Breakdown (Tentative)
To maintain profitability, our margins are calculated based on current provider costs:
- **Sarvam AI (Indic)**: ~$0.0001 per token for Translation; ~$1.0 per 1M characters for Bulbul TTS.
- **Google Gemini (Global)**: ~$0.000125 per 1K tokens (Gemini 1.5 Flash) for global routing and reasoning.
- **Convex (Infrastructure)**: ~$25/month for Pro (covers 5M+ monthly WebSocket operations).
- **Auth0**: ~$0 per month for first 7,500 active users (Standard B2C).

### 5. Large-Scale Profitability Analysis
Polygo's margins significantly improve at high volumes because our infrastructure costs (Convex, Auth0) scale sub-linearly, while AI costs scale linearly with unit-based pricing.
- **Gross Margin**: At **$0.005/word** (Pro), our raw AI cost (Sarvam + Gemini) is approx **$0.0002 - $0.0004 per word**. This leaves a **~90% gross margin** per translated word.
- **The "Volume Advantage"**: As we move to the Enterprise tier ($0.002/word), our volume discounts with providers like Google and Sarvam reduce our COGS (Cost of Goods Sold) further, ensuring that even high-bandwidth power users remain profitable with a **60-70% margin**.
- **Fixed vs. Variable**: Our fixed costs (hosting/DB) are low, meaning profitability hits its stride once we cross the 500-seat mark.

### 6. Example: Community of 1,000 Users
If you run a community of **1,000 users** with **5,000 text messages** monthly (avg. 15 words/message):
- **Total Words**: 75,000 words.
- **Total Revenue (Pro @ $0.005/word)**: **$375.00**
- **Estimated Costs**:
  - **AI (Translation + Nuance)**: ~$22.50 (at $0.0003/word avg)
  - **Infrastructure (Convex + Auth0)**: ~$30.00 (Pro tiers)
- **Net Profit**: **$322.50 (~86% Margin)**

---

## Tech Stack

### Frontend & UI
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **State Management**: React Hooks & Context API
- **Styling**: Tailwind CSS (Shadcn UI + Radix UI)
- **Icons**: Lucide React

### Backend & Real-Time
- **Real-Time Database**: [Convex](https://www.convex.dev/) (WebSocket sync, ACID transactions)
- **Auth**: [Auth0](https://auth0.com/) (Secure JWT identity bridge)
- **Deployment**: Vercel

### AI Models
- **Sarvam AI**: Translate API (Indic), `sarvam-m` (LLM), Bulbul v3 (TTS).
- **Google Gemini**: `gemini-flash-latest` (Global translation & Reasoning).

---

## Getting Started

1. **Clone & Install**:
   ```bash
   git clone https://github.com/decodewithdeepak/polygo
   cd polygo
   npm install
   ```

2. **Environment Setup**: Create a `.env.local` file with:
   - `CONVEX_DEPLOYMENT`: Your Convex project URL
   - `SARVAM_API_KEY`: Your Sarvam AI key
   - `GEMINI_API_KEY`: Your Google AI Studio key
   - `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`: Your Auth0 credentials.

3. **Run Dev Server**:
   ```bash
   npx convex dev # In terminal A
   npm run dev    # In terminal B
   ```


---

## Security

- **Server-side Validation**: Every message read/write is validated on the Convex backend to ensure participant IDs match.
- **Privacy**: Soft-deleting messages clears all AI-generated translations and metadata to prevent privacy leaks.
