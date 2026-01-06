
import { ProgressionMessage, MemoryCard, ClarificationCard, DoubtTile, NoticeCard, PromiseCard, CornerNode, OptionalContainer } from './types';

export const PROGRESSION_MESSAGES: ProgressionMessage[] = [
  { id: 1, text: "I messed up." },
  { id: 2, text: "Not in feelings..." },
  { id: 3, text: "But in how I spoke." }
];

export const NO_REBUTTALS = [
  "Then let me try again… because I didn’t explain it well.",
  "You were never less.",
  "You were never compared.",
  "I chose you."
];

export const MEMORY_CARDS: MemoryCard[] = [
  { id: 1, text: "Choosing you" },
  { id: 2, text: "Trusting you" },
  { id: 3, text: "Being with you" },
  { id: 4, text: "Standing by you" }
];

export const CLARIFICATION_CARDS: ClarificationCard[] = [
  {
    id: 'meant',
    title: 'What I Meant',
    content: 'That you matter to me completely.'
  },
  {
    id: 'said',
    title: 'What I Said',
    content: 'Something that made you feel less.'
  },
  {
    id: 'should',
    title: 'What I Should Have Said',
    content: 'That no situation, no person, no moment ever put you below first place.'
  }
];

export const VALUES_TEXT = [
  "I don’t follow labels or movements blindly.",
  "What I care about is how people in my life are treated.",
  "Especially you.",
  "For me, respect isn’t a slogan — it’s action.",
  "Every woman in my life deserves space, voice, safety, and the chance to prove herself.",
  "Not because of ideology.",
  "But because that’s the standard I hold myself to."
];

export const DOUBT_TILES: DoubtTile[] = [
  { id: 'importance', title: 'Your importance', revealedText: 'You are the priority, always.' },
  { id: 'place', title: 'Your place', revealedText: 'First place was never a competition.' },
  { id: 'value', title: 'Your value', revealedText: 'Beyond what any words can measure.' },
  { id: 'presence', title: 'Your presence', revealedText: 'It is the only part of my day that feels certain.' }
];

export const REALITY_TEXT = [
  "Today is January 6th.",
  "I have my maths end-semester exam on the 8th.",
  "I still have around 70% of the syllabus left.",
  "But I chose to build this.",
  "Not because it was easier.",
  "Because you matter more than comfort."
];

export const NOTICE_CARDS: NoticeCard[] = [
  { id: 'pres', title: 'Your presence', content: 'The air feels different when you are around.' },
  { id: 'care', title: 'The way you care', content: 'It is subtle, but it never goes unnoticed.' },
  { id: 'hon', title: 'Your honesty', content: 'It challenges me to be better every single day.' },
  { id: 'str', title: 'Your strength', content: 'You carry yourself with a grace I deeply admire.' }
];

export const PROMISE_CARDS: PromiseCard[] = [
  { id: 'listen', title: 'I’ll listen first', content: 'I will pause before I react, ensuring your voice is fully heard.' },
  { id: 'slow', title: 'I’ll slow down', content: 'If things feel heavy, I will match your pace, not force my own.' },
  { id: 'protect', title: 'I’ll protect your feelings', content: 'Your emotional safety is a boundary I will never cross again.' }
];

// Phase 5 Additions
export const MICRO_MESSAGES = [
  "Still here.",
  "No rush.",
  "I meant it.",
  "Take your time.",
  "Always choosing you.",
  "You are safe here.",
  "Breathe slowly.",
  "I'm listening."
];

export const CORNER_NODES: CornerNode[] = [
  { id: 'tl', position: 'top-left', message: "I'm holding space for you." },
  { id: 'tr', position: 'top-right', message: "You deserve this peace." },
  { id: 'bl', position: 'bottom-left', message: "No expectations, just presence." },
  { id: 'br', position: 'bottom-right', message: "I appreciate you being here." }
];

export const OPTIONAL_CONTAINERS: OptionalContainer[] = [
  { id: 'opt1', title: "A quiet thought", content: "Sometimes words aren't enough, but I'll keep trying anyway." },
  { id: 'opt2', title: "Why this matters", content: "Because building something for you feels more natural than anything else." },
  { id: 'opt3', title: "The silence", content: "Silence between us should feel like a blanket, not a wall." }
];

export const EXTRA_LAYER_CONTENT = "I wanted this to be a place you could come back to whenever you felt a bit of doubt. It's not a one-time thing. It's a standing promise.";
