const mongoose = require('mongoose');

const Dish = require('../models/dish');

const {
  FilterHelper
} = require('../../../../api/lib/tp/mongodb');

const {
  WellKnownJsonRes,
  JsonResWriter
} = require('../../../../api/middleware/json-response-util');

// cRud
exports.read_all = (req, res, next) => {

  Dish.aggregate([{
      $match: req._q.filter
    }, {
      $lookup: {
        from: "ingredients",
        localField: "ingredients",
        foreignField: "_id",
        as: "ingredients"
      }
    }]).exec()
    .then(readResult => {
      if (readResult) {
        WellKnownJsonRes.okMulti(res, readResult.length, readResult);
      } else {
        WellKnownJsonRes.notFound(res);
      }
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });

};

// cRud/autocompleteOnTitle
exports.autocomplete = (req, res, next) => {

  if (req._q.filterAcSimple === undefined) {
    WellKnownJsonRes.okMulti(res);
    return;
  }

  const filter = FilterHelper
    .buildAutocompleteFilter(
      'title',
      req._q.filterAcSimple,
      req._q.filter,
      req._q.projection);

  const limit = 10;

  Dish.aggregate([{
      $match: filter
    }, {
      $lookup: {
        from: "ingredients",
        localField: "ingredients",
        foreignField: "_id",
        as: "ingredients"
      }
    }, {
      $limit: limit
    }]).exec()
    .then(readResult => {
      if (readResult) {
        WellKnownJsonRes.okMulti(res, readResult.length, readResult, 0, limit);
      } else {
        WellKnownJsonRes.notFound(res);
      }
    })
    .catch(readError => {
      WellKnownJsonRes.errorDebug(res, readError);
    });

};
