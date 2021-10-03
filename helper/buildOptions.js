'use strict';

var main = "main";
var ticket = "ticket";
var problem = "problem";
var phraseResponse = "You chose: ";


module.exports.buildOptions = function (param) {
  console.log ("in buildOptions")
  if (param === main) {
    return [
      { text: 'Open Ticket', value: 'open a ticket' },
      { text: 'Continue Search', value: 'I want to continue' },
      { text: 'Done', value: 'i am done' }

    ]}
  else
  if (param === ticket) {
      return [
       { text: 'Benefits', value: phraseResponse + 'Benefits' },
       { text: 'Covid', value: phraseResponse + 'Covid' },
       { text: 'Training', value: phraseResponse + 'Training' },
       { text: 'Appraisal', value: phraseResponse + 'Appraisal' },
       { text: 'Cancel', value: 'Cancel' }
      ]
    }
  else
  if (param === problem) {
      return [
       { text: 'Results unuseful', value: phraseResponse + 'Results unuseful' },
       { text: 'No results', value: phraseResponse + 'No results' },
       { text: 'Timed out', value: phraseResponse + 'Timed out' },
       { text: 'Need more info', value: phraseResponse + 'Need more info' },
       { text: 'Cancel', value: 'Cancel' }
      ]
    }

}
