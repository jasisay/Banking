'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

console.log('Welcome');

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
const locale = navigator.language;

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const formattedMov = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'GBP',
    }).format(mov);
    const html = `
         <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

let currentUser;

const deposits = movements.filter(function (mov) {
  return mov > 0;
});

const withdrawals = movements.filter(function (mov) {
  return mov < 0;
});

const calcBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = `${new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'GBP',
  }).format(acc.balance)}`;
};

const calcDisplaySum = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'GBP',
  }).format(incomes)}`;

  const outGoings = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `£${Math.abs(outGoings).toFixed(2)}`;

  const interests = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter(int => int > 1)
    .reduce((acc, int) => acc + int);
  labelSumInterest.textContent = `${new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'GBP',
  }).format(interests)}`;
};

const displayUI = function (acc) {
  displayMovements(acc.movements);
  calcBalance(acc);
  calcDisplaySum(acc);
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentUser = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currentUser?.pin === Math.floor(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentUser.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
  }

  inputLoginPin.value = inputLoginUsername.value = '';
  inputLoginPin.blur();

  displayUI(currentUser);
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);

  if (
    receiver &&
    amount > 0 &&
    currentUser.balance >= amount &&
    currentUser.username !== receiver.username
  ) {
    currentUser.movements.push(-amount);
    receiver.movements.push(amount);
    displayUI(currentUser);
    inputTransferTo.value = inputTransferAmount.value = '';
  }
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentUser.movements, !sorted);
  sorted = !sorted;
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputLoanAmount.value;

  if (
    amount &&
    amount > 0 &&
    currentUser.movements.some(mov => mov >= 0.1 * amount)
  ) {
    setTimeout(function () {
      currentUser.movements.push(amount);
      displayUI(currentUser);
      inputLoanAmount.value = '';
    }, 5000);
  }
});

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
  });
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentUser.username === inputCloseUsername.value &&
    currentUser.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentUser.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
});

setInterval(function () {
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  };
  labelDate.textContent = `${new Intl.DateTimeFormat(locale, options).format(
    now
  )}`;
}, 10000);

labelTimer.textContent = 'Click here to log out';

labelTimer.addEventListener('click', function (e) {
  e.preventDefault();
  containerApp.style.opacity = 0;
  labelWelcome.textContent = 'Log in to get started';
});
