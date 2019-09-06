function plotData(prices,ticker){
  let layout = {
    title: {
      text:`${ticker}`,
      font: {
        // family: 'Courier New, monospace',
        size: 24
      }
    }
  }
  Plotly.newPlot('chart',[{
      x:[getTimes(prices)][0].reverse(),
      y:[getPrices(prices)][0].reverse(),
      type:'scatter',
      connectgaps: false,
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
  return times.filter(filterOutGaps) //returns the array of timestamps, to be used in initial plot creation
}

function filterOutGaps(timestamp)  {
  var date = new Date(timestamp);
  var hour = date.getHours();

  return (hour<= 8 && hour>16 ) ? null : timestamp;
}

function getPrices(prices){
  let ticks = prices.map(function(obj){
    return obj.price
  })
  return ticks //returns array of prices, to be used in initial plot creation
}


var cnt = 0 //to be used in addNewPrices(), which is called in updateChart()
const MarketOpen = '093000'
const MarketClose = '160000'


function getNewPrice(prices){
  let last = prices[0]
  let lastPrice=last.price
  let lastTime=last.timestamp
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
  console.log('new price added')
  console.log(newPrices)
  console.log(getNewPrice(newPrices).timestamp)
  console.log(getNewPrice(newPrices).price)

  updateRealTimePrice(getNewPrice(newPrices).price) //to update realTimePrice div
  //update unrealized profit here
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
  //function to update innerText of realtimeprice div
  //leverage addNewPrices to prevent duplicating fetch requests
  updateUnrealized(price)
}

function updateUnrealized(price){
  if (!!document.getElementById('logout-button')){ //determine if user is logged in
    let ticker=document.getElementById('ticker').value
    let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
    let update=new Position(username,ticker,price)
    update.postUpdatedPrice()
  }
}

async function getLongAPI(ticker){
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
  plotData(longPrices,ticker)
  addRealTimePriceDiv(longPrices)
  setInterval(updateChart,60000) //setting interval here to call updateRealTimePrice which sits within updateChart
}

async function getAPI(ticker){
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
  console.log('inside getAPI')
  console.log(getNewPrice(prices).timestamp)
  plotData(prices,ticker)
}

document.getElementById('insert-ticker').addEventListener('submit',function(event){
  let ticker=document.getElementById('ticker').value
  getLongAPI(ticker)
  setDivTicker(ticker) //adding ticker attribute to the chart div
  displayButtons() //create toggle buttons for 5m and intraday prices
  event.preventDefault()
})

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

//login function
function displayLogin(){
  if (!document.getElementById('login')){
    document.getElementById('insert-ticker').insertAdjacentHTML('afterEnd',`
    <div id="user-login">
      <form id="login" action="http://localhost:3000/users" method="post">
        <label for="username">Username: </label>
        <input id="username" name="username">
        <input type="submit" value="Submit">
      </form>
    </div>
    `)
  }
}

function displayButtons(){
  if(!document.getElementById('5m')){ //condition to detect if the buttons have already been created
    document.getElementById('toggle-time').innerHTML+=`
    <button id='5m'>5 Months</button>
    <button id='intraday'>Intraday</button>
  `
  }
}

class User{
  constructor(username){
    this.username=username
  }

  postUser(){
    fetch("http://localhost:3000/users",{
      method:'POST',
      headers: {
        "Content-Type":"application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(this)
    })
  }
}


displayLogin()
document.getElementById('login').addEventListener('submit',function(event){
  console.log(this.parentElement)
  let username=document.getElementById('username').value
  let user=new User(username)
  user.postUser() //creating or finding user in the backend
  this.parentElement.innerHTML+=`<div id="logged-in-user">Account: ${username}</div>`
  removeLoginForm()
  addLogoutButton()
  renderPortfolioView()
  event.preventDefault()
})

function removeLoginForm(){
  let elem = document.getElementById('login')
  elem.remove()
}

function addLogoutButton(){
  let elem=document.getElementById('user-login') //maybe place logout button elsewhere
  elem.innerHTML+="<button id='logout-button'>Logout</button><br><br>"
}

function renderPortfolioView(){ //render trading functions, portfolio view
  let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
  let elem=document.getElementById('buy-sell-btns')
  elem.innerHTML+=`<button id='buy-btn' class='buy-sell'>Buy</button>
  <button id='sell-btn' class='buy-sell'>Sell</button>
  `
  fetch("http://localhost:3000/positions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({username: username})
  })
  .then(resp=>resp.json())
  .then(json=>createPositionTable(json))
}

function createPositionTable(array){
  console.log('position table being created')
  let div=document.querySelector('#portfolio-positions')
  div.innerHTML+="<h3>Portfolio Positions</h3>"
  let table=document.createElement('table')
  table.innerHTML+=`
    <tr>
      <th>Ticker</th>
      <th>Size</th>
      <th>Cost</th>
      <th>Value</th>
      <th>Unrealized Profit</th>
      <th>Realized Profit</th>
    </tr>
  `
  array.forEach(pos=>{
    table.innerHTML+=`
      <tr id=${pos.stock.ticker}-position-details>
        <td>${pos.stock.ticker}</td>
        <td id="${pos.stock.ticker}-size">${pos.size}</td>
        <td id="${pos.stock.ticker}-cost">${pos.cost}</td>
        <td id="${pos.stock.ticker}-value">${pos.value}</td>
        <td id="${pos.stock.ticker}-unrealized-profit">${pos.unrealized}</td>
        <td id="${pos.stock.ticker}-realized">${pos.realized}</td>
      </tr>
    `
  })
  div.appendChild(table)
}

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

closeBtn.onclick = function() {
  modal.style.display = "none";
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
  }
}

function newTradeUpdateTable(position){
  console.log('updating table after trade submitted')
  let ticker=position.stock.ticker
  let size=document.getElementById(`${ticker}-size`)
  let cost=document.getElementById(`${ticker}-cost`)
  let value=document.getElementById(`${ticker}-value`)
  let unrealized=document.getElementById(`${ticker}-unrealized-profit`)
  let realized=document.getElementById(`${ticker}-realized`)
  size.innerText=position.size
  cost.innerText=position.cost
  value.innerText=position.value
  unrealized.innerText=position.unrealized
  realized.innerText=position.realized
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
    .then(json=>updateUnrealizedInTable(json)) //now just need to replace this with a function to update unrealized profit on the DOM
  }
}

function updateUnrealizedInTable(position){
  console.log('updating unrealized profit in table')
  let ticker=position.stock.ticker
  let row=document.querySelector(`#${ticker}-unrealized-profit`)
  row.innerText=position.unrealized
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
  event.preventDefault()
})
