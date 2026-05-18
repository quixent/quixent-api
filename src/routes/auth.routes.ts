import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import {
  sendOtp,
  verifyOtp,
  refresh,
  logout,
  getMe,
  updateProfile,
  deleteAccount,
} from '../controllers/auth.controller';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/refresh', refresh);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);
router.put('/update-profile', verifyToken, updateProfile);
router.delete('/delete-account', verifyToken, deleteAccount);

export default router;
