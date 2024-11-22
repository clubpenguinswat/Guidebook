
let body = document.body;
let content = document.querySelector("main");
let infobox = document.querySelector("div#infobox");
let currentTab = "Overview";
let infoboxTimeout;
let infoboxDefinition;

fetch(`./definitions.json`).then(json => {
  return json.text();
}).then(raw => {
  definitions = JSON.parse(raw);
});

async function onLoad() {
  let hash = location.hash.replace(`#`, ``).split(":")[0];

  if (hash != "") {
    await switchTab(hash);
  } else {
    await switchTab('Overview');
  }

  if (location.hash.replace(`#`, ``).search(":") != -1) {
    document.querySelector(`[id="${location.hash.replace("#", "")}"]`).scrollIntoView();
  }
}

async function switchTab(tabName) {

  if (!tabName) return new Error("Invalid tab name");

  let path = tabName.replace("#", "");

  await fetch(`./guides/${path}.html`).then(content => {
    if (content.status == 404) {
      return `
        <h1>Not found!</h1>
        <div class="danger">
          <b>Content not found!</b>\n<p>The guide you have directed to does not exist. Please find your guide using the navigation menu on the left.</p>
          <small>In an attempt to fetch the hypothetical resource, a response with status code <b>${content.status}</b> was received.</small>
        </div>
      `;
    } else {
      return content.text();
    }
  }).then(raw => {
    content.innerHTML = raw;
  });

  if (tabName != "Overview") {
    body.classList.remove("centerMode");
  } else {
    body.classList.add("centerMode");
  }

  document.querySelector(`aside a[href="#${currentTab}"]`).classList.remove("active");
  document.querySelector(`aside a[href="#${tabName}"]`).classList.add("active");
  currentTab = tabName;

  let dfnElements = document.querySelectorAll(`dfn`);
  dfnElements.forEach(function(dfnElement) {
    dfnElement.setAttribute(`onclick`, `define(this)`);
  });

  let textblocks = document.querySelectorAll(`div.textblock`);
  textblocks.forEach(function(textblock) {
    let copyButton = document.createElement("button");
    copyButton.innerHTML = "Copy";
    copyButton.setAttribute("onclick", "copyText(this)");
    textblock.prepend(copyButton);
  });

  let linkedContent = document.querySelectorAll(`[id*=":"]`);
  linkedContent.forEach(function(linkedItem) {
    let copyButton = document.createElement("button");
    copyButton.innerHTML = "Copy Link";
    copyButton.setAttribute("onclick", `copyLink("${linkedItem.id}")`);
    linkedItem.appendChild(copyButton);
  });

}

function define(dfnElement) {

  let definition = definitions[dfnElement.innerText.toLowerCase()];

  if (!definition) {
    definition = {
      definition: `Error! Could not find a definition for <b>${dfnElement.innerText}</b>.`
    };
    hideInfobox(5000);
  } else {
    hideInfobox(30000);
  }

  if (!isInfoboxVisible()) {
    infobox.style.bottom = "5%";
    document.querySelector(`div#infobox img`).src = `thumbnails/${definition.thumbnail ?? 'logo.png'}`;
    document.querySelector(`div#infobox p`).innerHTML = definition.definition;
  } else {
    hideInfobox();
  }

}

function isInfoboxVisible(requestedDfn) {
  if (infobox.style.bottom == "-50%" || !infobox.style.bottom) {
    return false;
  } else {
    return true;
  }
}

function hideInfobox(timeout) {
  function hide() {
    infobox.style.bottom = "-50%";
  }

  if (timeout) {
    if (infoboxTimeout) clearInterval(infoboxTimeout);
    infoboxTimeout = setTimeout(() => {
      hide();
    }, timeout);
  } else {
    hide();
  }
}

async function copyText(element) {
  await navigator.clipboard.writeText(element.parentElement.textContent.replace("Copy", "").replaceAll("  ", " ").replaceAll("  ", " ").replaceAll("\n\n", "\n").replaceAll("\n\n", "\n").replaceAll("\n \n", "\n").replaceAll("\n ", "\n").replaceAll("\n-", "\n  -").trim());
  element.innerHTML = "Copied";
  setTimeout(() => {
    element.innerHTML = "Copy";
  }, 5000);
}

async function copyLink(id) {
  await navigator.clipboard.writeText(`https://${location.host}/Guidebook/#${id}`);
}
