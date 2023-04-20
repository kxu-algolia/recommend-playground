import algoliasearch from 'algoliasearch';
import algoliarecommend from '@algolia/recommend';
import { relatedProducts } from '@algolia/recommend-js';
import { createElement } from 'preact';
import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';

import { predictClient as algoliapredict } from '@algolia/predict';


// TODO: 
// remove PRODUCTS global

/*******************************************************
 * 
 * App-specific Parameters
 * 
 * Change these to make this demo work with a different app
 * 
 *******************************************************/

 // New Flagship
const appID     = 'U9UXVSI686';
const apiKey    = '957a686033e36becc98438f052691675';
const indexName = 'prod_ECOM';

const DISPLAY = {
  name:   'name',
  brand:  'brand',
  image:  'image_urls.0',
  gender: 'gender',
  color:  'color.original_name',
  priceStr:     'price.value',
  category:     'hierarchical_categories.lvl1',
  reviewScore:  'reviews.rating',
  reviewCount:  'reviews.count',
};

// Add custom mapping logic here, if any
function getName(item, format = true) {
  return resolve(DISPLAY.name, item);
}
function getImage(item) {
  return resolve(DISPLAY.image, item);
}
function getCategory(item) {
  return resolve(DISPLAY.category, item);
}
function getReviewScore(item) {
  return resolve(DISPLAY.reviewScore, item);
}
function getReviewCount(item) {
  return resolve(DISPLAY.reviewCount, item);
}
function getPrice(item) {
  return `£ ${resolve(DISPLAY.priceStr, item)}`;
}

/*******************************************************
 * 
 * Helpers
 * 
 *******************************************************/

function resolve(path, obj) {
  return path.split('.').reduce(function(prev, curr) {
    return prev ? prev[curr] : null
  }, obj || self);
}

function formatProductName(str) {
  const name = str.split("-")[0].trim();
  return name.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}

/*******************************************************
 * 
 * Initialize
 * 
 *******************************************************/

var PRODUCTS = [];
const COLORS = ['red', 'blue', 'green', 'orange', 'violet'];

const searchClient    = algoliasearch(appID, apiKey);
const recommendClient = algoliarecommend(appID, apiKey);
const predictClient = algoliapredict(
  appID,
  apiKey,
  'us' // 'eu' for Europe, 'us' for United States
);

const $hits     = document.getElementById('hits');
const $cart     = document.getElementById('cart');
const $control  = document.getElementById('control');
const $recs     = document.getElementById('container-related-products');

$control.addEventListener('change', event => {
  event.preventDefault();
  execute();
  return false;
});

/*******************************************************
 * 
 * Autocomplete
 * 
 *******************************************************/

const autocompleteSearch = autocomplete({
  container: '#autocomplete',
  placeholder: 'Add a product to cart to get started!',
  getSources() {
    return [
      {
        sourceId: 'products',
        getItemInputValue: ({ item }) => item.query,
        getItems({ query }) {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: indexName,
                query,
                params: {
                  hitsPerPage: 5,
                },
              },
            ],
          });
        },
        templates: {
          item({ item, createElement }) {
            return createElement('div', {
              dangerouslySetInnerHTML: {
                __html: `<div>
                  <img class="inline-block" src=${getImage(item)} alt=${getName(item)} width="40" height="40" />
                  ${getName(item, false)}
                </div>`,
              },
            });
          },
        },
        onSelect: ({ item }) => {
          addToCart(item);
          execute();
          return false;
        },
      },
    ];
  },
});

/*******************************************************
 * 
 * Shopping Cart
 * 
 *******************************************************/

// clicked remove from cart button
$cart.addEventListener('click', event => {
  event.preventDefault();
  if (event.target.localName === 'button') {
    removeFromCart(event.target.parentNode.parentNode.parentNode);
    execute();
  }
  return false;
});


function addToCart(product) {
  PRODUCTS.push(product);
  if (PRODUCTS.length > 0) {
    $recs.classList.replace("invisible", "visible");
  }
}

function removeFromCart(li) {
  const idx = parseInt(li.getAttribute('index'));
  PRODUCTS.splice(idx, 1);
  if (PRODUCTS.length === 0) {
    $recs.classList.replace("visible", "invisible");
  }
}

function renderCart(attribution = null) {
  $cart.innerHTML = '';
  for (var i = 0; i < PRODUCTS.length; i++) {
    const color = attribution ? 
      attribution.cart[PRODUCTS[i].objectID] :
      null;
    const html = renderCartProduct(PRODUCTS[i], i, color)
    const fragment = document.createRange().createContextualFragment(html);
    $cart.appendChild(fragment);
  }
}

function renderCartProduct(item, idx, color = null) {
  var colorClass = color ? `border-2 border-${color}-400` : '';

  return `
    <li class="${colorClass}" index="${idx}">
       <div class="shadow rounded p-3 flex flex-col space-between w-full h-full">
          <a class="flex flex-col space-between relative w-full h-full">
             <button class="absolute top-2 right-2 px-2 py-05 border border-gray-200 text-xs bg-gray-50 rounded rounded-full hover:bg-red-100 hover:border-red-200">
                x
             </button>

             <div class="flex-none">
                <div class="h-32 w-full mb-4 flex items-center"><img class="m-auto w-auto h-auto" src="${getImage(item)}" alt="${getName(item)}" style="max-height: 140px; max-width: 160px;"></div>
             </div>
             <div class="capitalize w-full text-xs text-gray-500 mb-1">
              ${getCategory(item)}
             </div>
             <div class="text-gray-900 text-sm font-medium mb-2 whitespace-normal">
              ${getName(item)}
              </div>
             <div class="text-sm text-gray-700 mr-2 flex-grow">
                <svg class="inline mr-1 text-green-600" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke-linecap="round" stroke-linejoin="round">
                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                ${getReviewScore(item)} <span class="text-gray-400">(${getReviewCount(item)} reviews)</span>
             </div>
             <div class="my-2 font-semibold text-gray-800 text-sm">
              ${getPrice(item)}
            </div>
          </a>
       </div>
    </li>`;
}


