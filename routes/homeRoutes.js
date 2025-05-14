const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', (req, res) => {
    res.render('index');
});

// Use the getDashboard controller instead of directly rendering
router.get('/dashboard', transactionController.getDashboard);

module.exports = router;