import { Router, Response } from 'express';
import { authGuard, AuthRequest } from '../middleware/auth';
import Match from '../models/Match';
import ConnectCode from '../models/ConnectCode';
import Question from '../models/Question';
import Answer from '../models/Answer';
import User from '../models/User';
import Message from '../models/Message';

const router = Router();

// POST /api/match/generate-code — generate a 6-digit connect code for the current user
router.post('/generate-code', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // If already in an active match, no need to generate a code
    const active = await Match.findOne({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: { $in: ['accepted', 'complete'] },
    });
    if (active) {
      res.status(400).json({ success: false, message: 'You are already connected with a partner.' });
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await ConnectCode.findOneAndUpdate(
      { userId },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { code, expiresAt } });
  } catch (err) {
    console.error('generate-code error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/match/connect-by-code — enter partner's 6-digit code to connect
router.post('/connect-by-code', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { code } = req.body;

    if (!code || !/^\d{6}$/.test(String(code))) {
      res.status(400).json({ success: false, message: 'Please enter a valid 6-digit code.' });
      return;
    }

    const connectCode = await ConnectCode.findOne({ code: String(code), expiresAt: { $gt: new Date() } });
    if (!connectCode) {
      res.status(404).json({ success: false, message: 'Code not found or expired. Ask your partner for a new code.' });
      return;
    }

    const partnerId = connectCode.userId.toString();

    if (userId === partnerId) {
      res.status(400).json({ success: false, message: 'Cannot connect with yourself.' });
      return;
    }

    const partner = await User.findById(partnerId).select('name');
    if (!partner) {
      res.status(404).json({ success: false, message: 'Partner account not found.' });
      return;
    }

    // If already connected to each other — return existing match
    const existingBetweenThem = await Match.findOne({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
      status: { $in: ['accepted', 'complete'] },
    });
    if (existingBetweenThem) {
      await ConnectCode.deleteOne({ _id: connectCode._id });
      res.json({ success: true, data: { matchId: existingBetweenThem._id, partnerName: partner.name } });
      return;
    }

    // Block if either is connected with someone else
    const myActive = await Match.findOne({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: { $in: ['accepted', 'complete'] },
    });
    if (myActive) {
      res.status(400).json({ success: false, message: 'You are already connected with a partner.' });
      return;
    }

    const partnerActive = await Match.findOne({
      $or: [{ senderId: partnerId }, { receiverId: partnerId }],
      status: { $in: ['accepted', 'complete'] },
    });
    if (partnerActive) {
      res.status(400).json({ success: false, message: 'This person is already connected with someone else.' });
      return;
    }

    const match = await Match.create({ senderId: userId, receiverId: partnerId, status: 'accepted' });
    await ConnectCode.deleteOne({ _id: connectCode._id });

    res.status(201).json({ success: true, data: { matchId: match._id, partnerName: partner.name } });
  } catch (err) {
    console.error('connect-by-code error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// GET /api/match/browse
router.get('/browse', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const me = await User.findById(req.user!.userId);
  if (!me || !me.gender) {
    res.status(400).json({ success: false, message: 'Complete your profile first' });
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const oppositeGender = me.gender === 'male' ? 'female' : 'male';

  // Exclude only non-rejected interactions
  const existingMatches = await Match.find({
    $or: [{ senderId: me._id }, { receiverId: me._id }],
    status: { $nin: ['rejected'] },
  });
  const excludeIds = existingMatches.flatMap((m) => [
    m.senderId.toString(),
    m.receiverId.toString(),
  ]);
  excludeIds.push(me._id.toString());

  const users = await User.find({
    gender: oppositeGender,
    name: { $ne: '' },
    _id: { $nin: excludeIds },
  })
    .select('_id name age gender city bio')
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({
    gender: oppositeGender,
    name: { $ne: '' },
    _id: { $nin: excludeIds },
  });

  res.json({
    success: true,
    data: { users, page, totalPages: Math.ceil(total / limit), total },
  });
});

// GET /api/match/profile/:userId
router.get('/profile/:userId', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.userId).select('_id name age gender city bio');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: { user } });
});

// POST /api/match/request/:userId
router.post('/request/:userId', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const me = await User.findById(req.user!.userId);
  const target = await User.findById(req.params.userId);

  if (!me || !target) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  if (me._id.toString() === target._id.toString()) {
    res.status(400).json({ success: false, message: 'Cannot send interest to yourself' });
    return;
  }
  if (me.gender === target.gender) {
    res.status(400).json({ success: false, message: 'Can only connect with opposite gender' });
    return;
  }

  const existing = await Match.findOne({
    $or: [
      { senderId: me._id, receiverId: target._id },
      { senderId: target._id, receiverId: me._id },
    ],
  });
  if (existing) {
    res.status(400).json({ success: false, message: 'Request already exists' });
    return;
  }

  const match = await Match.create({ senderId: me._id, receiverId: target._id });
  res.status(201).json({ success: true, data: { matchId: match._id, status: match.status } });
});

