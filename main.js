let transactions = [];
let balanceTotal = 0;
let incomeTotal = 0;
let expenseTotal = 0;

function addTransaction() {
  let detail = document.getElementById('txtDetail').value.trim();
  let amount = parseFloat(document.getElementById('txtAmount').value);
  let type = document.getElementById('txtType').value;

  // Check if amount is NaN or less than or equal to 0
  if (detail === '' || isNaN(amount) || amount <= 0) {
    alert('Please enter valid details and amount.');
    return;
  }

  // Check if type is 'expense' and incomeTotal is 0
  if (type === 'expense' && incomeTotal === 0) {
    alert('Please enter your income first.');
    return;
  }

  // Check if type is 'expense' and the proposed expense exceeds the income
  if (type === 'expense' && amount > incomeTotal - expenseTotal) {
    let remainingIncome = incomeTotal - expenseTotal;
    let neededAmount = amount - remainingIncome;
    alert(`Expense not added. You have R${remainingIncome.toFixed(2)} left, and you need an additional R${neededAmount.toFixed(2)}.`);
    return;
  }

  let existingTransaction = transactions.find(tran => tran.detail === detail && tran.type === type);

  if (existingTransaction) {
    existingTransaction.amount = (parseFloat(existingTransaction.amount) + amount).toFixed(2);
    updateInput(); // Update Input after modifying existing transaction
  } else {
    let transaction = {
      detail: detail,
      amount: amount.toFixed(2),
      type: type
    };

    transactions.push(transaction);
    updateInput(); // Update Input after adding new transaction
  }

  document.getElementById('txtDetail').value = '';
  document.getElementById('txtAmount').value = '';

  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateInput() {
  document.getElementById('allTransaction').innerHTML = '';

  transactions.forEach(transaction => {
    let transactionDiv = document.createElement('div');
    transactionDiv.classList.add('transaction', transaction.type === 'expense' ? 'expense-b' : 'income-b');
    transactionDiv.innerHTML = `
      <div class="detail">${transaction.detail}</div>
      <div class="amount">R${transaction.amount}</div>
      <div class="action"><i class="bi bi-trash"></i></div>
    `;

    let deleteIcon = transactionDiv.querySelector('.action i');
    deleteIcon.onclick = function() {
      let index = transactions.indexOf(transaction);
      if (index !== -1) {
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateInput(); // Update UI after deletion
        updateTotals(); // Update totals after deletion
      }
    };

    document.getElementById('allTransaction').appendChild(transactionDiv);
  });

  updateTotals(); // Update totals initially
}

