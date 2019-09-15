var cnt = 0 //to be used in addNewPrices(), which is called in updateChart()
const MarketOpen = '093000'
const MarketClose = '160000'


function plotData(prices,ticker){
  let layout = {
    title: {
      text:`${ticker.toUpperCase()}`,
      font: {
        // family: 'Courier New, monospace',
        size: 24,
        color: 'rgb(255,255,255)'
      }
    },
    font:{
      color: 'rgb(255,255,255)'
    },
    plot_bgcolor:"black",
    paper_bgcolor:"#000000"
  }
  Plotly.newPlot('chart',[{
      x: [getTimes(prices)][0].reverse(),
      y: [getPrices(prices)][0].reverse(),
      mode:'lines',
      line: {
        color: 'rgb(255, 206, 0)',
        width: 3
      },
      transforms: [{
        type: 'filter',
        target: 'x',
        operation: '!=',
        value: null
      }]
  }],layout);
  console.log(getTimes(prices))
  console.log(getPrices(prices))
}

function getTimes(prices){
  let times = prices.map(function(obj){
    return obj.timestamp
  })
  return times //returns the array of timestamps, to be used in initial plot creation
}

function getPrices(prices){
  let ticks = prices.map(function(obj){
    return obj.price
  })
  return ticks //returns array of prices, to be used in initial plot creation
}


function getNewPrice(prices){
  let last = prices[0]
  return last //return last object within the api
}

async function addNewPrices(){
  console.log(ticker.value)
  let newLink=`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker.value}&interval=1min&apikey=ZREIW6HJ1LEBYBQT`;
  const newResp = await fetch(newLink)
  const newJson = await newResp.json()
  const newTimeSeries= await newJson['Time Series (1min)']
  let newPrices= await Object.keys(newTimeSeries).map(function(key){
    return Object.assign({},{
      timestamp: key,
      price: newTimeSeries[key]["4. close"]
    })
  })

  updateRealTimePrice(getNewPrice(newPrices).price) //to update realTimePrice div
  Plotly.extendTraces('chart',{ x:[[getNewPrice(newPrices).timestamp]], y:[[getNewPrice(newPrices).price]]}, [0]);
  cnt++;
  if(cnt > 500) {
      Plotly.relayout('chart',{
          xaxis: {
              range: [cnt-500,cnt] //setting the range of x-axis
          }
      });
  }
}



function updateChart(){
  let current=time()
  if (current>MarketOpen && current<MarketClose){
    addNewPrices()
  }
}

function updateRealTimePrice(price){ //to be initiated once ticker is submitted
  console.log('inside updateRealTimePrice')
  let realTimePrice=document.getElementById('real-time-price')
  realTimePrice.innerText=`${ticker.value}: ${price}`
  let tableLatestPrice=document.getElementById(`${ticker.value}-price`)
  if (!!tableLatestPrice){
    tableLatestPrice.innerText=Number(price).toFixed(2)
  }
  //function to update innerText of realtimeprice div
  //leverage addNewPrices to prevent duplicating fetch requests
  updateUnrealized(price)
}

function updateUnrealized(price){
  if (!!document.getElementById('logout-button')){ //determine if user is logged in
    let ticker=document.getElementById('ticker').value
    let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
    let update=new Position(username,ticker,price)
    update.postUpdatedPrice() //post updated price to the backend
  }
}