// GET /api/match/requests
router.get('/requests', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const requests = await Match.find({
    receiverId: req.user!.userId,
    status: 'requested',
  }).populate('senderId', '_id name age gender');

  res.json({ success: true, data: { requests } });
});

// GET /api/match/sent
router.get('/sent', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const sent = await Match.find({
    senderId: req.user!.userId,
    status: { $in: ['requested', 'accepted'] },
  }).populate('receiverId', '_id name age gender');

  res.json({ success: true, data: { sent } });
});

// PUT /api/match/accept/:matchId — multi-match: just accept, no blocking others
router.put('/accept/:matchId', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const match = await Match.findOne({
    _id: req.params.matchId,
    receiverId: req.user!.userId,
    status: 'requested',
  });

  if (!match) {
    res.status(404).json({ success: false, message: 'Request not found' });
    return;
  }

  match.status = 'accepted';
  await match.save();

  res.json({ success: true, data: { matchId: match._id, status: match.status } });
});

// PUT /api/match/reject/:matchId
router.put('/reject/:matchId', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const match = await Match.findOne({
    _id: req.params.matchId,
    receiverId: req.user!.userId,
    status: 'requested',
  });

  if (!match) {
    res.status(404).json({ success: false, message: 'Request not found' });
    return;
  }

  match.status = 'rejected';
  await match.save();

  res.json({ success: true, data: { matchId: match._id, status: match.status } });
});

// GET /api/match/matches — all active matches for the current user
router.get('/matches', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const matches = await Match.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
    status: { $in: ['accepted', 'complete'] },
  }).sort({ createdAt: -1 });

  const totalQuestions = await Question.countDocuments();

  const result = await Promise.all(
    matches.map(async (match) => {
      const partnerId =
        match.senderId.toString() === userId
          ? match.receiverId.toString()
          : match.senderId.toString();

      const partner = await User.findById(partnerId).select('name gender age');
      const myAnswers = await Answer.countDocuments({ matchId: match._id, userId });
      const partnerAnswers = await Answer.countDocuments({ matchId: match._id, userId: partnerId });
      const messageCount = await Message.countDocuments({ matchId: match._id });

      return {
        matchId: match._id,
        status: match.status,
        partner,
        progress: { totalQuestions, myAnswers, partnerAnswers },
        messageCount,
      };
    })
  );

  res.json({ success: true, data: { matches: result } });
});

// GET /api/match/questions?matchId=
router.get('/questions', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { matchId } = req.query;

  if (!matchId) {
    res.status(400).json({ success: false, message: 'matchId is required' });
    return;
  }

  const match = await Match.findOne({
    _id: matchId as string,
    $or: [{ senderId: userId }, { receiverId: userId }],
    status: 'accepted',
  });

  if (!match) {
    res.status(404).json({ success: false, message: 'Match not found or not in quiz stage' });
    return;
  }

  const questions = await Question.find().sort({ order: 1 });
  const myAnswers = await Answer.find({ matchId: match._id, userId });
  const answeredIds = new Set(myAnswers.map((a) => a.questionId.toString()));

  const result = questions.map((q) => ({
    _id: q._id,
    text: q.text,
    order: q.order,
    options: q.options.map((o) => ({ _id: o._id, text: o.text })),
    answered: answeredIds.has(q._id.toString()),
    selectedOptionId:
      myAnswers.find((a) => a.questionId.toString() === q._id.toString())?.optionId ?? null,
  }));

  res.json({ success: true, data: { matchId: match._id, questions: result } });
});

// POST /api/match/answer
router.post('/answer', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const { questionId, optionId, matchId } = req.body;
  const userId = req.user!.userId;

  if (!questionId || !optionId || !matchId) {
    res.status(400).json({ success: false, message: 'questionId, optionId and matchId are required' });
    return;
  }

  const match = await Match.findOne({
    _id: matchId,
    $or: [{ senderId: userId }, { receiverId: userId }],
    status: 'accepted',
  });

  if (!match) {
    res.status(404).json({ success: false, message: 'Match not found or not in quiz stage' });
    return;
  }

  const question = await Question.findById(questionId);
  if (!question) {
    res.status(404).json({ success: false, message: 'Question not found' });
    return;
  }

  const validOption = question.options.find((o) => o._id.toString() === optionId);
  if (!validOption) {
    res.status(400).json({ success: false, message: 'Invalid option for this question' });
    return;
  }

  await Answer.findOneAndUpdate(
    { matchId: match._id, userId, questionId },
    { optionId },
    { upsert: true, new: true }
  );

  const totalQuestions = await Question.countDocuments();
  const myAnswerCount = await Answer.countDocuments({ matchId: match._id, userId });

  if (myAnswerCount === totalQuestions) {
    const partnerId =
      match.senderId.toString() === userId
        ? match.receiverId.toString()
        : match.senderId.toString();
    const partnerAnswerCount = await Answer.countDocuments({ matchId: match._id, userId: partnerId });
    if (partnerAnswerCount === totalQuestions) {
      match.status = 'complete';
      await match.save();
    }
  }

  res.json({ success: true, data: { answered: myAnswerCount, total: totalQuestions } });
});

