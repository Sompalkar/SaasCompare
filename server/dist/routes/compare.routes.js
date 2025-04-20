"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compare_controller_1 = require("../controllers/compare.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = express_1.default.Router();
// Public routes
router.post('/', compare_controller_1.compareTools);
router.post('/save', authenticate_1.authenticate, compare_controller_1.saveComparison);
router.get('/saved', authenticate_1.authenticate, compare_controller_1.getSavedComparisons);
router.get('/:id', compare_controller_1.getComparisonById);
router.delete('/:id', authenticate_1.authenticate, compare_controller_1.deleteComparison);
router.post('/export', authenticate_1.authenticate, compare_controller_1.exportComparison);
router.post('/historical', compare_controller_1.getHistoricalData);
exports.default = router;
