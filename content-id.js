(function () {
  console.log("ChatGPT Logger: Script loaded");

  let loggedQuestions = {} //new Set(); // Track already logged questions to avoid duplicates

  // Function to save question to storage
  function saveQuestion(question, threadID) {

    if (!(document.querySelectorAll('[data-active=""]')[0].href in loggedQuestions)) {
        loggedQuestions[document.querySelectorAll('[data-active=""]')[0].href] = new Set();
    }

    // Skip if already logged
    if (loggedQuestions[threadID].has(question)) {
      console.log(
        "ChatGPT Logger: Question already logged, skipping:",
        question
      );
      return;
    }

    loggedQuestions[threadID].add(question);
    const timestamp = new Date().toISOString();
    const entry = {
      question: question,
      timestamp: timestamp,
    };

    // Get existing questions from storage
    chrome.storage.local.get([`questions-${threadID}`], function (result) {
      if (chrome.runtime.lastError) {
        console.error(
          "ChatGPT Logger: Storage error:",
          chrome.runtime.lastError
        );
        return;
      }

      const existingQuestions = result[`questions-${threadID}`] || [];
      existingQuestions.push(entry);

      // Save updated questions
      chrome.storage.local.set({ [`questions-${threadID}`]: existingQuestions }, function () {
        if (chrome.runtime.lastError) {
          console.error(
            "ChatGPT Logger: Save error:",
            chrome.runtime.lastError
          );
        } else {
          console.log("ChatGPT Logger: Question saved:", question);
        }
      });
    });
  }

  // Function to find and log user messages from the chat
 function captureUserMessages(threadID) {
    console.log("ChatGPT Logger: Scanning for user messages...");

    // Look for all elements with the specific structure
    // Based on your HTML: <div class="relative max-w-[var(--user-chat-width,70%)] bg-token-message-surface rounded-3xl px-5 py-2.5">
    const userMessages = document.querySelectorAll("div.whitespace-pre-wrap");

    if (userMessages.length === 0) {
      // Try alternative selectors
      const alternativeSelectors = [
        // Look for rounded message bubbles
        "div.rounded-3xl div.whitespace-pre-wrap",
        // Look for user role messages
        '[data-message-author-role="user"] div.whitespace-pre-wrap',
        // Look for specific max-width pattern
        'div[class*="max-w-"][class*="70%"] div.whitespace-pre-wrap',
      ];

      for (const selector of alternativeSelectors) {
        const messages = document.querySelectorAll(selector);
        if (messages.length > 0) {
          console.log(
            `ChatGPT Logger: Found ${messages.length} messages with selector: ${selector} in thread ${threadID}`
          );
          messages.forEach((msgElement) => {
            processMessage(msgElement, threadID)
          });
          return;
        }
      }

      console.log("ChatGPT Logger: No user messages found");
    } else {
      console.log(`ChatGPT Logger: Found ${userMessages.length} user messages`);
      userMessages.forEach((msgElement) => {
        processMessage(msgElement, threadID)
      });
    }
  }

  // Process individual message
 function processMessage(msgElement, threadID) {
    const text = msgElement.textContent.trim();
    if (text && text.length > 0) {
      // Verify this is a user message by checking parent structure
      const parent =
        msgElement.closest("div.bg-token-message-surface") ||
        msgElement.closest("div.rounded-3xl");

      if (parent) {
        // Additional check: make sure it's not an assistant message
        // Assistant messages typically have different styling
        const isAssistant =
          parent.closest('[data-message-author-role="assistant"]') ||
          parent.querySelector("svg") || // Assistant messages often have icons
          parent.closest(".group.bg-token-main-surface"); // Different background

        if (!isAssistant) {
          console.log(
            "ChatGPT Logger: Processing user message:",
            text.substring(0, 50) + "..."
          );
          saveQuestion(text, threadID);
        }
      }
    }
  }

  // Monitor for new messages being added to the chat
  function setupObserver() {
    console.log("ChatGPT Logger: Setting up observer...");

    let debounceTimer;
    const observer = new MutationObserver(function (mutations) {
      // Clear existing timer
      clearTimeout(debounceTimer);

      // Set new timer to capture messages after DOM settles
      debounceTimer = setTimeout(() => {
        console.log(
          "ChatGPT Logger: DOM changed, checking for new messages..."
        );
        captureUserMessages(document.querySelectorAll('[data-active=""]')[0].href);
      }, 1000); // Wait 1 second for DOM to settle
    });

    // Start observing the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("ChatGPT Logger: Observer started successfully");
  }

  // Initialize the extension
  function init() {
    console.log("ChatGPT Logger: Initializing...");

    if (!(document.querySelectorAll('[data-active=""]')[0].href in loggedQuestions)) {
        loggedQuestions[document.querySelectorAll('[data-active=""]')[0].href] = new Set();
    }
    

    // Test if we're on the right page
    if (
      !window.location.href.includes("chat") &&
      !window.location.href.includes("chatgpt")
    ) {
      console.error("ChatGPT Logger: Not on ChatGPT page");
      return;
    }

    // Load previously logged questions first
    chrome.storage.local.get([`questions-${document.querySelectorAll('[data-active=""]')[0].href}`], function (result) {
      if (chrome.runtime.lastError) {
        console.error(
          "ChatGPT Logger: Error loading existing questions:",
          chrome.runtime.lastError
        );
      } else {
        console.log("idk what even")
        console.log(result)
        const existingQuestions = result[`questions-${document.querySelectorAll('[data-active=""]')[0].href}`] || [];
        console.log(existingQuestions);
        console.log(loggedQuestions);
        existingQuestions.forEach((q) => {
          loggedQuestions[document.querySelectorAll('[data-active=""]')[0].href].add(q.question);
        });
        console.log(
          `ChatGPT Logger: Loaded ${loggedQuestions[document.querySelectorAll('[data-active=""]')[0].href].size} existing questions`
        );
      }

      // After loading existing questions, scan current page
      setTimeout(() => {
        captureUserMessages(document.querySelectorAll('[data-active=""]')[0].href);
      }, 2000);
    });

    // Set up monitoring for new messages
    setupObserver();

    // Periodic fallback scanning
    setInterval(() => {
      console.log("ChatGPT Logger: Periodic scan...");
      captureUserMessages(document.querySelectorAll('[data-active=""]')[0].href);
    }, 15000); // Check every 15 seconds
  }

  // Start the extension with delay to ensure page is loaded
  console.log("ChatGPT Logger: Waiting for page load...");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(init, 2000);
    });
  } else {
    setTimeout(init, 2000);
  }
})();
