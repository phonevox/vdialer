#!/usr/bin/node
const fastagi = require("fastagi.io");
const PORT = process.env.FASTAGI_PORT || 4573

const app = fastagi();

app.agi("/test", (channel) => {
    console.log('--- TEST CONNECTION STARTED ---')

    // These listeners are optional
  channel.on('hangup', function() {
    console.log('channel hangup');
  });

  channel.on('close', function() {
    console.log('channel closed');
  });

  channel.on('error', function(err) {
    console.log('error!', err);
  });

  // params are in the channel object
  console.log('Parameters:')
  console.log(channel.params);

  channel.setVariable("BATATA", "FRITA");
  channel.sayNumber(123, "*12");
  console.log('fin')
  channel.close();
});

app.listen(PORT, () => {
    console.log(`FastAGI listening on port ${PORT}`);
});