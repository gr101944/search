'use strict';

var lexResponses = require('../lexResponses');
var needle = require('needle');

var changeToTitleCase = require('../helper/changeToTitleCase');
var random = require('../helper/random');
var bo = require('../helper/buildOptions');
var brc = require('../helper/buildResponseCard');
var scanTrans = require('../helper/scanTranscript');
var apiCallHandler = require('../API/apiCallHandler');
var config = require('../config.json');

var currIntentName;
var responseCard;
var options = [];
var message;
var veryHighConfidenceItems = [];
var qnaItems = [];
var highConfidenceItems = [];
var mediumConfidenceItems = [];
var lowConfidenceItems = [];
var numberOfSearchItems = 0;



module.exports = function (sessionAttributes, intentRequest, slots, callback) {
  intentRequest.sessionAttributes= intentRequest.sessionAttributes || {};

  currIntentName = intentRequest.currentIntent.name;
  console.log (currIntentName);
  console.log (JSON.stringify(intentRequest));
  const source = intentRequest.invocationSource;
  const outputDialogMode = intentRequest.outputDialogMode;
  console.log (source);
  if  (source === "DialogCodeHook"){
    console.log ("In DialogCodeHook")

  }//End of DialogCodeHook

  if (source === "FulfillmentCodeHook") {
    console.log ("In FulfillmentCodeHook")
    //Config paramaters
    var maxItems = 3;
    //
    var qryText = intentRequest.inputTranscript;
    var urlKendra = apiCallHandler.getKendra(qryText );
    console.log ("urlKendra " + urlKendra);
    var type;

    var voiceMessage = "";
    var docExcerpt = "";
    var docExcerptQnA = "";
    var docExcerptQnASaved = "";
    var contentOut = "";
    var documentURI=""
    var srchResult = "";
    var docTitle = "";
    var faqPresent = "n";
    var scoreConfidence = "";
    var savedScoreConfidence = "LOW";
    var dashes = "------------------------------------------------------";

    needle.get(urlKendra, function(error, response) {
      if (!error && response.statusCode == 200){
        console.log(response.body);
        //Handle items length
        var items = response.body.ResultItems;
        numberOfSearchItems = items.length;
        if (numberOfSearchItems < maxItems){
          maxItems = numberOfSearchItems
        }
        qnaItems = [];
        veryHighConfidenceItems = [];
        highConfidenceItems = [];
        mediumConfidenceItems = [];
        lowConfidenceItems = [];
        for (var j = 0; j< numberOfSearchItems; j++){
          type = items[j].Type;

          if (type != "QUESTION_ANSWER"){
            console.log ("Document Section");
            scoreConfidence = (items[j].ScoreAttributes.ScoreConfidence);
            console.log ("scoreConfidence " + scoreConfidence)
            switch(scoreConfidence) {
              case "VERY_HIGH":
                veryHighConfidenceItems.push(items[i])
                break;
              case "HIGH":
                highConfidenceItems.push(items[i])
                break;
              case "MEDIUM":
                mediumConfidenceItems.push(items[i])
                break;
              case "LOW":
                lowConfidenceItems.push(items[i])
                break;
              default:
                console.log("There is some problem with scoreConfidenceTest") + scoreConfidenceTest;
            }
          }
          if (type === "QUESTION_ANSWER"){
            console.log ("FAQ Section")
            scoreConfidence = (items[j].ScoreAttributes.ScoreConfidence);
            console.log ("scoreConfidence " + scoreConfidence)
            qnaItems.push(items[j])
            faqPresent = "y";
            docExcerptQnA = items[j].DocumentExcerpt.Text;
            docExcerptQnASaved = docExcerptQnA;
            docExcerptQnA = JSON.stringify(docExcerptQnA);
            docExcerptQnA = "<h3>From FAQ: </h3>"  + docExcerptQnA + "<br>" + items[j].DocumentURI + "<br>" + dashes + "<br> <br>"
          }
        }
        console.log ("Processing only maxItems " + maxItems);
        for (var i = 0; i< maxItems; i++){
          type = items[i].Type
          docExcerpt =  items[i].DocumentExcerpt.Text;
          docExcerpt =  docExcerpt.replace(/[\n\t]/g, ' ');
          docExcerpt = JSON.stringify(docExcerpt);
          if (type != "QUESTION_ANSWER"){
            docTitle = items[i].DocumentTitle.Text
            documentURI = items[i].DocumentURI;
            documentURI = documentURI.replace(/ /g,"%20")
            scoreConfidence = (items[i].ScoreAttributes.ScoreConfidence);
            if (scoreConfidence != "LOW"){
              savedScoreConfidence = scoreConfidence
            }
            srchResult =  srchResult + dashes + "<br>" + docExcerpt + "<br>" + "Link: " + "<a href =" + documentURI  + " target=" + '"' + "_blank" + '"' + ">" + docTitle + "</a>" +  "<br>" +  "<i> <small>" + "Search Confidence: "  + changeToTitleCase.toTitleCase(scoreConfidence) + " </small> </i> <br>"
            srchResult = srchResult.toString()
          }
        }
        console.log ("faqPresent " + faqPresent)
        console.log ("numberOfSearchItems " + numberOfSearchItems)



        console.log ("Total items             " + numberOfSearchItems)
        console.log ("veryHighConfidenceItems " + veryHighConfidenceItems.length)
        console.log ("highConfidenceItems     " + highConfidenceItems.length)
        console.log ("mediumConfidenceItems   " + mediumConfidenceItems.length)
        console.log ("lowConfidenceItems      " + lowConfidenceItems.length)
        console.log ("qnaItems                " + qnaItems.length)

        console.log ("savedScoreConfidence " + savedScoreConfidence)
        //Do not show if everything is low confidence
        if (savedScoreConfidence === "LOW"){
          contentOut = "Sorry no matches found...you can ask for more options..."
        } else {
          contentOut = "<h2> Here are the results:  </h2>"  + "<br> <br>" +  docExcerptQnA + "<h3> From websites / documents:</h3>" + srchResult
        }
        if ((numberOfSearchItems === 1) && (faqPresent === "y")){
          console.log ("inside only FAQ present ")
          srchResult =  docExcerptQnA
          srchResult = srchResult.toString()
          contentOut = "<h2> Here are the results:  </h2>"  + "<br> <br>" +  docExcerptQnA
        }

        if (outputDialogMode != "Voice"){
           message = {
            contentType: 'CustomPayload',
            content: contentOut
          }
        } else {
          console.log ("Processing Voice...neds more programming...")
          if (faqPresent === "y"){
            voiceMessage = "<speak>" + docExcerptQnASaved + "</speak>"
             message = {
              contentType: 'SSML',
              content: voiceMessage
            }
          } else {
            intentRequest.outputDialogMode = "Text"
            console.log ("intentRequest.outputDialogMode " + intentRequest.outputDialogMode)
            console.log ("contentOut " + contentOut)
             message = {
              contentType: 'PlainText',
              content: contentOut
            }
          }
        }
        //DynamoDB Entry
        var userId = "Rajesh Ghosh"
        var responseTxt  = "TBD";

        var date = new Date();
        var currentTime = date.toLocaleTimeString();
        var dd = String(date.getDate()).padStart(2, '0');
        var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = date.getFullYear();
        var queryTime = yyyy + "-" + mm + "-" + dd + " " + currentTime;

        var ZERO_HOUR = 0; /* ms */
        var qnaId =  ((new Date) - ZERO_HOUR)

        var urlInsertDB = apiCallHandler.insertQnA(userId, qnaId, queryTime, qryText, responseTxt );
        needle.get(urlInsertDB, function(error, response) {
          if (!error && response.statusCode == 200){

            options = bo.buildOptions("main");
            var title = "Your options";
            var subtitle = " ";
            var imageOption = "someURL.PNG";
            responseCard = brc.buildResponseCard(title,subtitle,options,null);
            callback (lexResponses.close(sessionAttributes,"Fulfilled", message, responseCard));
          } else {
            console.log ("Error in the insert query")
          }
        })
        //DynamoDB entry done
      } //End of Kendra call
    }); //End of Needle call
  }//end Fullfillment
}//end of function
