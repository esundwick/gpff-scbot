require('dotenv').config() // set up .env with access tokens


var botkit = require('botkit');
// var config = require('./config.json');

var controller = botkit.slackbot({
	clientID: process.env.SLACK_CLIENT_ID,
	clientSecret: process.env.SLACK_CLIENT_SECRET,
	scopes: ['bot'],
	require_delivery: true
});

var bot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
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

controller.on('slash_command',function(slashCommand,message) { 
	// reply to slash command
	switch (message.command) {
  		case '/define':
  			if (message.token !== process.env.SLACK_VERIFICATION_TOKEN) return; // make sure it's actually the bot making the request
  			var defineRequest = message.text;
  			slashCommand.replyPrivate(message, 'You ased to define ' + defineRequest);
		break;
		default:
			slashCommand.replyPrivate(message,"I don't know how to " + message.command + " yet.");
	}
}); 