const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.keepCamRealTime = functions.https.onRequest((req, res)=> {
  console.log('donke');
  console.log(req);
  res.status(200).json({
    message:'it worked!'
  });
});
