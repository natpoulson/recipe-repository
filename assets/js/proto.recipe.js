async function recipeSearch(query, resultCap = 10) {
    const output = fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&number=${resultCap}`, {
        method: "GET",
        headers: {
            "x-api-key": 'd6b7732ac8f6419095e86a0d96cc3570'
        }
    })
    .then(resp => {
        if (!resp.ok) {
            const errorMask = `[${resp.status}]: ${resp.statusText}`;
            // console.error(errorMask);
            throw new Error(errorMask);
        }
        return resp.json();
    });

    return output;
}

recipeSearch("beef", 2)
    .then(data => console.log(data))
    .catch(error => console.error(error));
