// Favourites functionality

document.addEventListener('DOMContentLoaded', function(){
    // Get the button element
var closeButton = document.getElementById("closeButton");

// Get the favouritesCard element
var favouritesCard = document.querySelector(".favouritesCard");

// Add a click event listener to the button
closeButton.addEventListener("click", function() {
  // Toggle the "hidden" class on favouritesCard
  favouritesCard.classList.toggle("hidden");
})
})


document.addEventListener('DOMContentLoaded', function(){
    // Get the button element
var fave = document.getElementById("fave");

// Get the favouritesCard element
var favouritesCard = document.querySelector(".favouritesCard");

// Add a click event listener to the button
fave.addEventListener("click", function() {
  // Toggle the "hidden" class on favouritesCard
  favouritesCard.classList.toggle("hidden");
})
})
