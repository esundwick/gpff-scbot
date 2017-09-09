require('dotenv').config(); // set up .env with access tokens

var botkit = require('botkit');
var debug = require('debug')('botkit:main');
// var config = require('./config.json');

// read environment for config options
var bot_options = {
	clientId: process.env.SLACK_CLIENT_ID,
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

// core of the bot
var controller = botkit.slackbot(bot_options);

controller.startTicking();

var bot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
});

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller);

// Send an onboarding message when a new team joins
require(__dirname + '/components/onboarding.js')(controller);

// Load in some helpers that make running Botkit on Glitch.com better
require(__dirname + '/components/plugin_glitch.js')(controller);

// Enable Dashbot.io plugin
require(__dirname + '/components/plugin_dashbot.js')(controller);


var normalizedPath = require("path").join(__dirname, "skills");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./skills/" + file)(controller);
});

//setup webhook for slash command
controller.setupWebserver(process.env.port, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);
});

// potential fix if slash command starts blowing up
/* bot.api.team.info({}, function (err, res) {
    if (err) return console.error(err);
    controller.storage.teams.save({id: res.team.id}, (err) => {
        if (err) {
            console.error(err);
        };
    });
}); */

// This captures and evaluates any message sent to the bot as a DM
// or sent to the bot in the form "@bot message" and passes it to
// Botkit Studio to evaluate for trigger words and patterns.
// If a trigger is matched, the conversation will automatically fire!
// You can tie into the execution of the script using the functions
// controller.studio.before, controller.studio.after and controller.studio.validate
if (process.env.studio_token) {
    controller.on('direct_message,direct_mention,mention', function(bot, message) {
        controller.studio.runTrigger(bot, message.text, message.user, message.channel).then(function(convo) {
            if (!convo) {
                // no trigger was matched
                // If you want your bot to respond to every message,
                // define a 'fallback' script in Botkit Studio
                // and uncomment the line below.
              controller.studio.run(bot, 'fallback', message.user, message.channel);
            } else {
                // set variables here that are needed for EVERY script
                // use controller.studio.before('script') to set variables specific to a script
                convo.setVar('current_time', new Date());
            }
        }).catch(function(err) {
            bot.reply(message, 'I experienced an error with a request to Botkit Studio: ' + err);
            debug('Botkit Studio: ', err);
        });
    });
    controller.on('slash_command', function (slashCommand, message) {
        // make sure it's actually the bot making the request
        if (message.token !== process.env.SLACK_VERIFICATION_TOKEN) {
            return bot.res.send(401, 'Unauthorized');
        };  
        // reply to slash command
        switch (message.command) {
            case '/define':
                var defineRequest = message.text;
                slashCommand.replyPrivate(message, 'You ased to define ' + defineRequest);
            break;
        default:
            slashCommand.replyPrivate(message,"I don't know how to " + message.command + " yet.");
        }
    });
} else {
    console.log('~~~~~~~~~~');
    console.log('NOTE: Botkit Studio functionality has not been enabled');
    console.log('To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/');
}