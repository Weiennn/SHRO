async function getArticleContainer() {
    let articles = document.getElementsByTagName("article");

    while (articles.length == 0) {
        await new Promise((r, _) => setTimeout(r, 100));
    }

    if (articles.length <= 3) {
        for (article of articles) {
            listeners.push(observeAndLogText(article));
        }
    }


    return articles[0].parentElement;
}

function observeAndLogText(element) {
    let text = undefined;

    return setInterval(
        () => {
            if (element.innerText != text) {
                text = element.innerText;
                console.log(Array.from(element.parentElement.children).indexOf(element));
                console.log(old_text);
            }
        },
        1000);
}

function attachLoggingObserver(mutation_list, _) {
    for (mutation of mutation_list) {
        for (node of mutation.addedNodes) {
            if (node.nodeName == "ARTICLE") {
                listeners.push(observeAndLogText(node));
            }
        }
    }
}

function main() {
    global_observer.disconnect();

    for (i of listeners) {
        clearInterval(i);
    }
    listeners = [];

    getArticleContainer()
        .then(
            cont => global_observer.observe(cont, { "childList": true })
        )
        .catch(r => console.error(r));

}

let global_observer = new MutationObserver(attachLoggingObserver);
let listeners = [];

// One second delay after url change to ensure correct logging
browser.runtime.onMessage.addListener(setTimeout.bind(undefined, main, 1000));
main();