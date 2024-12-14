function appendToSessionsArray(item) {
  const array = JSON.parse(localStorage.getItem("Sessions"));
  array.push(item);

  if (array.length >= 1000) {
    for (let i = 0; i < array.length - 1000; i++) {
      array.shift();
    }
  }

  return array;
}

if (!localStorage.getItem("Sessions")) {
  localStorage.setItem("Sessions", JSON.stringify([]));
}

client.tabHistory.log = function(item) {
  client.tabHistory.push(item);
  localStorage.setItem("Sessions", JSON.stringify(appendToSessionsArray(item)));
}

client.settings.updateInformation = async function() {
  client.settings.sessions.recordCount.innerHTML = JSON.parse(localStorage.getItem("Sessions")).length;
}

client.settings.copySessionHistory = async function(button) {
  button.originalInnerHTML = button.innerHTML;
  button.innerHTML = "Copied!";
  setTimeout(() => {
    button.innerHTML = button.originalInnerHTML;
  }, 5000);
  await navigator.clipboard.writeText(localStorage.getItem("Sessions"));
}

client.settings.deleteSessionHistory = async function(confirmation) {

  let message = "Are you sure that you would like to erase your entire session history? This action is not recommended and is irreversible! Make sure to save your session history elsewhere, just in case.";

  function perform() {
    localStorage.setItem("Sessions", "[]");
    client.settings.updateInformation();
  }

  if (confirmation == true) {
    if (confirm(message) == true) perform();
  } else {
    perform();
  }

}

client.settings.updateInformation();