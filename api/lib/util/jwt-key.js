'use strict';

module.exports = () => {
	return process.env.JWT_KEY || 'sample_fake_key';
};
