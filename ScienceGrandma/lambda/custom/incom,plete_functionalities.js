//read all steps in the protocol
const ReadAllIntent = {
  canHandle(handlerInput) {
  const request = handlerInput.requestEnvelope.request;
  return request.type === 'IntentRequest'
  && request.intent.name === 'ReadAll';
},
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    if (request.intent.slots.protocol.value == 'RNA extraction'){
      var protocolKey = './RNAextraction'
    } else if (request.intent.slots.protocol.value == 'PBMC isolation') {
      var protocolKey = './PBMC'
    }

    var referenceFile = require(protocolKey);
    console.log('ReadAllIntent');
    var stepCount = referenceFile.protocols.tissue['step count'];
    stepCount = Number(stepCount);
    // initiate the full protocol
    let  stepName = 'step' + ' ' + 0;
    var stepNow = referenceFile.protocols.tissue[stepName];
    //add all the steps with 1.5 secs between them
    var fullProtocol =  stepNow + '<break time="1.5s"/>'
    for (i = 1; i < stepCount; i++) {
      let  stepName = 'step' + ' ' + i;
      // request attributes from the protocol
      var stepNow = referenceFile.protocols.tissue[stepName];
      var fullProtocol = fullProtocol+ stepNow + '<break time="1.5s"/>'
}
return handlerInput.responseBuilder
    .speak(fullProtocol)
    .reprompt()
    .getResponse();
  }
};

const MaterialIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'MaterialIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
  // check if user wants to know about equipment or consumables
    const itemSlot = handlerInput.requestEnvelope.request.intent.slots.material;
    let itemName;
   // pass the value to lowercase, to make it standardized
    if (itemSlot && itemSlot.value) {
      itemName = itemSlot.value.toLowerCase();
    }
    // request attributes from material
    var response = referenceFile.protocols.tissue[itemName];

    //and add it to the output
//    sessionAttributes.speakOutput = LIST;
    return handlerInput.responseBuilder
      .speak(response)
      .reprompt()
      .getResponse();
  },
};


const SetUpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'setUp';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('To set up Science Grandma, go to your alexa App for linking to the protocols dot io website.')
      .withLinkAccountCard()
      .getResponse();
  },
};


ReadAllStepsIntent
MaterialIntent

/*
 {
                    "name": "getMaterial",
                    "slots": [
                        {
                            "name": "protocol",
                            "type": "AMAZON.Animal"
                        }
                    ],
                    "samples": [
                        "get material for {protocol}",
                        "which materials do I need"
                    ]
                },
  */


readAll = function (responseFromAPI, handlerInput) {
  console.log(responseFromAPI)
  var outputSpeech = " Here are all the steps from the " + responseFromAPI.protocol.title + ' protocol '
  var i;
  for (i = 0; i < responseFromAPI.protocol.steps.length; i++) {
    var j;
    for (j = 0; j < responseFromAPI.protocol.steps[i].components.length; j++) {
      if (responseFromAPI.protocol.steps[i].components[j].type_id == 1) {
        var text = htmlToText.fromString(responseFromAPI.protocol.steps[i].components[j].source.description, {
          wordwrap: null
        });

        outputSpeech = '<break time="0.5s"/>' + outputSpeech + text
      }
    }


  }
  outputSpeech = outputSpeech + '<break time="0.5s"/>' + ' And thats it!'
  return handlerInput.responseBuilder
    .speak(outputSpeech)
    .getResponse();
}


readMaterial = function (responseFromAPI, handlerInput) {
  console.log(responseFromAPI.protocol.materials.length)
  if (responseFromAPI.protocol.materials.length == 0) {
    return handlerInput.responseBuilder
      .speak('No materials are listed for the ' + responseFromAPI.protocol.title + ' protocol ')
      .getResponse();

  }
  var outputSpeech = " Here are the materials you will need for the " + responseFromAPI.protocol.title + ' protocol '
  var i;
  for (i = 0; i < responseFromAPI.protocol.materials.length; i++) {
    console.log('i:' + i)

    if (i == responseFromAPI.protocol.materials.length - 1) {
      var text = responseFromAPI.protocol.materials[i].name
      outputSpeech = '<break time="0.3s"/> and the' + outputSpeech + text
    } else {
      var text = responseFromAPI.protocol.materials[i].name
      outputSpeech = '<break time="0.3s"/>  the' + outputSpeech + text

    }

  }
  outputSpeech = outputSpeech + '<break time="0.5s"/>' + ' And thats it!'

  return handlerInput.responseBuilder
    .speak(outputSpeech)
    .getResponse();
}

const ReadAllStepsIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'ReadAllStepsIntent'
  },

  // if the dialog resolves fine, proceed to:
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    //resolve utterances to protocol ID on protocols.io
    var id = utterance2protocol(request.intent.slots.protocol.value)
    var UserID = handlerInput.requestEnvelope.session.user['userId']

    var bla = rp(protocolQuery(id)).then(function (resp) {
      return readAll(resp, handlerInput)
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

// {
//   "name": "ReadAllStepsIntent",
//   "slots": [
//       {
//           "name": "protocol",
//           "type": "protocolSlot"
//       }
//   ],
//   "samples": [
//       "read all steps for {protocol}",
//       "read all steps for the {protocol} protocol"
//   ]
// },
const MaterialIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'getMaterial';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    if (request.intent.slots.protocol.value) {
      console.log('aqui')
      //resolve utterances to protocol ID on protocols.io
      var id = utterance2protocol(request.intent.slots.protocol.value)
      var UserID = handlerInput.requestEnvelope.session.user['userId']

      var bla = rp(protocolQuery(id)).then(function (resp) {
        return readMaterial(resp, handlerInput)
      })
        .catch(function (err) {
          console.log('err : ' + err)

          return handlerInput.responseBuilder
            .speak(API_FAILURE)
            .getResponse()

        });
      return bla
    } else {
      var UserID = handlerInput.requestEnvelope.session.user['userId']
      console.log('nao, aqui')
      var bla = protocolsTable.find(UserID)
        .then(function (user) {
          var id = user.protocol_id

          var ble = rp(protocolQuery(id)).then(function (resp) {
            return readMaterial(resp, handlerInput)

          })
            .catch(function (err) {
              return handlerInput.responseBuilder
                .speak(API_FAILURE)
                .getResponse()

            });

          return ble

        })
      return bla
    }



  }
};


// {
//   "name": "getMaterial",
//   "slots": [
//       {
//           "name": "protocol",
//           "type": "protocolSlot"
//       }
//   ],
//   "samples": [
//       "get material for {protocol}",
//       "which materials do I need"
//   ]
// },