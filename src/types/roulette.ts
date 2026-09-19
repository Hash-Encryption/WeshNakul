export interface DecisionSpin {
  spinId: string;
  kind: 'category' | 'restaurant';
  candidateIds: string[];
  winnerId?: string;
  error?: string;
  cancelled?: boolean;
  startedAt?: number;
  plannedRevealAt?: number;
  revealAt?: number;
  completeAt?: number;
}
