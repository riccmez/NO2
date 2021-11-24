var params = JSON.parse(process.argv[2]);

var file = params.Name
var jsonURL = './HistData/'+ file +'.json';      
let newData = require(jsonURL);
process.stdout.write(JSON.stringify(newData));
    
