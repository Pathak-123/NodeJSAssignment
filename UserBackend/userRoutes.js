const express = require('express');
const { registerUser, loginUser, updateUserProfile, updateUserStatus, updateUserRole, forgotPassword, resetPassword } = require('./userController');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/role');

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.put('/update', authMiddleware , updateUserProfile);

router.put('/role', authMiddleware, roleMiddleware('admin'), updateUserRole);

router.put('/status', authMiddleware, roleMiddleware('admin'), updateUserStatus);

router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

module.exports = router;