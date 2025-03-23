let expenseChart; // Global chart variable

let categoryLimits = {}; // Store limits for different categories

document.getElementById('setLimitBtn').addEventListener('click', () => {
    populateCategoryDropdown();
    document.getElementById('limitPopup').style.display = "block";
});

document.querySelector('.closeLimit').addEventListener('click', () => {
    document.getElementById('limitPopup').style.display = "none";
});

// Function to populate category dropdown dynamically
function populateCategoryDropdown() {
    const dropdown = document.getElementById('limitCategoryDropdown');
    dropdown.innerHTML = `<option value="">Select a Category</option>`;

    const categories = new Set();
    document.querySelectorAll('#expenseTable tr td:first-child').forEach(td => {
        categories.add(td.textContent);
    });

    categories.forEach(category => {
        dropdown.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

// Function to set category-specific expense limits
function setCategoryLimit() {
    const category = document.getElementById('limitCategoryDropdown').value;
    const limit = document.getElementById('categoryLimit').value;

    if (!category) {
        alert("Please select a category!");
        return;
    }
    if (!limit || limit <= 0) {
        alert("Please enter a valid limit!");
        return;
    }

    categoryLimits[category] = parseFloat(limit);
    document.getElementById('limitPopup').style.display = "none";
    checkCategoryLimits();
}

// Function to check if expenses exceed category-specific limits
function checkCategoryLimits() {
    let warnings = [];
    const categoryTotals = {};

    // Calculate total spent per category
    document.querySelectorAll('#expenseTable tr').forEach(row => {
        const cells = row.getElementsByTagName('td');
        if (cells.length > 1) {
            const category = cells[0].textContent;
            const amount = parseFloat(cells[1].textContent);
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        }
    });

    // Compare totals with limits
    for (let category in categoryLimits) {
        if (categoryTotals[category] > categoryLimits[category]) {
            warnings.push(`⚠ Limit exceeded for ${category}! (Limit: ${categoryLimits[category]}, Spent: ${categoryTotals[category]})`);
        }
    }

    // Display warning inside the chart container (below chart)
    const warningElement = document.getElementById('limitWarning');
    if (warnings.length > 0) {
        warningElement.innerHTML = warnings.join('<br>');
        warningElement.style.display = "block";
    } else {
        warningElement.style.display = "none";
    }
}

// Modify fetchExpenses() to check category limits after loading expenses
async function fetchExpenses() {
    const res = await fetch('/expenses');
    const data = await res.json();

    document.getElementById('expenseTable').innerHTML = data.map(e => 
        `<tr>
            <td>${e.category}</td>
            <td>${e.amount}</td>
            <td>${e.payer}</td>
            <td>${e.date}</td>
            <td>
                <button onclick="deleteExpense(${e.id})">Delete</button>
                <button onclick="repeatExpense('${e.category}', '${e.amount}', '${e.payer}')">Repeat</button>
            </td>
        </tr>`
    ).join('');

    updateChart(data);
    checkCategoryLimits(); // Check category limits after fetching expenses
}

// Function to repeat expense (copy values, set current date)
function repeatExpense(category, amount, payer) {
    document.getElementById('category').value = category;
    document.getElementById('amount').value = amount;
    document.getElementById('payer').value = payer;

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    // Show popup
    document.getElementById('expensePopup').style.display = "block";
}

async function addExpense() {
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const payer = document.getElementById('payer').value;
    let date = document.getElementById('date').value;

    // Validation: Amount is required
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }
    if(!date)   date = new Date();

    await fetch('/add-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount, payer, date })
    });

    closePopup();
    fetchExpenses();
}

// Show current date in popup by default
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0]; // Format: yyyy-mm-dd
    document.getElementById('date').value = today;
});

async function deleteExpense(id) {
    await fetch(`/delete-expense/${id}`, { method: 'DELETE' });
    fetchExpenses();
}

// Open & Close Popup
document.getElementById('openPopup').addEventListener('click', () => {
    document.getElementById('expensePopup').style.display = "block";
});

document.querySelector('.close').addEventListener('click', closePopup);

function closePopup() {
    document.getElementById('expensePopup').style.display = "none";
}

// Pie Chart Function
function updateChart(expenses) {
    const categoryTotals = {};
    expenses.forEach(expense => {
        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] += parseFloat(expense.amount);
        } else {
            categoryTotals[expense.category] = parseFloat(expense.amount);
        }
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx = document.getElementById('expenseChart').getContext('2d');
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff']
            }]
        }
    });
}

fetchExpenses();
