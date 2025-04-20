import express from 'express';
import { 
  compareTools, 
  saveComparison, 
  getComparisonById, 
  getSavedComparisons, 
  deleteComparison,
  exportComparison,
  getHistoricalData
} from '../controllers/compare.controller';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// Public routes
router.post('/', compareTools);
router.post('/save', authenticate, saveComparison);
router.get('/saved', authenticate, getSavedComparisons);
router.get('/:id', getComparisonById);
router.delete('/:id', authenticate, deleteComparison);
router.post('/export', authenticate, exportComparison);
router.post('/historical', getHistoricalData);

export default router;
