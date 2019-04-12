const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Account = require('../models/account');

const AccountDetailCtrl = require('../controllers/accountDetail');

const { WellKnownJsonRes, JsonResWriter } = require('../middleware/json-response-util');

// Crud
exports.create = (req, res, next) => {
	Account.countDocuments({
		$or: [
			{
				username: req.body.username
			},
			{
				registration_email: req.body.registration_email
			}
		]
	})
		.exec()
		.then((totalConflicts) => {
			if (totalConflicts > 0) {
				WellKnownJsonRes.conflict(res, {
					message: 'Total conflicts occurred: ' + totalConflicts
				});
				return res;
			} else {
				bcrypt.hash(req.body.secret, 10, (err, hash) => {
					if (err) {
						WellKnownJsonRes.errorDebug(res, err);
					} else {
						const account = new Account({
							_id: new mongoose.Types.ObjectId(),
							enabled: req.body.enabled,
							correlation_id: req.body.correlation_id,
							provider: req.body.provider,
							username: req.body.username,
							nickname: req.body.nickname,
							secret: hash,
							registration_email: req.body.registration_email,
							contact_email: req.body.contact_email
						});

						// set/overwrite readonly fields
						const now = new Date();
						const sysUser = '$$system';
						const sysRole = '$$admin';
						account.creator = sysUser;
						account.creator_ts = now;
						account.creator_role = sysRole;
						account.last_update_by = null;
						account.last_update_ts = null;
						account.last_updater_role = null;

						account
							.save()
							.then((createResult) => {
								// to only create account: WellKnownJsonRes.created(res, createResult);
								// instead let's create empty account detail
								AccountDetailCtrl.init_by_account(res, createResult._id, createResult);
							})
							.catch((createError) => {
								WellKnownJsonRes.errorDebug(res, createError);
							});
					}
				});
			}
		})
		.catch((readExistingAccountError) => {
			WellKnownJsonRes.errorDebug(res, readExistingAccountError);
		});
};

// others/login
exports.login = (req, res, next) => {
	Account.findOne({
		username: req.body.username
	})
		.exec()
		.then((account) => {
			if (!account) {
				WellKnownJsonRes.unauthorized(res, [ 'Auth failed' ], {
					message: 'no account available as per request'
				});
				return res;
			}

			bcrypt.compare(req.body.secret, account.secret, (err, secretCompareSucceded) => {
				if (err) {
					WellKnownJsonRes.unauthorized(res, [ 'Auth failed' ], {
						messages: [ 'password checking failed' ]
					});
					return res;
				}
				if (secretCompareSucceded) {
					const jwtKey = process.env.JWT_KEY || 'sample_fake_key';
					const token = jwt.sign(
						{
							_id: account._id,
							username: account.username,
							registration_email: account.registration_email
						},
						jwtKey,
						{
							expiresIn: 3600
						}
					);
					new JsonResWriter(200)
						._messages([ 'Auth succeeded for ' + req.body.username ])
						._add('token', token)
						.applyTo(res);
					return res;
				}
				WellKnownJsonRes.unauthorized(res, [ 'Auth failed' ]);
				return res;
			});
		})
		.catch((loginError) => {
			WellKnownJsonRes.errorDebug(res, loginError);
		});
};

// others/login_refresh
exports.login_refresh = (req, res, next) => {
	const id = req.userData._id;

	Account.findById(id)
		.exec()
		.then((account) => {
			if (!account) {
				WellKnownJsonRes.unauthorized(res, [ 'Refresh token failed' ], {
					message: 'no account available as per request'
				});
				return res;
			}

			const token = jwt.sign(
				{
					_id: account._id,
					username: account.username,
					registration_email: account.registration_email
				},
				process.env.JWT_KEY,
				{
					expiresIn: 3600
				}
			);

			new JsonResWriter(200)
				._messages([ 'Auth succeeded for ' + req.body.username ])
				._add('token', token)
				.applyTo(res);
		})
		.catch((readError) => {
			WellKnownJsonRes.errorDebug(res, readError);
		});
};

// others/oblivion
exports.oblivion = (req, res, next) => {
	const id = req.userData._id;

	Account.remove({
		_id: id
	})
		.exec()
		.then((deleteResult) => {
			AccountDetailCtrl.delete_by_account(res, id, deleteResult);
		})
		.catch((deleteError) => {
			WellKnownJsonRes.errorDebug(res, deleteError);
		});
};
