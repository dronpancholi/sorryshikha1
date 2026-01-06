
export enum Scene {
  ENTRY = 'ENTRY',
  PROGRESSION = 'PROGRESSION',
  QUESTION_1 = 'QUESTION_1',
  LOYALTY = 'LOYALTY',
  AFFIRMATION = 'AFFIRMATION',
  TRANSITION_TO_SCROLL = 'TRANSITION_TO_SCROLL',
  PHASE_2 = 'PHASE_2'
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
