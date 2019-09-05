API requests are limited to 5 API requests per minute and 500 requests per day


#buy-btn button {
  background-color: #339933; /* Green background */
  border: 1px solid green; /* Green border */
  color: white; /* White text */
  padding: 8px 20px; /* Some padding */
  cursor: pointer; /* Pointer/hand icon */
  float: left; /* Float the buttons side by side */
}

/* Add a background color on hover */
#buy-btn button:hover {
  background-color: #267326;
}

#sell-btn button {
  background-color: #ff3300; /* Green background */
  border: 1px solid red; /* Green border */
  color: white; /* White text */
  padding: 8px 20px; /* Some padding */
  cursor: pointer; /* Pointer/hand icon */
  float: left; /* Float the buttons side by side */
}

/* Add a background color on hover */
#sell-btn button:hover {
  background-color: #991f00;
}

#buy-sell-btns button:not(:last-child) {
  border-right: none; /* Prevent double borders */
}

/* Clear floats (clearfix hack) */
#buy-sell-btns:after {
  content: "";
  clear: both;
  display: table;
}
