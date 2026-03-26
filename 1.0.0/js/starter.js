if (navigator.onLine == false) {
  location.href = 'noInternet.html';
}


chrome.storage.local.get('starter', function (data) {
  if (data['starter'] == undefined) {
    location.href = 'landing.html'
  } else {
    location.href = 'index.html'
  }
})