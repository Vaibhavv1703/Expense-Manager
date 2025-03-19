let expenseChart; // Global chart variable

async function fetchExpenses() {
    const res = await fetch('/expenses');
    const data = await res.json();

    // Update Table
    document.getElementById('expenseTable').innerHTML = data.map(e => 
        `<tr>
            <td>${e.category}</td>
            <td>${e.amount}</td>
            <td>${e.payer}</td>
            <td>${e.date}</td>
            <td><button onclick="deleteExpense(${e.id})">Delete</button></td>
        </tr>`
    ).join('');

    // Update Pie Chart
    updateChart(data);
}

async function addExpense() {
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const payer = document.getElementById('payer').value;
    const date = document.getElementById('date').value;
    
    await fetch('/add-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount, payer, date })
    });

    closePopup();
    fetchExpenses();
}

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
