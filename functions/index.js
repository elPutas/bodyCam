const functions = require('firebase-functions');
const cors = require('cors')({
  origin: true
});
const xml2js = require('xml2js');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const interval = 10;
const weekDays = [dom,lun,mar,mie,jue,vie,sab];

//const serviceAccount = require("./My-Service.json");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

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
      var strDateRow = result['EventNotificationAlert']['peopleCounting'][0]['RealTime'][0]['time'][0];
      var date_registro = convertJsonDateToDate(strDateRow);
      //var horaStr =
      var obj_info = {
        fecha: date_registro,
        ingresaron: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['enter'][0]),
        salieron: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['exit'][0]),
        personas_en_clase: (parseInt(result['EventNotificationAlert']['peopleCounting'][0]['enter'][0]) - parseInt(result['EventNotificationAlert']['peopleCounting'][0]['exit'][0])),
        pass: parseInt(result['EventNotificationAlert']['peopleCounting'][0]['pass'][0])
      };

      getCamera(id_cam, function(doc){
        cameraAddInfo(id_cam, obj_info, function(){
          getClassOfRow(id_cam, date_registro.getDay(), strDateRow,
            function(docy){

              claseAddIngresos(
                          docy,
                          obj_info,
                          dameKeyRegistro(strDateRow, docy.getData().h_inicio),
                          function(){
                            //aca eval assitencia
                            responsegood(res);
                          }
                        );

            },
            function(){
              return null;
            }
          );


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
              getClassOfRow(id_cam, date_registro.getDay(), strDateRow,
                function(docy){
                  claseAddIngresos(
                              docy,
                              obj_info,
                              dameKeyRegistro(strDateRow, docy.getData().h_inicio),
                              function(){
                                //aca eval assitencia
                                responsegood(res);
                              }
                            );
                },
                function(){
                  return null;
                }
              );

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

function convertTomilisHour(date){
  var intHoraMili = dateo.getHours()*60*60*1000 + dateo.getMinutes()*60*1000 + dateo.getSeconds()*1000;
  return intHoraMili;
}

function convertTomilisHourString(date){
  var intHoraMili = dateo.getHours()*60*60*1000 + dateo.getMinutes()*60*1000 + dateo.getSeconds()*1000;
  return intHoraMili;
}

function dameHoraMiliOfstrDt(jsonDate){
  var arr1 = jsonDate.split('T');
  var arr_pres = arr1[1].split(':');
  var seconds = parseInt(arr_pres[2].split('-'));
  return (parseInt(arr_pres[0])*60*60*1000)+(parseInt(arr_pres[1])*60*1000)+seconds*1000;
}

function horaClassMili(strHora){
    var fase1 = strHora.split(' ');
    var fase2 = fase1[0].split(':');
    var hora = fase1[1] == 'PM' ? parseInt(fase2[0]) +12 : parseInt(fase2[0]);
    return (hora*60*60*1000)+(parseInt(fase2[1])*60*1000);
}

function dameKeyRegistro(jsonDate, strIni){
  var arr1 = jsonDate.split('T');
  return arr1[0]+strIni;
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

function claseAddIngresos(clase, registro, keyreg, added){
  var classRef = db.collection('clases').doc(clase.id);
  classRef.collection('ingresos').doc(keyreg).collection('ingresosXdia')
    .set(registro)
      .then(ans=>{
        return added(ans);
      })
      .catch(err=>{
        console.log(err);
        return null;
      });
}

function evalAsistencia(clase, registro, date,added){
  //if()
}

/*function getSalonByCamara(idCamara, callfinded, callnotfinded){
  var docRefSalones = db.collection('salones');
  docRefSalones.where('idCam', '==', idCamara).get()
    .then(doc=>{
      if (doc.exists) {
        return callfinded(doc);
      }else{
        return callnotfinded();
      }
    });
}*/

/*function getClasesBySalonByDayOfWeek(idSalon, dayOfWeek, callfinded, callnotfinded){
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
}*/

function getClasesByCam(idcam, dayOfWeek, callfinded, callnotfinded){
  var docRefClases = db.collection('clases');
  docRefClases.where('cam_id','==',idcam)
              //.where()
              .where("diasClase", "array-contains", weekDays[dayOfWeek]).get()
              .then(doc=>{
                if (doc.exists) {
                  return callfinded(doc);
                }else{
                  return callnotfinded();
                }
              });
}

function getClassOfRow(idcam, dayOfWeek, dateRow, callfinded, callnotfinded){
  var hora_row_mili = dameHoraMiliOfstrDt(dateRow);
  getClasesByCam(idcam, dayOfWeek,
     function(docs){
       docs.forEach(function (doc) {
         var iniMili =  horaClassMili(doc.data().h_final);
         var finMili =  horaClassMili(doc.data().h_inicio);
         if(iniMili <= hora_row_mili && finMili >= hora_row_mili){
           return doc;
         }
         console.log(doc);
      });
     },
     function(){
       return null;
     }
  );
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
/*
function convertJsonDateToDate(jsonDate){
 //console.log(JSON.stringify(new Date()));
 var arr1 = jsonDate.split('T');
  var arr_big = arr1[0].split('-');
  var arr_pres = arr1[1].split(':');
  var seconds = arr_pres[2].split('-');
  //return new Date(jsonDate.substr(0,19));
  console.log(arr_big);
  console.log(arr_pres);
  console.log(seconds);
  console.log(parseInt(arr_big[0]), (parseInt(arr_big[1])-1), parseInt(arr_big[2]), parseInt(arr_pres[0]), parseInt(arr_pres[1]), parseInt(seconds[0]), 0);
  return new Date(parseInt(arr_big[0]), (parseInt(arr_big[1])-1), parseInt(arr_big[2]), parseInt(arr_pres[0]), parseInt(arr_pres[1]), parseInt(seconds[0]), 0)
}
*/
