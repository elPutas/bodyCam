const functions = require('firebase-functions');
<<<<<<< HEAD
const admin = require('firebase-admin');
admin.initializeApp();
=======
const cors = require('cors')({
  origin: true
});
const xml2js = require('xml2js');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

//const serviceAccount = require("./My-Service.json");
>>>>>>> 47730e49d002e3e12b08d199f248ba14cc330fc7

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

<<<<<<< HEAD

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
=======
exports.keepStats  = functions.https.onRequest((req, res) => {
  console.log("Dunked");
  //console.log(req);

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

      /*
      var obj_info = {
        datetime:result['EventNotificationAlert']['peopleCounting'][0]['RealTime'][0]['time'][0],
        enter: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['enter'][0]),
        exit: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['exit'][0]),
        ipaddress: result['EventNotificationAlert']['ipAddress'][0],
        macaddress: result['EventNotificationAlert']['macAddress'][0],
        pass: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['pass'][0])
      };
      */

      var id_cam = result['EventNotificationAlert']['macAddress'][0];
      var obj_info = {
        fecha: convertJsonDateToDate(result['EventNotificationAlert']['peopleCounting'][0]['RealTime'][0]['time'][0]),
        ingresaron: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['enter'][0]),
        salieron: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['exit'][0])
      };

      getCamera(id_cam, function(doc){
        cameraAddInfo(id_cam, obj_info, function(){
          responsegood(res);
        });

      }, function(){
        var camObj = {
          asignada: false,
          fecha_creado: new Date(),
          id: id_cam,
        };
        createCamera(id_cam, camObj, function(obj){
          getCamera(id_cam, function(doc){

            cameraAddInfo(id_cam, obj_info, function(){
              responsegood(res);
            });

          }, function(){
            return null;
          });
        })
      })

    }
  });

});

function getCamera(id_cam, callfinded, callnotfinded){
  var docRefCamar = db.collection('camaras').doc(id_cam);
  var getDoc = docRefCamar.get()
        .then(doc => {
          if (doc.exists) {
            return callfinded(doc);
          }else{
            return callnotfinded();
          }
        });
}

function createCamera(idCam, objcamera, created){
  var setCamara = db.collection('camaras').doc(idCam).set(objcamera)
        .then(obj=>{
          return created(obj);
        });
}

function responsegood(res){
  return res.status(200).json({
                    message:"It worked"
                  });
}

function convertJsonDateToDate(jsonDate){
  return new Date(jsonDate.substr(0,19))
}

function cameraAddInfo(idCamara, info, added){
  var camRef = db.collection('camaras').doc(idCamara);
  camRef.collection('info').add(info)
      .then(ans=>{
        return added(ans);
      })
      .catch(err=>{
        console.log(err);
        return null;
      });
}

function getSalonByCamara(idCamara, callfinded, callnotfinded){
  var docRefSalones = db.collection('salones');
  docRefSalones.where('idCam', '==', idCamara).get()
    .then(doc=>{
      if (doc.exists) {
        return callfinded(doc);
      }else{
        return callnotfinded();
      }
    });
}

function getClasesBySalonByDayOfWeek(idSalon, dayOfWeek, callfinded, callnotfinded){
  var docRefClases = db.collection('clases');
  docRefClases.where('salon_id','==',idSalon)
              .where("diasClase", "array-contains", dayOfWeek).get()
              .then(doc=>{
                if (doc.exists) {
                  return callfinded(doc);
                }else{
                  return callnotfinded();
                }
              });;
}

/*
function getClaseBySalonXDate(idSalon, date, callfinded, callnotfinded){
  getClasesBySalon(
    idSalon,
    function(){
    },
    function(){
    }
  );
}
*/
>>>>>>> 47730e49d002e3e12b08d199f248ba14cc330fc7
