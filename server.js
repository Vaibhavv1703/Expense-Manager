const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database/expenses.db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure the database folder exists
const fs = require('fs');
const databaseFolder = path.join(__dirname, 'database');
if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder);
}

// Create expenses table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    amount REAL,
    payer TEXT,
    date TEXT
)`);

// API to add an expense
app.post('/add-expense', (req, res) => {
    let { category, amount, payer, date } = req.body;

    // Validation: Amount is required
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Amount is required and must be greater than zero." });
    }

    // Apply default values
    category = category && category.trim() ? category : "Unknown";
    date = date ? date : new Date().toISOString().split('T')[0];

    db.run(`INSERT INTO expenses (category, amount, payer, date) VALUES (?, ?, ?, ?)`,
        [category, amount, payer, date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, category, amount, payer, date });
        }
    );
});


// API to fetch all expenses
app.get('/expenses', (req, res) => {
    db.all(`SELECT * FROM expenses`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API to delete an expense
app.delete('/delete-expense/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM expenses WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Expense deleted', id });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));