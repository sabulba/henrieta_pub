const dev = {
  terminal_name: "rbtest",
  currency_code: "ILS",
  response_language: "hebrew",
  amount: "10.00",
};

const prod = {
  terminal_name: "rbtest",
  currency_code: "ILS",
  response_language: "hebrew",
  amount: "20.00",
};

export const environment = process.env.REACT_APP_STAGE === "dev" ? dev : prod || dev;
