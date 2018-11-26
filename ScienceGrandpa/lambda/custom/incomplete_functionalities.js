

const GetLiteratureByJournalHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest'
        && request.intent.name === 'getLiteratureByJournal';
    },
    handle(handlerInput) {
      const attributes = handlerInput.attributesManager.getSessionAttributes();
      const pubmed = ncbi.pubmed;
      const pubmedKey = handlerInput.requestEnvelope.request.intent.slots.query.value
      const pubmedJournal = handlerInput.requestEnvelope.request.intent.slots.journal.value
      const pubmedQuery = pubmedKey + ' AND ("' + pubmedJournal + '"[Journal])'
      attributes.ordering = 'date'
      attributes.pubmedDescription = pubmedKey + ' on ' + pubmedJournal
      attributes.pubmedQuery = pubmedQuery
      attributes.counter = 0
      handlerInput.attributesManager.setSessionAttributes(attributes);
      let bla = pubmed.search(pubmedQuery).then(function (results) {
        if (results.count > 0) {
          let title = results.papers[0]['title']
          let ble = pubmed.abstract(results.papers[0].raw.uid).then(abstract => {
            return handlerInput.responseBuilder
              .speak('The last title found for ' + pubmedKey + ' on ' + pubmedJournal + ' was ' + title + '  to get the abstract on your app, say ok, for more titles say next.')
              .reprompt()
              .getResponse();
  
          })
          return (ble)
        } else {
          return handlerInput.responseBuilder
            .speak("I could not find any articles about " + pubmedKey + ' on ' + pubmedJournal)
            .getResponse();
  
        }
      });
      return bla
  
    },
  };

  const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetLiteratureByJournalHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();