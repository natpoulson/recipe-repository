/* initiate materialize */
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
const searchBtn = document.getElementById("searchBtn");
var noRecipeFound = $("<div>");
var card = $(".fcards");
var alertdiv = $(".alert");

function searchRecipes() {
  const query = searchInput.value;
  if (!query) {
    noRecipeFound.text("Please enter a recipe 👨‍🍳");
    noRecipeFound.css({
      padding: "50px",
      "text-align": "center",
      "font-size": "30px",
      "font-family": "'Bree Serif', serif",
    });
    card.append(noRecipeFound);
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

/* Function to display the recipe card */
function displayRecipes(recipes) {
  console.log(recipes);
  var card = $(".fcards");
  var rowDiv1 = $("<div>");
  rowDiv1.attr("class", "row");
  rowDiv1.css("padding", "50px");
  if (recipes.length !==0) {
  /* loop recipes results to display image and title */
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
    var iconDiv = $("<div>");
    iconDiv.attr("class", "favIconDiv");
    //7
    var cardImageBtn1 = $("<a>");
    cardImageBtn1.css("margin-right", "12px");
    cardImageBtn1.attr("class", "btn-floating waves-effect waves-light red");
    var favIcon1 = $("<i>");
    favIcon1.attr("class", "material-icons");
    favIcon1.text("favorite");
    cardImageBtn1.append(favIcon1);
    //8
    var cardImageBtn2 = $("<a>");
    cardImageBtn2.attr(
      "class",
      "btn-floating waves-effect waves-light red accent-1"
    );
    var favIcon2 = $("<i>");
    favIcon2.attr("class", "material-icons");
    favIcon2.text("volume_up");
    cardImageBtn2.append(favIcon2);

    iconDiv.append(cardImageBtn1);
    iconDiv.append(cardImageBtn2);
    cardImageDiv.append(cardImage);
    cardImageDiv.append(iconDiv);
    //9
    var cardContentDiv = $("<div>");
    cardContentDiv.attr("class", "card-content");
    cardContentDiv.css({
      "border-bottom-left-radius": "25px",
      "border-bottom-right-radius": "25px",
      "background-color": "#f5f5f5",
    });

    //10
    var cardTitle = $("<span>");
    cardTitle.attr("class", "card-title");
    cardTitle.text(recipe.title);

    cardContentDiv.append(cardTitle);

    //11
    var cardParapraph = $("<p>");
    cardParapraph.text(
      " I am a very simple card. I am good at containing small bits of information."
    );
    cardContentDiv.append(cardParapraph);

    //12
    var contenDivSeparator1 = $("<div>");
    contenDivSeparator1.attr("class", "timeServesIcons");

    //13
    var timerDiv = $("<div>");
    contenDivSeparator1.append(timerDiv);
    //14
    var timerBtn = $("<a>");
    timerBtn.attr(
      "class",
      "btn-floating waves-effect waves-light red accent-1"
    );
    var timerIcon = $("<i>");
    timerIcon.attr("class", "material-icons");
    timerIcon.text("schedule");
    timerBtn.append(timerIcon);
    timerDiv.append(timerBtn);

    //15
    var timerText = $("<p>");
    timerText.text("Min");
    timerDiv.append(timerText);

    // 16
    var servesDiv = $("<div>");

    //17
    var servestBtn = $("<a>");
    servestBtn.attr(
      "class",
      "btn-floating waves-effect waves-light red accent-1"
    );
    var servesIcon = $("<i>");
    servesIcon.attr("class", "material-icons");
    servesIcon.text("restaurant");
    servestBtn.append(servesIcon);
    servesDiv.append(servestBtn);

    //18
    var servesText = $("<p>");
    servesText.text("Serves");
    servesDiv.append(servesText);
    contenDivSeparator1.append(servesDiv);
    cardContentDiv.append(contenDivSeparator1);

    //19
    var readMoreDiv = $("<div>");
    readMoreDiv.css({
      "padding-top": "15px",
      "text-align": "center",
    });
    var readMoreBtn = $("<button>");
    readMoreBtn.css("width", "100%");
    readMoreBtn.attr({
      class: "waves-effect waves-light btn-large",
      id: "readMoreBtn",
    });
    readMoreBtn.text("Read More");
    readMoreDiv.append(readMoreBtn);
    cardContentDiv.append(readMoreDiv);

    mainCard.append(cardImageDiv);
    mainCard.append(cardContentDiv);
  });
}else {
    noRecipeFound.text("No recipes found. 😥");
    noRecipeFound.css({
      padding: "50px",
      "text-align": "center",
      "font-size": "30px",
      "font-family": "'Bree Serif', serif",
    });
    card.append(noRecipeFound);
  }
}

searchBtn.addEventListener("click", function () {
  alertdiv.text("");
  card.html("");
  searchRecipes();
});
