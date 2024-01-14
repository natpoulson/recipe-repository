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
    const descSentenceMask = /^(?:.+?\.){1}/;
    // Mask for removing the <b> tags.
    const descHTMLMask = /(\<\/?b\>)/gi;
    // Truncate to 1 sentence then remove any instances of <b> or </b> tags
    this.description = this.description.match(descSentenceMask);
    this.description = String(this.description).replace(descHTMLMask, '');

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
      return `<div class="col s12 m6 l4">
      <div class="card recipe-card">
        <div class="card-image">
          <img class="recipe-card-badges" src="${this.image}" alt="${this.name}" />
          <div class="recipe-card-details">
            <a aria-label="Add Recipe to Favourites" class="btn-floating waves-effect waves-light red" onclick="">
              <i class="material-icons">favorite</i>
              </a>
            <a aria-label="Read Aloud" class="btn-floating waves-effect waves-light red accent-1" onclick="">
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
              <p>${this.servings} serve${this.servings > 1 ? 's' : ''}</p>
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

      // Process the results before they can be used
      const data = await resp.json();
      await Recipe.saveResults(data);
      return;

    } catch(err) {
      // Log the error message
      console.error(err);
      return;
    }
  }

  static async saveResults(data) {
      // Clear any existing results and begin generating fresh results
      Recipe.list = [];

      for (const item of data.results) {
        Recipe.list.push(new Recipe(item.id, item));
      }
  }

  static async showResultCards() {
    // Bind our search results section first and blank what's there.
    const results = $('#search-results');
    results.html('');

    // Show no results found if the Recipe list is empty, then terminate the function.
    if (Recipe.list.length === 0) {
      results.html('<div class="msg-searchErr">No recipes found. 😥</div>');
      return;
    }

    // Create new string containing the generated HTML concatenated for all recipes returned.
    let formattedResults = '<div class="row">';
    for (const recipe of Recipe.list) {
      formattedResults += recipe.resultCard;
    }
    formattedResults += '</div>';

    // Apply the results to the container
    results.html(formattedResults);
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
      narrator.play();
    }
    catch(err) {
      console.error(err);
    }
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
    .then(() => Recipe.showResultCards()) // Show the results after query processing only.
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
