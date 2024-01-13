class Recipe {
  // Class properties
  id = 0;
  name = "";
  image = "";
  description = "";
  servings = 0;
  time = 0;
  instructions = [];
  ingredients = [];
  hasMeat = false;
  hasDairy = false;
  hasGluten = false;
  source = "";

  // Constructor
  constructor(id, properties = {}, importMode = false) {
    this.id = id;
    // Create a mapping for keys and values
    // Ideally we would pass this in as an argument, but we're limiting the scope to spoonacular for now
    const propMap = {
      'name':'title',
      'image':'image',
      'description':'summary',
      'servings':'servings',
      'time':'readyInMinutes',
      'hasMeat':'vegetarian',
      'hasDairy':'dairyFree',
      'hasGluten':'glutenFree',
      'source':'source'
    }
    // Handling in cases where importMode is enabled
    // It assumes the data is 1-to-1
    if (importMode) {
      this.name = properties['name'];
      this.image = properties['image'];
      this.description = properties['description'];
      this.servings = properties['servings'];
      this.time = propertes['time'];
      this.instructions = properties['instructions'];
      this.ingredients = properies['ingredients'];
      this.hasMeat = properties['hasMeat'];
      this.hasDairy = properties['hasDairy'];
      this.hasGluten = properties['hasGluten'];
      this.source = properties['source'];
      return;
    }

    // Populate the properties found, mapping each object by the names in the key value pair
    for (const prop of Object.entries(propMap)) {
      // Check that the property exists before we apply anything
      if (Object.keys(properties).includes(prop[1]))
      {
        // Object.entries returns an array of the key and value E.g. [ 'name', 'title' ]
        // Thus, we're using these to assign the equivalent values in the object.
        this[prop[0]] = properties[prop[1]];
      }
    }

    // Ensure the object being passed has instructions
    if (Object.keys(properties).includes('analyzedInstructions')) {
      // Extract the steps for processing
      // The [0] is utterly asinine, but that's because of the way Spoonacular returns it
      // "Yes, a breakdown of the instructions should start with an array with a single element, which contains the object detailing the actual steps. I am a programmer :)"
      for (const instruction of properties['analyzedInstructions'][0]['steps']) {
        // Create a temporary object to synthesise a 'step', since we can't directly create an object with that property
        const newInstruction = {};
        // Inject a step in the format { '0':'Preheat oven to 200F' }
        // This is so we can keep track of the step count using the key when sorting the array
        newInstruction[instruction['number']] = instruction['step'];
        // Push the sysnthesised object to the instructions array
        this.instructions.push(Object(newInstruction));
      }
      // Sort in ascending order by comparing the extracted values of the steps
      // this.instructions.sort((a, b) => {
      //   return Object.values(a)[0] < Object.values(b)[0];
      // });
    }
    
    // Invert the values of the booleans, since spoonacular's keys are inversions of what we want
    this.hasMeat = !this.hasMeat;
    this.hasDairy = !this.hasDairy;
    this.hasGluten = !this.hasGluten;
  }

  // Getters
  get resultCard() {
      return `<div class="row" style="padding-left: 50px; padding-right: 50px">
      <div class="col s12 m6 l3">
        <div class="card recipe-card">
          <div class="card-image">
            <img src="${this.image}" alt="${this.name}" />
            <div class="recipe-card-badges">
              <a class="btn-floating waves-effect waves-light red recipe-card-badge">
                <i class="material-icons">favorite</i></a>
              <a class="btn-floating waves-effect waves-light red accent-1">
                <i class="material-icons">volume_up</i></a>
            </div>
          </div>
          <div class="card-content recipe-card-content">
            <span class="card-title">${this.name}</span>
            <p>
              ${this.description}
            </p>
            <div class="recipe-card-details">
              <div>
                <a
                  class="btn-floating waves-effect waves-light red accent-1"
                  ><i class="material-icons">schedule</i></a>
                <p>${this.time}</p>
              </div>
              <div>
                <a
                  class="btn-floating waves-effect waves-light red accent-1"
                  ><i class="material-icons">restaurant</i></a>
                <p>${this.servings}</p>
              </div>
            </div>
            <div style="padding-top: 15px; text-align: center">
              <button
                style="width: 100%"
                class="waves-effect waves-light btn-large"
                id="readMoreBtn"
              >
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // Static properties
  static list = []; // Recipes handled from search results are stored here
  static favourites = []; // Saved recipes in memory to be stored here
  static config = { // Add any configurable values here for reuse where needed
    searchLimit: 9,
    apiKey: "d6b7732ac8f6419095e86a0d96cc3570"
  }

  // Static Methods
  static async search(query, searchOpts = { limit:Recipe.config.searchLimit, offset:0 }) {
    // If passing searchOpts, make sure you specify a limit and offset
    // Otherwise we'll inject the default values as a failover
    if (!Object.keys(searchOpts).includes('limit')) {
      searchOpts['limit'] = Recipe.config.searchLimit;
    }
    if (!Object.keys(searchOpts).includes('offset')) {
      searchOpts['offset'] = 0;
    }

    try {
      // Query Spoonacular
      const resp = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&number=${searchOpts.limit}&offset=${searchOpts.offset}`, {
        method: "GET",
        headers: {
          // Replace this with your own API key if you want to test using your quotas
          "x-api-key": Recipe.config.apiKey
        }
      });

      // Error handling for non-200 status codes
      if (!resp.ok) {
        throw new Error(resp.statusText);
      }

      // Unpackage json response
      const data = await resp.json();

      // Clear any existing results and begin generating fresh results
      Recipe.list = [];

      for (const item of data.results) {
        Recipe.list.push(new Recipe(item.id, item));
      }
      return;

    } catch(err) {
      // Log the error message
      console.error(err);
      return;
    }
  }

  static showResultCards() {
    // Bind our search results section first and blank what's there.
    const results = $('#search-results');
    results.html('');

    // Show no results found if the Recipe list is empty, then terminate the function.
    if (Recipe.list.length === 0) {
      results.html('<div class="msg-noResults">No recipes found. 😥</div>');
      return false;
    }

    // Create new string containing the generated HTML concatenated for all recipes returned.
    let formattedResults = '';
    for (const recipe of Recipe.list) {
      formattedResults += recipe.resultCard;
    }

    // Apply the results to the container
    results.html(formattedResults);
    return true;
  }
}
 
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

