const functions = require('firebase-functions');

const cors = require('cors')({
  origin: true
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.keepCamRealTime  = functions.https.onRequest((req, res) => {
  console.log("Dunked");
  console.log(req);

  

  res.status(200).json({
    message:"It worked"
  })
});
