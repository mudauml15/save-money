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
let transaction = { detail, amount, type };
transactions.push(transaction);
updateInput();

document.getElementById('txtDetail').value = '';
document.getElementById('txtAmount').value = 0;

localStorage.setItem('transactions', JSON.stringify(transactions));

}

