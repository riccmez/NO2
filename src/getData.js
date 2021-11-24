// Require client library and private key.
var ee = require('@google/earthengine');
var privateKey = require('./ee_api_key.json');
var SG = require('ml-savitzky-golay-generalized');

var params = JSON.parse(process.argv[2]);

// Initialize client library and run analysis.
const runAnalysis = async function() {
    ee.initialize(null, null, function() {
        let lon = params.lng;
        let lat = params.lat; 
        let startDate = params.startDate;
        let endDate = params.endDate;
        
        let newData = {
            timeseries: getMeasurements(lon, lat, startDate, endDate)
        }
        process.stdout.write(JSON.stringify(newData));
    }, function(e) {
        console.error('Initialization error: ' + e);
    });
};

// Authenticate using a service account.
ee.data.authenticateViaPrivateKey(privateKey, runAnalysis, function(e) {
    console.error('Authentication error: ' + e);
});


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

function getMeasurements(lon, lat, startDate, endDate) {
    let collection = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_NO2').select('tropospheric_NO2_column_number_density').filterDate(startDate, endDate)
    let geoPoint = ee.Geometry.Point(lon, lat)
    let scale = 1000

    let timeseries = collection.getRegion(geoPoint, scale).getInfo()
    let newData= rmmissing(timeseries)
    return newData;
}