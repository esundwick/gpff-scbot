var graph = require('fbgraph');
//var config = require('./config.json');


module.exports = function(controller) {
	controller.hears(['^define (.*)','^define'], 'direct_message,direct_mention', function(bot, message) {
      /*  if (message.match[1]) {
            if () {
                bot.reply(message, message.match[1]);
            } else {
                bot.reply(message, 'No match found');
            }
        } else {*/
        bot.reply(message, 'I will try to look up whoever you ask me about.')
    });
}
/*

var accessToken = config.facebook.accessToken;
var app_secret = config.facebook.app_secret;

var name = "Evan Sundwick";	// will be filled in by a query later

// get authorization url
var authURL = graph.getOauthUrl({
	"client_id": conf.client_id
,	"redirect_uri": conf.redirect_uri 
});

// options for the request to graph api
var options = {
	timeout: 3000
,	pool: {maxSockets: Infinity}
,	headers: { connection: "keep-alive"}
};

// what gets piped to the graph search api
var searchOptions = {
	q: name
,	type: "user"
};


graph.setAccessToken(accessToken);
graph.setAppSecret(app_secret);

graph.setOptions(options);
graph.search(searchOptions, function (err, response){
	console.log(response);
});

// probably need to set up express for this part

// shows auth dialog
//res.redirect(authURL);

// after user clicks, auth 'code' will be set
// we'll send that and get auth token

/*
graph.authorize({
	"client_id": conf.client_id
,	"redirect_uri": conf.redirect_uri
,	"client_secret": conf.client_secret
,	"code": req.query.code
}, function (err, fbResponse) {
	fbResponse.redirect('/loggedIn');
});
*/