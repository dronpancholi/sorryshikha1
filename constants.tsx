
import { ProgressionMessage, MemoryCard, ClarificationCard } from './types';

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
