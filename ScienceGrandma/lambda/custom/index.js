/// OBS! This only works for protocols in which the order of steps was added as it is!
/// Test before using ...


/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const dynasty = require('dynasty')({});
var rp = require('request-promise');
var htmlToText = require('html-to-text');
const {google} = require('googleapis');

//User data is saved in a dynamoDB. Notice that any user can create a dynamoDB account and use its free tier for 12 months
//(as of june/2018). Notice that no sensitive information is stored anywhere.
const protocolsTable = dynasty.table('bact');


const SKILL_NAME = 'Science Grandma ';
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can say read the default protocol for bacterial transformation. Or, for setting up with drive say set me up. ';
const HELP_REPROMPT = 'What can I help you with?';
const FALLBACK_MESSAGE = 'The Science Grandma  skill can\'t help you with that. What can I help you with?';
const FALLBACK_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const API_FAILURE = 'There was a problem with  retrieving the protocol from protocols.io. Sorry for the trouble';
const BEGIN_PROTOCOL = 'Ok, here goes the first step.';


//Handles the launching of the app
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Good day. What do you want to do today?')
      .reprompt()
      .getResponse();
  },
};


const InProgressReadProtocolHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'ReadProtocol' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

const ReadProtocolIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'ReadProtocol'
  },

  // if the dialog resolves fine, proceed to:
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    //resolve utterances to protocol ID on protocols.io
    var id = utterance2protocol(request.intent.slots.protocol.value)
    if (id == 'none') {
      return handlerInput.responseBuilder
          .speak('Hmm, there are not any default protocols for ' + request.intent.slots.protocol.value)
          .getResponse()
    }
    var UserID = handlerInput.requestEnvelope.session.user['userId']
    rp(protocolQuery(id)).then(function (resp) {
      var hashList = []
      var flag = 0

      // set first hash
      for (i = 0; i < resp.protocol.steps.length; i++) {
        if (resp.protocol.steps[i]['previous_guid'] == null) {
          hashNow = resp.protocol.steps[i].guid
          hashList.push(hashNow)
        }
      }

      // get ordered hashes
      for (n = 0; n < resp.protocol.steps.length; n++) {
        for (i = 0; i < resp.protocol.steps.length; i++) {
          if (resp.protocol.steps[i]['previous_guid'] == hashNow) {
            hashNow = resp.protocol.steps[i].guid
            hashList.push(hashNow)
            break
          }
        }
      }
      console.log(hashNow)
      //update or insert user info to dynamoDB
      protocolsTable.update(UserID, {
        step: 1,
        protocol: request.intent.slots.protocol.value,
        protocol_id: id,
        hashes: hashList
      })
    })
      .catch(function (err) {
        // API call failed...
      });




    //send user to step 1
    let stepName = 'step' + ' ' + 1;

    var bla = rp(protocolQuery(id)).then(function (resp) {
      return returnProtocol(resp, handlerInput)
    })
      .catch(function (err) {
        console.log('err : ' + err)

        return handlerInput.responseBuilder
          .speak(API_FAILURE)
          .getResponse()

      });
    return bla


  }
};

const SetUpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'setUp';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('To set up the integration with drive, go to your alexa App. You will have to have a sheet named "Science Grandma" for me to work!')
      .withLinkAccountCard()
      .getResponse();
  },
};


// Gets an ID from gogole drive and queries it on protocols.io
const InProgressReadMyProtocolHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'ReadMyProtocol' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};


