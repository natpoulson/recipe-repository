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
      return `<div class="col s12 m6 l3">
      <div class="card recipe-card">
        <div class="card-image">
          <img class="recipe-card-badges" src="${this.image}" alt="${this.name}" />
          <div class="recipe-card-details">
            <a class="btn-floating waves-effect waves-light red">
              <i class="material-icons">favorite</i>
              </a>
            <a class="btn-floating waves-effect waves-light red accent-1">
              <i class="material-icons">volume_up</i>
              </a>
          </div>
        </div>
        <!-- Content -->
        <div class="card-content recipe-card-content">
          <span class="card-title">${this.name}</span>
          <p>
            ${this.description}
          </p>
          <div class="timeServesIcons">
            <div>
              <a class="btn-floating waves-effect waves-light red accent-1">
                <i class="material-icons">schedule</i>
              </a>
              <p>${this.time} min</p>
            </div>
            <div>
              <a class="btn-floating waves-effect waves-light red accent-1">
                <i class="material-icons">restaurant</i>
              </a>
              <p>Serves ${this.servings}</p>
            </div>
          </div>
          <div class="read-more">
            <button class="waves-effect waves-light btn-large" id="readMoreBtn" data-recipeId="${this.id}">Read more</button>
          </div>
        </div>
      </div>
    </div>`
  }

  get favouriteCard() {
    return ``; // Add your HTML snippet for favourite cards here!
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
      results.html('<div class="msg-searchErr">No recipes found. 😥</div>');
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
    // Condense the change to a single .html for more readability
    $('#search-results')
      .html('<div class="msg-searchErr">Please enter a recipe 👨‍🍳</div>');
    return;
  }

  // Initiate a search query then display the results
  Recipe.search(query)
    .then(Recipe.showResultCards())
    .catch(() => {
      // An error splash in the event that we fail to receive a response from Spoonacular
      $('#search-results')
        .html('<div class="msg-searchErr">Sorry. We encountered an error fetching results. 😔</div>');
    });

}

// Listeners
searchBtn.addEventListener("click", function () {
  alertdiv.text("");
  card.html("");
  searchRecipes();
});
