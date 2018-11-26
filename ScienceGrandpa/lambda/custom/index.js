/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const ncbi = require('node-ncbi');
const cookbook = require('./alexa-cookbook.js');
const eutils = require('ncbi-eutils');
const HELP_MESSAGE = "To search for something say give me news about, and then the word you will want to search. What can I do for you?" 
const HELP_REPROMPT = "What can I do for you?" 

const STOP_MESSAGE = 'Bye bye!'

const LaunchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log('Launch handler is active')
    return request.type === 'LaunchRequest';

  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Hey! I am science grandpa. To get news straight from PUBMED say something like give me news about dengue')
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

//add dialog directive for confirming the user intent 
const InProgressGetLiteratureHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'getLiterature' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

const GetLiteratureHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'getLiterature'
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const pubmed = ncbi.pubmed;
    const pubmedQuery = handlerInput.requestEnvelope.request.intent.slots.item.value

    attributes.ordering = 'date'
    attributes.pubmedQuery = pubmedQuery
    attributes.pubmedDescription = pubmedQuery
    attributes.counter = 0

    handlerInput.attributesManager.setSessionAttributes(attributes);

    let bla = pubmed.search(pubmedQuery).then(function (results) {
      if (results.count > attributes.counter) {
        let title = results.papers[0]['title']
        let ble = pubmed.abstract(results.papers[0].raw.uid).then(abstract => {
          return handlerInput.responseBuilder
            .speak('The last title found for ' + pubmedQuery + ' was ' + title + '  to get the abstract on your app, say ok, for more titles say next.')
            .reprompt()
            .getResponse();
        })
        return (ble)

      } else {
        return handlerInput.responseBuilder
          .speak("I could not find any articles about " + query)
          .getResponse();

      }
    });
    return bla

  },
};

const InProgressGetLiteratureByRelevanceHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'getLiteratureByRelevance' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};
// A different, more complicate npm package was used due to need of more parameters
const GetLiteratureByRelevanceHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'getLiteratureByRelevance';
  },
  handle(handlerInput) {
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const pubmed = ncbi.pubmed;
    const pubmedQuery = handlerInput.requestEnvelope.request.intent.slots.item.value
    attributes.pubmedQuery = pubmedQuery
    attributes.pubmedDescription = pubmedQuery
    attributes.counter = 0
    attributes.ordering = 'relevance'
    let blo = eutils.esearch({ db: 'pubmed', term: pubmedQuery, sort: 'relevance' }).then(function (results) {
      if (results.esearchresult.count > 0) {
        if (results.esearchresult.count > 10) {
          listOfIDs_size = 10
        } else {
          listOfIDs_size = results.esearchresult.count
        }
        attributes.listOfIDs = results.esearchresult.idlist.slice(0, 10)
        handlerInput.attributesManager.setSessionAttributes(attributes);
        let bla = pubmed.search(attributes.listOfIDs[0]).then(function (results) {
          let title = results.papers[0]['title']
          return handlerInput.responseBuilder
            .speak('The most relevant title found for ' + pubmedQuery + ' was ' + title + '  to get the abstract on your app, say ok, for more titles say next.')
            .reprompt()
            .getResponse();
        });

        return bla

      } else {
        return handlerInput.responseBuilder
          .speak("I could not find any articles about " + query)
          .getResponse();

      }
    })
    return blo
  }
};


const NextTitleHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'nextTitle';
  },
  handle(handlerInput) {
    const pubmed = ncbi.pubmed;
    const attributes = handlerInput.attributesManager.getSessionAttributes();

    if (attributes.ordering == 'date') {
      let query = attributes.pubmedQuery
      let description = attributes.pubmedDescription

      attributes.counter = attributes.counter + 1
      index = attributes.counter

      handlerInput.attributesManager.setSessionAttributes(attributes);

      let bla = pubmed.search(query).then(function (results) {
        console.log(results.count)
        console.log(results)

        if (results.count > index) {
          let title = results.papers[index]['title']
          let ble = pubmed.abstract(results.papers[index].raw.uid).then(abstract => {
            return handlerInput.responseBuilder
              .speak('The next title  for ' + description + ' is ' + title + '  to get the abstract on your app, say ok, for more titles say next.')
              .reprompt()
              .getResponse();
          })
          return (ble)

        } else {
          return handlerInput.responseBuilder
            .speak("I could not find any more  articles about " + description)
            .getResponse();

        }

      });
      return bla

    } else if (attributes.ordering == 'relevance') {
      let query = attributes.pubmedQuery
      let description = attributes.pubmedDescription

      attributes.counter = attributes.counter + 1
      index = attributes.counter
      id = attributes.listOfIDs[index]

      handlerInput.attributesManager.setSessionAttributes(attributes);
      if (attributes.listOfIDs.length > index) {
        let bla = pubmed.search(id).then(function (results) {

          let title = results.papers[0]['title']
          let ble = pubmed.abstract(results.papers[0].raw.uid).then(abstract => {
            return handlerInput.responseBuilder
              .speak('The next title  for ' + description + ' is ' + title + '  to get the abstract on your app, say ok, for more titles say next.')
              .reprompt()
              .getResponse();
          })
          return (ble)
        });
        return bla
      } else if (attributes.listOfIDs.length == 10) {
        return handlerInput.responseBuilder
          .speak("Sorry, kid, I can only get 10 articles for any query.")
          .getResponse();

      } else {
        return handlerInput.responseBuilder
          .speak("Sorry, kid, I could only get " + attributes.listOfIDs.length + 'articles for your query about ' + description)
          .getResponse();

      }

    }
  }
};

const SendAbstract = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'sendAbstract';
  },
  handle(handlerInput) {
    const pubmed = ncbi.pubmed;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    let query = attributes.pubmedQuery
    let description = attributes.pubmedDescription
    let index = attributes.counter

    if (attributes.ordering == 'date') {
      let bla = pubmed.search(query).then(function (results) {
        console.log(results.count)
        console.log(results)

        if (results.count > index) {
          let title = results.papers[index]['title']
          let ble = pubmed.abstract(results.papers[index].raw.uid).then(abstract => {
            return handlerInput.responseBuilder
            .speak('Ok, now you can read this abstract on your alexa app')
            .withSimpleCard('Your PubMed result about ' + description, 'Title: ' + title + '\n' + 'Abstract: ' + abstract + '\n')
            .getResponse();
          })
          return (ble)

        } else {
          return handlerInput.responseBuilder
            .speak("I could not find any more  articles about " + description)
            .getResponse();

        }

      });
      return bla

    } else if (attributes.ordering == 'relevance') {
      id = attributes.listOfIDs[index]

      handlerInput.attributesManager.setSessionAttributes(attributes);
      if (attributes.listOfIDs.length > index) {
        let bla = pubmed.search(id).then(function (results) {

          let title = results.papers[0]['title']
          let ble = pubmed.abstract(results.papers[0].raw.uid).then(abstract => {
            return handlerInput.responseBuilder
            .speak('Ok, now you can read this abstract on your alexa app')
            .withSimpleCard('Your PubMed result about ' + description, 'Title: ' + title + '\n' + 'Abstract: ' + abstract + '\n')
            .getResponse();
          })
          return (ble)
        });
        return bla
      } 

    }
  }
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
    LaunchHandler,
    InProgressGetLiteratureHandler,
    InProgressGetLiteratureByRelevanceHandler,
    GetLiteratureByRelevanceHandler,
    SendAbstract,
    NextTitleHandler,
    GetLiteratureHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
