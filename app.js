/*eslint-env node*/

// This application uses express as its web server
// for more info, see: http://expressjs.com
const express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
// var cfenv = require('cfenv');
// follows above replacement to run outside Cloud Foundry environment (I)
require('dotenv').config();

// create a new express server
const app = express();

//
// CUSTOM PART - begin
//

const bodyParser = require('body-parser');
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose
	.connect('mongodb://127.0.0.1:27017/sample-nodejs-app?authSource=admin', {
		dbName: 'sample-nodejs-app',
		useNewUrlParser: true,
		useCreateIndex: true,
		family: 6
	})
	.then(
		() => {
			/** ready to use. The `mongoose.connect()` promise resolves to undefined. */
			const db = mongoose.connection;
			db.on('error', console.error.bind(console, 'MongoDB connection error:'));
			db.once('open', () => {
				console.log('MongoDB connection is up');
			});
		},
		(err) => {
			/** handle initial connection error */
			console.error.bind(console, 'MongoDB startup connection error:');
		}
	);

//
// basic & unsecure CORS handling
// FIXME
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, Origin, X-Requested-With');
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE');
		return res.status(200).json({});
	}
	next();
});

//
// Response Headers handling
app.disable('x-powered-by');

// here there are rest services routes
// - basics
const accountRoutes = require('./api/routes/account');
app.use('/accounts', accountRoutes);
// - admin
const accountDetailRoutes = require('./api/routes/accountDetail');
app.use('/account', accountDetailRoutes);
// - utils
const utilRoutes = require('./api/routes/util');
app.use('/util', utilRoutes);
// - app: komanda
const komandaDishRoutes = require('./app/komanda/api/routes/dish');
app.use('/komanda/public/menu', komandaDishRoutes);
const komandaIngredientRoutes = require('./app/komanda/api/routes/ingredient');
app.use('/komanda/public/ingredients', komandaIngredientRoutes);

//
// CUSTOM PART I - end
//

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

//
// CUSTOM PART II - begin
//

app.use((req, res, next) => {
	const error = new Error('Not Found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		status: error.status,
		message: error.message
	});
});

//
// CUSTOM PART II - end
//

// get the app environment from Cloud Foundry
// const appEnv = cfenv.getAppEnv();
// const srvPort = appEnv.port;
// const srvUrl = appEnv.url;
// follows above replacement to run outside Cloud Foundry environment (I)
const srvPort = process.env.srvPort || 9443;
const srvUrl = process.env.srvUrl || 'localhost';

// start server on the specified port and binding host
app.listen(srvPort, '0.0.0.0', function() {
	// print a message when the server starts listening
	console.log(`server starting on ${srvUrl}`);
});
