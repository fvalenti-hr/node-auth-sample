const mongoose = require('mongoose');

const komandaDBConn = mongoose.createConnection('mongodb://127.0.0.1:27017/sample-nodejs-app?authSource=admin', {
	dbName: 'sample-nodejs-app',
	useNewUrlParser: true,
	useCreateIndex: true,
	family: 6
});

module.exports = komandaDBConn;
