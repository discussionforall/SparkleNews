var slideIndex = 1;


function plusDivs(n) {
  showDivs(slideIndex += n);
}

function currentDiv(n) {
  showDivs(slideIndex = n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  if (n > x.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = x.length }
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" w3-red", "");
  }
  x[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " w3-red";
}
// just querying the DOM...like a boss!
var links = document.querySelectorAll(".itemLinks");
var wrapper = document.querySelector("#wrapper");

// the activeLink provides a pointer to the currently displayed item
var activeLink = 0;

// setup the event listeners only when slider nav links exist
if (links.length) {
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    link.addEventListener('click', setClickedItem, false);

    // identify the item for the activeLink
    link.itemID = i;
  }

  // set first item as active
  links[activeLink].classList.add("active");
}

function setClickedItem(e) {
  removeActiveLinks();

  var clickedLink = e.target;
  activeLink = clickedLink.itemID;

  changePosition(clickedLink);
}

function removeActiveLinks() {
  for (var i = 0; i < links.length; i++) {
    links[i].classList.remove("active");
  }
}

// Handle changing the slider position as well as ensure
// the correct link is highlighted as being active
function changePosition(link) {
  var position = link.getAttribute("data-pos");
  if (position !== null) {
    wrapper.style.left = position;
  }

  link.classList.add("active");
}
function bindEventSkip() {
  $(document).on('click', '.jsSkip', function () {
    chrome.storage.local.set({ 'starter': true }, function (d) { })
    location.href = 'index.html';
  })
}
function bindEventToIndex() {
  $(document).on('click', '.jsMoveToIndex', function () {
    chrome.storage.local.set({ 'starter': true }, function (d) { })
    location.href = 'index.html';
  })
}

$(document).ready(function () {
  $('.animsition').animsition();

  //showDivs(slideIndex);
  bindEventSkip();
  bindEventToIndex();
});
