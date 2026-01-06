
export enum Scene {
  ENTRY = 'ENTRY',
  PROGRESSION = 'PROGRESSION',
  QUESTION_1 = 'QUESTION_1',
  LOYALTY = 'LOYALTY',
  AFFIRMATION = 'AFFIRMATION',
  TRANSITION_TO_SCROLL = 'TRANSITION_TO_SCROLL',
  PHASE_2 = 'PHASE_2',
  END_GAME_POPUP = 'END_GAME_POPUP'
}

export interface ProgressionMessage {
  id: number;
  text: string;
}

export interface MemoryCard {
  id: number;
  text: string;
}

export interface ClarificationCard {
  id: string;
  title: string;
  content: string;
}

export interface DoubtTile {
  id: string;
  title: string;
  revealedText: string;
}

export interface NoticeCard {
  id: string;
  title: string;
  content: string;
}

export interface PromiseCard {
  id: string;
  title: string;
  content: string;
}

export interface CornerNode {
  id: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  message: string;
}

export interface OptionalContainer {
  id: string;
  title: string;
  content: string;
}
