export type MatchStatus = 'requested' | 'accepted' | 'rejected' | 'complete';

export interface IOption {
  _id: string;
  text: string;
  weight: number;
}

export interface IQuestion {
  _id: string;
  text: string;
  order: number;
  options: IOption[];
}

export interface IMatch {
  _id: string;
  senderId: string;
  receiverId: string;
  status: MatchStatus;
  createdAt: Date;
}

export interface IAnswer {
  _id: string;
  matchId: string;
  userId: string;
  questionId: string;
  optionId: string;
}

export interface ActiveMatch {
  matchId: string;
  status: MatchStatus;
  partner: { name: string; gender: string; age: number } | null;
  progress: {
    totalQuestions: number;
    myAnswers: number;
    partnerAnswers: number;
  };
  messageCount: number;
}

export interface ChatMessage {
  _id: string;
  senderId: { _id: string; name: string };
  text: string;
  createdAt: string;
}

export interface ScoreResult {
  compatibility: number;
  totalQuestions: number;
  answeredByYou: number;
  answeredByPartner: number;
  breakdown: {
    questionId: string;
    questionText: string;
    yourOption: string;
    partnerOption: string;
    points: number;
  }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
