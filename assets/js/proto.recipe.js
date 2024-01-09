function promiseSearch(query, resultCap = 10) {
    const output = fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&number=${resultCap}`, {
        method: "GET",
        headers: {
            "x-api-key": 'd6b7732ac8f6419095e86a0d96cc3570'
        }
    })
    .then(resp => {
        if (!resp.ok) {
            const errorMask = `[${resp.status}]: ${resp.statusText}`;
            throw new Error(errorMask);
        }

        return resp.json();
    });

    return output;
}

async function awaitSearch(query, resultCap = 10) {
    try {
        const resp = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&addRecipeInformation=true&number=${resultCap}`, {
            method: "GET",
            headers: {
                "x-api-key": 'd6b7732ac8f6419095e86a0d96cc3570'
            }
        });

        if (!resp.ok) {
            throw new Error (resp.statusText);
        }

        return await resp.json();

    } catch (err)
    {
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