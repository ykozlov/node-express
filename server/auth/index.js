'use strict';
import express from 'express';
import User from '../api/user/user.model';

// Passport Configuration
require('./local/passport').setup(User);

var router = express.Router();

router.use('/local', require('./local').default);

module.exports = router;
