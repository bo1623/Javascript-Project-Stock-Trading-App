
//login function
function displayLogin(){
  if (!document.getElementById('login')){
    document.getElementById('user-login').innerHTML+=`
      <form id="login" action="http://localhost:3000/users" method="post">
        <label for="username">Username: </label>
        <input id="username" name="username">
        <input type="submit" value="Submit">
      </form>
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
    .then(resp=>resp.json())
    .then(user=>displayCashBalance(user))
  }
}

function displayCashBalance(user){
  let div=document.getElementById('cash')
  div.innerHTML+=`
  <div class="cash-balance-div">
    <label id="cash-balance">Cash Balance: ${user['cash_balance']}</label>
    <button class="cash-transfer-btns" id='deposit-cash'>Deposit</button>
    <button class="cash-transfer-btns" id='withdraw-cash'>Withdraw</button>
  </div>
  `
}


displayLogin()
document.getElementById('login').addEventListener('submit',function(event){
  console.log(this.parentElement)
  let username=document.getElementById('username').value
  let user=new User(username)
  user.postUser() //creating or finding user in the backend
  this.parentElement.innerHTML+=`<label id="logged-in-user">Account: ${username}   </label>`
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
  elem.innerHTML+="<button id='logout-button'>Logout</button>"
}

function renderPortfolioView(){ //render trading functions, portfolio view
  let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
  if (!!document.getElementById('ticker').value){
    addBuySellBtns()
  }
  fetch("http://localhost:3000/positions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({username: username})
  })
  .then(resp=>resp.json())
  .then(positionArray=>fetchLatestPrices(positionArray))
  .then(json=>createPositionTable(json))
}

function fetchLatestPrices(positionArray){ //note: there is a limit of 5 requests per minute where one request has to be sent per stock
  let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
  positionArray.forEach(pos=>{
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${pos.stock.ticker}&apikey=ZREIW6HJ1LEBYBQT`)
    .then(resp=>resp.json())
    .then(json=>updatePricesInBackend(username,pos.stock.ticker,json["Global Quote"]["05. price"]))
  })
  return positionArray //return in the end to be used by createPositionTable() in the next .then
}

function updatePricesInBackend(username,ticker,price){ //used in the fetchLatestPrices() above
  let position= new Position(username,ticker,price)
  position.updatePositionPrice()
}

function createPositionTable(array){ //array of position objects
  console.log(array)
  console.log('position table being created')
  let div=document.querySelector('#portfolio-positions')
  div.innerHTML+="<h3>Portfolio Positions</h3>"
  let table=document.createElement('table')
  table.innerHTML+=`
    <tr>
      <th>Ticker</th>
      <th>Latest Price</th>
      <th>Size</th>
      <th>Cost</th>
      <th>Value</th>
      <th>Unrealized Profit</th>
      <th>Realized Profit</th>
      <th>Price Refresh</th>
    </tr>
  `
  array.forEach(pos=>{
    table.innerHTML+=`
      <tr id=${pos.stock.ticker}-position-details>
        <td>${pos.stock.ticker}</td>
        <td id="${pos.stock.ticker}-price">${Number(pos.value/pos.size).toFixed(2)}</td>
        <td id="${pos.stock.ticker}-size">${pos.size}</td>
        <td id="${pos.stock.ticker}-cost">${Number(pos.cost).toFixed(2)}</td>
        <td id="${pos.stock.ticker}-value">${Number(pos.value).toFixed(2)}</td>
        <td id="${pos.stock.ticker}-unrealized-profit">${Number(pos.unrealized).toFixed(2)}</td>
        <td id="${pos.stock.ticker}-realized">${Number(pos.realized).toFixed(2)}</td>
        <td ticker="${pos.stock.ticker}"><button class="update-price-btn">Update</button></td>
      </tr>
    `
  })
  div.appendChild(table)
  createPieChart(array)
}

function createPieChart(array){ //array of position objects
  let tickers=array.map(pos=>pos.stock.ticker)
  let values=array.map(pos=>Number(pos.value))
  console.log(values)
  console.log(tickers)
  let colors=['rgb(255,71,19)',
  'rgb(255,206,0)',
  'rgb(252,155,179)',
  'rgb(0,139,92)',
  'rgb(144,98,188)',
  'rgb(255,255,255)',
  'rgb(192,11,40)']
  let data = [{
    values: values,
    labels: tickers,
    hole: .4,
    type: 'pie',
    marker: {
      colors: colors
    },
  }];

  let layout = {
    height: 400,
    width: 500,
    title:{
      text:"Portfolio Composition",
      font:{
        size: 24,
        color: 'rgb(255,255,255)'
      }
    },
    font:{
      color: 'rgb(255,255,255)'
    },
    plot_bgcolor:"black",
    paper_bgcolor:"#000000"
  };

  Plotly.newPlot('pie-chart', data, layout);

}
