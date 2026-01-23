"use strict";
import { BASE_URL } from "./config.js";

// --- DOM ELEMENTS ---
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");
const btnLogout = document.querySelector(".btn--logout");

const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
// const inputCloseEmail = document.querySelector(".form__input--email");
// const inputClosePassword = document.querySelector(".form__input--password");

// --- UI STATE & HELPERS ---
let _sorted = false;
let _logoutInterval = null;
let _logoutTimeLeft = 0;

// Comprehensive mapping for Nepal and other regions
const localeToCurrency = {
  "ne-NP": "NPR", // Nepali (Nepal)
  "en-NP": "NPR", // English (Nepal)
  "hi-IN": "INR", // Hindi (India)
  "en-IN": "INR", // English (India)
  "en-US": "USD",
  "en-GB": "GBP",
  "ja-JP": "JPY",
  "de-DE": "EUR",
  "fr-FR": "EUR",
};

/**
 * Fetches exchange rate from EUR (MongoDB Base) to target currency
 * Uses Open ER-API to ensure support for NPR (Nepal)
 */
async function getExchangeRate(target) {
  if (target === "EUR") return 1;
  try {
    // This API includes 160+ currencies including NPR
    const res = await fetch(`https://open.er-api.com/v6/latest/EUR`);
    if (!res.ok) throw new Error("Exchange rate fetch failed");

    const data = await res.json();
    return data.rates[target] || 1;
  } catch (err) {
    console.error("Exchange API Error:", err);
    return 1; // Fallback to 1:1 so the app doesn't crash
  }
}

// --- UI FUNCTIONS ---

const displayMovements = function (movements, sort = false, format) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? movements.slice().sort((a, b) => a.amount - b.amount)
    : movements;

  movs.forEach(function (movObj, i) {
    const mov = movObj.amount;
    const type = mov > 0 ? "deposit" : "withdrawal";
    const dateStr = movObj.date ? format.date(new Date(movObj.date)) : "";
    const valueStr = format.currency(mov);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${dateStr}</div>
        <div class="movements__value">${valueStr}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (movements, format) {
  const balance = movements.reduce((acc, mov) => acc + mov.amount, 0);
  labelBalance.textContent = format.currency(balance);
};

const calcDisplaySummary = function (movements, interestRate, format) {
  const incomes = movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = format.currency(incomes);

  const out = movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = format.currency(Math.abs(out));

  const interest = movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = format.currency(interest);
};

function updateUI(user) {
  if (labelWelcome)
    labelWelcome.textContent = `Welcome back, ${user.name.split(" ")[0]}`;

  displayMovements(user.movements, _sorted, user._format);
  calcDisplayBalance(user.movements, user._format);
  calcDisplaySummary(
    user.movements.map((m) => m.amount),
    user.interestRate,
    user._format,
  );

  resetLogoutTimer();
}

// --- INITIALIZATION ---
async function initApp() {
  try {
    // 1. Fetch from your MongoDB Backend
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        window.location.href = "index.html";
        return;
      }
      throw new Error("Failed to fetch user data");
    }

    const data = await response.json();
    const user = data.data.user;

    // 2. Detect Locale and Map to Currency
    const userLocale = navigator.language;
    const targetCurrency = localeToCurrency[userLocale] || "EUR";

    // 3. Fetch the Conversion Rate
    const rate = await getExchangeRate(targetCurrency);

    // 4. Set Formatters (Supports Nepali number formatting if Locale is ne-NP)
    const currencyFormatter = new Intl.NumberFormat(userLocale, {
      style: "currency",
      currency: targetCurrency,
      minimumFractionDigits: 2,
    });

    const dateFormatter = new Intl.DateTimeFormat(userLocale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    user._format = {
      currency: (n) => currencyFormatter.format(n),
      date: (d) => dateFormatter.format(d),
    };

    // 5. Convert MongoDB 'movement' array into 'movements' for UI
    const rawMovements = Array.isArray(user.movement) ? user.movement : [];
    user.movements = rawMovements.map((mov) => ({
      ...mov,
      amount: mov.amount * rate, // Actual conversion math
    }));

    updateUI(user);
    containerApp.style.opacity = 100;
  } catch (error) {
    console.error("App Init Error:", error);
    if (labelWelcome)
      labelWelcome.textContent = "Session Error. Please login again.";
    setTimeout(() => (window.location.href = "index.html"), 3000);
  }
}

document.addEventListener("DOMContentLoaded", initApp);

// --- EVENT HANDLERS ---

btnSort.addEventListener("click", () => {
  _sorted = !_sorted;
  initApp();
});

btnLogout.addEventListener("click", async () => {
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout error", err);
  } finally {
    if (_logoutInterval) clearInterval(_logoutInterval);
    window.location.href = "index.html";
  }
});

if (btnTransfer)
  btnTransfer.addEventListener("click", async (e) => {
    e.preventDefault();
    const toEmail = inputTransferTo.value;
    const amount = inputTransferAmount.value;
    try {
      const res = await fetch(`${BASE_URL}/auth/transfer`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail, amount }),
      });
      if (!res.ok) throw new Error("Transfer failed");
      inputTransferTo.value = inputTransferAmount.value = "";
      await initApp();
    } catch (err) {
      alert("Transfer Error: " + err.message);
    }
  });

if (btnLoan)
  btnLoan.addEventListener("click", async (e) => {
    e.preventDefault();
    const amount = inputLoanAmount.value;
    try {
      const res = await fetch(`${BASE_URL}/auth/loan`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Loan failed");
      inputLoanAmount.value = "";
      await initApp();
    } catch (err) {
      alert("Loan Error: " + err.message);
    }
  });

// --- TIMER LOGIC ---
function startLogoutTimer(durationSec = 300) {
  if (_logoutInterval) clearInterval(_logoutInterval);
  _logoutTimeLeft = durationSec;

  const tick = () => {
    const min = String(Math.trunc(_logoutTimeLeft / 60)).padStart(2, "0");
    const sec = String(_logoutTimeLeft % 60).padStart(2, "0");
    if (labelTimer) labelTimer.textContent = `${min}:${sec}`;

    if (_logoutTimeLeft <= 0) {
      clearInterval(_logoutInterval);
      window.location.href = "index.html";
    }
    _logoutTimeLeft -= 1;
  };

  tick();
  _logoutInterval = setInterval(tick, 1000);
}

function resetLogoutTimer() {
  startLogoutTimer(300);
}

["click", "mousemove", "keydown", "scroll", "touchstart"].forEach((ev) =>
  document.addEventListener(ev, () => {
    if (_logoutInterval) resetLogoutTimer();
  }),
);
