client.aside.isVisible = function() {
  let display = getComputedStyle(client.aside).display;

  if (display == "none") {
    return false;
  } else {
    return true;
  }
}

client.menuToggler.addEventListener("click", function() {
  if (client.aside.isVisible()) {
    client.aside.style.display = "none";
  } else {
    client.aside.style.display = "initial";
  }
});