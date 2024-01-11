class Recipe {
    id = 0;
    name = "";
    image = "";
    servings = 0;
    prep = 0;
    description = "";
    instructions = [];
    ingredients = [];
    allergens = {
        dairy: false,
        gluten: false,
        nuts: false, // There's nothing explicitly in the results returned for this. Considering options
        shrimp: false //Nothing explicitly stated for this
    };

    // Standard constructor
    constructor(id, attributes = {}) {
        
    }

    // This is a getter which functions as a placeholder for card output
    get template() {
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
                  <p>${this.prep}</p>
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
}

// Functions with promise-based searches are called normally
function promiseSearch(query, resultCap = 10) {
    // The fetch function needs to be returned either directly or via a variable
    // Otherwise the function will be returned as undefined
    return fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&number=${resultCap}`, {
        // Setting values for the Request object, which will use default values for anything else
        method: "GET",
        headers: {
            "x-api-key": 'd6b7732ac8f6419095e86a0d96cc3570'
        }
    })
    // Handle the response when successful
    .then(resp => {
        // Check if the status code is anything other than 2XX using the Response.OK helper property
        if (!resp.ok) {
            // You can perform error handling in here, or just pass the error back to the caller so it can be handled depending on use case (in this case)
            const errorMask = `[${resp.status}]: ${resp.statusText}`;
            throw new Error(errorMask);
        }

        // Return a promise for the payload in JSON format
        return resp.json();
    });
}

// Functions using async...await syntax must be declared as async methods
async function awaitSearch(query, resultCap = 10) {
    // Because async...await abstracts a lot of the flow control away that you'd need to deal with using promises directly, you can intercept and apply error checking using try...catch syntax
    // try...catch is more standard syntax for error checking, so this is easier to read
    try {
        // Using await forces execution of asynchronous code to halt until a response is received, making it behave more like regular code
        const resp = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&number=${resultCap}`, {
            method: "GET",
            headers: {
                "x-api-key": 'd6b7732ac8f6419095e86a0d96cc3570'
            }
        });

        // You can apply the checks on the response directly instead of encapsulating in .then()
        if (!resp.ok) {
            throw new Error (resp.statusText);
        }

        // When done, simply return the promised JSON object
        return await resp.json();

    } catch (err)
    {
        // We can handle the errors internally here
        console.error(err);
    }
}

// Example of handling the call through direct promise handling
/*
promiseSearch("beef", 2)
    .then(data => console.log(data))
    .catch(error => console.error(error));
*/

// Example of handling the call from async...await
/* 
awaitSearch("pork", 1)
    .then(data => console.log(data));
*/

// The key difference? You can apply error handling within the function itself using standard try...catch syntax without it being much of a hassle.
// No matter which method you go with, successful executions still need to be handled with .then()