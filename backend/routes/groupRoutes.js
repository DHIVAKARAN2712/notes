const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { createGroup, joinGroup, getGroups, getGroupById, deleteGroup, removeUserFromGroup } = require('../controllers/groupController');

router.post('/create', auth, role('admin'), createGroup);
router.post('/join', auth, joinGroup);
router.get('/', auth, getGroups);
router.get('/:id', auth, getGroupById);
router.delete('/:id', auth, role('admin'), deleteGroup);
router.delete('/:group_id/members/:user_id', auth, role('admin'), removeUserFromGroup);

module.exports = router;
