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
      'source':'source'
    }
    // Handling in cases where importMode is enabled
    // It assumes the data is 1-to-1
    if (importMode) {
      this.name = properties['name'];
      this.image = properties['image'];
      this.description = properties['description'];
      this.servings = properties['servings'];
      this.time = properties['time'];
      this.instructions = properties['instructions'];
      this.ingredients = properties['ingredients'];
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

    // Regex mask, captures the first sentence of the description
    // In testing, everything past the second sentence tended to start delving into details that were overly redundant to the rest of the card.
    this.description = this.description.match(/^(?:.+?\.){1}/);
    // Just removes the bold (<b>) tags
    this.description = String(this.description).replace(/(\<\/?b\>)/gi, '');

    // Ensure the object being passed has instructions
    if (Object.keys(properties).includes('analyzedInstructions')) {
      // Dictionary of regex patterns and substitutions for cleaning instruction text for parsing.
      const sanitisers = [
        {
          // Replace ampersands with just the word to avoid accidentally breaking the query string
          pattern: /&/,
          substitution: 'and'
        },
        {
          // Remove any leading numbers
          pattern: /^[0-9]+?\s?/,
          substitution: ''
        },
        {
          // Remove any trailing numbers
          pattern: /\s?[0-9]\.?$/,
          substitution: '.'
        },
        {
          // Create space between full stop and next word
          // This would break URLs but these are instructions, they shouldn't have those.
          pattern: /\.(?=[A-Za-z])/,
          substitution: '. '
        }
      ];
      // Extract the steps for processing
      // The [0] is utterly asinine, but that's because of the way Spoonacular returns it
      for (const instruction of properties['analyzedInstructions'][0]['steps']) {
        // Create a temporary object to synthesise a 'step', since we can't directly create an object with that property
        const newInstruction = {};
        // Inject a step in the format { '0':'Preheat oven to 200F' }
        // This is so we can keep track of the step count using the key when sorting the array
        let cleanedInstruction = instruction['step'];
        for (const sanitiser of sanitisers) {
          // Iterate through all sanitisers and apply to the instruction
          cleanedInstruction = cleanedInstruction.replace(sanitiser.pattern, sanitiser.substitution);
          // Run a quick regex on the end to see if there's no full stop, add one if that's the case
          if (!(/\.$/).test(cleanedInstruction)) {
            cleanedInstruction += '.';
          }
        }
        newInstruction[instruction['number']] = cleanedInstruction;
        // Push the sysnthesised object to the instructions array
        this.instructions.push(Object(newInstruction));
      }
    }
    
  }

  // Getters
  get resultCard() {
    /*
      Notes:
      - Narration buttons require data-type="" to specify their parse handling type. See Narrator.type for the numerical list
      - Include the data-recipe-id="" to help identify narration items in arrays (Favourites and Recipe results)
      - Also include data-recipe-id="" for the read more button, that way we can target the recipe to make the 'active' recipe, apply the appropriate callback to fetch ingredients, then generate the page accordingly
    */
    return `<div class="col s12 m6 l4">
      <div class="card recipe-card">
        <div class="card-image">
          <img class="recipe-card-badges" src="${this.image}" alt="${this.name}" />
          <div class="recipe-card-details">
            ${this.favouriteCheck}
            <a aria-label="Read Aloud" class="btn-floating waves-effect waves-light red accent-1 btn-narrate" data-type="0" data-recipe-id="${this.id}">
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
              <p>${this.time > 0 ? this.time : '??'} min${(this.time > 1 || this.time < 0) ? 's' : ''}</p>
            </div>
            <div>
              <a class="btn-floating waves-effect waves-light red accent-1" onclick="">
                <i class="material-icons">restaurant</i>
              </a>
              <p>${this.servings > 0 ? this.servings : '??'} serv${(this.servings > 1 || this.servings < 0) ? 'es' : 'e'}</p>
            </div>
          </div>
          <div>
            <button class="waves-effect waves-light btn-large read-more" data-recipe-id="${this.id}">Read more</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  get favouriteCard() {
    return `<div class="col s12">
    <div class="card horizontal fav-card" data-recipe-id="${this.id}">
      <div class="card-image" style="width: 33%; height: 100%">
        <img src="${this.image}" alt="${this.name}" style="height: 100%; object-fit: cover" />
      </div>
      <div class="card-stacked" style="width: 67%">
        <div class="card-content">
          <span class="card-title">${this.name}</span>
          <p>${this.description}</p>
        </div>
      </div>
      <div class="favourite-controls" style="display: flex; flex-direction: column; justify-content: space-between;">
        <a class="btn-floating waves-effect waves-light red accent-1 btn-narrate" data-recipe-id="${this.id}" data-type="1">
          <i class="material-icons">volume_up</i>
        </a>
        ${this.favouriteCheck}
      </div>
    </div>
  </div>`;
  }

  get activeTemplate() {
    return `<section class="row RecipeTitleIcon">
      <div class="col">
        <h1>${this.name}</h1>
      </div>
      <div id="recipe-page-header" class="col">
        ${this.favouriteCheck}
        <a class="btn-floating waves-effect waves-light red accent-1 btn-narrate" data-type="2"><i class="material-icons">volume_up</i></a>
      </div>
    </section>
    <section class="row recipe-page-description">
    <img src="${this.image}" alt="${this.name}" class="col s4" height="300px"/>
    <div class="col s7 recipe-description-div">
      <p style="text-align: center">
        ${this.description}
      </p>
    </div>
    <div style="display: flex; align-items: center; padding-left: 10px" class="col">
      <div>
        <div>
          <a class="btn-floating waves-effect waves-light red accent-1"><i class="material-icons">schedule</i></a>
          <p>${this.time} min${this.time > 1 ? 's' : ''}</p>
        </div>
        <div>
          <a class="btn-floating waves-effect waves-light red accent-1"><i class="material-icons">restaurant</i></a>
          <p>${this.servings > 0 ? this.servings : '??'} serv${(this.servings > 1 || this.servings < 0) ? 'es' : 'e'}</p>
        </div>
      </div>
    </div>
    </section>
    <section class="row" id="preparation">
    <div class="col s7" id="prepDetails1" style="margin-left: 10px; margin-bottom: 20px; margin-top: 20px">
      <div class="prepIcon">
        <a class="btn-narrate btn-floating waves-effect waves-light red accent-1" data-type="3"><i class="material-icons" >volume_up</i></a>
      </div>
      <div>
        <p class="prep-ingredient-title">Instructions</p>
        <ol>
          ${this.formattedInstructions}
        </ol>
      </div>
    </div>
    <div class="col s5" id="prepDetails2">
      <div class="prepIcon">
        <a aria-label="Read Aloud" class="btn-narrate btn-floating waves-effect waves-light red accent-1" data-type="4"><i class="material-icons">volume_up</i></a>
      </div>
      <div>
        <p class="prep-ingredient-title">Ingredients</p>
        <ul>
          ${this.formattedIngredients}
        </ul>
      </div>
    </div>
  </section>`;
  }

  get favouriteCheck() {
    if (Recipe.favourites.findIndex(a => a.id === this.id) > Number(-1)) {
      return `<a aria-label="Remove Recipe from Favourites" class="btn-floating waves-effect waves-light red accent-1 fav-remove" data-recipe-id="${this.id}"><i class="material-icons">remove</i></a>`;
    }
    return `<a aria-label="Add Recipe to Favourites" class="btn-floating waves-effect waves-light red fav-add" data-recipe-id="${this.id}"><i class="material-icons">favorite</i></a>`;
  }

  get formattedIngredients() {
    let output = "";
    for (const item of this.ingredients) {
      output += `<li>${item.quantity} ${item.unit === '' ? "&times;" : item.unit} ${item.name}<li>\n`;
    }
    output.replace(/\n$/g, '');
    return output;
  }

  get formattedInstructions() {
    let output = "";
    for (const item of this.instructions) {
      output += `<li>${Object.values(item)[0]}</li>\n`;
    }
    output.replace(/\n$/g, '');
    return output;
  }

  // Static properties
  static list = []; // Recipes handled from search results are stored here
  static favourites = []; // Saved recipes in memory to be stored here
  static active = {}; // Recipe currently being viewed
  static config = { // Add any configurable values here for reuse where needed
    searchLimit: 9,
    apiKey: "d6b7732ac8f6419095e86a0d96cc3570",
    favStoreName: "dd-favourites"
  }

  // Static Methods
  static async search(query, offset = 0) {
    try {
      // Query Spoonacular
      const resp = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&number=${Recipe.config.searchLimit}&offset=${offset}`, {
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

      // Process the results before they can be used
      const data = await resp.json();
      await Recipe.prepareResults(data);
      return;

    } catch(err) {
      // Log the error message
      console.error(err);
      return;
    }
  }

  static async prepareResults(data) {
      // Clear any existing results and begin generating fresh results
      Recipe.list = [];

      for (const item of data.results) {
        Recipe.list.push(new Recipe(item.id, item));
      }
  }

  static async fetchIngredients(recipe) {
    if (recipe.ingredients.length > 0) {
      return recipe; // You already have ingredients, return without modification
    }

    try {
      // Modifying the param is a no-no, we'll copy it into a new variable instead for mutation
      const newRecipe = recipe;
      // Call spoonacular to fetch ingredients
      const resp = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/ingredientWidget.json`, {
        method: "GET",
        headers: {
          "x-api-key": Recipe.config.apiKey
        }
      });

      if (!resp.ok) {
        // Standard response error checking
        throw new Error(resp.statusText);
      }

      // Digest the response
      const data = await resp.json();

      // Unpack the ingredients and store to a new object we'll add to the ingredients array
      for (const ingredient of data.ingredients) {
        const newIngredient = {
          quantity: Number(Number(ingredient['amount']['metric']['value']).toFixed(2)),
          unit: String(ingredient['amount']['metric']['unit']).replace(/s$/, '').toLowerCase(), // Removing plural measure notations
          name: ingredient['name']
        };
        newRecipe.ingredients.push(newIngredient);
      }

      // Return our mutated recipe object
      return newRecipe;

    } catch(err) {
      console.error(err);
    }
  }

  static async setActive(id, isFavourite = false) {
    // Return from the favourites list directly
    if (isFavourite) {
      Recipe.active = Recipe.favourites.find(a => a.id === id);
      return;
    }

    // Return from search results, obtain ingredients
    const tempRecipe = Recipe.list.find(a => a.id === id);
    Recipe.active = await Recipe.fetchIngredients(tempRecipe);
    return;
  }

  static async showActive(event) {
    const content = $('#content-main');
    // Retrieve the recipeId from our card (this method is only used on lists)
    const id = Number(event.currentTarget.dataset['recipeId']);

    // Retrieve the recipe from the results list if it was triggered by a 'read more' button
    if (event.currentTarget.classList.contains('read-more')) {
      await Recipe.setActive(id);
    }
    // Retrieve the recipe from the favourites list if it was triggered by a favourite card
    if (event.currentTarget.classList.contains('fav-card')) {
      await Recipe.setActive(id, true);
    }

    content[0].class = '';
    content.html(Recipe.active.activeTemplate);
  }

  static async showResultCards() {
    // Bind content zone and prepare for search results.
    const content = $('#content-main');
    content[0].class = "";
    content.addClass('fcards');
    content.html('');

    // Show no results found if the Recipe list is empty, then terminate the function.
    if (Recipe.list.length === 0) {
      content.html('<div class="msg-searchErr">No recipes found. 😥</div>');
      return;
    }

    // Create new string containing the generated HTML concatenated for all recipes returned.
    let formattedResults = '<div class="row">';
    for (const recipe of Recipe.list) {
      formattedResults += recipe.resultCard;
    }
    formattedResults += '</div>';

    // Apply the results to the container
    content.html(formattedResults);
    return;
  }

  static async addFavourite(event) {
    event.preventDefault();
    event.stopPropagation();
    const recipeId = Number(event.currentTarget.dataset['recipeId']);
    // Abort if a recipe is found
    if (!Recipe.favourites.indexOf(a => a.id === recipeId) === -1) {
      return;
    }

    // Obtain the recipe, pre-fill ingredients, and then add to the favourites array
    let recipe = Recipe.list.find(a => a.id === recipeId);
    recipe = await Recipe.fetchIngredients(recipe);
    Recipe.favourites.push(recipe);
    Recipe.saveFavourites();
  }

  static removeFavourite(event) {
    event.preventDefault();
    event.stopPropagation();
    // Identify the index of the recipe and splice it from the array, limit to 1 result so we don't accidentally nuke eveeryting
    const recipeId = Number(event.currentTarget.dataset['recipeId']);
    const index = Recipe.favourites.findIndex(a => a.id === recipeId);
    Recipe.favourites.splice(index, 1);
    // Make sure to save and update cards
    Recipe.saveFavourites();
    Recipe.renderFavourites();
  }

  static saveFavourites() {
    // Simple write of the favourites property to the local storage
    localStorage.setItem(Recipe.config.favStoreName, JSON.stringify(Recipe.favourites));
  }

  static loadFavourites() {
    if (localStorage.getItem(Recipe.config.favStoreName)) {
      const tempFavs = JSON.parse(localStorage.getItem(Recipe.config.favStoreName)); // Staging the data for consumption
      for (const fav of tempFavs) {
        Recipe.favourites.push(new Recipe(Number(fav.id), fav, true)); // Direct import into new objects
      }
    }
  }

  static renderFavourites() {
    const favouritesList = $('.favouritesCard');
    let contents = `<h2>Favourites</h2>\n`; // Pre-format with the header since it'll be erased
    for (const recipe of Recipe.favourites) {
      contents += `${recipe.favouriteCard}\n`;
    }
    contents = contents.replace(/\n$/, ''); // Clean up last line break
    favouritesList.html(contents); // Replace with formatted HTML
  }

}

class Narrator {
  // Configurable settings for the voicerss API
  static config = {
    apiKey: "5d5be935cb174f47a783187afc4a1d1e",
    lang: "en-au",
    voice: "isla"
  }

  // Enumerators for parse types, used to direct the narration method
  static type = {
    RECIPE_CARD: 0,
    RECIPE_FAV_CARD: 1,
    RECIPE_ACTIVE_CARD: 2,
    RECIPE_INSTRUCTIONS: 3,
    RECIPE_INGREDIENTS: 4
  }

  // Articulation aids for common units of measure
  static unit = {
    'g':'gram',
    'kg':'kilogram',
    'mg':'miligram',
    'tsp':'tea spoon',
    'dsp':'dessert spoon',
    'tbsp':'table spoon',
    'ml':'mililiter',
    'l':'liter'
  }

  static articulatedUnit(value) {
    // Determine if the unit presented exists in the list of units we have articulations for
    if (Object.keys(Narrator.unit)
          .includes(String(value).toLowerCase())) {
      // Return the articulated value
      return Narrator.unit[value];
    }

    // Return it in uppercase in case it's an acronym
    // Words should still be parseable like this, but acronyms will be sounded out
    return String(value);
  }

  static parse(event) {
    try {
      // Stop bubbling and default anchor behaviour
      event.preventDefault();
      event.stopPropagation();

      // Extract the parse type and recipe ID from the narration element
      const type = Number(event.currentTarget.dataset['type']);
      let recipeId;

      // Retrieve the recipe from the current dataset
      // Need to add handling based on type since we can only rely on the list when searching. Different contexts exist for Favourites and Ingredients/Instructions.
      let recipe;

      switch (type) {
        case Narrator.type.RECIPE_CARD:
          // recipeId must be cast to a Number as the id in the class is handled as Number
          // Yes, I could just remove an = and rely on type coercion instead of casting
          // No, I am not going to do that. I'd rather die.
          recipeId = Number(event.currentTarget.dataset['recipeId']); // data-recipe-id === recipeId
          recipe = Recipe.list.find(a => a.id === recipeId);
          break;
        case Narrator.type.RECIPE_FAV_CARD:
          recipeId = Number(event.currentTarget.dataset['recipeId']);
          recipe = Recipe.favourites.find(a => a.id === recipeId);
          break;
        case Narrator.type.RECIPE_ACTIVE_CARD:
        case Narrator.type.RECIPE_INGREDIENTS:
        case Narrator.type.RECIPE_INSTRUCTIONS:
          recipe = Recipe.active; // No searching needed
          break;
        default:
          throw new Error("No valid type detected");
      }

      let dialogue = ""; // Initialiser for the switch block below due to scoping
      const newLineMask = /\n$/g; // Strips new lines at the end of a string
      const pluralise = quantity => quantity > 1 ? 's' : ''; // Condense the plural check to a single arrow function

      // Identify what type of text to pass to the read function and format appropriately.
      switch (type) {
        case Narrator.type.RECIPE_CARD:
        case Narrator.type.RECIPE_FAV_CARD:
        case Narrator.type.RECIPE_ACTIVE_CARD:
          dialogue = `${recipe.name}. Serves ${recipe.servings > 0 ? recipe.servings : 'an unspecified number of'} ${recipe.servings === 1 ? "person" : "people"}, and ready in ${recipe.time > 0 ? recipe.time : 'an unspecified number of'} minute${pluralise(recipe.time)}. ${recipe.description}.`;
          break;
        case Narrator.type.RECIPE_INSTRUCTIONS:
          // Extract each step and parse as text, include a new line at the end
          for (const step of recipe.instructions) {
            dialogue += `Step ${Object.keys(step)[0]}; ${Object.values(step)[0]} \n`;
          }
          // Remove the final new line character
          dialogue = dialogue.replace(newLineMask, '');
          break;
        case Narrator.type.RECIPE_INGREDIENTS:
          // TODO: Add method for populating ingredients with quantity, unit, and name values
          for (const ingredient of recipe.ingredients) {
            dialogue += `${ingredient.quantity} ${Narrator.articulatedUnit(ingredient.unit)}${ingredient.unit !== "" ? pluralise(ingredient.quantity) : ''}; ${ingredient.name}. \n`;
            dialogue = dialogue.replace(newLineMask, '');
          }
          break;
      }

      Narrator.read(dialogue);
    } catch(err){
      console.error(err);
    }
  }

  static async read(text) {
    // Bind audio control
    const narrator = $('#narrator');
    try {
      // Call narration
      const resp = await fetch(`https://api.voicerss.org/?key=${Narrator.config.apiKey}&hl=${Narrator.config.lang}&v=${Narrator.config.voice}&src=${text}`);

      // Throw error message if unsuccessful.
      if (!resp.ok) {
        throw new Error(resp.statusText);
      }

      // Parse audio stream and create a URL for use with the audio control
      const data = await resp.blob();
      const url = window.URL.createObjectURL(data);

      // Bind the audio stream to the audio control and play the narration
      narrator.attr("src", url);
      // We have to select the element from the array so we can access the Audio object's .play() method
      narrator[0].play();
    }
    catch(err) {
      console.error(err);
    }
  }

  // Automatically unload the object URL of a narration for memory management purposes
  static unload(event) {
    event.stopPropagation();
    URL.revokeObjectURL(event.target.src);
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
    $('#content-main')
      .html('<div class="msg-searchErr">Please enter a recipe 👨‍🍳</div>');
    return;
  }

  // Initiate a search query then display the results
  Recipe.search(query)
    .then(() => Recipe.showResultCards()) // Show the results after query processing only.
    .catch(() => {
      // An error splash in the event that we fail to receive a response from Spoonacular
      $('#content-main')
        .html('<div class="msg-searchErr">Sorry. We encountered an error fetching results. 😔</div>');
    });

}

// Listeners and inits
$(function () {
  $('#narrator').on('ended', Narrator.unload); // Removing temporary audio stream
  $('#content-main').on('click', '.read-more', Recipe.showActive);
  $('.favouritesCard').on('click', '.fav-card', Recipe.showActive);
  $('body').on('click', '.btn-narrate', Narrator.parse); // Set up delegated event listener for narrator elements.
  $('body').on('click', '.fav-add', Recipe.addFavourite);
  $('body').on('click', '.fav-remove', Recipe.removeFavourite);
  $('#fave').on('click', Recipe.renderFavourites);
  searchBtn.addEventListener("click", function () {
    alertdiv.text("");
    card.html("");
    searchRecipes();
  });

  Recipe.loadFavourites(); // Load any favourites in local storage
});
