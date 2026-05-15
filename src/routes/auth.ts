import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Otp from '../models/Otp';
import { authGuard, AuthRequest } from '../middleware/auth';

const router = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  const { mobile } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
    return;
  }

  await Otp.deleteMany({ mobile });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRES_MINUTES ?? 10) * 60 * 1000);

  await Otp.create({ mobile, code, expiresAt, used: false });

  // DEV: log OTP to console — swap for SMS provider in production
  console.log(`\n📱 OTP for ${mobile}: ${code}\n`);

  res.json({ success: true, message: 'OTP sent' });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { mobile, code } = req.body;

  if (!mobile || !code) {
    res.status(400).json({ success: false, message: 'mobile and code are required' });
    return;
  }

  const otp = await Otp.findOne({ mobile, code, used: false });

  if (!otp) {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
    return;
  }

  if (otp.expiresAt < new Date()) {
    res.status(400).json({ success: false, message: 'OTP expired' });
    return;
  }

  otp.used = true;
  await otp.save();

  let user = await User.findOne({ mobile });
  if (!user) {
    user = await User.create({ mobile });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), mobile: user.mobile },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as `${number}${'s'|'m'|'h'|'d'}` }
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
