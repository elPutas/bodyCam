const functions = require('firebase-functions');
const cors = require('cors')({
  origin: true
});
const xml2js = require('xml2js');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

//const serviceAccount = require("./My-Service.json");

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
  /*res.status(200).json({
    message:"It worked",
    message_bruto: xmlData
  });*/
  parser.parseString(xmlData, function(err,result){
    if (err) {
      res.status(500).json(err);
    }else{

      var obj_info = {
        datetime:result['EventNotificationAlert']['peopleCounting'][0]['RealTime'][0]['time'][0],
        enter: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['enter'][0]),
        exit: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['exit'][0]),
        ipaddress: result['EventNotificationAlert']['ipAddress'][0],
        macaddress: result['EventNotificationAlert']['macAddress'][0],
        pass: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['pass'][0])
      };

      //admin.database().ref('/info_bruto_camaras').push(obj_info);
      db.collection('info_bruto_camaras').add(obj_info);

      //newCityRef.set(obj_info);

      res.status(200).json({
        message:"It worked",
        objk:obj_info
        //newPostKey:newPostKey
        //str:xmlData
        //data:result,
        //ipAddress: result['EventNotificationAlert']['ipAddress'][0],
        //macAddress: result['EventNotificationAlert']['macAddress'][0],
        //datetime: result['EventNotificationAlert']['peopleCounting'][0]['RealTime'][0]['time'][0],
        //enter: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['enter'][0]),
        //exit: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['exit'][0]),
        //pass: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['pass'][0])
      });
    }
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
