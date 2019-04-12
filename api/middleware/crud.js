'use strict';

const { FilterHelper } = require('../lib/tp/mongodb');
const { JsonObjectHelper } = require('../lib/util/json-util');

const { WellKnownJsonRes } = require('../middleware/json-response-util');

class BasicRead {
	// cRud
	static all(req, res, next, model, filter = {}, skip = 0, limit = 0, projection = {}, sort = {}) {
		model
			.find(filter)
			.skip(skip)
			.limit(limit)
			.sort(sort)
			.select(projection)
			.exec()
			.then((readResult) => {
				if (readResult) {
					if (limit > 0 && readResult.length == limit) {
						// when limit is specified, total items count can differ from size of result
						// in these cases a count query is necessary to get the correct value
						model
							.count(filter)
							.exec()
							.then((countResult) => {
								WellKnownJsonRes.okMulti(res, countResult, readResult, skip, limit);
							})
							.catch((countError) => {
								WellKnownJsonRes.errorDebug(res, countError);
							});

						// exit because response has been fulfilled at this stage
						return;
					}
					WellKnownJsonRes.okMulti(res, readResult.length, readResult, skip, limit);
				} else {
					WellKnownJsonRes.notFound(res);
				}
			})
			.catch((readError) => {
				WellKnownJsonRes.errorDebug(res, readError);
			});
	}

	// cRud/autocomplete
	static autocomplete(
		req,
		res,
		next,
		model,
		textFieldName,
		textSearch,
		filter = {},
		projection = {},
		maxResult = 10
	) {
		if (textSearch === undefined) {
			WellKnownJsonRes.okMulti(res);
			return;
		}

		Object.assign(filter, FilterHelper.buildAutocompleteFilter(textFieldName, textSearch));

		model
			.find(filter)
			.limit(maxResult)
			.select(projection)
			.exec()
			.then((readResult) => {
				if (readResult) {
					WellKnownJsonRes.okMulti(res, readResult.length, readResult, 0, maxResult);
				} else {
					WellKnownJsonRes.okMulti(res);
				}
			})
			.catch((readError) => {
				WellKnownJsonRes.errorDebug(res, readError);
			});
	}

	// cRud/byId
	static byId(req, res, next, model, id) {
		model
			.findById(id)
			.exec()
			.then((readResult) => {
				if (readResult) {
					WellKnownJsonRes.okSingle(res, readResult);
				} else {
					WellKnownJsonRes.notFound(res);
				}
			})
			.catch((readError) => {
				WellKnownJsonRes.errorDebug(res, readError);
			});
	}

	// cRud/count
	static count(filter = {}) {
		model
			.count(filter)
			.exec()
			.then((countResult) => {
				WellKnownJsonRes.count(res, countResult);
			})
			.catch((countError) => {
				WellKnownJsonRes.errorDebug(res, countError);
			});
	}
}

class BasicWrite {
	// Crud
	static create(req, res, next, model) {
		model
			.save()
			.then((createResult) => {
				AccountDetailCtrl.init_by_account(res, createResult._id, createResult);
			})
			.catch((createError) => {
				WellKnownJsonRes.errorDebug(res, createError);
			});
	}

	// crUd/byId
	static updateById(req, res, next, model, id) {
		const updateFilter = {
			_id: id
		};
		const updateStatement = {
			$set: JsonObjectHelper.buildFlattenJson(req.body)
		};

		model
			.update(updateFilter, updateStatement)
			.exec()
			.then((updateResult) => {
				WellKnownJsonRes.okSingle(res, updateFilter, 200, updateResult);
			})
			.catch((updateError) => {
				WellKnownJsonRes.errorDebug(res, updateError);
			});
	}

	// cruD/byId
	static deleteById(req, res, next, model, id) {
		model
			.remove({
				_id: id
			})
			.exec()
			.then((deleteResult) => {
				WellKnownJsonRes._genericDebug(res, 200, deleteResult);
			})
			.catch((deleteError) => {
				WellKnownJsonRes.errorDebug(res, deleteError);
			});
	}
}

module.exports = {
	BasicRead,
	BasicWrite
};
