
const functions = require('firebase-functions');
const cors = require('cors')({
  origin: true
});
const xml2js = require('xml2js');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const interval = 10;
const weekDays = ['dom','lun','mar','mie','jue','vie','sab'];

exports.keepStats  = functions.https.onRequest((req, res) => {
  console.log("Dunked");
  console.log(req);

  let data = req.rawBody;
  let xmlData = data.toString();
  let parser = new xml2js.Parser();
  //https://stackoverflow.com/questions/10904448/node-to-parse-xml-using-xml2js
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
          getClassOfRow(id_cam, weekDays[date_registro.getDay()], strDateRow,
            function(docy){
              console.log('docku');
              console.log(docy.id);
              console.log(docy.data().h_inicio);
              var keyClass = dameKeyRegistro(strDateRow, docy.data().h_inicio);
              claseAddIngresos(
                          docy,
                          obj_info,
                          keyClass,
                          function(clase, obj){
                            //aca eval assitencia
                            evalAsistencia(clase, obj_info, function(){
                              return responsegood(res);
                            });
                          },
                          function(err){
                            return responseError(res, err);
                          }
                        );

            },
            function(){
              return responseNotFinded(res);
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
              getClassOfRow(id_cam, weekDays[date_registro.getDay()], strDateRow,
                function(docy){
                  console.log('docku 2');
                  var keyClass = dameKeyRegistro(strDateRow, docy.data().h_inicio);
                  claseAddIngresos(
                              docy,
                              obj_info,
                              keyClass,
                              function(clase, obj){
                                //aca eval assitencia
                                evalAsistencia(clase, obj_info, function(){
                                  return responsegood(res);
                                });

                              },
                              function(err){
                                return responseError(res, err);
                              }
                            );
                },
                function(){
                  return responseNotFinded(res);
                }
              );

              return responsegood(res);
            });

          }, function(){
            return responseNotFinded(res);
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

function responseNotFinded(res){
  return res.status(204).json({
                    message:"not finded null exit"
                  });
}

function responseError(res, err){
  return res.status(500).json(err);
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
    var hora = fase1[1] === 'PM' ? parseInt(fase2[0]) +12 : parseInt(fase2[0]);
    return (hora*60*60*1000)+(parseInt(fase2[1])*60*1000);
}

function dameKeyRegistro(jsonDate, strIni){
  console.log('dameKeyRegistro');
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

function claseAddIngresos(clase, registro, keyreg, added, fail){
  console.log('claseAddIngresos');
  console.log(clase.id);
  var classRef = db.collection('clases').doc(clase.id);
  var ingresos;
  getIngresosClases(
    clase,
    keyreg,
    function(doc){
      ingresos = {
        ingresosXdia: doc.data().ingresosXdia
      };

      ingresos.ingresosXdia.push(registro);
        classRef.collection('ingresos').doc(keyreg)
          .set(ingresos)
          .then(obj=>{
            console.log('claseAddIngresos +');
            return added(clase, obj);
          })
          .catch(err=>{
            console.log('claseAddIngresos -');
            return fail(err);
          });
    },
    function(){
      ingresos = {
        ingresosXdia: []
      };

      ingresos.ingresosXdia.push(registro);
        classRef.collection('ingresos').doc(keyreg)
          .set(ingresos)
          .then(obj=>{
            console.log('claseAddIngresos +');
            return added(obj);
          })
          .catch(err=>{
            console.log('claseAddIngresos -');
            return fail(err);
          });
    }
  );
}

function getIngresosClases(clase, keyIngresos, callfinded, callnotfinded){
  console.log('getIngresosClases');
  var classRef = db.collection('clases').doc(clase.id);
  console.log('keyIngresos');
  console.log(keyIngresos);
  classRef.collection('ingresos').doc(keyIngresos).get()
          .then(
            doc => {
              if (doc.exists) {
                console.log('getIngresosClases +');
                return callfinded(doc);
              }else{
                console.log('getIngresosClases -');
                return callnotfinded();
              }
            }
          ).catch(
              err=>{
                console.log('getIngresosClases fail');
                console.log(err);
              if (err) {
                 console.log(err);
              }
              return callnotfinded();
            }
          );
}

function evalAsistencia(clase, registro, added){
  var asistencia = clase.data().asistencia;
  var classRef = db.collection('clases').doc(clase.id);
  var date_bruto = new Date(registro.fecha.getFullYear(), registro.fecha.getMonth(), registro.fecha.getDate(), 0, 0, 0);
  var obj_asist = {};
  var new_data = clase.data();
  //asistencia is null
  if(asistencia === undefined){
    obj_asist = {
      fecha: date_bruto,
      promedio: registro.personas_en_clase
    };

    new_data.asistencia = new Array();
    new_data.asistencia.push(obj_asist);

    classRef.set(new_data)
            .then(function() {
                return added();
            })
            .catch(function(error) {
                return null;
            });
  }else{
    //asistencia date is menor
    var comparisson = compareDatesAsistencia(asistencia[asistencia.length - 1].fecha, date_bruto);
    if(comparisson > 0)
    {
      obj_asist = {
        fecha: date_bruto,
        promedio: registro.personas_en_clase
      };
      asistencia.push(obj_asist);
      new_data.asistencia = asistencia;

      classRef.set(new_data)
              .then(function() {
                  return added();
              })
              .catch(function(error) {
                  return null;
              });
    }

    if(comparisson === 0)
    {
      if(asistencia[asistencia.length-1].promedio < registro.personas_en_clase)
      {
        asistencia[asistencia.length-1] = {
          fecha: new Date(new_data.asistencia[asistencia.length-1].fecha),
          promedio: registro.personas_en_clase
        };
        new_data.asistencia = asistencia;
        classRef.set(new_data)
          .then(function() {
              return added();
          })
          .catch(function(error) {
            return null;
          })
          ;

      }
    }
  }

}

function compareDatesAsistencia(assitDateStamp, brutoDate){
  var dateStamp = new Date(assitDateStamp);
  var dateA = new Date(dateStamp.getFullYear(), dateStamp.getMonth(), dateStamp.getDate());
  var dateB = new Date(brutoDate.getFullYear(), brutoDate.getMonth(), brutoDate.getDate());

  return dateB.getTime()-dateA.getTime();
}

function getClasesByCam(idcam, dayOfWeek, callfinded){
  //console.log('getClasesByCam '+idcam);
  var docRefClases = db.collection('clases');
  docRefClases.where('cam_id','==',idcam)
              .get()
              .then(querySnapshot=>{
                return callfinded(querySnapshot);
              }).catch(function(error) {
                return null;
              })
              ;
}

function getClassOfRow(idcam, dayOfWeek, dateRow, callfinded, callnotfinded){
  //console.log('getClassOfRow');
  var hora_row_mili = dameHoraMiliOfstrDt(dateRow);
  getClasesByCam(idcam, dayOfWeek,
     function(querySnapshot){
       if(querySnapshot.size > 0){
         querySnapshot.forEach(function (doc) {
           var iniMili = horaClassMili(doc.data().h_inicio);
           var finMili = horaClassMili(doc.data().h_final);
           if(iniMili <= hora_row_mili && finMili >= hora_row_mili && doc.data().diasClase.includes(dayOfWeek)){
             //console.log('getClassOfRow +');
             return callfinded(doc);
           }
         });

         return callnotfinded();

       }else{
         console.log('getClassOfRow -');
         return callnotfinded();
       }
     }
  );
}
