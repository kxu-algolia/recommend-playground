
/*
// Hit Recommmend API directly
const algoliarecommend = require('@algolia/recommend');
const client = algoliarecommend(
  '853MYZ81KY',
  'aed9b39a5a489d4a6c9a66d40f66edbf'
);
client.getRelatedProducts([
  {
    indexName: 'flagship_fashion',
    objectID: 'RAD11A0FI',
    maxRecommendations: 5,
    threshold: 35,
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
