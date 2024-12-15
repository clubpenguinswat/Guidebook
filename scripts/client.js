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
  centerModeTabs: [
    "Overview"
  ],
  preloadTabs: [
    "Overview",
    "Foreword",
    "Essentials",
    "Essentials/Recruiting",
    "Essentials/Mentoring",
    "Essentials/Attending_Events",
    "Essentials/Leading_Events",
    "Armies_Explained",
    "Armies_Explained/Army_Map",
    "Armies_Explained/Wars",
    "Armies_Explained/Tournaments",
    "Armies_Explained/Judging",
    "SWAT_Bot",
    "SWAT_Bot/History",
    "SWAT_Bot/Commands",
    "Promotions",
    "Server_Tickets",
    "Diplomacy",
    "Recruitment_Regiment",
    "Documents",
    "Documents/CPAJ_Judging_Guide",
  ],
  preloadedContent: {},
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

client.preloadAllArticles = async function() {
  client.preloadTabs.forEach(function(tab) {
    preloadArticle(tab);
  });
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
client.settings.inputs.blurEffects = document.querySelector(`input[name="blurEffects"]`);
client.settings.inputs.animations = document.querySelector(`input[name="animations"]`);
client.settings.inputs.discordWidget = document.querySelector(`input[name="discordWidget"]`);
client.settings.inputs.preloader = document.querySelector(`input[name="preloader"]`);
client.settings.inputs.discordWidgetColor = document.querySelector(`input[name="discordWidgetColor"]`);
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
client.settings.applyFallbacks = async function() {
  localStorage.itemFallback("Settings", JSON.stringify({}));
  localStorage.propertyFallback("Settings", "blurEffects", true);
  localStorage.propertyFallback("Settings", "animations", true);
  localStorage.propertyFallback("Settings", "preloader", true);
  localStorage.propertyFallback("Settings", "discordWidget", true);
  localStorage.propertyFallback("Settings", "discordWidgetColor", "#006900");
}

client.settings.fetchSaved = async function() {
  if (localStorage.getItem("Settings")) {
    let Settings = JSON.parse(localStorage.getItem("Settings"));
    for (const key in Settings) {
      client.settings.set(key, Settings[key]);
    }
  }
}
client.settings.reset = function(confirmation) {

  let message = "Are you sure that you would like to reset all settings? All settings will automatically be set to their default options.";

  function perform() {
    localStorage.removeItem("Settings");
    client.settings.applyFallbacks();
    client.settings.fetchSaved();
  }

  if (confirmation == true) {
    if (confirm(message) == true) perform();
  } else {
    perform();
  }

}
client.settings.set = function(option, value) {
  let interprettedValue = value;
  localStorage.writeToObject("Settings", option, interprettedValue);
  if (option == 'blurEffects') {
    if (value == true) client.settings.addBlurEffects();
    if (value == false) client.settings.removeBlurEffects();
  } else if (option == 'animations') {
    if (value == true) client.settings.addAnimations();
    if (value == false) client.settings.removeAnimations();
  } else if (option == 'preloader') {
    if (value == true) client.settings.enablePreloader();
    if (value == false) client.settings.disablePreloader();
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
client.settings.enablePreloader = function() {
  client.preloadAllArticles();
};
client.settings.disablePreloader = function() {
  client.preloadedContent = {};
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

client.forEachElement = async function(query, callback) {

  let elements = document.querySelectorAll(query);
  elements.forEach(function(element) {
    callback(element);
  })

}

client.format = async function(parent) {

  if (!parent) parent = `:root`;

  client.forEachElement(`${parent} dfn`, function(element) {
    element.setAttribute(`title`, `Define "${element.innerText}"`);
    element.setAttribute(`onclick`, `define(this)`);
  });

  client.forEachElement(`${parent} div.textblock`, function(element) {
    element.innerHTML = element.innerHTML.trim();

    let copyButton = document.createElement("button");
    copyButton.innerHTML = "Copy";
    copyButton.setAttribute("onclick", "copyText(this)");
    element.prepend(copyButton);
  });

  client.forEachElement(`${parent} [id*=":"]`, function(element) {
    let copyButton = document.createElement("button");
    copyButton.innerHTML = "Copy Link";
    copyButton.setAttribute("onclick", `copyLink("${element.id}")`);
    element.appendChild(copyButton);
  });

  client.forEachElement(`${parent} span.slash-command`, function(element) {
    element.setAttribute(`title`, `Click to copy`);
    element.setAttribute(`onclick`, `copySlashCommand(this)`);
  });

  client.forEachElement(`${parent} span.discord-channel[channelID]`, function(element) {
    element.setAttribute(`title`, `Click to view`);
    element.setAttribute(`onclick`, `Discord.onChannelMentionClick(this)`);
  });

  let externalResourceEmbeds = document.querySelectorAll(`${parent} div.external-resource`);
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

  client.forEachElement(`${parent} a[href^="http:"], a[href^="https:"]`, function(element) {
    element.setAttribute("title", "This external link will open in a new tab.");
    element.setAttribute("target", "_blank");
  });

  client.forEachElement(`${parent} a[href^="#"]`, function(element) {
    let targetTabName = element.getAttribute("href").replace("#", "");
    if (!element.classList.contains("redirect")) {
      element.setAttribute("title", "This internal link will redirect you to another resource.");
      element.setAttribute("onclick", `switchTab("${targetTabName}")`);
    } else {
      element.setAttribute("title", "This internal link will switch you to another resource.");
      element.setAttribute("onclick", `switchTab("${targetTabName}", true)`);
    }
  });

}