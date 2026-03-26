// landingjs.js
// Marks that the user has seen the onboarding preview, then returns to the main popup.
chrome.storage.local.get("starter", function (data) {
  if (data && data.starter !== undefined) {
    location.href = "index.html";
    return;
  }

  chrome.storage.local.set({ starter: true }, function () {
    // Give the preview iframe a moment to render.
    setTimeout(function () {
      location.href = "index.html";
    }, 1200);
  });
});

