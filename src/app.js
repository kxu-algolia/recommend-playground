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

// V1 - doesn't work any more
// RAD11A0FI    // niyah
// VA111N0DI    // kenova

// AD541C01I    // terrex
// 1MI82N009    // graphic t shirt

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

// niyah
const $hits1 = document.querySelector('#hits');
const recs1 = generateRelatedProducts($hits1, getState());
console.log("recs1", recs1);

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
    //view: horizontalSlider,
    headerComponent: () => null,
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

  // TODO: make fallback params editable
  var fallback = {};
  var fallbackValue = document.querySelector('input[name=fallback]:checked').value;
  if (fallbackValue === 'shirts') {
    console.log("shirts");
    fallback = {
      facetFilters: ['category:shirt']
    };
  } else if (fallbackValue === 'accessories') {
    console.log("accessories");
    fallback = {
      facetFilters: ["categories:Accessories"]
    };
  }
  var products = Array.from(
    document.querySelectorAll("input[name='products']:checked")).map((elem) => elem.value);
  console.log("products", products);

  const state = {
    objectIDs: products,
    threshold: parseInt(document.getElementById("myRange").value),
    maxRecommendations: parseInt(document.querySelector('input[name=maxRecs]:checked').value),
    fallbackParameters: fallback,
  };
  return state;
}

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
      Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
      .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
      .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
      
    console.log("updating projects", products);
    generateRelatedProducts($hits1, getState());
  })
});


//
// Threshold Slider
//
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value; // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
}
slider.onchange = function() {
  console.log("updated threshold:", this.value);
  generateRelatedProducts($hits1, getState());
}

//
// Max Recommendations
//
var radiosRecs = document.forms["maxRecs"].elements["maxRecs"];
for(var i = 0, max = radiosRecs.length; i < max; i++) {
    radiosRecs[i].onclick = function() {
        console.log("updated max recs:", this.value);
        generateRelatedProducts($hits1, getState());
    }
}

//
// Fallback Params
//
var radiosFallback = document.forms["fallback"].elements["fallback"];
for(var i = 0, max = radiosFallback.length; i < max; i++) {
    radiosFallback[i].onclick = function() {
        console.log("updated fallback:", this.value);
        generateRelatedProducts($hits1, getState());
    }
}


