const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const walletController = require('../controllers/walletController');
const transactionController = require('../controllers/transactionController');
const analyticsController = require('../controllers/analyticsController');
const notificationController = require('../controllers/notificationController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getUserProfile);
router.get('/users/search', verifyToken, authController.searchUsers);

// Notification Routes
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.patch('/notifications/:notificationId/read', verifyToken, notificationController.markAsRead);
router.delete('/notifications', verifyToken, notificationController.clearAll);

// Pillar 4: MFA Routes
router.post('/mfa/setup', verifyToken, authController.setup2FA);
router.post('/mfa/verify', verifyToken, authController.verify2FA);

// Pillar 2: KYC Routes
router.post('/kyc/submit', verifyToken, authController.submitKYC);

// Wallet & Payment Method Routes
router.get('/wallet', verifyToken, walletController.getBalance);
router.post('/wallet/add-money', verifyToken, walletController.addMoney);
router.get('/wallet/cards', verifyToken, walletController.getCards);
router.post('/wallet/cards', verifyToken, walletController.addCard);
router.patch('/wallet/cards/:cardId/primary', verifyToken, walletController.setPrimaryCard);
router.delete('/wallet/cards/:cardId', verifyToken, walletController.deleteCard);
router.get('/wallet/banks', verifyToken, walletController.getBanks);
router.post('/wallet/banks', verifyToken, walletController.linkBank);
router.delete('/wallet/banks/:bankId', verifyToken, walletController.unlinkBank);

// Analytics Routes
router.get('/analytics/insights', verifyToken, analyticsController.getSpendingInsights);

// Transaction Routes
router.post('/transaction/send', verifyToken, transactionController.sendMoney);
router.post('/transaction/pay-bill', verifyToken, transactionController.payBill);
router.get('/transactions', verifyToken, transactionController.getTransactions);
router.get('/transactions/statement', verifyToken, transactionController.getMonthlyStatement);

// Admin Routes (Restricted to 'admin' role)
router.get('/admin/stats', verifyToken, isAdmin, transactionController.getAdminStats);
router.get('/admin/flagged', verifyToken, isAdmin, transactionController.getFlaggedTransactions);
router.get('/admin/users', verifyToken, isAdmin, authController.getAllUsers);
router.post('/admin/kyc/update', verifyToken, isAdmin, authController.updateKYCStatus);

module.exports = router;
