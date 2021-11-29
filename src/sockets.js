
var spawn = require('child_process').spawn;  

// Require client library and private key.
var ee = require('@google/earthengine');
var privateKey = require('./ee_api_key.json');
var SG = require('ml-savitzky-golay-generalized');

var bbPromise = require('bluebird');
function rmmissing(data) {
    let timestamps = [];
    let values = [];
    let newData = [];
    let filterValues = [];
    let options = {
        windowSize: 35, 
        polynomial: 1,
        derivative: 0 
    };

    for (var i = 0; i < data.length; i++) {
        if (i==0)
            continue

        if (data[i][4] != null){
            timestamps.push(data[i][3]);
            values.push(data[i][4]);
        }
    }
    try {
        filterValues = SG(values, 1, options);
    }
    catch {
        filterValues = values;
    }
    newData = timestamps.map(function(e, i) {
        return [e, filterValues[i]];
    });
  return newData;
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New User connected');

        socket.on('userCoordinates', coords => { 
            let params = coords;

            const runAnalysis = async function() {
                ee.initialize(null, null, function() {
                    let lon = params.lng;
                    let lat = params.lat;
                    let startDate = params.startDate;
                    let endDate = params.endDate;

                    (async() => {
                        await start1(lon, lat, startDate, endDate);
                    })();

                }, function(e) {
                    console.error('Initialization error: ' + e);
                });
            };

            ee.data.authenticateViaPrivateKey(privateKey, runAnalysis, function(e) {
                console.error('Authentication error: ' + e);
            });
        })

        socket.on('Mapviz', Dates => {   
            let params = Dates;      
            const runAnalysis = async function() {
                ee.initialize(null, null, function() {
              
                    let StartDate = params.Start;
                    let EndDate = params.End;
                    
                    (async() => {
                        await start2(StartDate, EndDate);
                    })();
                }, function(e) {
                  console.error('Initialization error: ' + e);
                });
              };
              
              // Authenticate using a service account.
              ee.data.authenticateViaPrivateKey(privateKey, runAnalysis, function(e) {
                console.error('Authentication error: ' + e);
              });
        })

        socket.on('HistData', Hist => {    
            var params = Hist;

            var file = params.Name
            var jsonURL = './HistData/'+ file +'.json';      
            let newData = require(jsonURL);
            socket.emit('Hist', newData);
        })
        
        function start1(lon, lat, startDate, endDate) {
            return getMeasurements(lon, lat, startDate, endDate);
        }
        function start2(StartDate, EndDate) {
            return getLayerLink(StartDate, EndDate);
        }

        async function getMeasurements(lon, lat, startDate, endDate) {
            let collection = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_NO2').select('tropospheric_NO2_column_number_density').filterDate(startDate, endDate);
            let geoPoint = ee.Geometry.Point(lon, lat);
            let scale = 1000;
        
            let timeseries = collection.getRegion(geoPoint, scale).getInfo();
            let newData = rmmissing(timeseries);
            
            let msg = {
                timeseries: newData
            };
            socket.emit('markerInfo', msg);
        }

        async function getLayerLink(StartDate, EndDate) {
            let band_viz = { 
                min: 0,
                max: 0.0002 ,
                palette: ['blue', 'green', 'yellow', 'red'],
                opacity: 0.45
            }
        
            // Colleción de imagenés del satélite
            let NO2 = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_NO2").select('tropospheric_NO2_column_number_density');
            NO2 = NO2.filterDate(StartDate, EndDate);
            let NO2_mapViz2 = NO2.mean();
            // Se hace un imagen apartir de la colleción
            let map_id_dict = ee.Image(NO2_mapViz2).getMap(band_viz);//getMapId(band_viz);

            myURL = map_id_dict.urlFormat;
            let link = {Link: myURL};
            socket.emit('Link', link);
        }

    });    
}


