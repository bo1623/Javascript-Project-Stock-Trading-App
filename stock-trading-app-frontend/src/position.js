class Position{//to be used in updateRealTimePrice
  constructor(username,ticker,price){
    this.username=username
    this.ticker=ticker
    this.price=price
  }

  postUpdatedPrice(){
    fetch("http://localhost:3000/positions/update",{
      method:'POST',
      headers: {
        "Content-Type":"application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(this)
    })
    .then(resp=>resp.json()) //retrieving the render json at the end of show
    .then(json=>updateUnrealizedAndValueInTable(json)) //now just need to replace this with a function to update unrealized profit on the DOM
  }

  updatePositionPrice(){ //just for updating the price and value in the backend but not rendering anything new on the HTML
    fetch("http://localhost:3000/positions/update",{
      method:'POST',
      headers: {
        "Content-Type":"application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(this)
    })
  }
}

function updateUnrealizedAndValueInTable(position){
  console.log('updating unrealized profit in table')
  console.log(position)
  let ticker=position.stock.ticker
  let tableLatestPrice=document.getElementById(`${ticker}-price`)
  if (!!tableLatestPrice){
    tableLatestPrice.innerText=Number(position.stock.latest_price).toFixed(2)
  }
  let unrealized=document.querySelector(`#${ticker}-unrealized-profit`)
  let value=document.querySelector(`#${ticker}-value`)
  unrealized.innerText=Number(position.unrealized).toFixed(2)
  value.innerText=Number(position.value).toFixed(2)
}

document.addEventListener('click',function(event){ //for update price buttons in position table
  if(event.target.className==='update-price-btn'){
    let ticker=event.target.parentNode.getAttribute('ticker')
    updateLatestPrice(ticker)
  }
})

function updateLatestPrice(ticker){ //for updating individual portfolio positions in the DOM
  let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
  fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=ZREIW6HJ1LEBYBQT`)
  .then(resp=>resp.json())
  .then(json=>updatePricesInBackend(username,ticker,json["Global Quote"]["05. price"])) //update price in the backend
  .then(()=>updateLatestPriceInDOM(username,ticker)) //updating price and unrealized profit and value in DOM
}

function updateLatestPriceInDOM(username,ticker){
  console.log(`in updateLatestPriceInDOM for ${ticker}`)
  fetch("http://localhost:3000/positions",{
    method: 'POST',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({username: username,ticker:ticker})
  })
  .then(resp=>resp.json())
  .then(json=>updateUnrealizedAndValueInTable(json))
}


function updatePieChart(){ //fetches json of all existing positions and creates new pie chart with them
  let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
  fetch("http://localhost:3000/positions",{ //need to post instead of get because we want to post the username to the positions controller
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({username: username})
  })
  .then(resp=>resp.json())
  .then(json=>createPieChart(json))
}
