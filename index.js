class CurrencyExchanger {
  constructor({
    baseCurrencySelect,
    exchangeCurrencySelect,
    exchangeCurrencyOutput,
    currencyDateHeading,
  }) {
    this.baseCurrencySelect = baseCurrencySelect;
    this.exchangeCurrencySelect = exchangeCurrencySelect;
    this.exchangeCurrencyOutput = exchangeCurrencyOutput;
    this.currencyDateHeading = currencyDateHeading;

    this.handleInitCurrencyExchange();
    this.handleSetTodaysDate();
  }
  handleSetTodaysDate = () => {
    const todaysDate = new Date().toLocaleDateString();
    this.currencyDateHeading.textContent += todaysDate;
  };
  handleResetAllValues = () => {
    this.baseCurrency = "";
    this.exchangeCurrency = "";
    this.exchangeRatesEur = "";
    this.exchangeRatesGbp = "";
    this.exchangeRatesPln = "";
    this.handleResetValuesToDefault();
  };
  handleInitCurrencyExchange = () => {
    this.baseCurrencySelect.addEventListener(
      "change",
      this.handleBaseCurrencySelect
    );
    this.exchangeCurrencySelect.addEventListener(
      "change",
      this.handleExchangeCurrencySelect
    );
    this.handleResetAllValues();
  };
  handleMakeCalculations = () => {
    let calculatedCurrency;
    if (this.exchangeRatesEur) {
      const { euroToGbp, euroToEuro, euroToPln } = this.exchangeRatesEur;
      if (this.exchangeCurrency === "EUR") {
        calculatedCurrency = +this.currencyAmount * +euroToEuro;
      } else if (this.exchangeCurrency === "GBP") {
        calculatedCurrency = +this.currencyAmount * +euroToGbp;
      } else if (this.exchangeCurrency === "PLN") {
        calculatedCurrency = +this.currencyAmount * +euroToPln;
      }
    } else if (this.exchangeRatesGbp) {
      const { gbpToEuro, gbpToGbp, gbpToPln } = this.exchangeRatesGbp;
      if (this.exchangeCurrency === "EUR") {
        calculatedCurrency = +this.currencyAmount * +gbpToEuro;
      } else if (this.exchangeCurrency === "GBP") {
        calculatedCurrency = +this.currencyAmount * +gbpToGbp;
      } else if (this.exchangeCurrency === "PLN") {
        calculatedCurrency = +this.currencyAmount * +gbpToPln;
      }
    } else if (this.exchangeRatesPln) {
      const { plnToEuro, plnToPln, plnToGbp } = this.exchangeRatesPln;
      if (this.exchangeCurrency === "EUR") {
        calculatedCurrency = +this.currencyAmount * +plnToEuro;
      } else if (this.exchangeCurrency === "GBP") {
        calculatedCurrency = +this.currencyAmount * +plnToGbp;
      } else if (this.exchangeCurrency === "PLN") {
        calculatedCurrency = +this.currencyAmount * +plnToPln;
      }
    } else return;

    calculatedCurrency = calculatedCurrency.toString().includes(".")
      ? calculatedCurrency.toFixed(2)
      : calculatedCurrency;
    this.exchangeCurrencyOutput.innerText = calculatedCurrency;
  };
  handleResetValuesToDefault = () => {
    this.exchangeCurrencyOutput.innerText = "";
    this.currencyAmount = "";
    if (this.baseValueInput) {
      this.baseValueInput.value = "";
    }
  };
  handleCurrentRates = (rates) => {
    let plnEuroRate;
    let plnGbpRate;
    rates.forEach((item) => {
      if (item.code === "EUR") {
        plnEuroRate = item.mid;
      }
      if (item.code === "GBP") {
        plnGbpRate = item.mid;
      }
    });

    switch (this.baseCurrency) {
      case "EUR":
        this.exchangeRatesEur = {
          euroToGbp: +plnEuroRate / +plnGbpRate,
          euroToEuro: 1,
          euroToPln: +plnEuroRate,
        };
        this.exchangeRatesGbp = "";
        this.exchangeRatesPln = "";
        break;
      case "GBP":
        this.exchangeRatesGbp = {
          gbpToEuro: +plnGbpRate / +plnEuroRate,
          gbpToGbp: 1,
          gbpToPln: +plnGbpRate,
        };
        this.exchangeRatesEur = "";
        this.exchangeRatesPln = "";
        break;
      case "PLN":
        this.exchangeRatesPln = {
          plnToEuro: 1 / +plnEuroRate,
          plnToPln: 1,
          plnToGbp: 1 / +plnGbpRate,
        };
        this.exchangeRatesEur = "";
        this.exchangeRatesGbp = "";
        break;
      default:
        return;
    }
  };
  handleBaseCurrencySelect = (event) => {
    this.baseCurrency = event.currentTarget.value;
    const getSelectedCurrencyData = fetch(
      "https://api.nbp.pl/api/exchangerates/tables/a?format=json"
    );
    getSelectedCurrencyData
      .then((res) => res.json())
      .then((data) => {
        this.handleCurrentRates(data[0].rates);
      });
    this.handleResetValuesToDefault();
  };
  handleExchangeCurrencySelect = (event) => {
    this.exchangeCurrency = event.currentTarget.value;
    this.handleResetValuesToDefault();
  };

  handleCurrencyInputedAmount = (amount, baseValInput) => {
    this.currencyAmount = amount;
    this.baseValueInput = baseValInput;
  };
  handleComputeExchange = () => {
    if (
      this.currencyAmount !== "" &&
      this.baseCurrency !== "" &&
      this.exchangeCurrency !== "default"
    ) {
      this.handleMakeCalculations();
    } else {
      const message = document.createElement("p");
      message.textContent =
        "please choose the base currency and the exchange currency and provide the amount";
      message.classList.add("error-message");
      document.body.appendChild(message);
      setTimeout(() => {
        message.remove();
      }, 3000);
    }
  };
}
const currencyDateHeading = document.querySelector(
  ".currency-calculation-date"
);
const exchangeBtn = document.getElementById("submit-exchange");
const baseCurrencySelect = document.getElementById("base-currency-select");
const exchangeCurrencySelect = document.getElementById(
  "exchange-currency-select"
);
const exchangeAmountInput = document.getElementById("base-currency-amount");
const exchangeCurrencyOutput = document.getElementById(
  "exchange-currency-output"
);

const currencyExchange = new CurrencyExchanger({
  baseCurrencySelect,
  exchangeCurrencySelect,
  exchangeCurrencyOutput,
  currencyDateHeading,
});

exchangeAmountInput.addEventListener("input", (event) => {
  currencyExchange.handleCurrencyInputedAmount(
    event.target.value,
    event.currentTarget
  );
});

exchangeBtn.addEventListener("click", () => {
  currencyExchange.handleComputeExchange();
});
