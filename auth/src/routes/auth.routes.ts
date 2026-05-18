import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { otpRateLimiter } from '../middleware/rateLimiter';
import {
  sendOtp,
  verifyOtp,
  refresh,
  logout,
  getMe,
  getUserById,
  updateProfile,
  deleteAccount,
} from '../controllers/auth.controller';

const router = Router();

router.post('/send-otp', otpRateLimiter, sendOtp);
router.post('/verify-otp', otpRateLimiter, verifyOtp);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);
router.get('/user/:id', verifyToken, getUserById);
router.put('/update-profile', verifyToken, updateProfile);
router.post('/profile', verifyToken, updateProfile);
router.delete('/delete-account', verifyToken, deleteAccount);

export default router;
