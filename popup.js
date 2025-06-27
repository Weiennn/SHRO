document.addEventListener("DOMContentLoaded", function () {
  // Update question count
  function updateCount() {
    chrome.storage.local.get(["questions"], function (result) {
      const questions = result.questions || [];
      document.getElementById("count").textContent = questions.length;
    });
  }

  // Download questions as JSON file
  document.getElementById("download").addEventListener("click", function () {
    chrome.storage.local.get(["questions"], function (result) {
      const questions = result.questions || [];

      if (questions.length === 0) {
        document.getElementById("status").innerHTML =
          '<p class="error">No questions to download!</p>';
        return;
      }

      // Create formatted content
      const content = JSON.stringify(questions, null, 2);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create filename with timestamp
      const now = new Date();
      const filename = `chatgpt_questions_${now.getFullYear()}${(
        now.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}_${now
        .getHours()
        .toString()
        .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}.json`;

      // Download the file
      chrome.downloads.download(
        {
          url: url,
          filename: filename,
          saveAs: true,
        },
        function () {
          document.getElementById("status").innerHTML =
            '<p style="color: green;">Download started!</p>';
          setTimeout(() => {
            document.getElementById("status").innerHTML = "";
          }, 3000);
        }
      );
    });
  });

  // Clear all data
  document.getElementById("clear").addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all logged questions?")) {
      chrome.storage.local.set({ questions: [] }, function () {
        updateCount();
        document.getElementById("status").innerHTML =
          '<p style="color: green;">All data cleared!</p>';
        setTimeout(() => {
          document.getElementById("status").innerHTML = "";
        }, 3000);
      });
    }
  });

  // Initial count update
  updateCount();
});
