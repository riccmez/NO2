// Require client library and private key.
var ee = require('@google/earthengine');
var privateKey = require('./ee_api_key.json');

var params = JSON.parse(process.argv[2]);

// Initialize client library and run analysis.
const runAnalysis = async function() {
  ee.initialize(null, null, function() {

    let StartDate = params.Start;
    let EndDate = params.End;

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
    process.stdout.write(JSON.stringify(link));
  }, function(e) {
    console.error('Initialization error: ' + e);
  });
};

// Authenticate using a service account.
ee.data.authenticateViaPrivateKey(privateKey, runAnalysis, function(e) {
  console.error('Authentication error: ' + e);
});