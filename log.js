let mut = new MutationObserver((mutations, observer) => {
  for (const mutation of mutations) {
    const children = mutation.target.childNodes;

    let lastEntry;

    for (let i = children.length - 1; i--; i > 0) {
      if (children[i].nodeName == "ARTICLE") {
        lastEntry = children[i];
        break;
      }
    }

    let conversation = [];

    if (!lastEntry) {
      return;
    }

    let articles = Array.prototype.slice.call(
      document.getElementsByClassName("text-token-text-primary w-full")
    );
    articles.splice(articles.length - 1, 1);
    console.log(articles);

    for (const article of articles) {
      data = {
        author: "",
        message: "",
      };

      let messageElement = article.getElementsByClassName(
        "whitespace-pre-wrap"
      )[0];
      if (messageElement) {
        data["author"] = "user";
        data["message"] = messageElement.innerText;
      } else {
        data["author"] = "chatgpt";
        let chatGptElement = article.getElementsByClassName(
          "markdown prose dark:prose-invert w-full break-words dark"
        )[0];
        if (chatGptElement) {
          data["message"] = chatGptElement.innerText;
        } else {
          console.warn("Could not identify author or message content.");
          continue;
        }
      }
      conversation.push(data);
    }

    console.log(conversation);

    // Save ChatGPT messages to a text file
    saveChatGptMessages(conversation);
  }
});

// Save ChatGPT messages
function saveChatGptMessages(conversation) {
  let chatGptMessages = "";
  for (const message of conversation) {
    if (message.author === "user") {
      chatGptMessages += message.message + "\n\n";
    }
  }

  // Write the ChatGPT messages to a text file
  if (chatGptMessages !== "") {
    const blob = new Blob([chatGptMessages], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chatgpt_messages.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("ChatGPT messages saved to chatgpt_messages.txt");
  }
}
