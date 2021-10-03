'use strict';

var lexResponses = require('../lexResponses');
var needle = require('needle');
var axios = require('axios');
var random = require('../helper/random');
var bo = require('../helper/buildOptions');
var brc = require('../helper/buildResponseCard');
var scanTrans = require('../helper/scanTranscript');
var apiCallHandler = require('../API/apiCallHandler');
var config = require('../config.json');

var currIntentName;
var responseCard;
var options = [];

const minRandom = 123456;
const maxRandom = 999888;


var ticketAreaSlotName = "ticketArea";
var issueFacedSlotName = "issueFaced";
var ticketArea = null;
var openTicket = null;
var issueFaced = null;
var accessToken = "";
var businessKey = "";

var urlWFCommentBusinesskey = "";
var useridWF = "rghosh";
var passwordWF = "1qaz!QAZ";

const optionMsg = "Sure";
const cancelMsg = "Cancelled";
const issueFacedMsg = "Please choose the problem that you faced...";
const ticketAreaMsg = "Please choose topic:"
const buildOptionTitle = "Please select";


//Config items

const literalConv = "You chose ";
const noQueryDoneLiteral = "No query done"
var hours = 1;
var minutes = 5;

const urlWF = "http://ds-workflow.com/userapi/gatekeeper/signin";//Get bearer token
const urlWFStart = "http://ds-workflow.com/bpmnapi/process/start"; //start api
const urlWFComment = "http://ds-workflow.com/bpmnapi/tasks/comments/batch?businesskey=";//post comments
const wfHTTPlink = "http://dev.ds-workflow.com/landing/process/view-contract/" //To open workflow ticket
const processNameHR = "Initiation Process HR Ticket";
const hrTicketSource = "BOT"


