const express = require('express');
const router = express.Router();

const AccountCtrl = require('../controllers/account');

const checkAuth = require('../middleware/check-auth');


router.post('/signup', AccountCtrl.create);

router.post('/login', AccountCtrl.login);

router.put('/login', checkAuth, AccountCtrl.login_refresh);

router.delete('/oblivion', checkAuth, AccountCtrl.oblivion);


module.exports = router;
