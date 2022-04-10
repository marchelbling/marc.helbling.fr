const search = instantsearch({
    appId: 'IQKQPU4IQQ',
    apiKey: '1c0ac4215c6971e99e7eadb4c8b36df1',
    indexName: 'go-faq',
});

// search.AddWidget(
//     instantsearch.widgets.searchBox({
//         container:'#search-input'
//     })
// );
//
//
// search.AddWidget({
//     instantsearch.widgets.hits({
//         container:'#search-hits',
//         hitsPerPage: 10
//         templates: {
//             item: document.getElementById('search-hit-template').innerHTML,
//             empty:"No entries for <em>\"{{query}}\"</em>"
//         }
//     })
// });

search.start();

console.log("hello");
