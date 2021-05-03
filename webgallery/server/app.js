const express = require('express');
const app = express();
const session = require('express-session');
const routes = require('./Routes');
const helmet = require('helmet');
const https = require('https');
const http = require('http');
const fs = require('fs');
const NedbStore = require('express-nedb-session')(session);


const store = new NedbStore({
	filename: 'db/session.db'
});

app.use(express.static('static')); // therefore not CORS

app.use(helmet());
app.use(
	session({
		secret: 's3cure-s3ssion',
		resave: false,
		saveUninitialized: false,
		httpOnly:true,
		secure:true,
		sameSite:true,
		cookie: {
			path: '/'
			, maxAge: 365 * 24 * 3600 * 1000  
		},
		store: store
	})
);


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('static'));

app.use(function (req, res, next) {
	req.username = req.session ? req.session.username : null;
	req.gallery = req.session ? req.session.gallery : null;
	console.log('HTTPS request', req.method, req.username, req.url, req.body);
	next();
});


app.use('/api', routes);

const config={
	key:fs.readFileSync('server/server.key'),
	cert:fs.readFileSync('server/server.cert')
}
let server;
const PORT = 3000;
if(process.env.NODE_ENV==="PRODUCTION")
server = https.createServer(config,app).listen(PORT, function (err) {
	if	 (err) console.log(err);
	else console.log('HTTPS server on https://localhost:%s', PORT);
});
else 
server = http.createServer(app).listen(PORT, function (err) {
	if	 (err) console.log(err);
	else console.log('HTTP server on http://localhost:%s', PORT);
});

module.exports = server;