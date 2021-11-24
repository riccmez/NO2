const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const socketIO = require('socket.io');
const http =require('http');
const config = require('../config.js');

// initialization
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
// settings
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));


// routes
app.use(require('./routes'));

// sockets
require('./sockets')(io);
console.log(__dirname)

// stactic files
app.use(express.static(path.join(__dirname,'public')));


const PORT = config.PORT;
const HOST = config.HOST;
// starting the server
server.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`)
/*
server.listen(process.env.PORT || 3000, () => {
    console.log('Server on port ' + (process.env.PORT ||3000) );
})*/
