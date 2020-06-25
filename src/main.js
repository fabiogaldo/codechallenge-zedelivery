import { ApiService, pocSearchQuery, productListQuery } from "./scripts/services";
import * as Utils from './scripts/utils.js';
import './styles/main.scss';

const API_URL = 'https://api.code-challenge.ze.delivery/public/graphql';
const addressLabel = document.querySelector('#address');
const apiService = new ApiService();

const cardContainer = document.querySelector('#cards');
const totalValue = document.querySelector('#total-value');
const totalPrice = document.querySelector('#total-price');

const autocompleteFormField = document.getElementById('address-field');
const autocomplete = new google.maps.places.Autocomplete((autocompleteFormField), {});
const geocoder = new google.maps.Geocoder();

google.maps.event.clearInstanceListeners(autocompleteFormField);
google.maps.event.addListener(autocomplete, 'place_changed', () => {
  const returnedPlace = autocomplete.getPlace();
  addressLabel.innerHTML = returnedPlace.formatted_address;
  getCoordinates(returnedPlace.formatted_address);
});

let productList, currentTotal, addressLatitude, addressLongitude;

function getCoordinates(address) {
  //default address (R. Américo Brasiliense)
  address = 'R. Américo Brasiliense';
  geocoder.geocode({ 'address': address }, function (results, status) {

    if (status == google.maps.GeocoderStatus.OK) {
      addressLatitude = results[0].geometry.location.lat().toString();
      addressLongitude = results[0].geometry.location.lng().toString();
    } else {
      //use default address coords
      addressLatitude = "-23.632919";
      addressLongitude = "-46.699453";
    }
    Utils.showLoading();
    productList = '';
    cardContainer.innerHTML = '';
    getPOC(addressLatitude, addressLongitude)
  });
}

const getPOC = (_lat, _lng) => {
  apiService.load(API_URL, pocSearchQuery,
    { "algorithm": 'NEAREST', "lat": _lat, "long": _lng, "now": `${new Date().toISOString()}` }).then(data => {
      apiService.load(API_URL, productListQuery, { "id": `${data.data.pocSearch[0].id.toString()}`, "search": "", "categoryId": null }).then(results => {
        listProducts(results.data.poc.products);
      })
    });
}

const listProducts = (products) => {
  productList = products.map((item) => { return { 'title': item.productVariants[0].title, 'desc': item.productVariants[0].desc, 'price': item.productVariants[0].price, 'imageUrl': item.images[0].url } })

  const templateCard = `
  ${productList.map(product => `
    <div class="results__card">
      <div class="results__card--title">
        ${product.title}
      </div>
      <img src='${product.imageUrl}' class="results__card--image" />
      <div class="results__card--price">
        ${ Utils.currencyFormatter(product.price)}
      </div>
      <div class="results__card__actions">
        <input type='hidden' name='product-price' value='${product.price}'>
        <input type='number' name='quantity' class='results__card__actions--quantity' value='0' min='0' max='99' onchange='_recalculate(this.value,"${product.title}", ${product.price})'>
      </div>
    </div>
    `)}
  `;
  cardContainer.innerHTML = templateCard;
  Utils.hideLoading();
  Utils.showResults();
  Utils.showFooter();
}

window._listProducts = listProducts;
window._recalculate = recalculate;
window._cart = {};
window._list = {};

function recalculate(_n, _i, _p) {
  window._list[_i] = _p;
  window._cart[_i] = parseInt(_n);
  let totalValueCalculate = 0;
  for (var item in window._cart) {
    if (item) {
      totalValueCalculate += window._list[item] * window._cart[item];
    }
  }

  totalValue.innerHTML = Utils.currencyFormatter(totalValueCalculate);
}