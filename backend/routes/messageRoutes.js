const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getConversations, getMessages, sendMessage, getContacts, getUnreadCount
} = require('../controllers/messageController');

router.get('/conversations',             auth, getConversations);
router.get('/conversations/:conversationId', auth, getMessages);
router.post('/send',                     auth, sendMessage);
router.get('/contacts',                  auth, getContacts);
router.get('/unread',                    auth, getUnreadCount);

module.exports = router;
