
// MAIN LANDING PAGE - SIDEBAR for FAVOURITES

document.addEventListener('DOMContentLoaded', function(){
    var closeButton = document.getElementById("closeButton");
    var fave = document.getElementById("fave");
    var favouritesCard = document.querySelector(".favouritesCard");
  
    closeButton.addEventListener("click", function() {

      // Remove the "visible" class to hide the sidebar
      favouritesCard.classList.remove("visible");
    });
  
    fave.addEventListener("click", function() {

      // Toggle the "visible" class on favouritesCard
      favouritesCard.classList.toggle("visible");
  
      // Adjust top and height based on scroll position
      var navbarHeight = document.querySelector("nav").offsetHeight;
      var scrollY = window.scrollY || document.documentElement.scrollTop;
  
      favouritesCard.style.top = navbarHeight + "px";
      favouritesCard.style.height = "calc(100vh - " + navbarHeight + "px)";
    });
  });
  


  // Function to add to favourites 
  document.addEventListener('DOMContentLoaded', function () {
    const staticFavoritesIcon = document.getElementById('favoritesIcon');
    const staticItemID = 'staticRecipe';

    staticFavoritesIcon.addEventListener('click', function () {
        const existingFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isAlreadyFavorite = existingFavorites.includes(staticItemID);

        if (isAlreadyFavorite) {
            const updatedFavorites = existingFavorites.filter(id => id !== staticItemID);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            alert('Removed from Favorites');
        } else {
            existingFavorites.push(staticItemID);
            localStorage.setItem('favorites', JSON.stringify(existingFavorites));
            alert('Added to Favorites');
        }

        staticFavoritesIcon.classList.toggle('favoritesIcon', !isAlreadyFavorite);
      

        // Function to append a card to the favorites sidebar
        function appendCardToSidebar(cardID) {
        const favoritesCard = document.querySelector('.favouritesCard');
        const cardClone = document.getElementById(cardID).cloneNode(true);
        cardClone.classList.add('appendedCard'); // Add a class to the cloned card
        cardClone.removeAttribute('id'); // Remove the ID to avoid duplication
        favoritesCard.appendChild(cardClone);
        }

        // Fetch the static recipe ID from local storage and append to the sidebar
        const staticRecipeID = 'staticRecipe';
        const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (storedFavorites.includes(staticRecipeID)) {
        appendCardToSidebar(staticRecipeID);
       };

        
    });
});




  