const ReadMyProtocol = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'ReadMyProtocol';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    if (typeof handlerInput.requestEnvelope.context.System.user.accessToken !== 'undefined') {
      var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
      authObj = new google.auth.OAuth2();
      authObj.setCredentials({
        access_token: accessToken
      });


      console.log('handling item');
      var query = request.intent.slots.protocol.value;
      console.log('The query is ' + query)
      query = query.toLowerCase()
      console.log('And now the query is ' + query)
      // set promise to get the files from google drive api
      var bla = listFiles(authObj, query).then(function (results) {
        if (results == 'item not found') {
          return handlerInput.responseBuilder
            .speak('Sorry, protocol ' + query + ' was not matched on your sheet.')
            .getResponse();

        } else if (results == 'sheet not found'){
          return handlerInput.responseBuilder
          .speak('I could not find a sheet named Science Mom on your drive. I will need one to know where the stuff is.')
          .getResponse();
        } else {
          //resolve utterances to protocol ID on protocols.io
          var id = mapnothingtonothing(results)
          console.log(id)
          var UserID = handlerInput.requestEnvelope.session.user['userId']
          rp(protocolQuery(id)).then(function (resp) {
            var hashList = []
            var flag = 0

            // set first hash
            for (i = 0; i < resp.protocol.steps.length; i++) {
              if (resp.protocol.steps[i]['previous_guid'] == null) {
                hashNow = resp.protocol.steps[i].guid
                hashList.push(hashNow)
              }
            }

            // get ordered hashes
            for (n = 0; n < resp.protocol.steps.length; n++) {
              for (i = 0; i < resp.protocol.steps.length; i++) {
                if (resp.protocol.steps[i]['previous_guid'] == hashNow) {
                  hashNow = resp.protocol.steps[i].guid
                  hashList.push(hashNow)
                  break
                }
              }
            }
            console.log(hashNow)
            //update or insert user info to dynamoDB
            protocolsTable.update(UserID, {
              step: 1,
              protocol_id: id,
              hashes: hashList
            })
          })
            .catch(function (err) {
              // API call failed...
            });




          //send user to step 1
          let stepName = 'step' + ' ' + 1;

          var bli = rp(protocolQuery(id)).then(function (resp) {
            return returnProtocol(resp, handlerInput)
          })
            .catch(function (err) {
              console.log('err : ' + err)

              return handlerInput.responseBuilder
                .speak(API_FAILURE)
                .getResponse()

            });
          return bli
        }
      })
      return bla

    } else {
      console.log('acess Token is undefined, got here')
      return handlerInput.responseBuilder
        .speak('You have to link your skill to google docs. just say set me up')
        .reprompt()
        .getResponse();
    }


  },
};

const ReadProtocolByNumber = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'ReadProtocolByNumber'
  },

  // if the dialog resolves fine, proceed to:
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    //resolve utterances to protocol ID on protocols.io
    var id = mapnothingtonothing(request.intent.slots.number.value)
    console.log(id)
    const ReadProtocolByNumberFAILURE = "The protocol number " + id  + 'was not found on the protocols io database'
    var UserID = handlerInput.requestEnvelope.session.user['userId']
    rp(protocolQuery(id)).then(function (resp) {
      var hashList = []
      var flag = 0

      // set first hash
      for (i = 0; i < resp.protocol.steps.length; i++) {
        if (resp.protocol.steps[i]['previous_guid'] == null) {
          hashNow = resp.protocol.steps[i].guid
          if (hashNow == undefined){
            console.log('that was the problem')
            return handlerInput.responseBuilder
          .speak(API_FAILURE)
          .getResponse()
          }
          hashList.push(hashNow)
        }
      }

      // get ordered hashes
      for (n = 0; n < resp.protocol.steps.length; n++) {
        for (i = 0; i < resp.protocol.steps.length; i++) {
          if (resp.protocol.steps[i]['previous_guid'] == hashNow) {
            hashNow = resp.protocol.steps[i].guid
            hashList.push(hashNow)
            break
          }
        }
      }
      console.log(hashNow)
      //update or insert user info to dynamoDB
      protocolsTable.update(UserID, {
        step: 1,
        protocol_id: id,
        hashes: hashList
      })
    })
      .catch(function (err) {
        console.log('err : ' + err)
        return handlerInput.responseBuilder

          .speak(ReadProtocolByNumberFAILURE)
          .getResponse()

      });




    //send user to step 1
    let stepName = 'step' + ' ' + 1;

    var bla = rp(protocolQuery(id)).then(function (resp) {
      return returnProtocol(resp, handlerInput)
    })
      .catch(function (err) {
        console.log('err : ' + err)

        return handlerInput.responseBuilder
          .speak('There was an error on the side of the API.Probably protocol number ' + id + ' is not compatible with this skill.' )
          .getResponse()

      });
    return bla


  }
};


const HowManyStepsIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'HowManyStepsIntent';
  },

  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // get protocol ID from the database
    var UserID = handlerInput.requestEnvelope.session.user['userId']
    var bla = protocolsTable.find(UserID)
      .then(function (user) {
        var id = user.protocol_id

        var ble = rp(protocolQuery(id)).then(function (resp) {
          var n_of_steps = resp.protocol.number_of_steps
          return handlerInput.responseBuilder
            .speak('There are ' + n_of_steps + ' on this protocol')
            .getResponse()

        })
          .catch(function (err) {
            return handlerInput.responseBuilder
              .speak(API_FAILURE)
              .getResponse()

          });

        return ble

      })
    return bla
  },
};