module.exports = function (sessionAttributes, intentRequest, slots, callback) {

  currIntentName = intentRequest.currentIntent.name;
  console.log (currIntentName);
  const source = intentRequest.invocationSource;
  console.log (source);
  ticketArea = intentRequest.currentIntent.slots.ticketArea;
  openTicket = intentRequest.currentIntent.slots.openTicket;
  issueFaced = intentRequest.currentIntent.slots.issueFaced;
  console.log ("ticketArea " + ticketArea)
  if  (source === "DialogCodeHook"){
    console.log ("In DialogCodeHook")
    if ((openTicket != null) && (ticketArea != null) && (issueFaced !=null)){
      console.log ("All slots full")
    }
    if ((openTicket != null) && (ticketArea != null) && (issueFaced === null)){
      console.log ("openTicket " + openTicket)
      console.log ("ticketArea " + ticketArea)
      console.log ("Filling IssueFaced now...")

      if (ticketArea === "Cancel"){
        var message = {
          contentType: 'CustomPayload',
          content: cancelMsg
        }
        callback (lexResponses.close(sessionAttributes,"Fulfilled", message, null));
      } else {
        var message = {
          contentType: 'PlainText',
          content: issueFacedMsg
        }
        options = bo.buildOptions("problem");
        var title = buildOptionTitle;
        var subtitle = " ";
        var imageOption = "someURL.PNG";
        responseCard = brc.buildResponseCard(title,subtitle,options,null);
        console.log("responseCard " + JSON.stringify(responseCard));
        callback (lexResponses.elicitSlot(intentRequest.sessionAttributes,currIntentName,slots,issueFacedSlotName, message, responseCard));
      }
    }
    if ((openTicket != null) && (ticketArea === null)){

      var message = {
        contentType: 'PlainText',
        content: ticketAreaMsg
      }
      options = bo.buildOptions("ticket");
      var title = buildOptionTitle
      var subtitle = " ";
      var imageOption = "someURL.PNG";
      responseCard = brc.buildResponseCard(title,subtitle,options,null);
      console.log("responseCard " + JSON.stringify(responseCard));
      callback (lexResponses.elicitSlot(intentRequest.sessionAttributes,currIntentName,slots,ticketAreaSlotName, message, responseCard));
    }

    callback (lexResponses.delegate(sessionAttributes, slots))
  }//End of DialogCodeHook

  if (source === "FulfillmentCodeHook") {
    var date = new Date();

    //Generating ticket Number
    var datePortion = ( date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + ("0" + date.getHours() ).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2) );
    var ticketNumber = "HRBot" + datePortion



    if ((ticketArea === "Cancel") || (issueFaced === "Cancel")){
      var message = {
        contentType: 'CustomPayload',
        content: "Cancelled"
      }
      callback (lexResponses.close(sessionAttributes,"Fulfilled", message, null));
    }
    else
    {

      var name = "Rajesh Ghosh";
      var fromAddress = "rajesh.ghosh.here@gmail.com";
      var toAddress = "rajesh.ghosh@digitalsherpa.ai";
      var ticketNumber = ticketNumber;
      var templateName = "MyTemplate5";
      var urlEmail = apiCallHandler.sendEmail(name, toAddress, fromAddress, templateName, ticketNumber, ticketArea );
      console.log ("urlEmail " + urlEmail);

      //Get Token






      var userId = "Rajesh Ghosh";
      //Config item

      var lookBackHour = hours * minutes * 60 * 1000;
      //var lookBackHour = units * 60 * 60 * 1000;
      var qnaId =  ((new Date) - lookBackHour)



      var urlGetDB = apiCallHandler.getQnA(userId, qnaId );
      console.log (urlGetDB)
    //  module.exports.insertQnA = function (userId, qnaId, dateEntered, queryTxt, responseTxt) {
      needle.get(urlGetDB, function(error, response) {
        if (!error && response.statusCode == 200){
          var len  = response.body.Items.length
          console.log(response.body.Items);

          var queryList = "";
          var jsonArr = [];
          var jsonArr2 = [];
          var jsonArr3 = [];
          var messageJSON = [];
          var messageJSONArr = [];
          if (len === 0){
            jsonArr.push({

                id: 1,
                query: noQueryDoneLiteral
            });

          } else{
            for (var i = 0;i <len;i++){

              jsonArr.push({

                  id: i+1,
                  query: response.body.Items[i].queryTxt
              });
            }

          }
          console.log ("ticket" + ticketArea)
          console.log ("ticket area pruned " + ticketArea.replace(literalConv, ""))

          console.log ("issueFaced" + issueFaced)
          console.log ("issueFaced area pruned " + issueFaced.replace(literalConv, ""))

          jsonArr2.push({
              hrTicketType: ticketArea,
              processname : processNameHR,
              hrTicketQuery : jsonArr[0].query,
              ticketNumber: ticketNumber,
              userId: userId,
              issueFaced: issueFaced,
              queryData: jsonArr
          });
          jsonArr3.push({
              hrTicketType: ticketArea.replace(literalConv, ""),
              processname : processNameHR,
              hrTicketQuery : jsonArr[0].query,
              hrTicketIssueFaced : issueFaced.replace(literalConv, ""),
              hrTicketSource: hrTicketSource
          });
          console.log ( "jsonArr2 " + JSON.stringify (jsonArr2))
          console.log ( "jsonArr3 " + JSON.stringify (jsonArr3))

          axios.post(urlWF, {
            userid: useridWF,
            password: passwordWF
          })
          .then(function (response) {
            console.log(response.data);
            accessToken = response.data.data.token;
            console.log("accessToken " + accessToken);
            const headers = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            };
            console.log("headers " + JSON.stringify (headers));
            //Calling the API to initiate the work flow

            axios.post(urlWFStart, jsonArr3[0], {headers})
              .then(function (response) {
                console.log(response.data);

                if (response.data.status === true){
                  console.log ("HR Workflow call was successful")
                  businessKey =  response.data.data[0].businessKey
                  console.log ("businessKey " + businessKey)
                  urlWFCommentBusinesskey = urlWFComment + businessKey
                  console.log ("urlWFCommentBusinesskey " + urlWFCommentBusinesskey)
                  console.log ("jsonArr[0].query " + jsonArr[0].query)
                  if (jsonArr.length === 0){
                    jsonArr.push({
                        id: 1,
                        query: "No Search Made"
                    });
                  }
                  messageJSON.push({
                    message: jsonArr[0].query
                  })

                  for (var m = 0;m <jsonArr.length; m++){
                    messageJSONArr.push({
                      message: jsonArr[m].query
                    })
                  }
                  console.log("messageJSON " + JSON.stringify (messageJSON));
                  console.log("messageJSONArr " + JSON.stringify (messageJSONArr));
                  axios.post(urlWFCommentBusinesskey, messageJSONArr, {headers})
                    .then(function (response) {
                      if (response.data.status === true){

                        var linkTicket  = "<a href =" + wfHTTPlink + businessKey  + " target=" + '"' + "_blank" + '"' + ">"  + businessKey + "</a>"
                        console.log ("linkTicket " + linkTicket)
                        if (ticketArea != "Other"){
                          var msg = "A ticket has been raised for query regarding " + "<i>" +  ticketArea + "</i>"+ " : " + "<b>" + linkTicket + "</b>"
                        } else {
                          //var msg = "A ticket has been raised :" + "<b>" + businessKey + "</b>"
                          var msg = "A ticket has been raised :" + "<b>" + linkTicket + "</b>"
                        }
                        var message = {
                          contentType: 'CustomPayload',
                          content: msg
                        }
                        console.log (ticketNumber)
                        console.log (ticketArea)
                        console.log (issueFaced)
                        console.log ("HR Comment call was successful")

                        callback (lexResponses.close(sessionAttributes,"Fulfilled", message, null));

                      } else {
                        console.log ("Something is wrong " + response.data.status)
                        var message = {
                          contentType: 'CustomPayload',
                          content: "Sorry, there was some error - HR Comment call failed " + response.data.status
                        }
                        callback (lexResponses.close(sessionAttributes,"Fulfilled", message, null));
                      }
                    })
                    .catch(function (error) {
                      console.log ("HR Comment call failed")
                      var message = {
                        contentType: 'CustomPayload',
                        content: "Sorry, there was some error - HR Comment call failed"
                      }
                      callback (lexResponses.close(sessionAttributes,"Fulfilled", message, null));
                      console.log(error);
                    });


                } else {
                  console.log ("****HR Workflow Start call was unsuccessful****")
                  var message = {
                    contentType: 'CustomPayload',
                    content: "Sorry, there was some error - HR Workflow Start call failed " + response.data.status
                  }
                  callback (lexResponses.close(sessionAttributes,"Fulfilled", message, null));
                }

              })
              .catch(function (error) {
                console.log(error);
              });
          })
          .catch(function (error) {
            console.log(error);
          });



        } else {
          {
            console.log ("Error in the select query")
          }
        }
      })

  }




  }//end Fullfillment
}//end of function
