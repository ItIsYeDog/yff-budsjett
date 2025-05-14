const Budget = require('../models/Budget');
const User = require('../models/User');

exports.getSettings = async (req, res) => {
    try {
        const budgetLimits = await Budget.find({ user: req.session.user._id });
        
        // Konverter til objekt for enklere håndtering i template
        const limitsByCategory = {};
        budgetLimits.forEach(budget => {
            limitsByCategory[budget.category] = budget.limit;
        });

        res.render('settings', {
            user: req.session.user,
            budgetLimits: limitsByCategory,
            error: '',
            success: ''
        });
    } catch (error) {
        res.render('settings', {
            user: req.session.user,
            budgetLimits: {},
            error: 'Kunne ikke hente innstillinger',
            success: ''
        });
    }
};

exports.getProfilePage = async (req, res) => {
    try {
        // Brukerinformasjon er allerede i req.session.user
        // Hvis du trenger å hente fersk data eller mer detaljert info:
        // const user = await User.findById(req.session.user._id);
        // if (!user) {
        //     return res.status(404).render('profile', { error: 'Bruker ikke funnet', user: req.session.user });
        // }
        res.render('profile', {
            user: req.session.user, // Eller den ferskt hentede 'user' variabelen
            error: ''
        });
    } catch (error) {
        console.error("Error fetching profile page:", error);
        res.status(500).render('profile', {
            user: req.session.user, // Send med det vi har i session i tilfelle feil
            error: 'Kunne ikke laste profilsiden.'
        });
    }
};

exports.updateBudgetLimits = async (req, res) => {
    try {
        const { limits } = req.body;
        
        // Slett eksisterende grenser
        await Budget.deleteMany({ user: req.session.user._id });
        
        // Opprett nye grenser
        const budgetPromises = Object.entries(limits).map(([category, limit]) => {
            if (limit && limit > 0) {
                return Budget.create({
                    user: req.session.user._id,
                    category,
                    limit: Number(limit)
                });
            }
        });

        await Promise.all(budgetPromises);
        
        res.redirect('/settings?success=true');
    } catch (error) {
        res.redirect('/settings?error=true');
    }
};