const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({
  origin: true,
});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


exports.saveCam = functions.https.onRequest((req, res) => {
  // [END trigger]
  // [START sendError]
  // Forbidding PUT requests.
  if (req.method === 'PUT') {
    return res.status(403).send('Forbidden!');
  }
  // [END sendError]

  // [START usingMiddleware]
  // Enable CORS using the `cors` express middleware.
  return cors(req, res, () => {
    // [END usingMiddleware]
    // Reading date format from URL query parameter.
    // [START readQueryParam]

    // [START sendResponse]




    res.status(200).send();
    // [END sendResponse]
  });
});
// [END all]
