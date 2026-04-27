// routes/index.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// Public routes
router.get('/', taskController.getHome);
router.get('/statistics', taskController.getStatistics);
router.get('/subscriptions', taskController.getSubscriptions);
router.post('/volunteer', taskController.volunteer);

// Auth routes
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);
router.get('/logout', authController.logout);

// Protected routes (task owners)
router.get('/tasks', requireAuth, taskController.getDashboard);
router.post('/tasks', requireAuth, taskController.createTask);
router.post('/tasks/dismiss', requireAuth, taskController.dismissVolunteer);
router.post('/tasks/:id/delete', requireAuth, taskController.deleteTask);

module.exports = router;
