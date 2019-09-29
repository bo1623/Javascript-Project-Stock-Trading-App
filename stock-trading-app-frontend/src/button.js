document.querySelector('.like-btns').addEventListener('click',function(){
  let likes=document.querySelector('#likes')
  let count=Number(likes.innerText)
  if(event.target.id==='upvote'){
    likes.innerText=count+1
  }else if(event.target.id==='downvote'){
    likes.innerText=count-1
  }
})
