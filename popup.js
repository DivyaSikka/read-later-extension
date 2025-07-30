/*document.addEventListener("DOMContentLoaded", () => {
//get button element & add event listener (for click)
document.getElementById("saveButton").addEventListener("click", async () => {
    //get the current tab in chrome
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    //chrome scripting API to run the function in the tab
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractAndSaveArticle
    });
});

//function that gets the page and passes it to storage
function extractAndSaveArticle() {
    //clone html and pass to readability to extract main content from web pages 
    //returns object with info
    const article = new Readability(document.cloneNode(true)).parse();

    //communicates with background script of extension (from content script currently)
    chrome.runtime.sendMessage({ 
        action: "save_article", //background script must save the article
        title: article.title, //title from readability 
        content: article.textContent, //content from readability
        url: window.location.href //url
    });
}

//retrieves saved article from chrome's local storage & passes to data object 
//if none saved, data object undefined 
chrome.storage.local.get(["articles"], (data) => {
    //empty array if undefined 
    const articles = data.articles || [];
    //element articleList - stores all saved articles
    const list = document.getElementById("articleList");

    //loop through each article
    articles.forEach(article => {
        //create new element for each
        const item = document.createElement("li");
        //fill element with title, summary (or if none then say none), and link to whole article
        item.innerHTML = "<strong>" + article.title + "</strong><br>" + (article.summary || "No summary yet") + "<br><a href=\"" + article.url + "\" target=\"_blank\">Read</a>";
        //make it appear on the popup by appending to list
        list.appendChild(item);
    });
});
});*/

document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded"); // Should show up immediately

  const saveButton = document.getElementById("saveButton");

  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      console.log("Save button clicked");

      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractAndSaveArticle
      });
    });
  } else {
    console.error("Could not find saveButton");
  }

  chrome.storage.local.get(["articles"], (data) => {
    const articles = data.articles || [];
    const list = document.getElementById("articleList");

    articles.forEach(article => {
      const item = document.createElement("li");
      item.innerHTML =
        "<strong>" + article.title + "</strong><br>" +
        (article.summary || "No summary yet") + "<br>" +
        "<a href=\"" + article.url + "\" target=\"_blank\">Read</a>";
      list.appendChild(item);
    });
  });
});

function extractAndSaveArticle() {
  const article = new Readability(document.cloneNode(true)).parse();

  chrome.runtime.sendMessage({
    action: "save_article",
    title: article.title,
    content: article.textContent,
    url: window.location.href
  });
}