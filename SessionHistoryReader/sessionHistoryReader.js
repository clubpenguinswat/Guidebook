let tbody = document.querySelector("tbody");

function addTimePadding(number) {
  if (number < 10) {
    return `0${number}`;
  } else {
    return `${number}`;
  }
}

function readableDate(timestamp) {
  const date = new Date(timestamp);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const monthday = date.getDate();
  const year = date.getFullYear();
  const hour = addTimePadding(date.getHours());
  const minute = addTimePadding(date.getMinutes());
  const second = addTimePadding(date.getSeconds());
  return `${weekday}, ${month} ${monthday}, ${year}, ${hour}:${minute}:${second}`;
}

function readHistory(json) {
  let history = JSON.parse(json);
  tbody.innerHTML = `<th>Timestamp</th> <th>Tab Name</th> <th>Duration</th>`;
  let previousTimestamp;
  let previousTabName;

  for (let index = history.length - 1; index >= 0; index--) {
    const element = document.createElement("tr");
    const row = history[index];
    const nextRow = history[index + 1];
    const duration = (nextRow) ? ((nextRow.timestamp - row.timestamp) / 1000).toFixed(1) + " seconds" : "";
    if (previousTabName == row.tabName) continue;
    previousTimestamp = row.timestamp;
    previousTabName = row.tabName;
    element.innerHTML = `
      <tr>
        <td>${readableDate(row.timestamp)}</td>
        <td>${row.tabName.replace("_", " ")}</td>
        <td>${duration}</td>
      </tr>
    `;
    tbody.appendChild(element);
  }
}