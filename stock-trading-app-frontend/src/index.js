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
  return times//.filter(filterOutWeekend) //returns the array of timestamps, to be used in initial plot creation
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

function getNewPriceTest(){
  return Math.random()*100
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


async function getLongAPI(ticker){
  let link=`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=ZREIW6HJ1LEBYBQT`;
  const resp = await fetch(link)
  const json = await resp.json()
  const timeseries= await json['Time Series (Daily)']
  let prices= await Object.keys(timeseries).map(function(key){
    return Object.assign({},{
      timestamp: key,
      price: timeseries[key]["4. close"]
    })
  })
  console.log('inside getAPI')
  console.log(getNewPrice(prices).timestamp)
  plotData(prices,ticker)
  addRealTimePriceDiv(prices)
}

async function getAPI(ticker){
  let link=`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=1min&outputsize=compact&apikey=ZREIW6HJ1LEBYBQT`;
  const resp = await fetch(link)
  const json = await resp.json()
  const timeseries= await json['Time Series (1min)']
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
  let last=getNewPrice(prices)
  let form=document.getElementById('insert-ticker')
  form.insertAdjacentHTML('afterend', `<div id="real-time-price">${ticker.value}: ${last.price}</div>`);
  // console.log('inside addRealTimePriceDiv')
  // console.log(last)
}

let body=document.querySelector('body')
body.addEventListener('click',function(event){
  if(event.target.id==='5m'){
    let ticker=document.getElementById('ticker').value
    getLongAPI(ticker)
  }else if(event.target.id==='intraday'){
    let ticker=document.getElementById('ticker').value
    getAPI(ticker)
    let updateIntraday=setInterval(updateChart,40000)
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
    document.querySelector('.wrapper').innerHTML+=`
    <form id="login" action="#" method="post">
      <label for="username">Username: </label>
      <input id="username" name="username">
      <input type="submit" value="Submit">
    </form>
    `
  }
}

function displayButtons(){
  if(!document.getElementById('5m')){ //condition to detect if the buttons have already been created
    document.querySelector('.btn-group').innerHTML+=`
    <button id='5m'>5 Months</button>
    <button id='intraday'>Intraday</button>
  `
  }
}

class User{
  constructor(username){
    this.username=username
  }
}


// displayLogin()
