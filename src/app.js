import algoliasearch from 'algoliasearch';
import algoliarecommend from '@algolia/recommend';
import { relatedProducts } from '@algolia/recommend-js';
import { createElement } from 'preact';
import { horizontalSlider } from '@algolia/ui-components-horizontal-slider-js';
import '@algolia/ui-components-horizontal-slider-theme';
import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';

/*******************************************************
 * 
 * Initialize
 * - API clients
 * - Event listeners
 * 
 * function initEventListenersCart()
 * function initEventListenersControlPanel()
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

const objectIDs = {
  //"AD541C01I": "red",         // terrex
  "1MI82N009": "blue",        // graphic t shirt  
  "C2342C00N": "red",         // fairbanks hiking
};
var recs1 = null;     // store recs for product to color-code recommendations

const searchClient = algoliasearch(
  '853MYZ81KY', 
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);


const autocompleteSearch = autocomplete({
  container: '#autocomplete',
  getSources() {
    return [
      {
        sourceId: 'querySuggestions',
        getItemInputValue: ({ item }) => item.query,
        onSelect: ({ item }) => console.log("selected!", item),
        getItems({ query }) {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: 'flagship_fashion',
                query,
                params: {
                  hitsPerPage: 4,
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
                  ${item.name}
                </div>`,
              },
            });
          },
        },
      },
    ];
  },
});

var products = null;  // store cart product data for dynamic filtering

// Kick everything off! 
searchClient
  // fetch cart objects
  .multipleQueries(
    Object.keys(objectIDs).map((objectID) => {
      return { indexName: indexName, query: objectID }
    })
  )
  // render shopping cart
  .then(({ results }) => {
    products = results;
    renderShoppingCart($cart, results);
  })
  .then(() => {
    recs1 = generateRelatedProducts($hits, getState());
  })
  .then(() => {
    attachEventListeners();
  });


function attachEventListeners() {
  document.getElementById('control')
    .addEventListener('change', event => {
      generateRelatedProducts($hits, getState());
    });
}

/*******************************************************
 * 
 * Shopping Cart
 * 
 *******************************************************/

function renderShoppingCart(container, results) {
    for (const result of results) {
      const html = renderCartProduct(result.hits[0], true)
      const fragment = document.createRange().createContextualFragment(html);
      container.appendChild(fragment);
    }
}

function renderCartProduct(item, checked = false) {

  const color = objectIDs[item.objectID];
  return `
    <li class="auc-Recommend-item">
       <div class="shadow rounded p-3 flex flex-col space-between w-full h-full">
          <a class="flex flex-col space-between relative w-full h-full">
             <div class="flex-none">
                <div class="h-32 w-full mb-4 flex items-center"><img class="m-auto w-auto h-auto" src="${item.full_url_image}" alt="${truncateName(item.name)}" style="max-height: 140px; max-width: 160px;"></div>
             </div>
             <div class="capitalize w-full text-xs text-gray-500 mb-1">
              ${item.hierarchicalCategories.lvl1}
             </div>
             <div class="text-gray-900 text-sm font-medium mb-2 whitespace-normal">
              ${truncateName(item.name)}
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
 * Recommend
 * - Generate model inputs
 * - 
 * 
 *******************************************************/

// TODO: REMOVE THIS!
function truncateName(str) {
  const name = str.split("-")[0].trim();
  // title case
  return name.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}


function generateRelatedProducts(container, state) {
  relatedProducts({
    indexName: indexName,
    ...state,
    container: container,
    recommendClient: client,
    headerComponent: () => null,
    fallbackComponent: () => {
      return createElement('article', {
        dangerouslySetInnerHTML: {
          __html: `
            <div>No recommendations! Try setting fallbackParameters</div>
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
      var score = item._score ? item._score : 'fallback';
      var scoreColor = item._score ? 'green' : 'gray';
      return createElement('div', {
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
                    <div class="h-32 w-full mb-4 flex items-center"><img class="m-auto w-auto h-auto" src="${item.full_url_image}" alt="${truncateName(item.name)}" style="max-height: 140px; max-width: 160px;"></div>
                 </div>
                 <div class="capitalize w-full text-xs text-gray-500 mb-1">
                  ${item.hierarchicalCategories.lvl1}
                 </div>
                 <div class="text-gray-900 text-sm font-medium mb-2 whitespace-normal">
                  ${truncateName(item.name)}
                  </div>
                 <div class="text-sm text-gray-700 mr-2 flex-grow">
                    <svg class="inline mr-1 text-green-600" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke-linecap="round" stroke-linejoin="round">
                       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    ${item.reviewScore} <span class="text-gray-400">(${item.reviewCount} reviews)</span>
                 </div>
                 <div class="my-2 font-semibold text-gray-800 text-sm">${item.price}</div>
              </a>
              <button class="active:bg-green-500 focus:outline-none flex-none mt-2 w-full inline-block text-red-600 border-red-500 border text-center rounded px-2 py-1 text-sm hover:bg-red-600 hover:text-white">Add to Cart</button>
           </div>`,
        },
      });
    },
  });
}

// GET THE VALUES FROM THE FIRST SELECTED ITEM!!
function getState() {
  console.log("getting state");

  // var ux = document.querySelector('input[name=ux]:checked').value;

  var filters = Array.from(
    document.querySelectorAll("input[name='filterStrategy']:checked")
  ).map((e) => e.value);

  var fallback = document.querySelector('input[name=fallbackStrategy]:checked').value;

  return  {
    objectIDs: [ "AD541C01I", "1MI82N009" ],
    maxRecommendations: 10,
    threshold: 0,
    // view: (ux === 'grid') ? null : horizontalSlider,
    queryParameters: translateFilters(filters),
    fallbackParameters: translateFallback(fallback),
  };
}

/*******************************************************
 * 
 * Dynamically generate queryParameters and fallbackFilters
 * 
 *******************************************************/

function translateFallback(fallback) {
  if (fallback === 'best') {
    return { numericFilters: [
      'reviewScore > 4', 'reviewCount > 25'
    ]};
  } else if (fallback === 'category') {
    return { facetFilters: [
      'hierarchicalCategories.lvl1:'.concat(parseAttr(products, 'hierarchicalCategories.lvl1')[0])
    ]};
  } else {
    return {}
  }
}

// takes Filter Strategy values and formats them into queryParameters
function translateFilters(filters) {
  var params = {
    facetFilters: [],
    numericFilters: [],
  };
  for (const filter of filters) {
    if (filter === "price") {
      params.numericFilters.push("unformated_price > ".concat(
        parseAttr(products, 'unformated_price')[0]
      ));
    } else if (filter === "gender") {
      params.facetFilters.push('genderFilter:'.concat(
        parseAttr(products, 'genderFilter')[0]
      ));
    } else if (filter === "category") {
      params.facetFilters.push('hierarchicalCategories.lvl1:'.concat(
        parseAttr(products, 'hierarchicalCategories.lvl1')[0]
      ));
    } else if (filter === "brand") {
      params.facetFilters.push('brand:'.concat(
        parseAttr(products, 'brand')[0]
      ));
    }
  }
  return params;
}

function parseAttr(results, attr) {
  var arr = [];
  for (const result of results) {
    arr.push(result.hits[0][attr]);
  }
  return [...new Set(arr)];
}

