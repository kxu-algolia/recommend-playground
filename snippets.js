

const str = document.createElement(
  `<!-- Product Row -->
    <div class="flex items-center -mx-4 px-6 py-5">

      <!-- Product -->
      <div class="flex w-2/4">
        <label class="mr-4 inline-flex items-center">
          <input type="checkbox" name="products" value="AD541C01I" />
        </label>
        <div class="w-20">
          <img class="h-24" src="https://res.cloudinary.com/hugo-valla/image/fetch/a_hflip/e_improve/e_pixelate_faces:40/e_make_transparent/https://img01.ztat.net/article/spp-media-p1/7bfc2e421d644651805c20313749cdb1/aa5b84514a8f45639c1434d7ec0d4938.jpg?imwidth=300&filter=packshot" alt="">
        </div>
        <div class="flex flex-col justify-between ml-4 flex-grow">
          <span class="font-bold text-sm">terrex cold.rdy shoes - winter boots - beige tone/core black/white</span>
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
      <span class="text-center w-1/4 font-semibold text-sm">£109.95</span>
      
    </div>`
  );

/*
// Multi-query
const algoliasearch = require('algoliasearch');

const client = algoliasearch(
  '853MYZ81KY', 
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);

const attributes = [  
  'objectID',
  'brand', 
  'name', 
  'unformatted_price', 
  'category', 
  'price',
  'full_url_image', 
];
const queries = [{
  indexName: 'flagship_fashion',
  query: 'AD541C01I',
  attributesToRetrieve: attributes,
}, {
  indexName: 'flagship_fashion',
  query: '1MI82N009',
  attributesToRetrieve: attributes,
}];
client.multipleQueries(queries).then(({ results }) => {
  for (const result of results) {
    console.log(result.hits[0]);
  }
});
*/

/*

// Hit Recommmend API directly
const algoliarecommend = require('@algolia/recommend');
const client = algoliarecommend(
  '853MYZ81KY',
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);
const products = client.getRelatedProducts([
  {
    indexName: 'flagship_fashion',
    objectID: 'RAD11A0FI',
    maxRecommendations: 10,
  },
])
.then(({ results }) => {
  console.log(JSON.stringify(results));
})
.catch(err => {
  console.log(err);
});

*/




/* Button with Event Listener

<button id="btnRecs" type="button" value="35">35</button>

const $button = document.getElementById('btnRecs');
$button.addEventListener('click', (event) => {
  console.log("clicked", $button.value);
  event.preventDefault();

  // update the threshold value to 35
  console.log("state", $hits1, [ p1 ], $button.value);
  generateRelatedProducts($hits1, [ p1 ], parseInt($button.value));

  //const query = $searchBox.value;
  //renderHits(query);
});

*/
