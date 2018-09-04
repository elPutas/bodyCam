const functions = require('firebase-functions');

const cors = require('cors')({
  origin: true
});

const xml2js = require('xml2js');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.keepStats  = functions.https.onRequest((req, res) => {
  console.log("Dunked");
  console.log(req);

  let data = req.rawBody;
  let xmlData = data.toString();
  let parser = new xml2js.Parser();
//https://stackoverflow.com/questions/10904448/node-to-parse-xml-using-xml2js
  parser.parseString(xml, function(err,result){
    //Extract the value from the data element
    extractedData = result['config']['data'];
    console.log(extractedData);
    res.status(200).json({
      message:"It worked",
      message_bruto: xmlData
    });
  });


  /*
  parseString(xmlData, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).end();
      return;
    }
    res.send(result);
  */
  /*
  parseString(xmlData, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).end();
      return;
    }
    res.send(result);
    */
});
