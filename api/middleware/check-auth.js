const jwt = require('jsonwebtoken');
const { WellKnownJsonRes } = require('../middleware/json-response-util');

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const jwtKey = process.env.JWT_KEY || 'sample_fake_key';
		const decoded = jwt.verify(token, jwtKey);
		req.userData = decoded;
		next();
	} catch (e) {
		// return res.status(401).json({
		//   status: 401,
		//   message: 'Unauthorized'
		// });
		WellKnownJsonRes.unauthorized(res);
	}
};
