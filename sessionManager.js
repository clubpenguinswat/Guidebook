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