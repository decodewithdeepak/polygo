const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const BLUE = "1A56DB";
const DARK = "1E293B";
const LIGHT_BLUE = "EFF6FF";
const ACCENT = "0EA5E9";
const GRAY = "64748B";
const TABLE_WIDTH = 9360;

const border = { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 32, color: BLUE, font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 26, color: DARK, font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 180, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, color: ACCENT, font: "Arial" })]
  });
}

function p(text, options = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK, ...options })]
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK })]
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK })]
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun("")] });
}

function callout(text, color = LIGHT_BLUE) {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [TABLE_WIDTH],
    rows: [new TableRow({
      children: [new TableCell({
        borders,
        width: { size: TABLE_WIDTH, type: WidthType.DXA },
        shading: { fill: color, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: [new Paragraph({
          children: [new TextRun({ text, size: 22, font: "Arial", color: DARK, italics: true })]
        })]
      })]
    })]
  });
}

function twoCol(left, right, leftWidth = 4680) {
  const rightWidth = TABLE_WIDTH - leftWidth;
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [leftWidth, rightWidth],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: leftWidth, type: WidthType.DXA },
          shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: left
        }),
        new TableCell({
          borders,
          width: { size: rightWidth, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: right
        })
      ]
    })]
  });
}

function stackTable(rows) {
  const colWidths = [2000, 3680, 3680];
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: ["Layer", "Technology", "Description"].map((h, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: BLUE, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: "FFFFFF", font: "Arial" })] })]
        }))
      }),
      ...rows.map(([layer, a, b], idx) => new TableRow({
        children: [layer, a, b].map((val, i) => new TableCell({
          borders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: i === 0 ? LIGHT_BLUE : (idx % 2 === 0 ? "F8FAFF" : "FFFFFF"), type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: val, size: 20, font: "Arial", color: DARK, bold: i === 0 })] })]
        }))
      }))
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
        ]
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.DECIMAL, text: "%1.%2.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
        ]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: DARK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: BLUE }, paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // TITLE PAGE
      new Paragraph({ spacing: { before: 480 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Polygo", bold: true, size: 72, color: BLUE, font: "Arial" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 60 }, children: [new TextRun({ text: "Product & Technical Documentation", size: 32, color: GRAY, font: "Arial" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 400 }, children: [new TextRun({ text: "Translating words, preserving meaning, building community", size: 24, color: GRAY, font: "Arial", italics: true })] }),

      callout("A comprehensive overview of Polygo's real-time multilingual capabilities, AI-driven translation routing, and future vision for enterprise integration."),

      spacer(),
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 1: OVERVIEW
      h1("1. Project Overview"),
      h2("Vision: Translate Words, Preserve Meaning"),
      p("In a globalized workforce, literal translation is rarely enough. Context, tone, and cultural nuances are the 'last mile' of communication that automated tools often miss. Polygo bridges this gap by combining blazing-fast Indic translation with high-reliability global models and AI-driven pedagogical insights."),
      spacer(),

      h2("Key Challenges Addressed"),
      bullet("Language silos in multinational development teams."),
      bullet("Accuracy trade-offs between speed and lexical depth."),
      bullet("Loss of cultural context in word-for-word translations."),
      bullet("Inorganic text-to-speech that lacks emotional resonance."),
      spacer(),

      h2("Market Opportunity"),
      p("With over 50% of global teams operating in hybrid or remote environments, the demand for integrated communication tools that support native languages is at an all-time high. Polygo targets the 'Language-First' demographic, specifically focusing on the Indian subcontinent's diverse linguistic landscape."),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 2: CORE FEATURES
      h1("2. Core Features & Use Cases"),

      h2("Feature 1: Hybrid AI Translation"),
      twoCol(
        [new Paragraph({ children: [new TextRun({ text: "Mechanism", bold: true, font: "Arial" })] }), p("Dual-routing strategy: Sarvam AI for fast Indic-to-Indic colloquialisms; Google Gemini for high-reliability global language support.")],
        [new Paragraph({ children: [new TextRun({ text: "Use Case", bold: true, font: "Arial" })] }), p("A PM in Delhi chats in Hindi; a developer in Tokyo sees Japanese instantly. Response arrives back in Hindi with near-zero latency.")]
      ),
      spacer(),

      h2("Feature 2: Cultural Nuance Detection"),
      twoCol(
        [new Paragraph({ children: [new TextRun({ text: "Mechanism", bold: true, font: "Arial" })] }), p("LLM-powered secondary analysis that generates 'Learning Tips' about grammar, word origin, or cultural context.")],
        [new Paragraph({ children: [new TextRun({ text: "Use Case", bold: true, font: "Arial" })] }), p("Understanding that 'Jai Hind' is more than just 'Victory to India'—learning the historical weight behind the greeting while chatting.")]
      ),
      spacer(),

      h2("Feature 3: Sentiment-Aware TTS"),
      twoCol(
        [new Paragraph({ children: [new TextRun({ text: "Mechanism", bold: true, font: "Arial" })] }), p("Sarvam Bulbul v3 with dynamic adjustment of 'pace' and 'temperature' based on heuristic sentiment analysis of the text.")],
        [new Paragraph({ children: [new TextRun({ text: "Use Case", bold: true, font: "Arial" })] }), p("Hearing a 'Good job!' in an enthusiastic, faster tone vs. a 'Please review' in a steady, professional cadence.")]
      ),
      spacer(),

      h2("Feature 4: Live WebSocket Sync"),
      twoCol(
        [new Paragraph({ children: [new TextRun({ text: "Mechanism", bold: true, font: "Arial" })] }), p("Convex-powered real-time synchronization with typing indicators and auto-expiring presence tracking.")],
        [new Paragraph({ children: [new TextRun({ text: "Use Case", bold: true, font: "Arial" })] }), p("Seamless team brainstorming where participants see who is typing and receive translations without hitting 'refresh'.")]
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 3: TECH STACK
      h1("3. Technical Implementation"),
      h2("The Modern Web Architecture"),
      p("Polygo is built on a 'Backend-as-a-Service' model to prioritize real-time features and developer velocity while maintaining enterprise-grade security."),
      spacer(),
      stackTable([
        ["Frontend", "Next.js 15 + React 19 + TypeScript", "Propelling UI performance with App Router and Server Components."],
        ["Styling", "Tailwind CSS + Lucide Icons", "Clean, dark-mode first interface with responsive layouts."],
        ["Backend", "Convex (Real-time Database)", "Eliminates polling; handles WebSockets and state synchronization natively."],
        ["Auth", "Auth0 (Next.js SDK)", "Secure JWT-based authentication with role-aware mutations."],
        ["Translation", "Sarvam AI + Google Gemini", "Tiered fallback: Gemini 3.1 Flash, 2.5 Flash, and 2.0 Flash for zero-latency."],
        ["Voice", "Sarvam Bulbul v3 (TTS)", "Empathetic text-to-speech with heuristic sentiment mapping."],
        ["Learning", "Gemini 2.0/2.5 Flash", "Contextual nuance extraction and pedagogical tip generation."],
      ]),
      spacer(),

      h2("Data Sovereignty & Security"),
      bullet("RBAC: Every Convex mutation verifies user participation in a conversation."),
      bullet("Privacy: Soft-deletion clears all AI translations and metadata to prevent leaks."),
      bullet("Latency: Use of Edge functions for AI processing to minimize round-trip times."),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 4: DEPLOYMENT & SETUP
      h1("4. Setup & Integration"),
      h2("Prerequisites"),
      bullet("Auth0 Account & Dashboard access"),
      bullet("Convex Cloud Project"),
      bullet("Sarvam AI API Subscription-Key"),
      bullet("Google AI Studio (Gemini) API Key"),
      spacer(),

      h2("One-Line Setup"),
      callout("npm install && npx convex dev --which will automatically Provision your backend and start the dev server."),
      spacer(),

      h2("Future Roadmap: Enterprise & SaaS"),
      numbered("Polygo API (B2B SaaS): Unified translation infrastructure for developer integration into apps like Slack, Teams, or custom internal dashboards."),      numbered("Global Support Integration: High-impact use case for BPOs and customer support. Example: Enabling an support agent in India to assist a US-based Spanish-speaking customer using real-time local-to-foreign translation."),      numbered("Integration Plugins: Out-of-the-box support for Zendesk, Intercom, and WhatsApp Business for global customer support."),
      numbered("Flexible Monetization: Usage-based pricing model ($0.05/message) with tiered subscriptions and Enterprise volume plans."),
      numbered("Enterprise Dictionary: Private 'Nuance Dictionary' where companies can upload internal jargon for AI training and domain-specific translation."),

      spacer(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240 },
        children: [new TextRun({ text: "Polygo: Enabling the world to speak one language — the language of context.", bold: true, size: 24, color: BLUE, font: "Arial", italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("Polygo_Product_Documentation.docx", buffer);
  console.log("Documentation Generated: Polygo_Product_Documentation.docx");
});