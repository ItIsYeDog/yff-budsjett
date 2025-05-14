const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');
const converter = require('json-2-csv');
const Budget = require('../models/Budget');

exports.getDashboard = async (req, res) => {
    try {
        // Hent transaksjoner og budsjettgrenser
        const transactions = await Transaction.find({ user: req.session.user._id }).sort({ date: -1 });
        const budgetLimits = await Budget.find({ user: req.session.user._id });
        
        // Beregn totaler
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalBalance = totalIncome - totalExpenses;

        // Beregn kategorifordeling
        const categories = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });

        const categoryLabels = Object.keys(categories);
        const categoryAmounts = Object.values(categories);

        // Organiser transaksjoner per kategori
        const categorizedTransactions = {};
        transactions.forEach(t => {
            if (!categorizedTransactions[t.category]) {
                categorizedTransactions[t.category] = {
                    transactions: [],
                    total: 0,
                    income: 0,
                    expenses: 0
                };
            }
            categorizedTransactions[t.category].transactions.push(t);
            if (t.type === 'income') {
                categorizedTransactions[t.category].income += t.amount;
            } else {
                categorizedTransactions[t.category].expenses += t.amount;
            }
            categorizedTransactions[t.category].total += (t.type === 'income' ? t.amount : -t.amount);
        });

        // Sjekk budsjettgrenser og generer varsler
        const alerts = [];
        
        // Sjekk kategori-spesifikke budsjettgrenser
        for (const [category, data] of Object.entries(categorizedTransactions)) {
            const budgetLimit = budgetLimits.find(b => b.category === category);
            if (budgetLimit && data.expenses > budgetLimit.limit) {
                alerts.push(`Du har overskredet budsjettet for ${category} (${budgetLimit.limit.toLocaleString('no-NO')} kr)`);
            }
        }

        // Sett hovedvarselet til det første varselet (hvis det finnes noen)
        const alert = alerts.length > 0 ? alerts[0] : '';

        // Render dashboard med all data
        res.render('dashboard', {
            categorizedTransactions,
            transactions,
            totalBalance,
            totalIncome,
            totalExpenses,
            categoryLabels,
            categoryAmounts,
            alert,    // Enkelt varsel for toppen av siden
            alerts,   // Array med alle varsler
            budgetLimits, // Send med budsjettgrensene
            user: req.session.user,
            error: ''
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('dashboard', {
            error: 'Kunne ikke hente dashboard',
            user: req.session.user,
            transactions: [],
            totalBalance: 0,
            totalIncome: 0,
            totalExpenses: 0,
            categoryLabels: [],
            categoryAmounts: [],
            alerts: [],
            alert: '',
            budgetLimits: []
        });
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const transaction = new Transaction({
            ...req.body,
            user: req.session.user._id
        });
        await transaction.save();
        res.redirect('/dashboard');
    } catch (error) {
        res.status(400).render('dashboard', { 
            error: 'Kunne ikke legge til transaksjon',
            user: req.session.user,
            transactions: [],
            totalBalance: 0,
            totalIncome: 0,
            totalExpenses: 0
        });
    }
};

exports.getCategoryChartDetails = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // Siste millisekund av måneden

        const expenseTransactions = await Transaction.find({
            user: userId,
            type: 'expense',
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }).sort({ date: -1, amount: -1 }); // Sorter etter dato, deretter beløp

        res.json(expenseTransactions);

    } catch (error) {
        console.error('Error fetching category chart details:', error);
        res.status(500).json({ message: 'Serverfeil ved henting av transaksjonsdetaljer.' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const transactionId = req.params.id;
        // Sjekk at transaksjonen tilhører den innloggede brukeren for sikkerhet
        const transaction = await Transaction.findOneAndDelete({ _id: transactionId, user: req.session.user._id });

        if (!transaction) {
            // Håndter tilfelle der transaksjonen ikke finnes eller ikke tilhører brukeren
            return res.status(404).send('Transaksjonen ble ikke funnet eller du har ikke tilgang til å slette den.');
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Delete transaction error:', error);
        // Send en feilmelding tilbake, eller omdiriger med en feilmelding
        res.status(500).render('dashboard', { 
            error: 'Kunne ikke slette transaksjon',
            user: req.session.user,
            transactions: await Transaction.find({ user: req.session.user._id }).sort({ date: -1 }), // Last inn transaksjoner på nytt
            totalBalance: 0, // Beregn på nytt eller hent fra en funksjon
            totalIncome: 0, // Beregn på nytt eller hent fra en funksjon
            totalExpenses: 0, // Beregn på nytt eller hent fra en funksjon
            categoryLabels: [], // Beregn på nytt eller hent fra en funksjon
            categoryAmounts: [], // Beregn på nytt eller hent fra en funksjon
            alerts: [],
            alert: 'Kunne ikke slette transaksjon. Prøv igjen.',
            budgetLimits: []
        });
    }
};

exports.exportPDF = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.session.user._id });
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
        
        doc.pipe(res);
        doc.fontSize(20).text('Transaksjonsrapport', { align: 'center' });
        
        transactions.forEach(t => {
            doc.fontSize(12).text(`
                Dato: ${t.date.toLocaleDateString()}
                Type: ${t.type === 'income' ? 'Inntekt' : 'Utgift'}
                Kategori: ${t.category}
                Beløp: kr ${t.amount}
                Beskrivelse: ${t.description || '-'}
            `);
        });

        doc.end();
    } catch (error) {
        res.status(500).send('Kunne ikke generere PDF');
    }
};

exports.exportCSV = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.session.user._id });
        
        // Format data for CSV
        const formattedTransactions = transactions.map(t => ({
            dato: t.date.toLocaleDateString('no-NO'),
            type: t.type === 'income' ? 'Inntekt' : 'Utgift',
            kategori: t.category,
            beløp: t.amount,  // Remove the 'kr' suffix for better CSV format
            beskrivelse: t.description || '-'
        }));

        // Convert to CSV using the proper method
        converter.json2csv(formattedTransactions, (err, csv) => {
            if (err) {
                console.error('CSV conversion error:', err);
                return res.status(500).send('Kunne ikke generere CSV');
            }
            
            // Send the CSV file
            res.attachment('transaksjoner.csv');
            res.type('text/csv');
            res.send(csv);
        });

    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).send('Kunne ikke generere CSV');
    }
};