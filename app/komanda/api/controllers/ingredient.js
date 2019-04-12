const mongoose = require('mongoose');

const Ingredient = require('../models/ingredient');

const {
  WellKnownJsonRes,
  JsonResWriter
} = require('../../../../api/middleware/json-response-util');
const {
  BasicRead
} = require('../../../../api/middleware/crud');

// cRud
exports.read_all = (req, res, next) => {

  BasicRead.all(req, res, next, Ingredient);

};

// cRud/autocompleteOnTitle
exports.autocomplete = (req, res, next) => {

  BasicRead.autocomplete(req, res, next, Ingredient, 'title', req._q.filterAcSimple, req._q.filter, req._q.projection);

};
