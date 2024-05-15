import * as model from './model.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODEL_CLOSE_SEC } from './config.js';

// if (module.hot) {
//   module.hot.accept();
// }
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    //
    if (!id) return;
    recipeView.renderSpinner();

    // 1) Updates results view to mark selected search result
    resultView.update(model.getSearchResultsPage());

    // 3) Loading recipe...
    await model.loadRecipe(id);

    // 4) rendering recipe
    recipeView.render(model.state.recipe);
    // 2) Udpate bookmarks
    bookmarksView.update(model.state.bookmarks);
  } catch (error) {
    recipeView.renderError();
  }
};
//
const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();

    // 1) Get search query...
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    //resultView.render(model.state.search.results);
    resultView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotToPage) {
  // 1) Render NEW results
  resultView.render(model.getSearchResultsPage(gotToPage));

  // 4) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (updateTo) {
  // Update the recipe servings (in state)
  model.updateServings(updateTo);

  // Update the recipe view
  recipeView.render(model.state.recipe);
  //recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/Delete bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmark
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    // Show spinner...
    addRecipeView.renderSpinner();

    // Upload the new recipe data....
    await model.uploadRecipe(newRecipe);

    // Render new recipe
    recipeView.render(model.state.recipe);

    // Render success message....
    addRecipeView.renderMessage();

    // Render bookmarks....
    bookmarksView.render(model.state.recipe);

    // Change Id in URL
    window.history.pushState(null, `#${model.state.recipe.id}`);
    // close window...
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log('🔥', err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
