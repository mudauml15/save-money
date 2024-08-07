let transactions = [];
let balanceTotal = 0;
let incomeTotal = 0;
let expenseTotal = 0;

function addTransaction() {
  let detail = document.getElementById('txtDetail').value.trim();
  let amount = parseFloat(document.getElementById('txtAmount').value);
  let type = document.getElementById('txtType').value;

  // Automatically correct detail to have the first letter uppercase and the rest lowercase
  if (detail) {
    detail = `${detail[0].toUpperCase()}${detail.slice(1).toLowerCase()}`;
  }

  // Check if amount is NaN or less than or equal to 0
  if (detail === '' || isNaN(amount) || amount <= 0) {
    alert('Please enter valid details and amount.');
    return;
  }

  // Checking if user's details = Salary and type = expense.
  if (detail.toLowerCase() === 'salary' && type === 'expense') {
    alert('Salary cannot be marked as an expense.');
    return;
  }


  // Checking if type is expense and incomeTotal is = 0.
  if (type === 'expense' && incomeTotal === 0) {
    alert('Please enter your income first.');
    return;
  }

  // Check if type is expense and if expense exceeds the income.
  if (type === 'expense' && amount > incomeTotal - expenseTotal) {
    let remainingIncome = incomeTotal - expenseTotal;
    let neededAmount = amount - remainingIncome;
    alert(`Expense not added. You have R${remainingIncome.toFixed(2)} left, and you need an additional R${neededAmount.toFixed(2)}.`);
    return;
  }

  // Compares to check if transaction & details are equal then combines two conditions.
  let existingTransaction = transactions.find(tran => tran.detail === detail && tran.type === type);

  if (existingTransaction) {
    existingTransaction.amount = (parseFloat(existingTransaction.amount) + amount).toFixed(2);
    updateInput(); 
  } else {
    let transaction = {
      detail: detail,
      amount: amount.toFixed(2),
      type: type
    };

    transactions.push(transaction);
    updateInput(); 
  }

  document.getElementById('txtDetail').value = '';
  document.getElementById('txtAmount').value = '';

  localStorage.setItem('transactions', JSON.stringify(transactions));
}





function updateInput() {
  document.getElementById('allTransaction').innerHTML = '';

  transactions.forEach(transaction => {
    let transactionDiv = document.createElement('div');
    transactionDiv.classList.add('transaction');

    if (transaction.type === 'expense') {
      transactionDiv.classList.add('expense-b');
    } else {
      transactionDiv.classList.add('income-b');
    }

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
        updateInput(); 
        updateTotals(); 
      }
    };

    document.getElementById('allTransaction').appendChild(transactionDiv);
  });

  updateTotals(); 
}





function updateTotals() {
  incomeTotal = 0;
  expenseTotal = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      incomeTotal += parseFloat(transaction.amount);
    } else {
      expenseTotal += parseFloat(transaction.amount);
    }
  });

  document.getElementById('incomeTotal').textContent = `R${incomeTotal.toFixed(2)}`;
  document.getElementById('expenseTotal').textContent = `R${expenseTotal.toFixed(2)}`;
  balanceTotal = incomeTotal - expenseTotal;
  document.getElementById('balanceTotal').textContent = `R${balanceTotal.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', function() {
  let storedTransactions = localStorage.getItem('transactions');
  if (storedTransactions) {
    transactions = JSON.parse(storedTransactions);
    updateInput();
  }
});

document.querySelector('button').addEventListener('click', addTransaction);
