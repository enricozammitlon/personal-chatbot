// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

admin.initializeApp();

// A unique identifier for the given session
const sessionId = uuid.v4();

// Create a new session
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath('personal-chatbot-793a5', sessionId);
      

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.chat = functions.https.onRequest(async (req, res) => {
	  return cors(req, res, async () => {
      if(req.method !== 'POST') {
        return res.status(401).json({
          message: 'Not allowed'
        })
      }

      const item = req.body.message



      // The text query request.
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            // The query to send to the dialogflow agent
            text: item,
            // The language used by the client (en-US)
            languageCode: 'en-US',
          },
        },
      };

      // Send request and log result
      const responses = await sessionClient.detectIntent(request);
      console.log('Detected intent');
      const result = responses[0].queryResult;
      console.log(`  Query: ${result.queryText}`);
      console.log(`  Response: ${result.fulfillmentText}`);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
        return res.status(200).json(result.fulfillmentText)
      } else {
        console.log(`  No intent matched.`);
        return res.status(200).json("No Intent matched")
      }      

    }, (error) => {
      return res.status(error.code).json({
        message: `Something went wrong. ${error.message}`
      })
    })
});