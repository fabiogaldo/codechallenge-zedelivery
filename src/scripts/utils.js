const currencyFormatter = value => {
  const options = { style: "currency", currency: "BRL" };
  return value.toLocaleString("pt-BR", options);
}

const showLoading = () => {
  document.querySelector('#overlay').classList.add('visible');
}

const hideLoading = () => {
  document.querySelector('#overlay').classList.remove('visible');
}

const showResults = () => {
  document.querySelector('#results').classList.add('visible');
  document.querySelector('#results').scrollIntoView({ block: "start", behavior: "smooth" })
  document.querySelector('.delivery-address').classList.add('visible');
}

const showFooter = () => {
  document.querySelector('.footer').classList.add('visible');
}

export { currencyFormatter, showLoading, hideLoading, showResults, showFooter }