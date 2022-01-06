import algoliasearch from 'algoliasearch';
import algoliarecommend from '@algolia/recommend';
import { relatedProducts } from '@algolia/recommend-js';
import { createElement } from 'preact';

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

const objectIDs = {
  "AD541C01I": "red",         // terrex
  "1MI82N009": "blue",        // graphic t shirt  
};
var recs1 = null;     // store recs for product to color-code recommendations

const searchClient = algoliasearch(
  '853MYZ81KY', 
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);



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
    renderShoppingCart($cart, results);
  })

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
      return createElement('div', {
        dangerouslySetInnerHTML: {
          __html: `
           <div class="shadow rounded p-3 flex flex-col space-between w-full h-full">
              <a class="flex flex-col space-between relative w-full h-full">
                 <div class="absolute top-2 right-2 px-2 py-05 border border-green-200 text-xs bg-green-50 rounded rounded-full">
                    <svg class="inline-block text-green-500 mr-1" width="18" viewBox="0 0 24 24">
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

const state = {
  objectIDs: [ "AD541C01I", "1MI82N009" ],
  maxRecommendations: 10,
  threshold: 0,
}
generateRelatedProducts($hits, state);

