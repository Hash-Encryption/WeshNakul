export interface CaptainCandidate {
  id: string;
  nickname: string;
  initial: string;
  color: string;
  weight: number;
}

export type CaptainEventStatus =
  | 'idle'
  | 'spinning'
  | 'initial_result_provisional'
  | 'objection_window'
  | 'reroll_vote_open'
  | 'reroll_approved'
  | 'finalized';

export type CaptainVoteType = 'approve' | 'reject';

export interface CaptainEventState {
  eventId: string;
  status: CaptainEventStatus;
  provisionalCaptainId: string;
  provisionalCaptainNickname: string;
  finalCaptainId?: string | null;
  finalCaptainNickname?: string | null;
  requesterParticipantId?: string | null;
  requesterNickname?: string | null;
  frozenVoterIds: string[];
  votes: Record<string, CaptainVoteType>;
  approvals: number;
  rejections: number;
  requiredApprovals: number;
  voterCount: number;
  objectionEndsAt?: string | null;
  voteEndsAt?: string | null;
  hasRerolled: boolean;
  candidates: CaptainCandidate[];
  finalDecision?: 'approved' | 'rejected' | 'uncontested' | null;
}

export type CaptainRealtimeMessage =
  | {
      type: 'captain_spin_start';
      eventId: string;
      provisionalWinnerId: string;
      candidates: CaptainCandidate[];
      objectionEndsAt: string;
    }
  | {
      type: 'captain_reroll_requested';
      eventId: string;
      requesterParticipantId: string;
      requesterNickname: string;
      voteEndsAt: string;
      requiredApprovals: number;
      voterCount: number;
      votes: Record<string, CaptainVoteType>;
    }
  | {
      type: 'captain_vote_cast';
      eventId: string;
      votes: Record<string, CaptainVoteType>;
      approvals: number;
      rejections: number;
    }
  | {
      type: 'captain_finalized';
      eventId: string;
      finalDecision: 'approved' | 'rejected' | 'uncontested';
      finalCaptainId: string;
      finalCaptainNickname: string;
      hasRerolled: boolean;
    };
