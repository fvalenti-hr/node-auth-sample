const mongoose = require('mongoose');
const komandaDBConn = require('../middleware/mongoose')

const triStateBoolType = require('../../../../api/lib/models/types/triStateBool');

const ingredientSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  allergyFriendly: {
    type: String,
    enum: triStateBoolType.values._all,
    default: triStateBoolType.values.undefined
  },
  veganFriendly: {
    type: String,
    enum: triStateBoolType.values._all,
    default: triStateBoolType.values.undefined
  },
  vegetarianFriendly: {
    type: String,
    enum: triStateBoolType.values._all,
    default: triStateBoolType.values.undefined
  }
});

module.exports = komandaDBConn.model('Ingredient', ingredientSchema);
