import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/verifyToken';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getQuestionsForMatchService } from '../services/question.service';
import {
  deleteUserDataService,
  generateConnectCodeService,
  getMyConnectCodeService,
  savePushTokenService,
  sendMatchRequestService,
  getMyMatchesService,
  getMatchByIdService,
  respondToMatchService,
  submitAnswersService,
  submitSingleAnswerService,
  getScoreService,
  getMessagesService,
  sendMessageService,
} from '../services/match.service';

export const deleteUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const secret = req.headers['x-internal-secret'];
    if (secret !== (process.env.INTERNAL_SECRET ?? '')) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    const { userId } = req.body;
    if (!userId) { res.status(400).json({ success: false, message: 'userId required' }); return; }
    await deleteUserDataService(userId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const savePushToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      sendError(res, 'token is required', 'INVALID_INPUT', 400);
      return;
    }
    await savePushTokenService(req.user!.userId, token);
    sendSuccess(res, 'Push token saved', {});
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to save push token', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const generateConnectCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const connectCode = await generateConnectCodeService(req.user!.userId);
    sendSuccess(res, 'Connect code generated', { connectCode });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to generate code', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const generateConnectCodeFlat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const connectCode = await generateConnectCodeService(req.user!.userId);
    sendSuccess(res, 'Connect code generated', {
      code: connectCode.code,
      expiresAt: connectCode.expiresAt.toISOString(),
    });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to generate code', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const getMyConnectCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const connectCode = await getMyConnectCodeService(req.user!.userId);
    sendSuccess(res, 'Connect code fetched', { connectCode });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to fetch code', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const sendMatchRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    if (!code) {
      sendError(res, 'Connect code is required', 'INVALID_INPUT', 400);
      return;
    }
    const match = await sendMatchRequestService(req.user!.userId, code);
    sendSuccess(res, 'Match request sent', { match }, 201);
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to send match request', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const connectByCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    if (!code) {
      sendError(res, 'Connect code is required', 'INVALID_INPUT', 400);
      return;
    }
    const match = await sendMatchRequestService(req.user!.userId, code);
    sendSuccess(res, 'Match request sent', {
      matchId: (match._id as any).toString(),
      partnerName: null,
    }, 201);
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to connect', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const getMyMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization ?? '';
    const matches = await getMyMatchesService(req.user!.userId, token);
    sendSuccess(res, 'Matches fetched', { matches });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to fetch matches', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const getMatchById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await getMatchByIdService(req.params.id, req.user!.userId);
    sendSuccess(res, 'Match fetched', { match });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to fetch match', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const acceptMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await respondToMatchService(req.params.id, req.user!.userId, 'accepted');
    sendSuccess(res, 'Match accepted', { match });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to accept match', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const rejectMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const match = await respondToMatchService(req.params.id, req.user!.userId, 'rejected');
    sendSuccess(res, 'Match rejected', { match });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to reject match', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const submitAnswers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      sendError(res, 'answers array is required', 'INVALID_INPUT', 400);
      return;
    }
    const result = await submitAnswersService(req.params.id, req.user!.userId, answers);
    sendSuccess(res, result.message, {});
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to submit answers', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const submitSingleAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId, optionId, matchId } = req.body;
    if (!questionId || !optionId || !matchId) {
      sendError(res, 'questionId, optionId, and matchId are required', 'INVALID_INPUT', 400);
      return;
    }
    const result = await submitSingleAnswerService(matchId, req.user!.userId, questionId, optionId);
    sendSuccess(res, 'Answer submitted', result);
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to submit answer', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const getScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const score = await getScoreService(req.params.id, req.user!.userId);
    sendSuccess(res, 'Score fetched', { score });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to fetch score', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const getScoreByQuery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matchId } = req.query;
    if (!matchId || typeof matchId !== 'string') {
      sendError(res, 'matchId is required', 'INVALID_INPUT', 400);
      return;
    }
    const score = await getScoreService(matchId, req.user!.userId);
    sendSuccess(res, 'Score fetched', score);
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to fetch score', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const getQuestionsFlat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matchId } = req.query;
    if (!matchId || typeof matchId !== 'string') {
      sendError(res, 'matchId is required', 'INVALID_INPUT', 400);
      return;
    }
    const data = await getQuestionsForMatchService(matchId, req.user!.userId);
    sendSuccess(res, 'Questions fetched', data);
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to fetch questions', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matchId } = req.query;
    if (!matchId || typeof matchId !== 'string') {
      sendError(res, 'matchId is required', 'INVALID_INPUT', 400);
      return;
    }
    const messages = await getMessagesService(matchId, req.user!.userId);
    sendSuccess(res, 'Messages fetched', { messages, matchId });
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to fetch messages', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, matchId } = req.body;
    if (!text || !matchId) {
      sendError(res, 'text and matchId are required', 'INVALID_INPUT', 400);
      return;
    }
    const message = await sendMessageService(matchId, req.user!.userId, req.user!.name, text);
    sendSuccess(res, 'Message sent', { message }, 201);
  } catch (err: any) {
    sendError(res, err.message ?? 'Failed to send message', err.error ?? 'SERVER_ERROR', err.status ?? 500);
  }
};
