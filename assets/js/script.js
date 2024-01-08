$(document).ready(function () {
  $(".modal").modal();
  $(".parallax").parallax();
  $(".sidenav").sidenav();
  $(".sidenav").sidenav();
  $(".slider").slider({ full_width: true });
});

function toggleModal() {
  var instance = $(".modal").modal($("modal3"));
  instance.open();
}

const apiKey = "1ad7150895a748249f035aea5efa456f";
const searchInput = document.getElementById("search-input");
const recipeList = document.getElementById("recipe-list");
const searchBtn = document.getElementById("searchBtn");
var card = $(".fcards");
var alertdiv = $(".alert");
function searchRecipes() {
  const query = searchInput.value;
  if (!query) {
    alertdiv.text("Please enter a recipe  👨‍🍳");
    alertdiv.css({
      padding: "50px",
      "text-align": "center",
      "font-size": "30px",
      "font-family": "'Bree Serif', serif",
    });

    return;
  }
  const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}&number=12`;

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      displayRecipes(data.results);
    })
    .catch((error) => console.error("Error fetching recipes:", error));
}

function displayRecipes(recipes) {
  console.log(recipes);
  var card = $(".fcards");
  var rowDiv1 = $("<div>");
  rowDiv1.attr("class", "row");
  rowDiv1.css("padding","50px");
  recipes.forEach((recipe) => {
    //1
    card.append(rowDiv1);
    //2
    var scndDiv = $("<div>");
    scndDiv.attr("class", "col s12 m6 l3");
    rowDiv1.append(scndDiv);
    //3
    var mainCard = $("<div>");
    mainCard.attr("class", "card");
    mainCard.css({
      "border-bottom-left-radius": "25px",
      "border-bottom-right-radius": "25px",
      "border-top-right-radius": "25px",
      "border-top-left-radius": "25px",
    });
    scndDiv.append(mainCard);
    //4
    var cardImageDiv = $("<div>");
    cardImageDiv.attr("class", "card-image");

    //5
    var cardImage = $("<img>");
    cardImage.attr("src", recipe.image);
    cardImage.css({
      "border-top-right-radius": "25px",
      "border-top-left-radius": "25px",
    });
    //6
    var cardImageBtn = $("<a>");
    cardImageBtn.attr(
      "class",
      "btn-floating halfway-fab waves-effect waves-light red"
    );
    var favIcon = $("<i>");
    favIcon.attr("class", "material-icons");
    favIcon.text("read_more");
    cardImageBtn.append(favIcon);
    cardImageDiv.append(cardImage);
    cardImageDiv.append(cardImageBtn);
    //7
    var cardContentDiv = $("<div>");
    cardContentDiv.attr("class", "card-content");
    cardContentDiv.css({
      "border-bottom-left-radius": "25px",
      "border-bottom-right-radius": "25px",
      "background-color": "#f5f5f5",
    });

    //8
    var cardTitle = $("<span>");
    cardTitle.attr("class", "card-title");
    cardTitle.text(recipe.title);
    
    cardContentDiv.append(cardTitle);

    //9
    var cardParapraph = $("<p>");
    cardParapraph.text(
      " I am a very simple card. I am good at containing small bits of information. I am convenient because I require little markup to use effectively."
    );
    cardContentDiv.append(cardParapraph);

    mainCard.append(cardImageDiv);
    mainCard.append(cardContentDiv);
  });
}

searchBtn.addEventListener("click", function () {
  alertdiv.text("");
  card.innerHTML = "";
  searchRecipes();
});
