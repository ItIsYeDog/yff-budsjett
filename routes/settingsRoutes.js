const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

router.use(requireAuth);

router.get('/', settingsController.getSettings);
router.post('/budget-limits', settingsController.updateBudgetLimits);
router.get('/profile', settingsController.getProfilePage);

module.exports = router;