async function getLongAPI(ticker){
  console.log('inside getLongAPI'+`Ticker=${ticker}`)
  let longLink=`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=ZREIW6HJ1LEBYBQT`;
  const longResp = await fetch(longLink)
  const longJson = await longResp.json()
  const longTimeseries= await longJson['Time Series (Daily)']
  let longPrices= await Object.keys(longTimeseries).map(function(key){
    return Object.assign({},{
      timestamp: key,
      price: longTimeseries[key]["4. close"]
    })
  })
  console.log('inside getAPI')
  console.log(getNewPrice(longPrices).timestamp)
  plotData(longPrices,ticker) //adding extra argument to determine if plotting for long or short series

  fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=ZREIW6HJ1LEBYBQT`)
  .then(resp=>resp.json())
  .then(json=>addInitialRealTimePriceDiv(json["Global Quote"]))
  // addRealTimePriceDiv(longPrices) //need to change this to take the latest price
  setInterval(updateChart,60000) //setting interval here to call updateRealTimePrice which sits within updateChart
}

function addInitialRealTimePriceDiv(priceObj){ //only used in getLongAPI call so that the realtimeprice div shows the most updated price taken from a
  //separate fetch, as opposed to taking the last obj from the longAPI array, which would only give us the previous day's close
  let realTimePrice=document.getElementById('real-time-price')
  realTimePrice.innerText=`${priceObj["01. symbol"]}: ${priceObj["05. price"]}`
}

async function getAPI(ticker){ //for intraday prices and chart
  let link=`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=1min&outputsize=compact&apikey=ZREIW6HJ1LEBYBQT`;
  const resp = await fetch(link)
  const json = await resp.json()
  const timeseries= await json['Time Series (1min)']
  console.log(timeseries)
  let prices= await Object.keys(timeseries).map(function(key){
    return Object.assign({},{
      timestamp: key,
      price: timeseries[key]["4. close"]
    })
  })

  let uniqueDates=[...new Set(prices.map(price=>{return price.timestamp.split(' ')[0]}))]
  let latestDate= uniqueDates[0] //getting latest date
  let modPrices=prices.filter(p=>p.timestamp.split(' ')[0]===latestDate)
  //filtering out price objects where the date is not equal to the latestdate
  console.log(modPrices)
  console.log('modPrices printed')
  plotData(modPrices,ticker)
}


document.getElementById('insert-ticker').addEventListener('submit',function(event){
  let ticker=document.getElementById('ticker').value
  getLongAPI(ticker)
  setDivTicker(ticker) //adding ticker attribute to the chart div
  displayButtons() //create toggle buttons for 5m and intraday prices
  if (!!document.getElementById('logout-button')){
    addBuySellBtns()
  }
  event.preventDefault()
})

function addBuySellBtns(){
  if (!document.getElementById('buy-btn')){ //if buttons already exist then we need not add them again
    let elem=document.getElementById('buy-sell-btns')
    elem.innerHTML+=`<button id='buy-btn' class='buy-sell'>Buy</button>
    <button id='sell-btn' class='buy-sell'>Sell</button>
    `
  }
}

function setDivTicker(ticker){
  let chartDiv=document.querySelector('#chart')
  chartDiv.setAttribute("ticker",`${ticker}`)
}

function addRealTimePriceDiv(prices){
  console.log('addRealTimePriceDiv running')
  let last=getNewPrice(prices)
  let realTimePrice=document.getElementById('real-time-price')
  realTimePrice.innerText=`${ticker.value}: ${last.price}`
}

let body=document.querySelector('body')
body.addEventListener('click',function(event){
  if(event.target.id==='5m'){
    let ticker=document.getElementById('ticker').value
    getLongAPI(ticker)
  }else if(event.target.id==='intraday'){
    let ticker=document.getElementById('ticker').value
    getAPI(ticker)
    // setInterval(updateChart,40000)
    console.log('clicking on intraday')
  }
})

//create 5m button and intraday button to toggle chart format
//only set interval for updateChart if the intraday button is clicked on to render the intraday chart
//but in the background we should setInterval to update realtimeprices

function time() {
  let newdate = new Date();
  let seconds = modNumber(newdate.getSeconds());
  let minutes = modNumber(newdate.getMinutes());
  let hours = newdate.getHours() > 12 ? modNumber((newdate.getHours()-12)) : modNumber((newdate.getHours()+12))
  let current = `${hours}${minutes}${seconds}`
  return current
}

function modNumber(num){
  return num.toString().length===2 ? num.toString() : `0${num}`
}


function displayButtons(){
  if(!document.getElementById('5m')){ //condition to detect if the buttons have already been created
    document.getElementById('toggle-time').innerHTML+=`
    <button id='5m'>5 Months</button>
    <button id='intraday'>Intraday</button>
  `
  }
}

//CREATING MODAL

let modal = document.querySelector(".modal")
let closeBtn = document.querySelector(".close-btn")

document.getElementById('buy-sell-btns').addEventListener('click',function(event){
  if(event.target.className==='buy-sell'){
    modal.style.display='block'
    console.log(event.target.id)
    if(event.target.id==='buy-btn'){
      addStockTradeForm('Buy')
    }else if(event.target.id==='sell-btn'){
      addStockTradeForm('Sell')
    }
  }
})

let closeBtns=document.getElementsByClassName('close-btn')
for (let i=0; i<closeBtns.length;i++){
  closeBtns[i].addEventListener('click',function(){
    modal.style.display="none"
    cashModal.style.display="none"
  })
}

function addStockTradeForm(direction){
  let ticker=document.getElementById('ticker').value
  let modal=document.getElementsByClassName('modal-content')[0]
  let tradePrice=document.getElementById('real-time-price').innerText.split(' ')[1] //removing the "TICKER: " portion of the innerText
  modal.innerHTML=`
  <h3>${direction} ${ticker} at ${tradePrice} per share</h3>
  <form action=# method='POST' id='trader-order'>
    <label for="quantity">Number of Shares: </label>
    <input name='quantity' type="number" id='number-of-shares'>
    <input type="submit" value="Submit Order">
  </form>
  `
}

class Trade{
  constructor(ticker,username,price,direction,quantity){
    this.ticker=ticker
    this.username=username
    this.price=price
    this.direction=direction
    this.quantity=quantity
  }

  postTrade(){
    fetch("http://localhost:3000/trades",{
      method:'POST',
      headers: {
        "Content-Type":"application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(this) //use .then over here to update table contents and render new trade onto DOM
    })
    .then(resp=>resp.json())
    .then(json=>newTradeUpdateTable(json))
    .then(userjson=>updateCashInDOM(userjson))
    .then(updatePieChart)
  }
}

function newTradeUpdateTable(position){
  console.log('updating table after trade submitted')
  let ticker=position.stock.ticker
  if(!!document.getElementById(`${ticker}-size`)){
    let latest_price=document.getElementById(`${ticker}-price`)
    let size=document.getElementById(`${ticker}-size`)
    let cost=document.getElementById(`${ticker}-cost`)
    let value=document.getElementById(`${ticker}-value`)
    let unrealized=document.getElementById(`${ticker}-unrealized-profit`)
    let realized=document.getElementById(`${ticker}-realized`)
    latest_price.innerText=Number(position.value/position.size).toFixed(2)
    size.innerText=position.size
    cost.innerText=Number(position.cost).toFixed(2)
    value.innerText=Number(position.value).toFixed(2)
    unrealized.innerText=Number(position.unrealized).toFixed(2)
    realized.innerText=Number(position.realized).toFixed(2)
  }else{
    let table=document.querySelector('table')
    table.innerHTML+=`
      <tr id=${ticker}-position-details>
        <td>${ticker}</td>
        <td id="${ticker}-price">${Number(position.value/position.size).toFixed(2)}</td>
        <td id="${ticker}-size">${position.size}</td>
        <td id="${ticker}-cost">${Number(position.cost).toFixed(2)}</td>
        <td id="${ticker}-value">${Number(position.value).toFixed(2)}</td>
        <td id="${ticker}-unrealized-profit">${Number(position.unrealized).toFixed(2)}</td>
        <td id="${ticker}-realized">${Number(position.realized).toFixed(2)}</td>
        <td ticker="${ticker}"><button class="update-price-btn">Update</button></td>
      </tr>
    `
  }
  return position.user //to be used in updateCashInDOM()
}

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

document.getElementsByClassName('modal-content')[0].addEventListener('submit',function(event){
  console.log('trade form submit button working')
  let ticker=document.querySelector('.modal-content h3').innerText.split(' ')[1]
  let direction=document.querySelector('.modal-content h3').innerText.split(' ')[0]
  let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
  let tradePrice=document.getElementById('real-time-price').innerText.split(' ')[1]
  let quantity=document.getElementById('number-of-shares').value
  let trade=new Trade(ticker,username,tradePrice,direction,quantity)
  trade.postTrade()
  modal.style.display="none"
  event.preventDefault()
})

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
