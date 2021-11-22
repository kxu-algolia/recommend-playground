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

const products = [
  "AD541C01I",        // terrex
  "1MI82N009",        // graphic t shirt
];
var recs1 = null;     // store recs for product to color-code recommendations


const searchClient = algoliasearch(
  '853MYZ81KY', 
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);

searchClient
  .multipleQueries(
    generateMultiQuery(products, indexName)
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
    console.log("recs1", recs1);
  });




//
// Generate Product Rows 
//
function generateMultiQuery(products, indexName) {
  var queries = [];
  for (const product of products) {
    queries.push({
      indexName: indexName,
      attributesToRetrieve: [  
        'objectID',
        'brand', 
        'name', 
        'unformatted_price', 
        'price',
        'category', 
        'full_url_image', 
      ],
      query: product,
    })
  }
  return queries;
}

function generateProductRow(item, checked = false) {
  return `
    <!-- Product Row -->
    <div class="flex items-center -mx-4 px-6 py-5">

      <!-- Product -->
      <div class="flex w-2/4">
        <label class="mr-4 inline-flex items-center">
          <input type="checkbox" name="products" value="${item.objectID}" ${(checked) ? 'checked' : ''} />
        </label>
        <div class="w-20">
          <img class="h-24" src="${item.full_url_image}" alt="">
        </div>
        <div class="flex flex-col justify-between ml-4 flex-grow">
          <span class="font-bold text-sm">${item.name}</span>
        </div>
      </div>

      <!-- Quantity -->
      <div class="flex justify-center w-1/4">
        <svg class="fill-current text-gray-600 w-3" viewBox="0 0 448 512"><path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
        </svg>
        <input class="mx-2 border text-center w-8" type="text" value="1">
        <svg class="fill-current text-gray-600 w-3" viewBox="0 0 448 512">
          <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
        </svg>
      </div>

      <!-- Price -->
      <span class="text-center w-1/4 font-semibold text-sm">${item.price}</span>
      
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

function itemTemplate(item, color) {
  return {
    dangerouslySetInnerHTML: {
      __html: `
        <li class="ais-hits--item" style="border-color: ${color}">
          <img src="${item.full_url_image}" width="100">
          <h3>${truncateName(item.name)}</h3>
          <p>${item.objectID}</p>
          <p>${item._score}</p>
        </li>`,
    },
  };
}

function generateRelatedProducts(container, state) {
  console.log("generating request...", state);
  const recs = [];

  // TODO: add in queryParameters
  // only recs with 'ankle' in the name will display
  //queryParameters: {
  //  query: 'ankle',
  //},

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

      return createElement('article', {
        dangerouslySetInnerHTML: {
          __html: `
            <li class="ais-hits--item" style="border-color: ${color}">
              <img src="${item.full_url_image}" width="100">
              <h3>${truncateName(item.name)}</h3>
              <p>${item.objectID}</p>
              <p>${score}</p>
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
  console.log("products", products);

  // Fallback state
  var fallback = document.querySelector('input[name=fallback]:checked').value;
  var fallbackFilter = {};
  if (fallback === 'shirts') {
    fallbackFilter = { facetFilters: ['category:shirt'] };
  }
  if (fallback === 'accessories') {
    fallbackFilter = { facetFilters: ["categories:Accessories"] };
  }

  const state = {
    objectIDs: products,
    maxRecommendations: parseInt(document.querySelector('input[name=maxRecs]:checked').value),
    threshold: parseInt(document.getElementById("myRange").value),
    fallbackParameters: fallbackFilter,
  };

  return state;
}



//
// Initialize Event Listeners
//

// Threshold Slider
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value; // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
}
slider.onchange = function() {
  console.log("updated threshold:", this.value);
  generateRelatedProducts($hits, getState());
}

// Max Recommendations
var radiosRecs = document.forms["maxRecs"].elements["maxRecs"];
for(var i = 0, max = radiosRecs.length; i < max; i++) {
    radiosRecs[i].onclick = function() {
        console.log("updated max recs:", this.value);
        generateRelatedProducts($hits, getState());
    }
}

// Fallback Params
var radiosFallback = document.forms["fallback"].elements["fallback"];
for(var i = 0, max = radiosFallback.length; i < max; i++) {
    radiosFallback[i].onclick = function() {
        console.log("updated fallback:", this.value);
        generateRelatedProducts($hits, getState());
    }
}
