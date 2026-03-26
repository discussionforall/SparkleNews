// background.js (MV3 compatible)
function getTodayKey() {
  const d = new Date();
  return d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
}

function applyBadgeFromCount(data) {
  chrome.action.setBadgeBackgroundColor({ color: "black" });
  if (data > 0) {
    let n = data;
    if (n > 100) {
      n = "100+";
    }
    chrome.action.setBadgeText({ text: "" + n + "" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

async function updateLatestNewsBadge() {
  const url = "https://economictimes.indiatimes.com/latestnews_chrome.cms?feedtype=sjson";

  const stored = await chrome.storage.local.get([
    "latestNewsCount",
    "lastNewsId",
    "lastNewsDate",
    "badgeCountN",
  ]);

  let count = Number(stored.latestNewsCount) || 0;
  let lastNewsId = Number(stored.lastNewsId) || 0;
  const todayKey = getTodayKey();

  if (stored.lastNewsDate !== todayKey) {
    count = 0;
    await chrome.storage.local.set({ lastNewsDate: todayKey });
  }

  const res = await fetch(url);
  if (!res.ok) {
    return;
  }
  const a = await res.json();
  const dt = (a && a.NewsItem) || [];

  let counter = 0;
  let check = false;
  let lastNewsIdLocal = lastNewsId;

  for (let i = 0; i < dt.length; i++) {
    if (Number(lastNewsIdLocal) < Number(dt[i].id)) {
      lastNewsIdLocal = dt[0].id;
      count = count + 1;
      counter = counter + 1;
      check = true;
    }
  }

  if (!check) return;

  await chrome.storage.local.set({
    lastNewsId: lastNewsIdLocal,
    latestNewsCount: count,
  });

  const prevBadge = stored.badgeCountN !== undefined ? Number(stored.badgeCountN) : undefined;
  const nextBadge = prevBadge !== undefined ? prevBadge + counter : counter;

  await chrome.storage.local.set({ badgeCountN: nextBadge });
  // Update badge directly; do not chrome.runtime.sendMessage from the SW to itself
  // (unreliable / can cause unhandled rejections when no other page is listening).
  applyBadgeFromCount(nextBadge);
}

// This build is popup-driven (no page-wide content scripts).

chrome.runtime.onMessage.addListener(function (request) {
  if (!request || !request.message) return;
  if (request.message === "check_site") {
    applyBadgeFromCount(request.data);
  } else if (request.message === "get_latest_news") {
    // Backward compatibility: trigger a badge refresh.
    updateLatestNewsBadge().catch(() => { });
  }
});

chrome.alarms.create("1min", {
  delayInMinutes: 5,
  periodInMinutes: 5
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "1min") {
    updateLatestNewsBadge().catch(() => { });
  }
});