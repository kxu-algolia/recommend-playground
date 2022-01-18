import algoliasearch from 'algoliasearch';
import algoliarecommend from '@algolia/recommend';
import { relatedProducts } from '@algolia/recommend-js';
import { createElement } from 'preact';
import { horizontalSlider } from '@algolia/ui-components-horizontal-slider-js';
import '@algolia/ui-components-horizontal-slider-theme';
import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';


// TODO: 
// refactor fallback / filtering code
// remove PRODUCTS global

/*******************************************************
 * 
 * Initialize
 * 
 *******************************************************/

const client = algoliarecommend(
  '853MYZ81KY',
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);
const indexName = 'flagship_fashion';

const $hits = document.getElementById('hits');
const $cart = document.getElementById('cart');
const $control = document.getElementById('control');
const $recs = document.getElementById('container-related-products');

const searchClient = algoliasearch(
  '853MYZ81KY', 
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);

// Object[]
var PRODUCTS = [];
const COLORS = ['red', 'blue', 'green'];

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
                indexName: 'flagship_fashion',
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
                  <img class="inline-block" src=${item.full_url_image} alt=${formatProductName(item.name)} width="40" height="40" />
                  ${item.name}
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
                <div class="h-32 w-full mb-4 flex items-center"><img class="m-auto w-auto h-auto" src="${item.full_url_image}" alt="${formatProductName(item.name)}" style="max-height: 140px; max-width: 160px;"></div>
             </div>
             <div class="capitalize w-full text-xs text-gray-500 mb-1">
              ${item.hierarchicalCategories.lvl1}
             </div>
             <div class="text-gray-900 text-sm font-medium mb-2 whitespace-normal">
              ${formatProductName(item.name)}
              </div>
             <div class="text-sm text-gray-700 mr-2 flex-grow">
                <svg class="inline mr-1 text-green-600" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke-linecap="round" stroke-linejoin="round">
                   <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                ${item.reviewScore} <span class="text-gray-400">(${item.reviewCount} reviews)</span>
             </div>
             <div class="my-2 font-semibold text-gray-800 text-sm">${item.price}</div>
          </a>
       </div>
    </li>`;
}


/*******************************************************
 * 
 * Show Attribution
 * 
 *******************************************************/

function execute() {
  const state = getState();
  if (state.showAttribution) {
    client.getRelatedProducts(
      PRODUCTS.map(product => createRequest(product))
    )
    .then(({ results }) => {
      const attribution = generateAttribution(results);
      renderCart(attribution);
      generateRelatedProducts(attribution);
    })
    .catch(err => {
      console.log("[ERROR] getRelatedProducts() w/ attribution", err);
    });
  } else {
    renderCart();
    generateRelatedProducts();
  }
  return false;
}

function createRequest(product) {
  const state = getState();
  return {
    indexName: 'flagship_fashion',
    objectID: product.objectID,
    ...state.params,
  };
}

function generateAttribution(results) {
  var attribution = {
    cart: {},
    recs: {},
  };
  for (var i = 0; i < results.length; i++) {
    const objectID = PRODUCTS[i].objectID;
    attribution.cart[objectID] = COLORS[i];
    for (const hit of results[i].hits) {
      attribution.recs[hit.objectID] = COLORS[i];
    }
  }
  return attribution;
}

/*******************************************************
 * 
 * Recommend
 * - Generate model inputs
 * 
 *******************************************************/

function formatProductName(str) {
  const name = str.split("-")[0].trim();
  return name.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}

function generateRelatedProducts(attribution = null) {
  const state = getState();
  const params = {
    indexName: indexName,
    objectIDs: PRODUCTS.map(p => p.objectID),
    ...state.params,
    container: $hits,
    recommendClient: client,
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
      // TODO: refactor this 
      var color = attribution ? attribution.recs[item.objectID] : null;
      var score = item._score ? item._score : 'fallback';
      var scoreColor = item._score ? 'green' : 'gray';
      if (score === 'fallback') color = null;

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
                    <div class="h-32 w-full mb-4 flex items-center"><img class="m-auto w-auto h-auto" src="${item.full_url_image}" alt="${formatProductName(item.name)}" style="max-height: 140px; max-width: 160px;"></div>
                 </div>
                 <div class="capitalize w-full text-xs text-gray-500 mb-1">
                  ${item.hierarchicalCategories.lvl1}
                 </div>
                 <div class="text-gray-900 text-sm font-medium mb-2 whitespace-normal">
                  ${formatProductName(item.name)}
                  </div>
                 <div class="text-sm text-gray-700 mr-2 flex-grow">
                    <svg class="inline mr-1 text-green-600" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke-linecap="round" stroke-linejoin="round">
                       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    ${item.reviewScore} <span class="text-gray-400">(${item.reviewCount} reviews)</span>
                 </div>
                 <div class="my-2 font-semibold text-gray-800 text-sm">${item.price}</div>
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
    ...state.params
  });
  relatedProducts(params);
}

/*******************************************************
 * 
 * State Management
 * 
 *******************************************************/

// GET THE VALUES FROM THE FIRST SELECTED ITEM!!
function getState() {
  // var ux = document.querySelector('input[name=ux]:checked').value;

  var maxRecs = parseInt(document.querySelector('input[name=maxRecs]:checked').value);
  var filters = Array.from(
    document.querySelectorAll("input[name='filterStrategy']:checked")
  ).map((e) => e.value);

  var attribution = document.querySelector("input[id='attribution']").checked;

  var fallback = document.querySelector('input[name=fallbackStrategy]:checked').value;

  return  {
    showAttribution: attribution,
    params: {
      maxRecommendations: maxRecs,
      threshold: 0,
      queryParameters: translateFilters(filters),
      fallbackParameters: translateFallback(fallback),
      // view: (ux === 'grid') ? null : horizontalSlider,
    },
  };
}

// takes Filter Strategy values and formats them into queryParameters
function translateFilters(filters) {
  var facetFilters = [],
      numericFilters = [];
  for (const filter of filters) {
    if (filter === "price") {
      numericFilters.push("unformated_price > ".concat(
        parseAttr(PRODUCTS, 'unformated_price')[0]
      ));
    } else if (filter === "best") {
      numericFilters.push('reviewScore > 4', 'reviewCount > 25');
    } else if (filter === "category") {
      facetFilters.push('hierarchicalCategories.lvl1:'.concat(
        parseAttr(PRODUCTS, 'hierarchicalCategories.lvl1')[0]
      ));
    } else if (filter === "brand") {
      facetFilters.push('brand:'.concat(
        parseAttr(PRODUCTS, 'brand')[0]
      ));
    }
  }
  return {
    facetFilters: facetFilters,
    numericFilters: numericFilters,
  }
}

function translateFallback(fallback) {
  if (fallback === 'best') {
    return { numericFilters: [
      'reviewScore > 4', 'reviewCount > 25'
    ]};
  } else if (fallback === 'category') {
    return { facetFilters: [
      'hierarchicalCategories.lvl1:'.concat(parseAttr(PRODUCTS, 'hierarchicalCategories.lvl1')[0])
    ]};
  } else if (fallback === 'brand') {
    return { facetFilters: [
      'brand:'.concat(parseAttr(PRODUCTS, 'brand')[0])
    ]};
  } else if (fallback === 'price') {
    return { numericFilters: [
      "unformated_price > ".concat(parseAttr(PRODUCTS, 'unformated_price')[0])
    ]};
  } else {
    return {}
  }
}

function parseAttr(results, attr) {
  var arr = [];
  for (const result of results) {
    arr.push(result[attr]);
  }
  return [...new Set(arr)];
}