/*******************************************************
 * 
 * Recommend (Related Products) // Predict
 * 
 *******************************************************/

// this gets run whenever there's a change that gets triggered
// in that case, we want to:
// - check the state
// - if there's a PREDICT call that we need to make
//  - make the PREDICT call, and then call generateRelatedProducts in the then
// - otherwise, make the generateRelatedProducts() on its own (no facetFilters);
function execute() {
  renderCart();
  var persona = document.querySelector('input[name=personalizationStrategy]:checked').value;
  if (persona !== "none") {
    generateRelatedProductsWithPredict(persona);
  } else {
    generateRelatedProducts({}, 20);
  }
  return false;
}

function generateRelatedProductsWithPredict(persona) {
  var profileID = '';
  if (persona == 'alice') {
    profileID = 'f102122215.419112893';
  } else if (persona == 'bob') {
    profileID = 'f168293368.672282899';
  }

  var userProfile = predictClient
    .fetchUserProfile({
      userID: profileID,
      params: {
        modelsToRetrieve: ['affinities', 'order_value'],
      },
    })
    .then((profile) => {
      console.log("Predict Profile", profile);

      // transform the predict profile and convert into filters
      const affinitiesThreshold = 0.50;
      var facetFilters = profile.predictions.affinities.value
        .filter(affinity => affinity.probability > affinitiesThreshold)
        .map(affinity => `${affinity.name}:${affinity.value}`);
      var queryParams = {
          facetFilters: [ facetFilters ]   // inner array OR 
          //facetFilters: facetFilters
      };

      // GET /recommendations based on user profile affinities
      generateRelatedProducts(queryParams, 20);
    });
}

function generateRelatedProducts(queryParams = {}, maxRecommendations = 10) {
  const params = {
    indexName: indexName,
    objectIDs: PRODUCTS.map(p => p.objectID),
    queryParameters: queryParams,
    maxRecommendations: maxRecommendations,
    container: $hits,
    recommendClient: recommendClient,
    headerComponent: () => null,
    fallbackComponent: () => {
      return createElement('article', {
        dangerouslySetInnerHTML: {
          __html: `
            <div>No recommendations! Try adding another product or setting a Fallback Strategy.</div>
          `,
        },
      });
    },
    classNames: {
      title: 'text-gray-900 text-xl mt-12 mb-2 font-medium',
      list:
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2',
    },
    itemComponent({ item }) {
      var color = null;
      var score = item._score ? item._score : 'fallback';
      var scoreColor = item._score ? 'green' : 'gray';
      if (score === 'fallback') color = null;

      var isPromoted = false;
      if (item._rankingInfo) {
          if ("promoted" in item._rankingInfo) {
            if (item._rankingInfo.promoted) {
              isPromoted = true;
              score = 'pinned';
          }
        }
      }

      return createElement('div', {
        class: color ? `border-2 border-${color}-400` : '',
        dangerouslySetInnerHTML: {
          __html: `
           <div class="shadow rounded p-3 flex flex-col space-between w-full h-full">
              <a class="flex flex-col space-between relative w-full h-full">
                 <div class="absolute top-2 right-2 px-2 py-05 border border-${scoreColor}-200 text-xs bg-${scoreColor}-50 rounded rounded-full">
                    <svg class="inline-block text-${scoreColor}-500 mr-1" width="18" viewBox="0 0 24 24">
                       <path fill="currentColor" d="M18.984 9.984h2.016v4.031h-2.016v-4.031zM15 18v-12h2.016v12h-2.016zM3 14.016v-4.031h2.016v4.031h-2.016zM11.016 21.984v-19.969h1.969v19.969h-1.969zM6.984 18v-12h2.016v12h-2.016z"></path>
                    </svg>
                    ${score}
                 </div>
                 <div class="flex-none">
                    <div class="h-32 w-full mb-4 flex items-center"><img class="m-auto w-auto h-auto" src="${getImage(item)}" alt="${getName(item)}" style="max-height: 140px; max-width: 160px;"></div>
                 </div>
                 <div class="capitalize w-full text-xs text-gray-500 mb-1">
                  ${getCategory(item)}
                 </div>
                 <div class="text-gray-900 text-sm font-medium mb-2 whitespace-normal">
                  ${getName(item)}
                  </div>
                 <div class="text-sm text-gray-700 mr-2 flex-grow">
                    <svg class="inline mr-1 text-green-600" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke-linecap="round" stroke-linejoin="round">
                       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    ${getReviewScore(item)} <span class="text-gray-400">(${getReviewCount(item)} reviews)</span>
                 </div>
                 <div class="my-2 font-semibold text-gray-800 text-sm">${getPrice(item)}</div>
              </a>
              <button class="focus:outline-none flex-none mt-2 w-full inline-block text-gray-500 border-gray-400 border text-center rounded px-2 py-1 text-sm">Add to Cart</button>
           </div>`,
        },
      });
    },
  };
  console.log("relatedProducts()", {
    indexName: indexName,
    objectIDs: PRODUCTS.map(p => p.objectID),
    queryParameters: queryParams
  });
  relatedProducts(params);
}