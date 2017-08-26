var botkit = require('botkit');
var config = require('./config.json');

var controller = botkit.slackbot({
	clientID: config.slack.client_id,
	clientSecret: config.slack.client_secret,
	scopes: ['bot'],
	require_delivery: true
});

var bot = controller.spawn({
  token: config.slack.bot_user_token
});


bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  };
});

//prepare the webhook
controller.setupWebserver(process.env.PORT || 3001, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        // handle errors...
        if (err) {
  			throw new Error('Could not connect to Slack');
  		};
    });
});

/*
  // close the RTM for the sake of it in 5 seconds
  setTimeout(function() {
      bot.closeRTM();
  }, 5000);
});*/

// give the bot something to listen for.
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {
  bot.reply(message,'Hello yourself.');
});

controller.on('slash_command',function(bot,message) {
  // reply to slash command
  bot.replyPublic(message,'Everyone can see the results of this slash command');
});
