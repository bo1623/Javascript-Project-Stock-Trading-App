// function getAPI("MDT") {
//     return Math.random();
// }

function plotData(prices){
  Plotly.newPlot('chart',[{
      x:[getTimes(prices)][0],
      y:[getPrices(prices)][0],
      type:'line'
  }]);
  console.log(prices)
}


var cnt = 0
const MarketOpen = '093000'
const MarketClose = '160000'


function getNewPrice(prices){
  let last = prices[prices.length-1]
  let lastPrice=last.price
  let lastTime=last.timestamp
  return last
}

function getNewPriceTest(){
  return Math.random()*100
}

async function addNewPrices(){
  console.log(ticker.value)
  let link=`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker.value}&interval=1min&apikey=ZREIW6HJ1LEBYBQT`;
  const resp = await fetch(link)
  const json = await resp.json()
  const timeseries= await json['Time Series (1min)']
  let prices= await Object.keys(timeseries).map(function(key){
    return Object.assign({},{
      timestamp: key,
      price: timeseries[key]["4. close"]
    })
  })
  console.log(prices)
  console.log(getNewPrice(prices).timestamp)
  console.log(getNewPrice(prices).price)

  Plotly.extendTraces('chart',{ x:[[getNewPrice(prices).timestamp]], y:[[getNewPrice(prices).price]]}, [0]);
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


async function getAPI(ticker){
  let link=`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=1min&apikey=ZREIW6HJ1LEBYBQT`;
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
  plotData(prices)
}


function getTimes(prices){
  let times = prices.map(function(obj){
    return obj.timestamp
  })
  return times
}

function getPrices(prices){
  let ticks = prices.map(function(obj){
    return obj.price
  })
  return ticks
}

document.getElementById('insert-ticker').addEventListener('submit',function(event){
  let ticker=document.getElementById('ticker').value
  getAPI(ticker)
  setInterval(updateChart,5000)
  event.preventDefault()
})

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
