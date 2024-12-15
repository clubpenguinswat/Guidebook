client.settings.fetchSaved();

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

async function preloadArticle(path, appendix = "") {
  client.preloadedContent[path] = await fetchArticle(path, appendix);
}

async function fetchArticle(path, appendix = "") {
  let data;
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
    data = `${appendix}${raw}`;
  });
  return data;
}

async function switchTab(tabName, redirect) {

  if (!tabName) return new Error("Tab name not provided.");
  if (tabName == client.currentTab) return;

  let appendix = ``;
  let path = tabName.replace("#", "");

  if (redirect) {
    appendix = `<a onclick="goBack()">← Go Back</a>`
  }

  if (client.preloadedContent[path]) {
    client.main.innerHTML = client.preloadedContent[path];
  } else {
    client.main.innerHTML = await fetchArticle(path, appendix);
  }

  if (!client.centerModeTabs.includes(tabName)) {
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

  await client.format();

}

async function define(dfnElement) {

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

  await client.format("div#infobox");

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