const apiKey = "bee79d9ce47844eb8af55005e4664235";
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

  Recipe.search(query)
    .then(Recipe.showResultCards());

  // const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}&number=12`;

  // fetch(apiUrl)
  //   .then(function (response) {
  //     return response.json();
  //   })
  //   .then(function (data) {
  //     console.log(data);
  //     displayRecipes(data.resuts);
  //   })
  //   .catch((error) => console.error("Error fetching recipes:", error));
}

/* Function to display the recipe card */
// function displayRecipes(recipes) {
//   console.log(recipes);
//   var card = $(".fcards");
//   var rowDiv1 = $("<div>");
//   rowDiv1.attr("class", "row");
//   rowDiv1.css("padding", "50px");
//   if (recipes.length !==0) {
//   /* loop recipes results to display image and title */
//   recipes.forEach((recipe) => {
//     //1
//     card.append(rowDiv1);
//     //2
//     var scndDiv = $("<div>");
//     scndDiv.attr("class", "col s12 m6 l3");
//     rowDiv1.append(scndDiv);
//     //3
//     var mainCard = $("<div>");
//     mainCard.attr("class", "card");
//     mainCard.css({
//       "border-bottom-left-radius": "25px",
//       "border-bottom-right-radius": "25px",
//       "border-top-right-radius": "25px",
//       "border-top-left-radius": "25px",
//     });
//     scndDiv.append(mainCard);
//     //4
//     var cardImageDiv = $("<div>");
//     cardImageDiv.attr("class", "card-image");

//     //5
//     var cardImage = $("<img>");
//     cardImage.attr("src", recipe.image);
//     cardImage.css({
//       "border-top-right-radius": "25px",
//       "border-top-left-radius": "25px",
//     });

