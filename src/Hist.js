// Require client library and private key.
var ee = require('@google/earthengine');
var privateKey = require('./ee_api_key.json');
// var SG = require('ml-savitzky-golay-generalized');
var params = JSON.parse(process.argv[2]);

// Initialize client library and run analysis.
const runAnalysis = async function() {
    ee.initialize(null, null, function() {  
        var file = params.Name
        var jsonURL = './HistData/'+ file +'.json';      
        let newData = require(jsonURL);
        process.stdout.write(JSON.stringify(newData));
    }, function(e) {
        console.error('Initialization error: ' + e);
    });
};

// Authenticate using a service account.
ee.data.authenticateViaPrivateKey(privateKey, runAnalysis, function(e) {
    console.error('Authentication error: ' + e);
});

