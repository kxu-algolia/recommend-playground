import algoliarecommend from '@algolia/recommend';
import { relatedProducts } from '@algolia/recommend-js';
import { createElement } from 'preact';

const client = algoliarecommend(
  '853MYZ81KY',
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);

// RAD11A0FI    // niyah
// VA111N0DI    // kenova

const $form = document.querySelector('#form');
const $searchBox = document.querySelector('#searchBox input[type=search]');
const props = {
  indexName: 'flagship_fashion',
  maxRecommendations: 5,

  // only recs with 'ankle' in the name will display
  //queryParameters: {
  //  query: 'ankle',
  //},

  // if there are no recs, display 'shirts'
  //fallbackParameters: {
  //  facetFilters: ['category:shirt'],
  //},

};

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
const recs1 = []; 
relatedProducts({
  ...props,
  container: $hits1,
  objectIDs: [ p1 ],
  recommendClient: client,
  headerComponent: () => null,
  itemComponent({ item }) {
    recs1.push(item.objectID);
    return createElement('article', itemTemplate(item, 'blue'));
  },
});
console.log("recs1", recs1);

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

/*
$form.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = $searchBox.value;
  renderHits(query);
});
// renderHits($searchBox.value);
*/
