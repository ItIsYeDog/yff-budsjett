const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/auth');

// Add requireAuth middleware to protect these routes
router.use(requireAuth);

router.get('/list', transactionController.getDashboard);
router.post('/add', transactionController.addTransaction);
router.delete('/delete/:id', transactionController.deleteTransaction);
router.get('/export/pdf', transactionController.exportPDF);
router.get('/export/csv', transactionController.exportCSV);

router.get('/category-chart-details', transactionController.getCategoryChartDetails);

module.exports = router;