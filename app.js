
let body = document.body;
let content = document.querySelector("main");
let infobox = document.querySelector("div#infobox");
let previousTab = null;
let currentTab = "Overview";
let infoboxTimeout;
let infoboxDefinition;

fetch(`./definitions.json`).then(json => {
  return json.text();
}).then(raw => {
  definitions = JSON.parse(raw);
});

async function onLoad() {
  let originalHash = location.hash;
  let hash = location.hash.replace(`#`, ``).split(":")[0];

  if (hash != "") {
    await switchTab(hash);
  } else {
    await switchTab('Overview');
  }

  if (originalHash.replace(`#`, ``).search(":") != -1) {
    console.log(`Sub-internal link found. Scrolling into ${originalHash.replace("#", "")}.`);
    document.querySelector(`[id="${originalHash.replace("#", "")}"]`).scrollIntoView();
    location.hash = originalHash;
  }
}

async function switchTab(tabName, redirect) {

  if (!tabName) return new Error("Invalid tab name");

  let appendix = ``;
  let path = tabName.replace("#", "");

  if (redirect) {
    appendix = `<a onclick="goBack()">← Go Back</a>`
  }

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
    content.innerHTML = `${appendix}${raw}`;
  });

  if (tabName != "Overview") {
    body.classList.remove("centerMode");
  } else {
    body.classList.add("centerMode");
  }

  document.querySelector(`aside a[href="#${currentTab}"]`)?.classList.remove("active");
  document.querySelector(`aside a[href="#${tabName}"]`)?.classList.add("active");

  previousTab = currentTab;
  currentTab = tabName;
  location.hash = `#${tabName}`;

  let dfnElements = document.querySelectorAll(`dfn`);
  dfnElements.forEach(function(dfnElement) {
    dfnElement.setAttribute(`onclick`, `define(this)`);
  });

  let textblocks = document.querySelectorAll(`div.textblock`);
  textblocks.forEach(function(textblock) {
    textblock.innerHTML = textblock.innerHTML.trim();

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

  checkLinks();

}

function define(dfnElement) {

  let requestedDfn = dfnElement.innerText;
  let definition = definitions[requestedDfn.toLowerCase()];

  if (!definition) {
    definition = {
      definition: `Error! Could not find a definition for <b>${requestedDfn}</b>.`
    };
    hideInfobox(5000);
  } else {
    hideInfobox(30000);
  }

  if (!isInfoboxVisible() || requestedDfn != infoboxDefinition) {
    infobox.style.bottom = "5%";
    document.querySelector(`div#infobox img`).src = `thumbnails/${definition.thumbnail ?? 'logo.png'}`;
    document.querySelector(`div#infobox p`).innerHTML = definition.definition;
    infoboxDefinition = requestedDfn;
    hideInfobox(30000);
  } else {
    hideInfobox();
  }

}

function checkLinks() {
  let externalLinks = document.querySelectorAll(`a[href^="http:"], a[href^="https:"]`);
  externalLinks.forEach(function(link) {
    link.setAttribute("target", "_blank");
  });

  let internalLinks = document.querySelectorAll(`a[href^="#"]`);
  internalLinks.forEach(function(link) {
    let targetTabName = link.getAttribute("href").replace("#", "");
    if (!link.classList.contains("redirect")) {
      link.setAttribute("onclick", `switchTab("${targetTabName}")`);
    } else {
      link.setAttribute("onclick", `switchTab("${targetTabName}", true)`);
    }
  });
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

function goBack() {
  switchTab(previousTab, false);
}

async function copyText(element) {
  await navigator.clipboard.writeText(element.parentElement.textContent.replace("Copy", "").trim());
  element.innerHTML = "Copied";
  setTimeout(() => {
    element.innerHTML = "Copy";
  }, 5000);
}

async function copyLink(id) {
  await navigator.clipboard.writeText(`https://${location.host}/Guidebook/#${id}`);
}
