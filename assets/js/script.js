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
      this.time = properties['time'];
      this.instructions = properties['instructions'];
      this.ingredients = properties['ingredients'];
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

    /* 
      Because it's potentially interesting I'll give you a breakdown:
      Syntax for a RegEx string:
        / / - Indicators of a RegEx string. You have to enter at least one character between for it to count as one or else it just becomes a single line comment
        ^  - Matches from the first character in the string
        (?:) - Indicates a group of characters - The ?: indicates that it shouldn't be captured, simply matched (Capturing means you can splice these in elsewhere using certain syntax)
        . - Represents ANY single character
        + - Match one or more of the preceding character (Note if you don't combine this with any other qualifiers this would match everything after it)
        ? - Makes the previous modifier lazy (interrupt as soon as it encounters a character specified after it)
        \. - Escaped full stop, prevents it from being read as a wildcard. You can use this on any other character that might otherwise be interpreted as a modifier, such as \? for a question mark
        {} - Match the specified number of occurrences of the preceding character or group. You can use a single number to specify a match only if it repeats the exact number of times, or use two numbers separated by a comma to specify a range
        
        All together, the RegEx mask is searching for up to three complete sentences from the start using this combination.

        You can learn more and experiment with RegEx using https://regexr.com
    */
    // Regex mask, captures the first sentence of the description
    // In testing, everything past the second sentence tended to start delving into details that were overly redundant to the rest of the card.
    this.description = this.description.match(/^(?:.+?\.){1}/);
    // Just removes the bold (<b>) tags
    this.description = String(this.description).replace(/(\<\/?b\>)/gi, '');

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
            <a aria-label="Add Recipe to Favourites" class="btn-floating waves-effect waves-light red">
              <i class="material-icons">favorite</i>
              </a>
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
    </div>`
  }

  get favouriteCard() {
    return ``; // Add your HTML snippet for favourite cards here!
  }

  get activeTemplate() {
    return `<section class="row RecipeTitleIcon">
      <div class="col">
        <h1>${this.name}</h1>
      </div>
      <div id="recipe-page-header" class="col"><a class="btn-floating waves-effect waves-light red"><i class="material-icons">favorite</i></a>
        <a class="btn-floating waves-effect waves-light red accent-1" data-type="2"><i class="material-icons">volume_up</i></a>
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
        <a class="btn-floating waves-effect waves-light red accent-1" data-type="3"><i class="material-icons" >volume_up</i></a>
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
        <a aria-label="Read Aloud" class="btn-floating waves-effect waves-light red accent-1" data-type="4"><i class="material-icons">volume_up</i></a>
      </div>
      <div>
        <p class="prep-ingredient-title">Ingredients</p>
        <ul>
          ${this.formattedIngredients}
        </ul>
      </div>
    </div>
  </section>`; // HTML Snippet for a result page
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
      output +=  `<li>${Object.values(item)[0]}</li>\n`;
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
          quantity: ingredient['amount']['metric']['value'],
          unit: String(ingredient['amount']['metric']['unit']).replace(/s$/, ''), // Removing plural measure notations
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
    if (event.currentTarget.classList.contains('read-favourite')) {
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
    return String(value).toUpperCase();
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
      /* 
        Why yes this *is* an arrow function for the sole purpose of adding plurals to stuff :)

        For posterity I will include the original template literals with the horrid ternery operators littered throughout as a testament to why.

        `${recipe.name}. Serves ${recipe.servings > 0 ? recipe.servings : 'an unspecified number of'} ${recipe.servings === 1 ? "person" : "people"}, and ready in ${recipe.time > 0 ? recipe.time : 'an unspecified number of'} minute${recipe.servings > 1 ? 's' : ''}. ${recipe.description}.`

        `${ingredient.quantity} ${ingredient.quantity > 1 ? (Narrator.articulatedUnit(ingredient.unit)) + 's' : (Narrator.articulatedUnit(ingredient.unit))} of ${ingredient.name}\n`
      */
      const pluralise = quantity => quantity > 1 ? 's' : '';

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
            dialogue += `Step ${Object.keys(step)[0]}. ${Object.values(step)[0]}.\n`;
          }
          // Remove the final new line character
          dialogue = dialogue.replace(newLineMask, '');
          break;
        case Narrator.type.RECIPE_INGREDIENTS:
          // TODO: Add method for populating ingredients with quantity, unit, and name values
          for (const ingredient of recipe.ingredients) {
            dialogue += `${ingredient.quantity} ${Narrator.articulatedUnit(ingredient.unit)}${pluralise(ingredient.quantity)}, ${ingredient.name}\n`;
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

// Listeners
$('#narrator').on('ended', Narrator.unload); // Removing temporary audio stream
$('#content-main').on('click', '.btn-narrate', Narrator.parse); // Set up delegated event listener for narrator elements.
$('#content-main').on('click', '.read-more', Recipe.showActive);

searchBtn.addEventListener("click", function () {
  alertdiv.text("");
  card.html("");
  searchRecipes();
});
