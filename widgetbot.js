const Discord = {};

Discord.createWidget = function(options) {
  Discord.crate = new Crate(options);
}

Discord.createNotification = function(options) {
  return Discord.crate.notify(options);
}

Discord.createWidget({
  server: '715178450716983326', // SWATRulers
  channel: '715198770413043854' // #💬】general-chat
});

setTimeout(() => {
  Discord.createNotification({
    content: "Good work, agent! I appreciate that you are reading through this guide thoroughly.",
    timeout: 10000
  });
}, 60000);