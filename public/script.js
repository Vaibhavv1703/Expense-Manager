let expenseChart; // Global chart variable

async function fetchExpenses() {
    const res = await fetch('/expenses');
    const data = await res.json();

    // Update table with Delete & Repeat buttons
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


function formatDateToDDMMYYYY(inputDate) {
    const dateObj = new Date(inputDate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
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

    // Format date
    if (!date) {
        date = formatDateToDDMMYYYY(new Date()); // Use current date if empty
    } else {
        date = formatDateToDDMMYYYY(date); // Convert user input to dd-mm-yyyy
    }

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
