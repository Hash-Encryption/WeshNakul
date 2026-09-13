export interface DecisionSpin {
  spinId: string;
  kind: 'category' | 'restaurant';
  candidateIds: string[];
  startedAt: number;
  plannedRevealAt: number;
  winnerId?: string;
  revealAt?: number;
  completeAt?: number;
  cancelled?: boolean;
}
