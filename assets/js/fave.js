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
  