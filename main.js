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

controller.on('slash_command',function(bot,message) { 
  // reply to slash command
  // DON'T FORGET TO CHECK VERIFICATION TOKEN WHEN THIS IS READY - CHECK SLACK AND BOTKIT DOCS
  bot.replyPublic(message,'You asked to define ');
});
