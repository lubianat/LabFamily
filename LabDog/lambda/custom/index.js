// This skill is derived from amazon 'fact' template

/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const cookbook = require('./alexa-cookbook.js');


const SKILL_NAME = 'Lab Dog';
const BARK = '<audio src=\'https://s3.amazonaws.com/ask-soundlibrary/animals/amzn_sfx_dog_med_bark_2x_03.mp3\'/> ';
const HELP_MESSAGE = 'You can say lab dog, tell me a joke or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const FALLBACK_MESSAGE = 'The Lab Dog skill can\'t help you with that.  It can only tell you science jokes. What can I help you with?';
const FALLBACK_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
'We should genetically modify potatoes to make chips CRISPR.',
'A prokaryote walks into a Verizon store. The salesman tries to sell him a family plan, he says “dude, I only have one cell”',
'Don\'t trust atoms...They make up everything!',
'Two atoms are walking along. One of them says:,“Oh, no, I think I lost an electron.”,“Are you sure?”, “Yes, I’m positive.”',
'Schrodinger’s cat walks into a bar. And doesn’t.',
'“Definition of Home”: The place scientists hope to go when they die. Considered mythical.',
'Hey, do you know the name Pavlov? It rings a bell...',
'“If you’re NOT part of the SOLUTION; you’re part of the PRECIPITATE”',
'What is a cation afraid of ?,, Dogions!<audio src=\'https://s3.amazonaws.com/ask-soundlibrary/animals/amzn_sfx_dog_med_bark_2x_01.mp3\'/>  ',
'Why is the pH of YouTube stable?,, Well, it is constantly buffering! '

];

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const randomJoke = cookbook.getRandomItem(data);
    const speechOutput = BARK + randomJoke + BARK;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, randomJoke)
      .getResponse();
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
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
