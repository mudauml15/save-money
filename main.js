let transactions = [];
let balanceTotal = 0;
let incomeTotal = 0;
let expenseTotal = 0;

function addTransaction() {
  let detail = document.getElementById('txtDetail').value.trim();
  let amount = parseFloat(document.getElementById('txtAmount').value);
  let type = document.getElementById('txtType').value;

  if (detail) {
    detail = `${detail[0].toUpperCase()}${detail.slice(1).toLowerCase()}`;
  }

  if (detail === '') {
    alert('Detail is required.');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert('Amount must be a valid number and greater than zero.');
    return;
  }

  if (detail.toLowerCase() === 'salary' && type === 'expense') {
    alert('Salary cannot be marked as an expense.');
    return;
  }

  if (type === 'expense' && incomeTotal === 0) {
    alert('Please enter your income before adding expenses.');
    return;
  }

  if (type === 'expense') {
    let remainingAmount = incomeTotal - expenseTotal;
    let neededAmount = amount - remainingAmount;
  
    if (amount > remainingAmount) {
      alert(`Insufficient funds. You have R${remainingAmount.toFixed(2)} left, 
      and you need an additional R${neededAmount.toFixed(2)} to add your expense.`);
      return;
    }
  }
  

  let existingTransaction = transactions.find(tran => tran.detail === detail && tran.type === type);

  if (existingTransaction) {
    existingTransaction.amount = (parseFloat(existingTransaction.amount) + amount).toFixed(2);

  } else {
    let transaction = {
      detail: detail,
      amount: amount.toFixed(2),
      type: type
    };
    transactions.push(transaction);
  }

  updateAll();
  document.getElementById('txtDetail').value = '';
  document.getElementById('txtAmount').value = '';
}

function editAmount(index) {
  let editBox = document.getElementById(`amount-${index}`);
  let currentAmount = parseFloat(transactions[index].amount);
  
  editBox.innerHTML = `
    <input type="number" id="editAmount-${index}" 
           value="${currentAmount.toFixed(2)}"
           style="width: 80px;" 
           onblur="updateTransaction(${index})">
  `;

  document.getElementById(`editAmount-${index}`).focus();
}

function updateTransaction(index) {
  let editInput = document.getElementById(`editAmount-${index}`);
  let newAmount = parseFloat(editInput.value);

  if (isNaN(newAmount) || newAmount <= 0) {
    alert('Amount must be a valid number and greater than zero.');

    editInput.value = parseFloat(transactions[index].amount).toFixed(2);
    return;
  }

  let oldAmount = parseFloat(transactions[index].amount);
  let difference = newAmount - oldAmount;

  if (transactions[index].type === 'expense' && balanceTotal - difference < 0) {
    alert('Updating this amount would result in a negative balance. Operation cancelled.');
    editInput.value = oldAmount.toFixed(2);
    return;
  }

  transactions[index].amount = newAmount.toFixed(2);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateAll();
}

function deleteTransaction(index) {
  let confirmDelete = false;

  if (transactions[index].detail.toLowerCase() === 'salary') {
    deleteSalary(index); 
  } else {
    confirmDelete = confirm('Are you sure you want to delete this transaction?');
    
    if (confirmDelete) {
      transactions.splice(index, 1);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      updateAll();
    }
  }
}

function deleteSalary(salaryIndex) {
  let confirmDelete = false;

  
  if (expenseTotal > 0) {
  
    confirmDelete = confirm('Deleting salary will clear all expenses. Are you sure you want to delete?');
  } else {
   
    confirmDelete = confirm('Are you sure you want to delete the salary transaction?');
  }

  if (confirmDelete) {
  
    transactions.splice(salaryIndex, 1);

  
    transactions = transactions.filter(transaction => transaction.type === 'income');

 
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateAll();
  }
}

function updateAll() {
  let container = document.getElementById('allTransaction');
  container.innerHTML = '';

  transactions.forEach((transaction, index) => {
    let transactionDiv = document.createElement('div');
    transactionDiv.classList.add('transaction');

    if (transaction.type === 'expense') {
      transactionDiv.classList.add('expense-b');
    } else {
      transactionDiv.classList.add('income-b');
    }

    transactionDiv.innerHTML = `
      <div class="detail">${transaction.detail}</div>
      <div class="amount" id="amount-${index}" onclick="editAmount(${index})">
        <span style="font-size: 10px; color: #999;">Edit amount</span><br>
        R${transaction.amount}
      </div>
      <div class="action"><i class="bi bi-trash" onclick="deleteTransaction(${index})"></i></div>
    `;

    container.appendChild(transactionDiv);
  });

  updateTotals();
  localStorage.setItem('transactions', JSON.stringify(transactions));
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

  document.getElementById('incomeTotal').innerHTML = `R${incomeTotal.toFixed(2)}`;
  document.getElementById('expenseTotal').innerHTML = `R${expenseTotal.toFixed(2)}`;
  balanceTotal = incomeTotal - expenseTotal;
  document.getElementById('balanceTotal').innerHTML = `R${balanceTotal.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', function() {
  let storedTransactions = localStorage.getItem('transactions');
  if (storedTransactions) {
    transactions = JSON.parse(storedTransactions);
  }
  updateAll();
});

document.querySelector('button').addEventListener('click', addTransaction);
