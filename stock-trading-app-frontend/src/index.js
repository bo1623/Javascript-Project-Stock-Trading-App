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
// setInterval(function(){
//   let current=time()
//   if (current>MarketOpen && current<MarketClose){
//     addNewPrices()
//   }
// },1000);

function fetchNewPrice(ticker){
  //put this under getAPI?
  //where do i place setInterval?
}

function addNewPrices(){
  let current=new Date()
  console.log(current)
  Plotly.extendTraces('chart',{ y:[[getAPI("MDT")]]}, [0]);
  cnt++;
  if(cnt > 500) {
      Plotly.relayout('chart',{
          xaxis: {
              range: [cnt-500,cnt] //setting the range of x-axis
          }
      });
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
