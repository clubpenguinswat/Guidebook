
let body = document.body;
let content = document.querySelector("main");
let infobox = document.querySelector("div#infobox");
let currentTab = "Overview";

fetch(`./definitions.json`).then(json => {
  return json.text();
}).then(raw => {
  definitions = JSON.parse(raw);
});

function onLoad() {
  if (location.hash.replace("#", "") != "") {
    switchTab(location.hash.replace(`#`, ``));
  } else {
    switchTab('Overview');
  }
}

async function switchTab(tabName) {

  if (!tabName) return new Error("Invalid tab name");

  let path = tabName.replace("#", "");

  await fetch(`./guides/${path}.html`).then(content => {
    return content.text();
  }).then(raw => {
    content.innerHTML = raw;
  });

  if (tabName != "Overview") {
    body.classList.remove("centerMode");
  } else {
    body.classList.add("centerMode");
  }

  console.log(`aside a[href="#${tabName}"]`);
  document.querySelector(`aside a[href="#${currentTab}"]`).classList.remove("active");
  document.querySelector(`aside a[href="#${tabName}"]`).classList.add("active");
  currentTab = tabName;

}

function define(dfnElement) {

  let definition = definitions[dfnElement.innerText];

  infobox.style.display = "flex";
  document.querySelector(`div#infobox img`).src = definition.thumbnail;
  document.querySelector(`div#infobox p`).innerHTML = definition.definition;

}
