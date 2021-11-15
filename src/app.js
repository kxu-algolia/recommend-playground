import algoliarecommend from '@algolia/recommend';
import { relatedProducts } from '@algolia/recommend-js';
import { createElement } from 'preact';

const client = algoliarecommend(
  '853MYZ81KY',
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);

// RAD11A0FI    // niyah
// VA111N0DI    // kenova

// const $form = document.querySelector('#form');
// const $searchBox = document.querySelector('#searchBox input[type=search]');



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
const p1 = 'RAD11A0FI';
const $hits1 = document.querySelector('#hits');
const recs1 = generateRelatedProducts($hits1, [ p1 ], getState());
console.log("recs1", recs1);

function generateRelatedProducts(container, objectIDs, state) {
  console.log("generating request...");
  const recs = [];

  const props = {
    indexName: 'flagship_fashion',
    maxRecommendations: state.maxRecommendations,
    threshold: state.thresold,
    fallbackParameters: state.fallbackParameters,

    // only recs with 'ankle' in the name will display
    //queryParameters: {
    //  query: 'ankle',
    //},

    // if there are no recs, display 'shirts'
    //fallbackParameters: {
    //  facetFilters: ['category:shirt'],
    //},

  };

  relatedProducts({
    ...props,
    container: container,
    objectIDs: objectIDs,
    recommendClient: client,
    headerComponent: () => null,
    itemComponent({ item }) {
      recs.push(item.objectID);
      const color = 'blue';
      const score = item._score ? item._score : 'fallback';
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
  if (fallbackValue == 'shirts') {
    fallback = {
      facetFilters: ['category:shirt']
    };
  }

  const state = {
    thresold: parseInt(document.getElementById("myRange").value),
    maxRecommendations: parseInt(document.querySelector('input[name=maxRecs]:checked').value),
    fallbackParameters: fallback,
  };
  console.log("state", state);
  return state;
}


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
  generateRelatedProducts($hits1, [ p1 ], getState());
}

//
// Max Recommendations
//
var radiosRecs = document.forms["maxRecs"].elements["maxRecs"];
for(var i = 0, max = radiosRecs.length; i < max; i++) {
    radiosRecs[i].onclick = function() {
        console.log("updated max recs:", this.value);
        generateRelatedProducts($hits1, [ p1 ], getState());
    }
}

//
// Fallback Params
//
var radiosFallback = document.forms["fallback"].elements["fallback"];
for(var i = 0, max = radiosFallback.length; i < max; i++) {
    radiosFallback[i].onclick = function() {
        console.log("updated fallback:", this.value);
        generateRelatedProducts($hits1, [ p1 ], getState());
    }
}















/*
// kenova
const p2 = 'VA111N0DI';
const $hits2 = document.querySelector('#hits2');
const recs2 = []; 
relatedProducts({
  ...props,
  container: $hits2,
  objectIDs: [ p2 ],
  recommendClient: client,
  headerComponent: () => null,
  itemComponent({ item }) {
    recs2.push(item.objectID);
    return createElement('article', itemTemplate(item, 'red'));
  },
});
console.log("recs2", recs2);

// both 
const $hits3 = document.querySelector('#hits3');
relatedProducts({
  ...props,
  container: $hits3,
  objectIDs: [p1, p2],
  recommendClient: client,
  headerComponent: () => null,
  itemComponent({ item }) {
    console.log("merging", item.objectID);
    var color = (recs1.includes(item.objectID)) ? 'blue' : 'red';
    return createElement('article', itemTemplate(item, color));
  },
});
*/


// const $form = document.querySelector('#form');

/*
$form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = $searchBox.value;
  renderHits(query);
});
// renderHits($searchBox.value);
*/
