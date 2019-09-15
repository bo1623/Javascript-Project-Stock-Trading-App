let countries={
  "United Arab Emirates":"ae",
  "Argentina":"ar",
  "Austria":"at",
  "Australia":"au",
  "Belgium":"be",
  "Bulgaria":"bg",
  "Brazil":"br",
  "Canada":"ca",
  "Switzerland":"ch",
  "China":"cn",
  "Colombia":"co",
  "Cuba":"cu",
  "Czech Republic":"cz",
  "Germany":"de",
  "Egypt":"eg",
  "France":"fr",
  "United Kingdom":"gb",
  "Greece":"gr",
  "Hong Kong":"hk",
  "Hungary":"hu",
  "Indonesia":"id",
  "Ireland":"ie",
  "Israel":"il",
  "India":"in",
  "Italy":"it",
  "Japan":"jp",
  "South Korea":"kr",
  "Lithuania":"lt",
  "Latvia":"lv",
  "Morocco":"ma",
  "Mexico":"mx",
  "Malaysia":"my",
  "Nigeria":"ng",
  "Netherlands":"nl",
  "Norway":"no",
  "New Zealand":"nz",
  "Philippines":"ph",
  "Poland":"pl",
  "Portugal":"pt",
  "Romania":"ro",
  "Serbia":"rs",
  "Russia":"ru",
  "Saudi Arabia":"sa",
  "Sweden":"se",
  "Singapore":"sg",
  "Slovenia":"si",
  "Slovakia":"sk",
  "Thailand":"th",
  "Turkey":"tr",
  "Taiwan":"tw",
  "Ukraine":"ua",
  "United States":"us",
  "Venezuela":"ve",
  "South Africa":"za"
}

//Creating news sidebar
function topNews(){
  let url = 'https://newsapi.org/v2/top-headlines?' +
          'country=us&' +
          'apiKey=93db96180ea548c082a15c7b1a985770';
  let req = new Request(url);
  fetch(url)
  .then(resp=>resp.json())
  .then(json=>addArticlesToNewsbar(json["articles"]))
}


function addArticlesToNewsbar(array){
  let bar=document.getElementById('news-column')
  let articles=document.getElementsByClassName('articles')
  while(articles[0]){
    articles[0].parentNode.removeChild(articles[0]); //to clear whatever articles were in the newsbar to start with
  }
  array.forEach(article=>{
    bar.innerHTML+=`
      <div class="articles">
        <a href="${article.url}">${article.title}</a>
        <div class="article-des">${article.description}</div>
        <div class="published-time">Published at: ${new Date(article.publishedAt)}</div>
        <br>
      </div>
    `
  })
}


document.getElementById('newsbar').addEventListener('submit',function(event){
  if(event.target.id==="topic-news"){
    let topic=document.getElementById('topic').value
    let url = 'https://newsapi.org/v2/everything?' +
              `q=${topic}&` +
              // 'from=2019-09-10&' + leave date as optional for now
              'sortBy=popularity&' +
              'apiKey=93db96180ea548c082a15c7b1a985770';
    fetch(url)
    .then(resp=>resp.json())
    .then(json=>addArticlesToNewsbar(json["articles"]))
  }
  event.preventDefault()
})

function addCountrySelectors(){
  //adding options for each country
  let countryOptions=document.getElementById('country-select')
  for (key in countries){
    countryOptions.innerHTML+=`
    <option value=${key}>${key}</option>
    `
    }
  countryOptions.addEventListener('change',function(){
    console.log('inside country select event listener')
    let box=document.getElementById('country-select')
    let countryName=box.options[box.selectedIndex].text //selecting country name from the dropdown list
    newsByCountry(countries[countryName])
  })
}

function newsByCountry(name){
  let url='https://newsapi.org/v2/top-headlines?'+
          `country=${name}&category=business`+
          `&apiKey=93db96180ea548c082a15c7b1a985770`
  fetch(url)
  .then(resp=>resp.json())
  .then(json=>addArticlesToNewsbar(json["articles"]))
}

topNews() //initiate top news from the moment the page is opened
addCountrySelectors() //creating the options within the country dropdown list and addingeventlistener for a "change" event for the dropdown list
