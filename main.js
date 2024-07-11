let transactions = [];
let balanceTotal = 0;
let incomeTotal = 0;
let expenseTotal = 0;

function addTransaction() {
  let detail = document.getElementById('txtDetail').value.trim();
  let amount = parseFloat(document.getElementById('txtAmount').value);
  let type = document.getElementById('txtType').value.toLowerCase();

  if (detail) {
    detail = `${detail[0].toUpperCase()}${detail.slice(1).toLowerCase()}`;
  }

  if (detail === '') {
    alert('Details are required.');
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
      alert(`Insufficient funds. You have R${remainingAmount.toFixed(2)} left, you need an additional R${neededAmount.toFixed(2)} to add your expense.`);
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
  document.getElementById('txtType').value = 'income';
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

function editType(index) {
  let editBox = document.getElementById(`type-${index}`);
  let currentType = transactions[index].type;

  editBox.innerHTML = `
    <input type="text" id="editType-${index}" 
           value="${currentType}"
           style="width: 100px;"
           onblur="updateType(${index}, this.value)">
  `;

  document.getElementById(`editType-${index}`).focus();
}

function updateType(index, newType) {
  let oldType = transactions[index].type;
  let oldAmount = parseFloat(transactions[index].amount);
  let detail = transactions[index].detail;

  if (oldType === 'income' && newType === 'expense') {
    if (incomeTotal - oldAmount < expenseTotal + oldAmount) {
      alert(`Insufficient funds to convert this transaction to expense. Current balance: R${balanceTotal.toFixed(2)}`);
      return;
    }

    transactions[index].type = 'expense';
    incomeTotal -= oldAmount;
    expenseTotal += oldAmount;
    balanceTotal = incomeTotal - expenseTotal;

  } else if (oldType === 'expense' && newType === 'income') {
    transactions[index].type = 'income';
    incomeTotal += oldAmount;
    expenseTotal -= oldAmount;
    balanceTotal = incomeTotal - expenseTotal;
  }

  let existingTransaction = transactions.find((tran, index) => index !== index && tran.detail === detail && tran.type === newType);

  if (existingTransaction) {
    existingTransaction.amount = (parseFloat(existingTransaction.amount) + oldAmount).toFixed(2);
    transactions.splice(index, 1);
  }

  if (balanceTotal < 0) {
    alert('Changing this transaction type would result in a negative balance. Operation cancelled.');
    transactions[index].type = oldType;
    balanceTotal = incomeTotal - expenseTotal;
    updateAll();
    return;
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateAll();
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
  let confirmDelete = confirm('Are you sure you want to delete this transaction? You have the option to edit.');

  if (confirmDelete) {
    if (transactions[index].type === 'income') {
      deleteIncome(index);
    } else {
      transactions.splice(index, 1);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      updateAll();
    }
  }
}

function deleteIncome(incomeIndex) {
  let incomeAmount = parseFloat(transactions[incomeIndex].amount);
  let newBalanceTotal = balanceTotal - incomeAmount;

  if (newBalanceTotal < 0) {
    let confirmDelete = confirm('Deleting this income transaction will clear all your expenses. Are you sure you want to proceed?');
    if (!confirmDelete) {
      return;
    }
  }

  transactions.splice(incomeIndex, 1);

  if (newBalanceTotal < 0) {
    transactions = transactions.filter(transaction => transaction.type === 'income');
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateAll();
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
      
      <div class="type" id="type-${index}" onclick="editType(${index})">
        <span style="font-size: 10px; color: #999;">Edit type</span><br>
        ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
      </div>
      <div class="action"><i class="bi bi-trash" onclick="deleteTransaction(${index});"></i></div>
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

  balanceTotal = incomeTotal - expenseTotal;

  document.getElementById('incomeTotal').innerHTML = `R${incomeTotal.toFixed(2)}`;
  document.getElementById('expenseTotal').innerHTML = `R${expenseTotal.toFixed(2)}`;
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
