const cors       = require('cors');
const helmet     = require('helmet');
const express    = require('express');
const app        = express();
const exception  = require('../app/util/exception');
const {dbConnection} = require('./util/db');
const path = require('path');
const cron = require('cron');
// load env variables
require('dotenv').config();
app.use('/app/public',express.static('app/public'));
const frontendBuildPath = path.join(__dirname, '../front-end/build');
app.use(express.static(frontendBuildPath));
app.use('/images',express.static('app/public/images'));
app.use('/assets',express.static('app/public/assets'));

// connect to mongo
dbConnection();
/*
 * @description Middlewares for parsing body
 */
app.use(cors({
    origin  : '*',
    headers : '*',
    methods : ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type', 'key' ,'Authorization' ,'authorization', 'authToken']
}));

app.use(helmet());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.get('/test-connection', async (req, res) => {
    // const now = new Date();
   
    res.send(`<h1>Welcome to AMEX</h1>`);
    // res.sendFile(path.join(__dirname, "..", "front-end/build/index.html"));
});



app.use(function (req, res, next) {

    let default_src = "default-src https://cdnjs.cloudflare.com/ 'self' 'unsafe-eval';";
    let font_src    = "font-src https://fonts.gstatic.com/ https://embed.tawk.to/ 'self';";
    let img_src     = "img-src 'self' https://embed.tawk.to/ blob: data: ;";
    let script_src  = "script-src 'self' https://cdnjs.cloudflare.com/ https://code.jquery.com/jquery-3.6.0.min.js https://fonts.googleapis.com/ 'unsafe-eval';";
    let style_src   = "style-src 'self' https://fonts.googleapis.com/ https://embed.tawk.to/ 'unsafe-inline';";
    let frame_src   = "frame-src 'self';";
    let connect_src = "connect-src 'self' https://amextrading.us/ https://va.tawk.to/v1/ https://embed.tawk.to/ wss: ;";
    let script_src_elem = "script-src-elem 'self' https://cdnjs.cloudflare.com/ https://unpkg.com/ https://code.jquery.com/ https://cdn.jsdelivr.net/ https://embed.tawk.to/ 'unsafe-inline' 'unsafe-eval';";
    
    res.setHeader(
        'Content-Security-Policy', 
        `${default_src} ${font_src} ${img_src} ${script_src} ${style_src} ${frame_src} ${connect_src} ${script_src_elem}`
    );

    next();
});
//////////////////////////////////
/*
 * Injecting all dependencies Modules + common libs
 */
require('../app/config/dependency')(app);

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "front-end/build/index.html"));
});

/*
 * @description Catch 404 error if no route found
 */
app.use(exception.unknownRouteHandler);

/*
 * @description Error handler
 */
app.use(exception.errorHandler);

module.exports = app;
