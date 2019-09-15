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
