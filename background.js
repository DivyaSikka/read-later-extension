//listens for messages from other parts of the popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("Message received in background:", msg);
    //if save article, then get title content and url (when user clicks save this page)
    if (msg.action === "save_article") {
        const { title, content, url } = msg;

        //logs for debugging:
        console.log("Article content length:", content.length);
        console.log("Content preview:", content.slice(0, 200)); // log first 200 chars

        //summarize article before saving
        summarizeText(content).then(summary => {
            chrome.storage.local.get(["articles"], (data) => {
                const articles = data.articles || []; //get already saved articles, if not, empty list
                articles.push({ title, content, url, summary }); //add article to the list (with summary)
                chrome.storage.local.set({ articles }); //saved updated list to local storage
            });
        }).catch(err => {
        console.error("Failed to summarize article:", err); //IF there is an error
        //save without a summary still -> same thing 
        chrome.storage.local.get(["articles"], (data) => {
            const articles = data.articles || [];
            articles.push({ title, content, url });
            chrome.storage.local.set({ articles });
            });
        });
    }
});

//function that calls openAI for the summary
function summarizeText(text) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("openaiKey", async (data) => {
            const apiKey = data.openaiKey;
            if (!apiKey) {
                return reject("OpenAI API key not found. Please set it via chrome.storage.");
            }

            // Truncate text to avoid token limit issues
            const safeText = text.length > 4000 ? text.slice(0, 4000) : text;

            //send POST request to fetch the data 
            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + apiKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "user", content: "Summarize this article in 30-35 words:\n\n" + safeText }],
                        temperature: 0.5
                    })
                });

                const data = await response.json();

                console.log("OpenAI response:", data); //log for debugging 

                if (!data.choices || !data.choices[0]) {
                    reject("No summary returned from OpenAI.");
                } else {
                    resolve(data.choices[0].message.content);
                }
            } catch (err) {
            reject(err);
            }
        });
    });
}

