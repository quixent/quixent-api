import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import {
  deleteUserData,
  savePushToken,
  generateConnectCode,
  generateConnectCodeFlat,
  getMyConnectCode,
  sendMatchRequest,
  connectByCode,
  getMyMatches,
  getMatchById,
  acceptMatch,
  rejectMatch,
  submitAnswers,
  submitSingleAnswer,
  getScore,
  getScoreByQuery,
  getQuestionsFlat,
  getMessages,
  sendMessage,
} from '../controllers/match.controller';

const router = Router();

// Original RESTful routes
router.post('/connect-code/generate', verifyToken, generateConnectCode);
router.get('/connect-code/my', verifyToken, getMyConnectCode);
router.post('/request', verifyToken, sendMatchRequest);

// Internal route — called by auth service on account deletion
router.delete('/user-data', deleteUserData);

// Flat routes matching frontend API client (must be before /:id wildcard)
router.post('/push-token', verifyToken, savePushToken);
router.post('/generate-code', verifyToken, generateConnectCodeFlat);
router.post('/connect-by-code', verifyToken, connectByCode);
router.get('/questions', verifyToken, getQuestionsFlat);
router.post('/answer', verifyToken, submitSingleAnswer);
router.get('/score', verifyToken, getScoreByQuery);
router.get('/messages', verifyToken, getMessages);
router.post('/message', verifyToken, sendMessage);

// Match list
router.get('/', verifyToken, getMyMatches);
router.get('/matches', verifyToken, getMyMatches);

// Match-specific routes (/:id must be last)
router.get('/:id', verifyToken, getMatchById);
router.put('/:id/accept', verifyToken, acceptMatch);
router.put('/:id/reject', verifyToken, rejectMatch);
router.post('/:id/answers', verifyToken, submitAnswers);
router.get('/:id/score', verifyToken, getScore);

export default router;
