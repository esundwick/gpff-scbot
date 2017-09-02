require('dotenv').config(); // set up .env with access tokens

var botkit = require('botkit');
var debug = require('debug')('botkit:main');
// var config = require('./config.json');

var bot_options = {
	clientID: process.env.SLACK_CLIENT_ID,
	clientSecret: process.env.SLACK_CLIENT_SECRET,
	scopes: ['bot'],
	studio_token: process.env.studio_token,
	studio_command_uri: process.env.studio_command_uri,
	require_delivery: true
};

// this should be active in heroku, otherwise, we can use the json data store
// should eliminate the team errors
if (process.env.MONGO_URI) {
    var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_URI});
    bot_options.storage = mongoStorage;
} else {
    bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

var controller = botkit.slackbot(bot_options);

controller.startTicking();

var bot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
});

// fix for team errors?
bot.api.team.info({}, (err, res) => {
    controller.storage.teams.save({id: res.team.id}, (err) => {
        if (err) {
            console.error(err)
        };
    });
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
  		// make sure it's actually the bot making the request
  			if (message.token !== process.env.SLACK_VERIFICATION_TOKEN) return; 
  			var defineRequest = message.text;
  			slashCommand.replyPrivate(message, 'You ased to define ' + defineRequest);
		break;
		default:
			slashCommand.replyPrivate(message,"I don't know how to " + message.command + " yet.");
	}
}); 