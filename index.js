const intents = require('./intents');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context, callback) {

try {
    // By default, treat the user request as coming from the America/New_York time zone.
    process.env.TZ = 'America/New_York';
    console.log(`event.bot.name=${event.bot.name}`);
    var now1 = new Date();

    now1.setHours(now1.getHours())

    var currDate1 = now1.toISOString().substring(0,10)
    var currTime1 = now1.toISOString().substring(11,19)
    console.log("currDate1 " + currDate1)
    console.log("currTime1 " + currTime1)

    /**
     * Uncomment this if statement and populate with your Lex bot name and / or version as
     * a sanity check to prevent invoking this Lambda function from an undesired Lex bot or
     * bot version.
     */
    /*
    if (event.bot.name !== 'MakeAppointment') {
         callback('Invalid Bot Name');
    }
    */
    dispatch(event, (response) => callback(null, response));
} catch (err) {
    callback(err);
}
};

function dispatch(intentRequest, callback) {
  console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
  console.log ("Request " + JSON.stringify (intentRequest))
  var slots = intentRequest.currentIntent.slots;
  const sessionAttributes = intentRequest.sessionAttributes || {};
  intents( sessionAttributes, intentRequest, slots, callback);
}
