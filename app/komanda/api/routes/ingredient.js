const express = require('express');
const router = express.Router();

const IngredientCtrl = require('../controllers/ingredient');

const checkAuth = require('../../../../api/middleware/check-auth');
const queryParser = require('../../../../api/middleware/parse-query');


router.get('/', checkAuth, queryParser, IngredientCtrl.read_all);

router.get('/autocomplete', checkAuth, queryParser, IngredientCtrl.autocomplete);


module.exports = router;
