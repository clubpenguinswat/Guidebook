const Discord = {};

Discord.createWidget = function(options) {
  Discord.crate = new Crate(options);
}

Discord.createNotification = function(options) {
  return Discord.crate.notify(options);
}

Discord.onChannelMentionClick = function(mentionElement) {
  let channelID = mentionElement.getAttribute("channelID");
  Discord.crate.navigate(channelID);
}