// Goes to an specific step in the protocol
const GoToStepIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'GoToStep';
  },

  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    //which step does the user wants?
    var currentIntent = request.intent;
    var stepNumber = currentIntent.slots.number;

    //save it to the database
    var UserID = handlerInput.requestEnvelope.session.user['userId']

    protocolsTable.update(UserID, {
      step: stepNumber.value
    })

    // Tell the promise what we want to do when it gets data back from DynamoDB
    var bla = protocolsTable.find(UserID)
      .then(function (user) {
        //get current step and go to next
        var stepNumber = user.step;
        var stepNow = Number(stepNumber)
        var id = user.protocol_id
        console.log('id : ' + id)

        var ble = rp(stepQuery(id)).then(function (resp) {
          console.log('stepNow : ' + stepNow)
          console.log('resp : ' + resp)
          return returnStep(resp, stepNow, handlerInput)
        })
          .catch(function (err) {
            return handlerInput.responseBuilder
              .speak(API_FAILURE)
              .getResponse()

          });

        return ble

      })
    return bla
  },
};

//gets where the user is and returns the next step in a given protocol
const NextRecommendationIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'NextRecommendationIntent'
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    var protocolsTable = dynasty.table('bact');
    const UserID = handlerInput.requestEnvelope.session.user['userId']
    // find userID on your dynamoDB table and pass the whole response to 'bla',
    // Tell the promise what we want to do when it gets data back from DynamoDB
    var bla = protocolsTable.find(UserID)
      .then(function (user) {

        var stepNumber = user.step;
        var stepNow = Number(stepNumber)
        var nextStep = stepNow + 1;

        const UserID = handlerInput.requestEnvelope.session.user['userId']
        const protocolsTable = dynasty.table('bact');

        //get hash equivalent to the step wanted
        var hash = user.hashes[stepNow]
        console.log(hash)

        protocolsTable.update(UserID, {
          step: nextStep
        })

        var id = user.protocol_id
        var ble = rp(stepQuery(id)).then(function (resp) {
          if (nextStep < resp.steps.length) {
            return returnStep(resp, hash, handlerInput)
          }
          else {
            return handlerInput.responseBuilder
              .speak('There are no more steps, you are done!')
              .getResponse()
          }
        }).catch(function (err) {
          console.log('err:', err)
          return handlerInput.responseBuilder
            .speak(API_FAILURE)
            .getResponse()

        });
        return ble

      })
    return bla
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const FallbackHandler = {
  // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
  //              This handler will not be triggered except in that locale, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(FALLBACK_MESSAGE)
      .reprompt(FALLBACK_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    SetUpHandler,
    InProgressReadProtocolHandler,
    InProgressReadMyProtocolHandler,
    ReadMyProtocol,
    ReadProtocolByNumber,
    LaunchRequestHandler,
    GoToStepIntent,
    NextRecommendationIntent,
    ReadProtocolIntent,
    HowManyStepsIntent,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

// Auxiliary functions

// This one gets the text from each step in the protocols.io API from its hash
// given that the query was to GET https://www.protocols.io/api/v3/protocols/[id]/steps
// Function for GET steps!
returnStep = function (responseFromAPI, hash, handlerInput) {
  var i;
  //iterate through all steps to find the first
  for (i = 0; i < responseFromAPI.steps.length; i++) {
    console.log(responseFromAPI.steps[i]['guid'])
    if (responseFromAPI.steps[i]['guid'] == hash) {
      //get element inside step which contains the text
      var j;
      for (j = 0; j < responseFromAPI.steps[i].components.length; j++) {
        if (responseFromAPI.steps[i].components[j].type_id == 1) {

          var text = htmlToText.fromString(responseFromAPI.steps[i].components[j].source.description, {
            wordwrap: null
          });

          return handlerInput.responseBuilder
            .speak(text)
            .getResponse();
        }
      }
    }
  }

}

//get steps from protocols.io API
stepQuery = function (id) {
  var id = id
  var options = {
    uri: 'https://www.protocols.io/api/v3/protocols/' + id + '/steps',
    qs: {
      access_token: 'b24cf5883f3dad2d6e863a006c5c669ba7f964143eee504cfc8920eb8caf5219 ' // -> uri + '?access_token=xxxxx%20xxxxx'
    },
    json: true // Automatically parses the JSON string in the response
  }
  return options

}

protocolQuery = function (id) {
  var id = id
  console.log(id)
  var options = {
    uri: 'https://www.protocols.io/api/v3/protocols/' + id,
    qs: {
      access_token: 'b24cf5883f3dad2d6e863a006c5c669ba7f964143eee504cfc8920eb8caf5219 ' // -> uri + '?access_token=xxxxx%20xxxxx'
    },
    json: true // Automatically parses the JSON string in the response
  }
  return options

}

utterance2protocol = function (utterance) {
  var dictionary = {}
  dictionary['bacterial transformation'] = 13810
  dictionary['ligation'] = 6678
  dictionary['tris buffer'] = 12085
  dictionary['rna extraction'] = 11342
  dictionary['iron chloride precipitation of viruses from seawater'] = 822
  dictionary['western blot'] = 2850
  dictionary['resuspension buffer'] = 5832
  dictionary['m9 media'] = 6224
  dictionary['electrocompetent cells'] = 531
  dictionary['immunofluorescent staining of whole blood'] = 5797
  dictionary['southern blotting'] = 5342



  var id = dictionary[utterance]
  if (id === undefined) {
    console.log('protocol not found')
    return 'none'
  }

  return id
}

// This one gets the text from THE FIRST step the protocols.io API
// given that the query was to GET https://www.protocols.io/api/v3/protocols/[id]
// Function for GET protocol!
returnProtocol = function (responseFromAPI, handlerInput) {
  var i;
  //iterate through all steps to find the first
  for (i = 0; i < responseFromAPI.protocol.steps.length; i++) {
    if (responseFromAPI.protocol.steps[i]['previous_guid'] == null) {

      //get element inside step which contains the text
      var j;
      for (j = 0; j < responseFromAPI.protocol.steps[i].components.length; j++) {
        if (responseFromAPI.protocol.steps[i].components[j].type_id == 1) {
          console.log('got here too and ' + j + '')

          var text = htmlToText.fromString(responseFromAPI.protocol.steps[i].components[j].source.description, {
            wordwrap: null
          });

          //check if there is a link and only return if there is 

          if (responseFromAPI.protocol.link == null) {
            var cardContent = 'Protocol from protocols.io written by ' + responseFromAPI.protocol.creator.name
          } else {
            var cardContent = 'Protocol from protocols.io written by ' + responseFromAPI.protocol.creator.name + '\n' + 'Available in ' + responseFromAPI.protocol.link
          }

          return handlerInput.responseBuilder
            .speak(text)
            .withSimpleCard(responseFromAPI.protocol.title, cardContent)
            .getResponse();
        }
      }
    }
  }
}


mapnothingtonothing = function (x) {
  return x
}

async function listFiles(auth, query) {

  var motherSheet = await sheetId(auth).then(function (result) {
    console.log('all seems good')
    return result
  })

  bla = motherSheet.slice(motherSheet.indexOf("(") + 1, -1)

  var sheetValues = await parseSheet(auth, bla).then(function (result) {
    console.log('YEP, all is good')
    return result
  })
  var result = sheetValues;
  var i;
  for (i = 0; i < result.rowData.length; i++) {
    console.log(i)
    console.log('row data for this index:', result.rowData[i])
    if (result.rowData[i].values[0].formattedValue.trim() == query) {
      return result.rowData[i].values[1].formattedValue
    } else if (i == result.rowData.length - 1) {
      return ('item not found')
    }
  }
}

async function sheetId(auth) {
  return new Promise(function (resolve, reject) {
    console.log('ok beg')
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
      q: 'name= "Science Grandma"',
      pageSize: 1,
      fields: 'nextPageToken, files(id, name)',
    }, (err, { data }) => {
      if (err) reject('The API returned an error: ' + err);
      const files = data.files;
      if (files.length) {
        console.log('files found')
        files.map((file) => {
          resolve(`${file.name} (${file.id})`);
        });
      } else {
        console.log('No files found.');
        resolve('sheet not found');
      }
    });

  });
}

async function parseSheet(auth,sheetID){
  const sheets = google.sheets({version: 'v4', auth});
  return new Promise(function(resolve, reject) {
    console.log('ok beg')
    var request = {
      spreadsheetId: sheetID,
      includeGridData: true,
      auth: auth,
    };
    sheets.spreadsheets.get(request, function(err, response) {
      if (err) {
        reject(err);
        return;
      }
      // returns list with values in the spreadsheet
      // evry item of the rowData list corresponds to a row.
      // you can access each colum by index using rowData[ROW_INDEX].values[COL_INDEX]
      // and you can acces each string by using  rowData[ROW_INDEX].values[COL_INDEX].formattedValue

      sheetValues = (response.data.sheets[0].data[0])
      resolve(sheetValues)

    });

  });
}