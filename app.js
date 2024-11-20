
let body = document.body;
let content = document.querySelector(`main`);

function switchTab(tabName) {
  if (!tabName) return new Error("Invalid tab name");

  let path = tabName.replace("#", "");

  fetch(`./guides/${path}.html`).then(content => {
    return content.text();
  }).then(raw => {
    content.innerHTML = raw;
  });

  if (tabName != "Overview") {
    body.classList.remove("centerMode");
  } else {
    body.classList.add("centerMode");
  }

}
