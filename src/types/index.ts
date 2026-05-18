export type Gender = 'male' | 'female';

export interface IUser {
  _id: string;
  mobile: string;
  name: string;
  gender: Gender;
  age: number;
  city: string;
  bio: string;
  isActive: boolean;
  role: 'user' | 'admin';
  lastLogin: Date;
  createdAt: Date;
}

export interface IOtp {
  _id: string;
  mobile: string;
  code: string;
  attempts: number;
  expiresAt: Date;
}

export interface IToken {
  _id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface JwtPayload {
  userId: string;
  mobile: string;
}

export interface RefreshTokenPayload {
  userId: string;
}
