const mongoose = require('mongoose');
const komandaDBConn = require('../middleware/mongoose')

const priceSchema = require('../../../../api/lib/models/price');

const dishSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: priceSchema,
    required: true
  },
  category: {
    type: String,
    required: true,
    match: /[a-z][a-z0-9-]*/
  },
  ingredients: [mongoose.Schema.Types.ObjectId]
});

module.exports = komandaDBConn.model('Dish', dishSchema);
