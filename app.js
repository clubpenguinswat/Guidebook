const client = {
  config: undefined,
  body: document.body,
  main: document.querySelector("main"),
  infobox: document.querySelector("div#infobox"),
  tabHistory: [],
  previousTab: null,
  currentTab: null,
  infoboxTimeout: null,
  infoboxDefinition: undefined,
  launcher: {
    screen: document.querySelector("div#launch"),
    text: document.querySelector("div#launch p"),
    input: document.querySelector("div#launch input"),
    errorText: document.querySelector("div#launch small.error")
  }
};

client.infobox.thumbnail = document.querySelector("div#infobox img");
client.infobox.text = document.querySelector("div#infobox p");
client.infobox.button = document.querySelector("div#infobox button");

async function onLoad() {

  await fetch(`./config.json`).then(json => {
    return json.text();
  }).then(raw => {
    client.config = JSON.parse(raw);
  });
  await fetch(`./definitions.json`).then(json => {
    return json.text();
  }).then(raw => {
    definitions = JSON.parse(raw);
  });
  await goToURL();
  await startLauncher();

}

async function goToURL() {

  let originalHash = location.hash;
  let hash = location.hash.replace(`#`, ``).split(":")[0];

  if (hash != "") {
    await switchTab(hash);
  } else {
    await switchTab(client.config.entrypoint);
  }

  if (originalHash.replace(`#`, ``).search(":") != -1) {
    document.querySelector(`[id="${originalHash.replace("#", "")}"]`).scrollIntoView();
    location.hash = originalHash;
  }

}

async function switchTab(tabName, redirect) {

  if (!tabName) return new Error("Tab name not provided.");

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
    client.main.innerHTML = `${appendix}${raw}`;
  });

  if (tabName != "Overview") {
    client.body.classList.remove("centerMode");
  } else {
    client.body.classList.add("centerMode");
  }

  document.querySelector(`aside a[href="#${client.currentTab}"]`)?.classList.remove("active");
  document.querySelector(`aside a[href="#${tabName}"]`)?.classList.add("active");

  client.previousTab = client.currentTab;
  client.currentTab = tabName;
  client.tabHistory.log({
    tabName: client.currentTab,
    timestamp: Date.now()
  });
  location.hash = `#${tabName}`;

  let dfnElements = document.querySelectorAll(`dfn`);
  dfnElements.forEach(function(dfnElement) {
    dfnElement.setAttribute(`title`, `Define "${dfnElement.innerText}"`);
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

  let slashCommandMentions = document.querySelectorAll(`span.slash-command`);
  slashCommandMentions.forEach(function(mentionElement) {
    mentionElement.setAttribute(`title`, `Click to copy`);
    mentionElement.setAttribute(`onclick`, `copySlashCommand(this)`);
  });

  let externalResourceEmbeds = document.querySelectorAll(`div.external-resource`);
  externalResourceEmbeds.forEach(function(embedElement) {
    let link = embedElement.children[0].textContent.trim();
    let text = embedElement.children[1].textContent.trim();
    embedElement.innerHTML = `<div><b>EMBEDDED CONTENT</b><br><p>${text}</p></div>`;

    let imageContainer = document.createElement("div");
    imageContainer.style.width = `200px`;
    let image = document.createElement("img");
    if (embedElement.classList.contains("googleSheets")) {
      image.src = "./media/Google Sheets.png";
    }
    imageContainer.append(image);
    embedElement.prepend(imageContainer);

    let button = document.createElement("button");
    button.innerHTML = `Open resource`;
    button.onclick = `open('${link}', '_blank')`;
    embedElement.append(button);
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

  if (!isInfoboxVisible() || requestedDfn != client.infoboxDefinition) {
    client.infobox.classList.add("visible");
    client.infobox.thumbnail.src = `thumbnails/${definition.thumbnail ?? 'logo.png'}`;
    client.infobox.text.innerHTML = definition.definition;
    client.infoboxDefinition = requestedDfn;
    hideInfobox(30000);
  } else {
    hideInfobox();
  }

  let dfnElements = document.querySelectorAll(`div#infobox dfn`);
  dfnElements.forEach(function(dfnElement) {
    dfnElement.setAttribute(`title`, `Define "${dfnElement.innerText}"`);
    dfnElement.setAttribute(`onclick`, `define(this)`);
  });

}

function checkLinks() {
  let externalLinks = document.querySelectorAll(`a[href^="http:"], a[href^="https:"]`);
  externalLinks.forEach(function(link) {
    link.setAttribute("title", "This external link will open in a new tab.");
    link.setAttribute("target", "_blank");
  });

  let internalLinks = document.querySelectorAll(`a[href^="#"]`);
  internalLinks.forEach(function(link) {
    let targetTabName = link.getAttribute("href").replace("#", "");
    if (!link.classList.contains("redirect")) {
      link.setAttribute("title", "This internal link will redirect you to another resource.");
      link.setAttribute("onclick", `switchTab("${targetTabName}")`);
    } else {
      link.setAttribute("title", "This internal link will switch you to another resource.");
      link.setAttribute("onclick", `switchTab("${targetTabName}", true)`);
    }
  });
}

function isInfoboxVisible(requestedDfn) {
  if (!client.infobox.classList.contains("visible")) {
    return false;
  } else {
    return true;
  }
}

function hideInfobox(timeout) {
  function hide() {
    client.infobox.classList.remove("visible");
  }

  if (timeout) {
    if (client.infoboxTimeout) clearInterval(client.infoboxTimeout);
    client.infoboxTimeout = setTimeout(() => {
      hide();
    }, timeout);
  } else {
    hide();
  }
}

function goBack() {
  switchTab(client.previousTab, false);
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

async function copySlashCommand(element) {
  await navigator.clipboard.writeText(`/${element.innerText}`);
}

async function startLauncher() {
  client.launcher.text.innerHTML = `Greetings, agent! Please enter the password required to access this interesting guidebook…`;

  let storedPassword = sessionStorage.getItem("Password");
  if (storedPassword) {
    login(storedPassword);
  } else {
    client.launcher.screen.style.display = "flex";
    client.launcher.input.focus();
  }
}

async function login(password) {
  dcodeIO.bcrypt.compare(password, client.config.hashed_password, function(err, res) {
    if (err) {
      client.launcher.screen.style.display = "flex";
      client.launcher.input.focus();
      console.error(err);
      return new Error(err);
    };
    if (res === false) {
      client.launcher.screen.style.display = "flex";
      client.launcher.input.focus();
      client.launcher.errorText.innerHTML = `Incorrect password! You might want to keep typing until you get it right.`;
    } else if (res === true) {
      client.launcher.screen.style.display = "none";
      client.launcher.input.focus();
      sessionStorage.setItem("Password", password);
    }
  });
}
