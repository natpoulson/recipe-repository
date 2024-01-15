# Dish Delight
## Description
Dish Delight is a simple single-page app (SPA) that can be used to query the Spoonacular API for various recipes to use, and also features TTS narration via VoiceRSS.

The intent behind this app is to provide a simple, straight forward tool for looking up recipes, with narration features to aid those who are hard of hearing. At this stage we were unable to delver all the features planned (such as result filtering and sorting), but strived to provide a minimum-viable product regardless.

This is a collaborative project betweeen [Nat](https://github.com/natpoulson), [Yousra](https://github.com/Yousra-Kamal), and [Stacey](https://github.com/Staceka1).

## Table of Contents
- [Usage](#usage)
- [Known Issues](#known-issues)
- [Credits](#credits)
- [License](#license)

## Usage
With the current release of Dish Delight, the following functionality is available to use:
- Search recipes from Spoonacular (currently limited to 9 results)
- Adding to/removing from favourites
- Favourites persistence
- Viewing individual results
- Narration capabilities for recipe/favourite cards, recipe description, instructions, and ingredients
    - Narration also includes a number of pre-processing rules to make the speech as natural as possible within constraints

## Known Issues
The following issues are known, but couldn't be addressed in time for the submission due to various constraints, these are as follows:
- The close button in the favourites sidebar is pushed off-sccreen when one or more recipe cards have been added
- The favourites sidebar doesn't compensate for the navbar when scrolling down
- No feedback on changes made when adding or removing a favourite from the recipe cards or active recipe view (ran out of time to create more elaborate redraws for the change)
- Currently lacking navigation capabilities (Prev/Next) in the results, so it's limited to up to 9 results
- No sorting or filtering capabilities
- Sometimes the TTS will read out things awkwardly, this has been mitigated to a degree with sanitisation regex but it unfortunately cannot commpletely compensate for the inconsistency of spoonacular's responses (a limitation based on the fact the recipes are interpretations from various sites, and all of them present their recipe information differently)

## Credits
Big thanks to [Yousra](https://github.com/Yousra-Kamal) for her assistance with:
- Scouting out project ideas and APIs
- Assisting with the implementation of the Materialise framework after Foundation didn't work out
- Helping create the UX in HTML/CSS and providing template data necessary for the result, recipe, and favourite objects to be presented

Big thank you to [Stacey](https://github.com/Staceka1) as well for her help in:
- Outlining overall design and theming
- Assisting with creating a collaborative workspace and presentation with her expansive knowledge of Figma
- Providing the sidebar and supporting materials for favourite functionality

## Attribution
- Fonts by [Google Fonts](https://fonts.google.com/)
- CSS Framework by [Materialize](https://materializecss.com/about.html)
- Recipe lookup API by [Spoonacular](https://spoonacular.com/food-api)
- TTS Narration by [VoiceRSS](https://www.voicerss.org/)

## License
This project is provided under the [MIT License](./LICENSE).