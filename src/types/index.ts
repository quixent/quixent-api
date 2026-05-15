export type Gender = 'male' | 'female';

export type MatchStatus = 'requested' | 'accepted' | 'rejected' | 'complete';

export interface IUser {
  _id: string;
  mobile: string;
  name: string;
  gender: Gender;
  age: number;
  createdAt: Date;
}

export interface IOtp {
  _id: string;
  mobile: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}

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
  data?: T;
  message?: string;
}

export interface JwtPayload {
  userId: string;
  mobile: string;
}
