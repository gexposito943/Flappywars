import express from 'express';
import { getShips, getUserShip, updateUserShip } from '../controllers/shipController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/naus', authenticateToken, getShips);
router.get('/users/:userId/ship', authenticateToken, getUserShip);
router.put('/users/:userId/ship', authenticateToken, updateUserShip);

export default router; 