/*
This script is the endpoint of Alexa skill 'Science Mom'
It queries the Google Drive API to give a voice response via Alexa to an user looking for an item in a laboratory

Written by Tiago Lubiana, July/2018 
*/




/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const cookbook = require('./alexa-cookbook.js');
const {
  google
} = require('googleapis');

const SKILL_NAME = 'Science Mom';
const HELP_MESSAGE = 'For connecting to your google drive, say set me up. If you are already set, you can look for your itens saying somethin  as where are my enzymes.'
const HELP_REPROMPT = 'What can I help you with?';
const FALLBACK_MESSAGE = 'The Science Mom can\'t help you with that, I am sorry.'
const FALLBACK_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const LAUNCH_MESSAGE = 'Hey! Science Mom is here to find your things, what can I do for you?';


const LaunchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';

  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(LAUNCH_MESSAGE)
      .reprompt()
      .getResponse();
  },
};

const SetUpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'setUp';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('To set up Science Mom, go to your alexa App for linking to  google drive. You will have to have a sheet named "Science Mom" for me to work!')
      .withLinkAccountCard()
      .getResponse();
  },
};

const InProgressFindItemHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'findItem' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};


const FindItemHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'findItem';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    if (typeof handlerInput.requestEnvelope.context.System.user.accessToken !== 'undefined') {
      let accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
      authObj = new google.auth.OAuth2();
      authObj.setCredentials({
        access_token: accessToken
      });


      console.log('handling item');
      let query = request.intent.slots.item.value;
      console.log(query)
      query = query.toLowerCase()

      // set promise to get the files from google drive api
      let bla = listFiles(authObj, query).then(function (results) {
        if (results == 'item not found') {
          return handlerInput.responseBuilder
            .speak('Sorry, item ' + query + ' was not matched on your sheet. Maybe it was written in another way? Feel free to try again! ')
            .reprompt()
            .getResponse();
        } else if (results == 'sheet not found') {
          return handlerInput.responseBuilder
            .speak('I could not find a sheet named Science Mom on your drive. I will need one to know where the stuff is.')
            .getResponse();
        } else {
          return handlerInput.responseBuilder
            .speak('The location for ' + query + ' is ' + results)
            .getResponse();
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




const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpIntent';
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
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(FALLBACK_MESSAGE)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.StopIntent');
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
    InProgressFindItemHandler,
    LaunchHandler,
    SetUpHandler,
    FindItemHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();


//AUXILIARY FUNCTIONS
// function  adapted from https://developers.google.com/drive/api/v3/quickstart/nodejs

// It is a async function which returns a promise, which can resolve to the
// ID of the Science Mom sheet if that exists. That is handled by the listFiles function
async function parseSheet(auth, sheetID) {
  const sheets = google.sheets({
    version: 'v4',
    auth
  });
  return new Promise(function (resolve, reject) {
    console.log('ok beg')
    let request = {
      spreadsheetId: sheetID,
      includeGridData: true,
      auth: auth,
    };
    sheets.spreadsheets.get(request, function (err, response) {
      if (err) {
        reject(err);
        return;
      }

      // returns list with values in the spreadsheet
      // every item of the rowData list corresponds to a row.
      // you can access each colum by index using rowData[ROW_INDEX].values[COL_INDEX]
      // and you can acces each string by using  rowData[ROW_INDEX].values[COL_INDEX].formattedValue

      sheetValues = (response.data.sheets[0].data[0])
      resolve(sheetValues)

    });

  });
}


//gets the sheet id from the SheetID function/promise
const listFiles = async function getSecondByFirstRowInSheet(auth, query) {

  let motherSheet = await sheetId(auth).then(function (result) {
    console.log('all seems good')
    return result
  })
  if (motherSheet == 'sheet not found') {
    console.log('sheet not found')
    return ('sheet not found')
  }

  bla = motherSheet.slice(motherSheet.indexOf("(") + 1, -1)

  let sheetValues = await parseSheet(auth, bla).then(function (result) {
    console.log('YEP, all is good')
    return result
  })
  let result = sheetValues;
  let i;
  for (i = 0; i < result.rowData.length; i++) {
    console.log(i)
    console.log(result.rowData[i].values[0])
    if (result.rowData[i].values[0].formattedValue == query) {
      if (result.rowData[i].values[1].formattedValue) {
        return result.rowData[i].values[1].formattedValue
      } else {
        return ('item not found')
      }
    } else if (i == result.rowData.length - 1) {
      return ('item not found')
    }
  }
}



const sheetId = async function getSheetIdFromLabMotherSheet(auth) {
  return new Promise(function (resolve, reject) {
    console.log('ok beg')
    const drive = google.drive({
      version: 'v3',
      auth
    });
    drive.files.list({
      q: 'name= "Science Mom"',
      pageSize: 1,
      fields: 'nextPageToken, files(id, name)',
    }, (err, {
      data
    }) => {
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