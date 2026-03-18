const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { summarizeNote, askQuestion, getChatHistory, clarifyDoubt } = require('../controllers/aiController');

router.get('/notes/:id/summary', auth, summarizeNote);
router.post('/notes/:id/ask', auth, askQuestion);
router.get('/notes/:id/history', auth, getChatHistory);
router.post('/clarify', auth, clarifyDoubt);

module.exports = router;
