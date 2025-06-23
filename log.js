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
      try {
        let _ = article.getElementsByTagName("h5"); // user
        data["author"] = "user";
        data["message"] = article.getElementsByClassName(
          "whitespace-pre-wrap"
        )[0].innerText;
      } catch {
        data["author"] = "chatgpt";
        data["message"] = article.getElementsByClassName(
          "markdown prose dark:prose-invert w-full break-words dark"
        )[0].innerText;
      }
      conversation.push(data);
    }

    console.log(conversation);

    // Save student messages to a text file
    saveMessages(conversation);
  }
});

// Questions students asked
function saveMessages(conversation) {
  let savedMessages = "";
  for (const message of conversation) {
    if (message.author === "author") {
      savedMessages += message.message + "\n\n";
    }
  }

  // Write the student messages to a text file
  if (savedMessages !== "") {
    const blob = new Blob([savedMessages], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved_messages.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Student messages saved to saved_messages.txt");
  }
}

mut.observe(document.getElementsByTagName("main")[0], {
  childList: true,
  subtree: false,
});
