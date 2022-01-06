import algoliasearch from 'algoliasearch';
import algoliarecommend from '@algolia/recommend';
import { relatedProducts } from '@algolia/recommend-js';
import { horizontalSlider } from '@algolia/ui-components-horizontal-slider-js';
import { createElement } from 'preact';
import '@algolia/ui-components-horizontal-slider-theme';

const client = algoliarecommend(
  '853MYZ81KY',
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);
const indexName = 'flagship_fashion';


const $hits = document.querySelector('#hits');
const $table = document.getElementById('products');

const objectIDs = {
  "AD541C01I": "red",         // terrex
  "1MI82N009": "blue",        // graphic t shirt  
};
var recs1 = null;     // store recs for product to color-code recommendations

const searchClient = algoliasearch(
  '853MYZ81KY', 
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);

searchClient
  .multipleQueries(
    generateMultiQuery(objectIDs, indexName)
  )
  .then(({ results }) => {
    for (const result of results) {
      const html = generateProductRow(result.hits[0], true)
      const fragment = document.createRange().createContextualFragment(html);
      $table.appendChild(fragment);
    }
  })
  .then(() => {
    recs1 = generateRelatedProducts($hits, getState());
  })
  .then(() => {
    initializeEventListeners();
  });


//
// Generate Product Rows 
//
function generateMultiQuery(objectIDs, indexName) {
  var queries = [];
  for (const objectID of Object.keys(objectIDs)) {
    queries.push({
      indexName: indexName,
      attributesToRetrieve: [  
        'objectID',
        'brand', 
        'name', 
        'unformated_price', 
        'price',
        'category', 
        'full_url_image', 
      ],
      query: objectID,
    })
  }
  return queries;
}

function generateProductRow(item, checked = false) {

  const color = objectIDs[item.objectID];

  return `
    <!-- Product Row -->
    <div class="flex items-center -mx-4 px-4 py-2 my-4 border-2 border-${color}-400">

      <!-- Product -->
      <div class="flex w-4/6">
        <label class="mr-4 inline-flex items-center">
          <input type="checkbox" name="products" value="${item.objectID}" ${(checked) ? 'checked' : ''} />
        </label>
        <div class="w-20">
          <img class="h-24" src="${item.full_url_image}" alt="">
        </div>
        <div class="flex flex-col ml-4 mt-2 flex-grow">
          <span class="font-bold text-sm mb-2">${item.name}</span>
          <span class="text-sm">Associated recommendations are shown in <span class="text-${color}-600">${color}</span></span>
        </div>
      </div>

      <!-- Quantity -->
      <div class="flex justify-center w-1/6">
        <svg class="fill-current text-gray-600 w-3" viewBox="0 0 448 512"><path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
        </svg>
        <input class="mx-2 border text-center w-8" type="text" value="1">
        <svg class="fill-current text-gray-600 w-3" viewBox="0 0 448 512">
          <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
        </svg>
      </div>

      <!-- Price -->
      <span class="text-center w-1/6 font-semibold text-sm">${item.price}</span>
      
    </div>`;
}


//
// Generate Recommendations
//

function truncateName(str) {
  return (str.length > 50) ? 
    str.substr(0, 35).concat("...") :
    str;
}

function generateRelatedProducts(container, state) {
  console.log("getting relatedProducts()...", state);
  const recs = [];

  relatedProducts({
    indexName: indexName,
    ...state,
    container: container,
    recommendClient: client,
    view: horizontalSlider,
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
    itemComponent({ item }) {
      recs.push(item.objectID);

      var score = item._score ? item._score : 'fallback';
      var color = (recs1.includes(item.objectID)) ? 'blue' : 'red';
      if (score == 'fallback') {
        color = 'gray';
      }
//               <p><span class="font-bold text-sm">score: </span>${score}
      return createElement('article', {
        class: `border-2 border-${color}-400 h-full`,
        dangerouslySetInnerHTML: {
          __html: `
            <li class="ais-hits--item p-2">

              <img src="${item.full_url_image}" width="100">
              <h3 class="font-bold text-sm mb-2">${truncateName(item.name)}</h3>
              <p>${item.price}</p>
              <p class="mb-2">
                <span class="inline-flex items-center justify-center px-2 py-1 text-xs text-white bg-gray-600 font-bold leading-none rounded-full">score: ${score}</span>
              </p>
            </li>`,
        },
      });
    },
  });

  return recs;
}

// 
// Get initial values
// 
function getState() {

  // Products
  var products = Array.from(
  document.querySelectorAll("input[name='products']:checked")).map((elem) => elem.value);

  // Fallback state
  var fallback = document.querySelector('input[name=fallback]:checked').value;
  var fallbackFilter = {};
  if (fallback === 'shirts') {
    fallbackFilter = { facetFilters: ['category:shirt'] };
  }
  if (fallback === 'accessories') {
    fallbackFilter = { facetFilters: ["categories:Accessories"] };
  }

  // Query params state
  var queryParameters = document.querySelector('input[name=queryParameters]:checked').value;
  var queryFilter = {};
  // only recs with 'ankle' in the name will display
  if (queryParameters === 'ankle') {
    queryFilter = { query: "ankle" };
  }
  if (queryParameters === 'price') {
    queryFilter = { numericFilters: "unformated_price > 100"};
  }

  const state = {
    objectIDs: products,
    maxRecommendations: parseInt(document.querySelector('input[name=maxRecs]:checked').value),
    threshold: parseInt(document.getElementById("myRange").value),
    fallbackParameters: fallbackFilter,
    queryParameters: queryFilter,
  };

  return state;
}



//
// Initialize Event Listeners
//
function initializeEventListeners() {
  //
  // Products Checkbox
  //
  // Select all checkboxes with the name 'settings' using querySelectorAll.
  var checkboxes = document.querySelectorAll("input[type=checkbox][name=products]");
  let products = []

  // Use Array.forEach to add an event listener to each checkbox.
  checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      products = 
        Array.from(checkboxes)  // Convert checkboxes to an array to use filter and map.
        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
        .map(i => i.value)      // Use Array.map to extract only the checkbox values from the array of objects.
      generateRelatedProducts($hits, getState());
    })
  });

  // Threshold Slider
  var slider = document.getElementById("myRange");
  var output = document.getElementById("demo");
  output.innerHTML = slider.value; // Display the default slider value
  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
      output.innerHTML = this.value;
  }
  slider.onchange = function() {
    generateRelatedProducts($hits, getState());
  }

  // Max Recommendations
  var radiosRecs = document.forms["maxRecs"].elements["maxRecs"];
  for(var i = 0, max = radiosRecs.length; i < max; i++) {
      radiosRecs[i].onclick = function() {
          generateRelatedProducts($hits, getState());
      }
  }

  // Fallback Params
  var radiosFallback = document.forms["fallback"].elements["fallback"];
  for(var i = 0, max = radiosFallback.length; i < max; i++) {
      radiosFallback[i].onclick = function() {
          generateRelatedProducts($hits, getState());
      }
  }

  // Query Params
  var radiosQuery = document.forms["queryParameters"].elements["queryParameters"];
  for(var i = 0, max = radiosQuery.length; i < max; i++) {
      radiosQuery[i].onclick = function() {
          generateRelatedProducts($hits, getState());
      }
  }
}