const express = require('express');
const router = express.Router();

const DishCtrl = require('../controllers/dish');

const checkAuth = require('../../../../api/middleware/check-auth');
const queryParser = require('../../../../api/middleware/parse-query');


router.get('/', checkAuth, queryParser, DishCtrl.read_all);

router.get('/autocomplete', checkAuth, queryParser, DishCtrl.autocomplete);


module.exports = router;
