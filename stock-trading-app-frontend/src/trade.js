
//CREATING TRADE MODAL
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