// GET /api/match/score?matchId=
router.get('/score', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { matchId } = req.query;

  if (!matchId) {
    res.status(400).json({ success: false, message: 'matchId is required' });
    return;
  }

  const match = await Match.findOne({
    _id: matchId as string,
    $or: [{ senderId: userId }, { receiverId: userId }],
    status: { $in: ['accepted', 'complete'] },
  });

  if (!match) {
    res.status(404).json({ success: false, message: 'Match not found' });
    return;
  }

  const partnerId =
    match.senderId.toString() === userId
      ? match.receiverId.toString()
      : match.senderId.toString();

  const totalQuestions = await Question.countDocuments();
  const myAnswerCount = await Answer.countDocuments({ matchId: match._id, userId });
  const partnerAnswerCount = await Answer.countDocuments({ matchId: match._id, userId: partnerId });

  if (myAnswerCount < totalQuestions || partnerAnswerCount < totalQuestions) {
    res.status(400).json({
      success: false,
      message: 'Score available only after both partners answer all questions',
      data: { myAnswers: myAnswerCount, partnerAnswers: partnerAnswerCount, total: totalQuestions },
    });
    return;
  }

  const questions = await Question.find().sort({ order: 1 });
  const myAnswers = await Answer.find({ matchId: match._id, userId });
  const partnerAnswers = await Answer.find({ matchId: match._id, userId: partnerId });

  const myMap = new Map(myAnswers.map((a) => [a.questionId.toString(), a.optionId.toString()]));
  const partnerMap = new Map(partnerAnswers.map((a) => [a.questionId.toString(), a.optionId.toString()]));

  let totalEarned = 0;
  const maxPerQuestion = 10;
  const breakdown = [];

  for (const question of questions) {
    const myOptionId = myMap.get(question._id.toString());
    const partnerOptionId = partnerMap.get(question._id.toString());
    const myOption = question.options.find((o) => o._id.toString() === myOptionId);
    const partnerOption = question.options.find((o) => o._id.toString() === partnerOptionId);

    let points = 0;
    if (myOptionId && partnerOptionId) {
      if (myOptionId === partnerOptionId) {
        points = 10;
      } else {
        const weightDiff = Math.abs((myOption?.weight ?? 0) - (partnerOption?.weight ?? 0));
        if (weightDiff <= 1) points = 6;
        else if (weightDiff <= 2) points = 4;
        else points = 2;
      }
    }

    totalEarned += points;
    breakdown.push({
      questionId: question._id,
      questionText: question.text,
      yourOption: myOption?.text ?? '',
      partnerOption: partnerOption?.text ?? '',
      points,
    });
  }

  const compatibility = Math.round((totalEarned / (questions.length * maxPerQuestion)) * 100);

  res.json({
    success: true,
    data: {
      compatibility,
      totalQuestions: questions.length,
      answeredByYou: myAnswerCount,
      answeredByPartner: partnerAnswerCount,
      breakdown,
    },
  });
});

// GET /api/match/messages?matchId=
router.get('/messages', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { matchId } = req.query;

  if (!matchId) {
    res.status(400).json({ success: false, message: 'matchId is required' });
    return;
  }

  const match = await Match.findOne({
    _id: matchId as string,
    $or: [{ senderId: userId }, { receiverId: userId }],
    status: { $in: ['accepted', 'complete'] },
  });

  if (!match) {
    res.status(404).json({ success: false, message: 'Match not found' });
    return;
  }

  const messages = await Message.find({ matchId: match._id })
    .populate('senderId', '_id name')
    .sort({ createdAt: 1 });

  res.json({ success: true, data: { messages, matchId: match._id } });
});

// POST /api/match/message
router.post('/message', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const { text, matchId } = req.body;
  const userId = req.user!.userId;

  if (!text?.trim() || !matchId) {
    res.status(400).json({ success: false, message: 'text and matchId are required' });
    return;
  }

  const match = await Match.findOne({
    _id: matchId,
    $or: [{ senderId: userId }, { receiverId: userId }],
    status: { $in: ['accepted', 'complete'] },
  });

  if (!match) {
    res.status(404).json({ success: false, message: 'Match not found' });
    return;
  }

  const message = await Message.create({ matchId: match._id, senderId: userId, text: text.trim() });
  await message.populate('senderId', '_id name');

  res.json({ success: true, data: { message } });
});

export default router;
