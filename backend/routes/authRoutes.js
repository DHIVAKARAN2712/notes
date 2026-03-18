const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, getAllUsers, grantAdmin } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.post('/register',                              register);
router.post('/login',                                 login);
router.get('/profile',           auth,                getProfile);
router.put('/profile',           auth,                updateProfile);
router.put('/change-password',   auth,                changePassword);
router.get('/users',             auth, role('admin'), getAllUsers);
router.patch('/users/:userId/grant-admin', auth, role('admin'), grantAdmin);

module.exports = router;
