function recipeSearch(query, resultCap = 10) {
    let results;
    try {
        fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation&number=${resultCap}`, {
            method: "GET",
            headers: {
                "x-api-key": 'd6b7732ac8f6419095e86a0d96cc3570'
            }
        })
        .then((resp) => {
            if (resp.ok) {
                resp.json().then(data => {results = data});
            }
            throw resp.statusText;
        });
    } catch(err) {
        console.error("Spoonacular API returned the following error:", err);
    }
    
    console.log(results);
}
