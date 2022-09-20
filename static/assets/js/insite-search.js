let pagesIndex, searchIndex;

async function initSearchIndex() {
  try {
    const response = await fetch("/index.json");
    pagesIndex = await response.json();
    searchIndex = lunr(function () {
      this.field("title");
      this.field("description");
      this.field("content");
    //   this.ref("href");
      this.ref("description");
    //   this.ref("title");
      pagesIndex.forEach((page) => this.add(page));
    });
  } catch (e) {
    console.log(e);
  }
}

function searchBoxFocused() {
  document.querySelector(".search-container").classList.add("focused");
  document
    .getElementById("search")
    .addEventListener("focusout", () => searchBoxFocusOut());
}

function searchBoxFocusOut() {
  document.querySelector(".search-container").classList.remove("focused");
}

initSearchIndex();

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("search-form") != null) {
    const searchInput = document.getElementById("search");

    searchInput.addEventListener("focus", () => searchBoxFocused());
  }
});


function handleSearchQuery(event) {
    event.preventDefault();
    const query = document.getElementById("search").value.trim().toLowerCase();
    if (!query) {
      displayErrorMessage("Please enter a search term");
      return;
    }
    const results = searchSite(query)
    if (!results.length) {
      displayErrorMessage("Your search returned no results")
      return
    }
  }
  
  function displayErrorMessage(message) {
    document.querySelector(".search-error-message").innerHTML = message;
    document.querySelector(".search-container").classList.remove("focused");
    document.querySelector(".search-error").classList.remove("hide-element");
    document.querySelector(".search-error").classList.add("fade");
  }
  
  function removeAnimation() {
    this.classList.remove("fade");
    this.classList.add("hide-element");
    document.querySelector(".search-container").classList.add("focused");
  }
  
  function searchSite(query) {
    const originalQuery = query;
    query = getLunrSearchQuery(query);
    let results = getSearchResults(query);
    return results.length
      ? results
      : query !== originalQuery
      ? getSearchResults(originalQuery)
      : [];
  }
  
  function getSearchResults(query) {
    return searchIndex.search(query).flatMap((hit) => {
      if (hit.ref == "undefined") return [];
      let pageMatch = pagesIndex.filter((page) => page.href === hit.ref)[0];
      pageMatch.score = hit.score;
      return [pageMatch];
    });
  }
  
  function getLunrSearchQuery(query) {
    const searchTerms = query.split(" ");
    if (searchTerms.length === 1) {
      return query;
    }
    query = "";
    for (const term of searchTerms) {
      query += `+${term} `;
    }
    return query.trim();
  }
  
