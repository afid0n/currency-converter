const inputFrom = document.querySelector('#my-currency');
const inputTo = document.querySelector('#converted-currency');
const footerRateFrom = document.querySelector('#one-curr__left');
const footerRateTo = document.querySelector('#one-curr__right');
const currencyButtonsFrom = document.querySelectorAll('.left-btn');
const currencyButtonsTo = document.querySelectorAll('.right-btn');
let selectedFromCurrency = 'RUB';
let selectedToCurrency = 'USD';
let activeField = null;
let activeConversionRate = 0;

const calculation = (rate) => {
  if (activeField === 'from') {
    inputTo.value = inputFrom.value
      ? (parseFloat(inputFrom.value) * rate).toFixed(5)
      : '';
  } else {
    inputFrom.value = inputTo.value
      ? (parseFloat(inputTo.value) * rate).toFixed(5)
      : '';
  }
}

const fetchAndConvert = () => {
  const from = activeField === 'from' ? selectedFromCurrency : selectedToCurrency;
  const to = activeField === 'from' ? selectedToCurrency : selectedFromCurrency;

  if (navigator.onLine) {
    fetch(`https://v6.exchangerate-api.com/v6/a03495cb7aef8936ab109a1a/pair/${from}/${to}`)
      .then(res => res.json())
      .then(data => {
        const rate = data.conversion_rate;
        activeConversionRate = rate
        calculation(rate)
      })
      .catch((err) => {
        Toastify({
          text: "Something went wrong",
          className: "info",
          style: {
            background: "linear-gradient(to right,rgb(176, 0, 0),rgb(245, 45, 45))",
          }
        }).showToast();
      });
  } else {
    calculation(activeConversionRate)
  }
};

const updateFooterRates = () => {
  fetch(`https://v6.exchangerate-api.com/v6/a03495cb7aef8936ab109a1a/pair/${selectedFromCurrency}/${selectedToCurrency}`)
    .then(res => res.json())
    .then(data => {
      footerRateFrom.innerHTML = `
        1 <p>${selectedFromCurrency}</p> = 
        <span>${data.conversion_rate.toFixed(5)}</span> 
        <p>${selectedToCurrency}</p>
      `;
    })
    .catch((err) => {
      Toastify({
        text: "Something went wrong",
        className: "info",
        style: {
          background: "linear-gradient(to right,rgb(176, 0, 0),rgb(245, 45, 45))",
        }
      }).showToast();
    });

  fetch(`https://v6.exchangerate-api.com/v6/a03495cb7aef8936ab109a1a/pair/${selectedToCurrency}/${selectedFromCurrency}`)
    .then(res => res.json())
    .then(data => {
      footerRateTo.innerHTML = `
        1 <p>${selectedToCurrency}</p> = 
        <span>${data.conversion_rate.toFixed(5)}</span> 
        <p>${selectedFromCurrency}</p>
      `;
    })
    .catch((err) => {
      Toastify({
        text: "Something went wrong",
        className: "info",
        style: {
          background: "linear-gradient(to right,rgb(176, 0, 0),rgb(245, 45, 45))",
        }
      }).showToast();
    });
};

const validateInput = (input) => {
  input.value = input.value.replace(/[^0-9.,]/g, '').replace(',', '.');

  let chars = input.value.split('');
  let decimalCount = 0;

  if (chars[0] === '.') {
    chars[0] = '0.';
  }

  chars = chars.filter(char => {
    if (char === '.') {
      decimalCount++;
      return decimalCount <= 1;
    }
    return true;
  });

  input.value = chars.join('');

  if (input.value.includes('.')) {
    const [intPart, decPart] = input.value.split('.');
    input.value = `${intPart}.${decPart.slice(0, 5)}`;
  }

  if (chars[0] === '0' && chars[1] !== '.' && chars.length > 1) {
    let i = 1;
    while (i < chars.length && chars[i] === '0') i++;
    input.value = chars.slice(i).join('');
  }
};

inputFrom.addEventListener('input', () => {
  activeField = 'from';
  validateInput(inputFrom);
  fetchAndConvert();
});

inputTo.addEventListener('input', () => {
  activeField = 'to';
  validateInput(inputTo);
  fetchAndConvert();
});

const setActiveButton = (buttons, activeBtn) => {
  buttons.forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
};

currencyButtonsFrom.forEach(button => {
  button.addEventListener('click', () => {
    selectedFromCurrency = button.textContent;
    setActiveButton(currencyButtonsFrom, button);
    fetchAndConvert();
    updateFooterRates();
  });
});

currencyButtonsTo.forEach(button => {
  button.addEventListener('click', () => {
    selectedToCurrency = button.textContent;
    setActiveButton(currencyButtonsTo, button);
    fetchAndConvert();
    updateFooterRates();
  });
});

updateFooterRates();
