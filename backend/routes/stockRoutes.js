import express from 'express';
import { createTransaction, getTransactions, getProductStockHistory } from '../controllers/stockController.js';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

router.post('/', auth, isAdmin, createTransaction);
router.get('/', auth, isAdmin, getTransactions);
router.get('/product/:id', auth, isAdmin, getProductStockHistory);

export default router;
