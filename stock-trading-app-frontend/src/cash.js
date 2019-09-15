let cashModal = document.querySelector(".cash-modal")

document.addEventListener('click',function(event){
  if (event.target.id==='deposit-cash'){
    //function to render deposit form
    cashTransferForm("Deposit")
  }else if(event.target.id==='withdraw-cash'){
    //function to render withdraw form
    cashTransferForm("Withdrawal")
  }
})

function cashTransferForm(direction){
  cashModal.style.display="block"
  let content=document.querySelector('.cash-modal-content')
  content.innerHTML=`
  <form action="#" method="POST" class="cash-transfer-form" id="${direction.toLowerCase()}-cash">
    <label for="transfer-amount">${direction} Amount (USD): </label>
    <input name="transfer-amount" type="number" id="transfer-amount">
    <input type="submit" value="Submit">
  </form>
  `
  addListenerToTransferForm()
}

function addListenerToTransferForm(){
  document.querySelector('.cash-transfer-form').addEventListener('submit',function(event){
    let username=document.querySelector('#logged-in-user').innerText.split(' ')[1]
    if(event.target.id==="deposit-cash"){
      let transfer= new Transfer(username,"deposit",document.getElementById('transfer-amount').value)
      transfer.postTransfer()
    }else if(event.target.id=="withdrawal-cash"){
      let transfer= new Transfer(username,"withdraw",document.getElementById('transfer-amount').value)
      transfer.postTransfer()
    }
    cashModal.style.display="none"
    event.preventDefault()
  })
}

class Transfer{
  constructor(username,direction,amount){
    this.username=username
    this.direction=direction
    this.amount=amount
  }

  postTransfer(){
    fetch("http://localhost:3000/users/update",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(this)
    })
    .then(resp=>resp.json())
    .then(json=>updateCashInDOM(json)) //reflect new cash balance in DOM
  }
}

function updateCashInDOM(user_json){
  let div=document.getElementById('cash-balance')
  div.innerText=`Cash Balance: ${Number(user_json.cash_balance).toFixed(2)}`
}
