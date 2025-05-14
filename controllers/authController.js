const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        req.session.user = user;
        res.redirect('/dashboard');
    } catch (error) {
        res.render('auth/register', { error: 'Registrering feilet. Prøv igjen.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Ugyldige innloggingsdetaljer');
        }
        req.session.user = user;
        res.redirect('/dashboard');
    } catch (error) {
        res.render('auth/login', { error: 'Innlogging feilet. Sjekk e-post og passord.' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};