//     //6
//     var iconDiv = $("<div>");
//     iconDiv.attr("class", "favIconDiv");
//     //7
//     var cardImageBtn1 = $("<a>");
//     cardImageBtn1.css("margin-right", "12px");
//     cardImageBtn1.attr("class", "btn-floating waves-effect waves-light red");
//     var favIcon1 = $("<i>");
//     favIcon1.attr("class", "material-icons");
//     favIcon1.text("favorite");
//     cardImageBtn1.append(favIcon1);
//     //8
//     var cardImageBtn2 = $("<a>");
//     cardImageBtn2.attr(
//       "class",
//       "btn-floating waves-effect waves-light red accent-1"
//     );
//     var favIcon2 = $("<i>");
//     favIcon2.attr("class", "material-icons");
//     favIcon2.text("volume_up");
//     cardImageBtn2.append(favIcon2);

//     iconDiv.append(cardImageBtn1);
//     iconDiv.append(cardImageBtn2);
//     cardImageDiv.append(cardImage);
//     cardImageDiv.append(iconDiv);
//     //9
//     var cardContentDiv = $("<div>");
//     cardContentDiv.attr("class", "card-content");
//     cardContentDiv.css({
//       "border-bottom-left-radius": "25px",
//       "border-bottom-right-radius": "25px",
//       "background-color": "#f5f5f5",
//     });

//     //10
//     var cardTitle = $("<span>");
//     cardTitle.attr("class", "card-title");
//     cardTitle.text(recipe.title);

//     cardContentDiv.append(cardTitle);

//     //11
//     var cardParapraph = $("<p>");
//     cardParapraph.text(
//       " I am a very simple card. I am good at containing small bits of information."
//     );
//     cardContentDiv.append(cardParapraph);

//     //12
//     var contenDivSeparator1 = $("<div>");
//     contenDivSeparator1.attr("class", "timeServesIcons");

//     //13
//     var timerDiv = $("<div>");
//     contenDivSeparator1.append(timerDiv);
//     //14
//     var timerBtn = $("<a>");
//     timerBtn.attr(
//       "class",
//       "btn-floating waves-effect waves-light red accent-1"
//     );
//     var timerIcon = $("<i>");
//     timerIcon.attr("class", "material-icons");
//     timerIcon.text("schedule");
//     timerBtn.append(timerIcon);
//     timerDiv.append(timerBtn);

//     //15
//     var timerText = $("<p>");
//     timerText.text("Min");
//     timerDiv.append(timerText);

//     // 16
//     var servesDiv = $("<div>");

//     //17
//     var servestBtn = $("<a>");
//     servestBtn.attr(
//       "class",
//       "btn-floating waves-effect waves-light red accent-1"
//     );
//     var servesIcon = $("<i>");
//     servesIcon.attr("class", "material-icons");
//     servesIcon.text("restaurant");
//     servestBtn.append(servesIcon);
//     servesDiv.append(servestBtn);

//     //18
//     var servesText = $("<p>");
//     servesText.text("Serves");
//     servesDiv.append(servesText);
//     contenDivSeparator1.append(servesDiv);
//     cardContentDiv.append(contenDivSeparator1);

//     //19
//     var readMoreDiv = $("<div>");
//     readMoreDiv.css({
//       "padding-top": "15px",
//       "text-align": "center",
//     });
//     var readMoreBtn = $("<button>");
//     readMoreBtn.css("width", "100%");
//     readMoreBtn.attr({
//       class: "waves-effect waves-light btn-large",
//       id: "readMoreBtn",
//     });
//     readMoreBtn.text("Read More");
//     readMoreDiv.append(readMoreBtn);
//     cardContentDiv.append(readMoreDiv);

//     mainCard.append(cardImageDiv);
//     mainCard.append(cardContentDiv);
//   });
// }else {
//     noRecipeFound.text("No recipes found. 😥");
//     noRecipeFound.css({
//       padding: "50px",
//       "text-align": "center",
//       "font-size": "30px",
//       "font-family": "'Bree Serif', serif",
//     });
//     card.append(noRecipeFound);
//   }
// }

searchBtn.addEventListener("click", function () {
  alertdiv.text("");
  card.html("");
  searchRecipes();
});
