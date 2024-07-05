let transactions = [];
let balanceTotal = 0;
let IncomeTotal = 0;
let expenseTotal = 0;

function addTransaction() {
  let detail = document.getElementById('txtDetail').value.trim();
  let amount = parseFloat(document.getElementById('txtAmount').value);
  let type = document.getElementById('txtType').value;

  if (detail === '' || isNaN(amount) || amount <= 0) {
    alert('Please enter valid details and amount.');
    return;

}
if (type === 'expense' && incomeTotal === 0) {
  alert('Cannot add expense when income is not set.');
  return;
}

if (type === 'expense' && amount > incomeTotal - expenseTotal) {
  let remainingIncome = incomeTotal - expenseTotal;
  alert(`Expenses cannot exceed income. You have R${remainingIncome.toFixed(2)} left.`);
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
document.getElementById('txtAmount').value = 0;

localStorage.setItem('transactions', JSON.stringify(transactions));

}


