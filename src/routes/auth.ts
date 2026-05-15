import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Otp from '../models/Otp';
import OtpRateLimit from '../models/OtpRateLimit';
import { authGuard, AuthRequest } from '../middleware/auth';

const router = Router();

const OTP_EXPIRY_MS        = 5 * 60 * 1000;        // 5 minutes
const OTP_COOLDOWN_MS      = 60 * 1000;             // 60 sec between requests
const MAX_DAILY_REQUESTS   = 10;                    // per day per mobile
const MAX_ATTEMPTS         = 5;                     // wrong guesses before OTP is invalidated
const RATE_LIMIT_EXPIRY_MS = 24 * 60 * 60 * 1000;  // rate-limit record lives 24 h

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
      return;
    }

    // ── Rate limit checks ──────────────────────────────────────────────────
    const rateLimit = await OtpRateLimit.findOne({ mobile });

    if (rateLimit) {
      const secsSinceLast = (Date.now() - rateLimit.lastRequestAt.getTime()) / 1000;

      if (secsSinceLast < OTP_COOLDOWN_MS / 1000) {
        const waitSecs = Math.ceil(OTP_COOLDOWN_MS / 1000 - secsSinceLast);
        res.status(429).json({
          success: false,
          message: `Please wait ${waitSecs} second${waitSecs !== 1 ? 's' : ''} before requesting another OTP`,
        });
        return;
      }

      if (rateLimit.dailyRequestCount >= MAX_DAILY_REQUESTS) {
        res.status(429).json({
          success: false,
          message: `Daily OTP limit reached (${MAX_DAILY_REQUESTS} requests). Try again tomorrow.`,
        });
        return;
      }
    }

    // ── Generate & store OTP ───────────────────────────────────────────────
    const code = generateOtp();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

    await Otp.findOneAndUpdate(
      { mobile },
      { mobile, code, attempts: 0, expiresAt },
      { upsert: true, new: true },
    );

    // ── Update rate-limit record ───────────────────────────────────────────
    await OtpRateLimit.findOneAndUpdate(
      { mobile },
      {
        $set: {
          mobile,
          lastRequestAt: now,
          expiresAt: new Date(now.getTime() + RATE_LIMIT_EXPIRY_MS),
        },
        $inc: { dailyRequestCount: 1 },
      },
      { upsert: true, new: true },
    );

    // DEV: log OTP to console — replace with SMS provider in production
    console.log(`\n📱 OTP for ${mobile}: ${code}\n`);

    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mobile, code } = req.body;

    if (!mobile || !code) {
      res.status(400).json({ success: false, message: 'mobile and code are required' });
      return;
    }

    const otp = await Otp.findOne({ mobile });

    if (!otp) {
      res.status(400).json({ success: false, message: 'OTP not found or expired. Please request a new OTP.' });
      return;
    }

    // ── Expiry check ───────────────────────────────────────────────────────
    if (Date.now() > otp.expiresAt.getTime()) {
      await Otp.deleteOne({ mobile });
      res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP.' });
      return;
    }

    // ── Attempt limit ──────────────────────────────────────────────────────
    if (otp.attempts >= MAX_ATTEMPTS) {
      await Otp.deleteOne({ mobile });
      res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
      return;
    }

    // ── Wrong OTP ──────────────────────────────────────────────────────────
    if (otp.code !== String(code).trim()) {
      otp.attempts += 1;
      await otp.save();
      const remaining = MAX_ATTEMPTS - otp.attempts;
      res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
      return;
    }

    // ── Success — delete OTP ───────────────────────────────────────────────
    await Otp.deleteOne({ mobile });

    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({ mobile });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), mobile: user.mobile },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );

    const profileComplete = !!(user.name && user.gender && user.age);

    res.json({
      success: true,
      data: {
        token,
        profileComplete,
        user: {
          _id: user._id,
          mobile: user.mobile,
          name: user.name,
          gender: user.gender,
          age: user.age,
        },
      },
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

// POST /api/auth/profile
router.post('/profile', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, gender, age, city, bio } = req.body;

  if (!name || !gender || !age) {
    res.status(400).json({ success: false, message: 'name, gender, and age are required' });
    return;
  }

  if (!['male', 'female'].includes(gender)) {
    res.status(400).json({ success: false, message: 'gender must be male or female' });
    return;
  }

  if (typeof age !== 'number' || age < 18 || age > 80) {
    res.status(400).json({ success: false, message: 'age must be between 18 and 80' });
    return;
  }

  const update: Record<string, unknown> = { name, gender, age };
  if (city !== undefined) update.city = city;
  if (bio !== undefined) update.bio = bio;

  const user = await User.findByIdAndUpdate(req.user!.userId, update, { new: true });

  res.json({
    success: true,
    data: {
      user: {
        _id: user!._id,
        mobile: user!.mobile,
        name: user!.name,
        gender: user!.gender,
        age: user!.age,
        city: user!.city,
        bio: user!.bio,
      },
    },
  });
});

// GET /api/auth/me
router.get('/me', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.userId).select('-__v');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: { user } });
});

export default router;
