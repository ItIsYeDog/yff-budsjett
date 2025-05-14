const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/register', (req, res) => {
    res.render('auth/register', { error: '' });
});

router.get('/login', (req, res) => {
    res.render('auth/login', { error: '' });
});

// Håndter registrering
router.post('/register', authController.register);

// Håndter innlogging
router.post('/login', authController.login);

// Logg ut
router.get('/logout', authController.logout);

module.exports = router;