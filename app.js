const client = {
  config: undefined,
  body: document.body,
  menuToggler: document.querySelector("button#menuToggler"),
  aside: document.querySelector("aside"),
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
  },
  settings: document.querySelector("#settings"),
  modalWrapper: document.querySelector("#modal_wrapper"),
  openedModalElement: null
};

localStorage.__proto__.itemFallback = function(item, defaultValue) {
  if (!localStorage.getItem(item)) localStorage.setItem(item, defaultValue);
}
localStorage.__proto__.propertyFallback = function(item, property, fallback) {
  let object = JSON.parse(localStorage.getItem(item)) ?? {};
  if (object[property] == undefined) {
    object[property] = fallback;
    localStorage.setItem(item, JSON.stringify(object));
  }
}
localStorage.__proto__.writeToObject = function(item, property, value) {
  let object = JSON.parse(localStorage.getItem(item)) ?? {};
  object[property] = value;
  localStorage.setItem(item, JSON.stringify(object));
}

client.infobox.thumbnail = document.querySelector("div#infobox img");
client.infobox.text = document.querySelector("div#infobox p");
client.infobox.button = document.querySelector("div#infobox button");
client.infobox.hide = function(timeout) {
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

client.settings.inputs = {};
client.settings.sessions = {
  recordCount: document.querySelector("b#sessionsRecordCount")
};
client.settings.open = function() {
  client.settings.classList.add("visible");
  client.modalWrapper.classList.add("visible");
  client.openedModalElement = this;
}
client.settings.close = function() {
  client.settings.classList.remove("visible");
  client.modalWrapper.classList.remove("visible");
  client.openedModalElement = null;
}
client.settings.reset = function(confirmation) {

  let message = "Are you sure that you would like to reset all settings? All settings will automatically be set to their default options.";

  function perform() {
    localStorage.removeItem("Settings");
    applySettingFallbacks();
    fetchSavedSettings();
  }

  if (confirmation == true) {
    if (confirm(message) == true) perform();
  } else {
    perform();
  }

}
client.settings.inputs.blurEffects = document.querySelector(`input[name="blurEffects"]`);
client.settings.inputs.animations = document.querySelector(`input[name="animations"]`);
client.settings.inputs.discordWidget = document.querySelector(`input[name="discordWidget"]`);
client.settings.inputs.discordWidgetColor = document.querySelector(`input[name="discordWidgetColor"]`);
client.settings.set = function(option, value) {
  let interprettedValue = value;
  localStorage.writeToObject("Settings", option, interprettedValue);
  if (option == 'blurEffects') {
    if (value == true) client.settings.addBlurEffects();
    if (value == false) client.settings.removeBlurEffects();
  } else if (option == 'animations') {
    if (value == true) client.settings.addAnimations();
    if (value == false) client.settings.removeAnimations();
  } else if (option == 'discordWidget') {
    if (value == true) client.settings.showDiscordWidget();
    if (value == false) client.settings.hideDiscordWidget();
  } else if (option == 'discordWidgetColor') {
    client.settings.setDiscordWidgetColor(value);
  }
  let input = document.querySelector(`input[name="${option}"]`);
  if (input.type == "checkbox") {
    input.checked = value;
  } else {
    input.value = value;
  }
}
client.settings.removeBlurEffects = function() {
  document.querySelector("div#launch").style.setProperty("backdrop-filter", "none");
  document.querySelector("div#launch").style.setProperty("background", "#242424FF");
  document.querySelector("div#modal_wrapper").style.setProperty("backdrop-filter", "none");
  document.querySelector("div#modal_wrapper").style.setProperty("background", "#242424A0");
};
client.settings.addBlurEffects = function() {
  document.querySelector("div#launch").style.setProperty("backdrop-filter", "blur(5px)");
  document.querySelector("div#launch").style.setProperty("background", "#242424A0");
  document.querySelector("div#modal_wrapper").style.setProperty("backdrop-filter", "blur(5px)");
  document.querySelector("div#modal_wrapper").style.setProperty("background", "#242424A0");
};
client.settings.removeAnimations = function() {
  document.querySelector("body").style.setProperty("background", "none");
  document.querySelector("body").style.setProperty("animation-duration", "0");
  document.querySelector("div#infobox").style.setProperty("transition", "bottom 0ms");
  document.querySelector("img.glowOnHover").classList.remove("animate");
};
client.settings.addAnimations = function() {
  document.querySelector("body").style.setProperty("background", "radial-gradient(circle at top, #0069004F 5%, transparent 25%)");
  document.querySelector("body").style.setProperty("animation-duration", "3s");
  document.querySelector("div#infobox").style.setProperty("transition", "bottom 250ms");
  document.querySelector("img.glowOnHover").classList.add("animate");
};
client.settings.showDiscordWidget = function() {
  Discord.crate.show();
};
client.settings.hideDiscordWidget = function() {
  Discord.crate.hide();
};
client.settings.setDiscordWidgetColor = function(value) {
  Discord.crate.options.color = value;
}

client.modalWrapper.addEventListener("click", function() {
  client.openedModalElement.close();
  this.classList.remove("visible");
});

function applySettingFallbacks() {
  localStorage.itemFallback("Settings", JSON.stringify({}));
  localStorage.propertyFallback("Settings", "blurEffects", true);
  localStorage.propertyFallback("Settings", "animations", true);
  localStorage.propertyFallback("Settings", "discordWidget", true);
  localStorage.propertyFallback("Settings", "discordWidgetColor", "#006900");
}

function fetchSavedSettings() {
  if (localStorage.getItem("Settings")) {
    let Settings = JSON.parse(localStorage.getItem("Settings"));
    for (const key in Settings) {
      client.settings.set(key, Settings[key]);
    }
  }
}
fetchSavedSettings();

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

async function forEachElement(query, callback) {

  let elements = document.querySelectorAll(query);
  elements.forEach(function(element) {
    callback(element);
  })

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
  client.settings.updateInformation();
  location.hash = `#${tabName}`;

  forEachElement("dfn", function(element) {
    element.setAttribute(`title`, `Define "${element.innerText}"`);
    element.setAttribute(`onclick`, `define(this)`);
  });

  forEachElement("div.textblock", function(element) {
    element.innerHTML = element.innerHTML.trim();

    let copyButton = document.createElement("button");
    copyButton.innerHTML = "Copy";
    copyButton.setAttribute("onclick", "copyText(this)");
    element.prepend(copyButton);
  });

  forEachElement(`[id*=":"]`, function(element) {
    let copyButton = document.createElement("button");
    copyButton.innerHTML = "Copy Link";
    copyButton.setAttribute("onclick", `copyLink("${element.id}")`);
    element.appendChild(copyButton);
  });

  forEachElement(`span.slash-command`, function(element) {
    element.setAttribute(`title`, `Click to copy`);
    element.setAttribute(`onclick`, `copySlashCommand(this)`);
  });

  forEachElement(`span.discord-channel[channelID]`, function(element) {
    element.setAttribute(`title`, `Click to view`);
    element.setAttribute(`onclick`, `Discord.onChannelMentionClick(this)`);
  });

  forEachElement(`a[href^="http:"], a[href^="https:"]`, function(element) {
    element.setAttribute("title", "This external link will open in a new tab.");
    element.setAttribute("target", "_blank");
  });

  forEachElement(`a[href^="#"]`, function(element) {
    let targetTabName = element.getAttribute("href").replace("#", "");
    if (!element.classList.contains("redirect")) {
      element.setAttribute("title", "This internal link will redirect you to another resource.");
      element.setAttribute("onclick", `switchTab("${targetTabName}")`);
    } else {
      element.setAttribute("title", "This internal link will switch you to another resource.");
      element.setAttribute("onclick", `switchTab("${targetTabName}", true)`);
    }
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
    button.addEventListener("click", function() {
      open(`${link}`, '_blank');
    });
    embedElement.append(button);
  });

}

function define(dfnElement) {

  let requestedDfn = dfnElement.innerText;
  let definition = definitions[requestedDfn.toLowerCase()];

  if (!definition) {
    definition = {
      definition: `Error! Could not find a definition for <b>${requestedDfn}</b>.`
    };
    client.infobox.hide(5000);
  } else {
    client.infobox.hide(30000);
  }

  if (!client.infobox.classList.contains("visible") || requestedDfn != client.infoboxDefinition) {
    client.infobox.classList.add("visible");
    client.infobox.thumbnail.src = `thumbnails/${definition.thumbnail ?? 'logo.png'}`;
    client.infobox.text.innerHTML = definition.definition;
    client.infoboxDefinition = requestedDfn;
    client.infobox.hide(30000);
  } else {
    client.infobox.hide();
  }

  let dfnElements = document.querySelectorAll(`div#infobox dfn`);
  dfnElements.forEach(function(dfnElement) {
    dfnElement.setAttribute(`title`, `Define "${dfnElement.innerText}"`);
    dfnElement.setAttribute(`onclick`, `define(this)`);
  });

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
